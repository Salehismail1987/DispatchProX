import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {

  dashboardData:any;
  loggedinUser : any = {};

  last_30_days_tickets:any=0;
  last_30_days_closed_tickets:any=0;
  feedBackForm!: FormGroup;

  is_loading:boolean=false;
  show_modal:boolean=false;
  tragget_tickets: any;
  feedbackError:any='';

  constructor(
    private user_service: UserDataService,
    private router: Router,
     private fb: FormBuilder,
     private ticket_service:TicketService,
    private plan_service: PlansService,
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined ){
      this.router.navigate(['/home']);
    }
    // if(userDone && userDone.account_type == 'Customer' && !userDone.is_setup_shown ){

    //   this.router.navigate(['/customer-setup']);
    // }

    if(this.loggedinUser && this.loggedinUser?.account_type && this.loggedinUser?.account_type == 'User' && this.is_only_approver(this.loggedinUser?.user_roles) && this.loggedinUser?.parent_user && this.loggedinUser?.parent_user?.account_type =='Customer'){
      this.router.navigate(['/approver-tickets']);
    }else if(this.loggedinUser && this.loggedinUser?.account_type && this.loggedinUser?.account_type == 'User' && this.is_only_approver(this.loggedinUser?.user_roles) && this.loggedinUser?.parent_user && this.loggedinUser?.parent_user?.account_type =='Trucking Company'){
      this.router.navigate(['/tc-approver-tickets']);
    }

    this.getDashboardData()
    var formData:any = {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id};
    this.plan_service.getLast30DaysTickets(formData).subscribe((response:any)=>{

      if (response && response.status && response.data ) {

        this.last_30_days_tickets = response.data?.last_30_days_tickets;
      }
    });


    this.ticket_service.get30DaysClsoedTickets(formData).subscribe((response:any)=>{

      if (response && response.status && response.data ) {

        this.last_30_days_closed_tickets = response.data?.last_30_days_closed_tickets;
      }
    });


    this.feedBackForm = this.fb.group({
      feedback: ['', Validators.required],
      user_id: [this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id]
    });
    this.getTraggetTickets();

  }

  getTraggetTickets() {
    const formData = new FormData();
    formData.append(
      'user_id',
      this.loggedinUser?.id
        ? this.loggedinUser?.id
        : this.loggedinUser?.user_data_request_id
    );
    this.plan_service.getTraggetTickets(formData).subscribe((response) => {
      if (response.status && response.data) {
        this.tragget_tickets = response.data;
      }
    });
  }

  is_only_approver(roles:any){

    let is_approver:boolean=false;
    if(roles && roles?.length>0){
      roles.map((item:any)=>{
        is_approver = item?.role?.role_name == "Approver" ? true : false;
      });


      if(roles.length== 1 && is_approver){
        is_approver = true;
      }else{
        is_approver = false;
      }
    }


    return is_approver;
  }


  getDashboardData(){
    if(this.loggedinUser && this.loggedinUser?.id){
      let data:any= {user_id:  this.loggedinUser?.id  ?  this.loggedinUser?.id : this.loggedinUser.user_data_request_id , user_type:"Customer"};

      if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Trucking Company'){
        data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,for_approver:"YES", user_type:"Trucking Company"};

      }else if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Customer'){
        data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer",for_approver:"YES",};

      }
    this.user_service.getDashboardData(data).subscribe(response => {
      if(response && response.status){
        if(response.data){
          this.dashboardData = response.data;
          if(this.dashboardData?.total>0){

            this.dashboardData.perc_subs_remaining = (parseFloat(this.dashboardData?.remaining.toString()) / parseFloat(this.dashboardData?.total.toString()))*100;
          }else{
            this.dashboardData.perc_subs_remaining =0;
          }

          this.dashboardData.total_available =  parseFloat(this.dashboardData.remaining) + parseFloat(this.dashboardData.remaining_single);
        }

      }else{

      }
    });

    }
  }

  moveToStatus(status:string){
    if (status == 'Approved') {
      this.router.navigate(['/cust-closed-tickets']);
    } else {
    this.router.navigate(['/customer-ticket-listing'],  { queryParams: {'status':status}});
    }
  }


  toApprover(){
    if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Customer'){
      this.router.navigate(['/approver-tickets']);
    }else{
      this.router.navigate(['/tc-approver-tickets']);
    }
  }


  onSendFeedback(){
    this.feedbackError='';
    if(this.feedBackForm.invalid){
      this.is_loading=false;
      this.feedbackError='Feedback is required!';
      return
    }

    let data= this.feedBackForm.value;
    this.is_loading=true;
    this.plan_service.sendFeedback(data).subscribe((response:any)=>{

    this.is_loading=false;
      if (response && response.status ) {

          Swal.fire(

            {
              confirmButtonColor:'#17A1FA',
              title:
              `Success`,
              text:
              `Feedback sent!`
            }
            ).then(() => {

            });
        this.feedBackForm.reset();
        this.hideFeedbackModal();
      }else{

          Swal.fire(

            {
              confirmButtonColor:'#17A1FA',
              title:
              `Error`,
              text:
              `Problem in sending feedback!`
            }
            ).then(() => {

            });
      }
    });
  }

  showFeedBackModal(){
    this.is_loading=false;
    this.show_modal=true;
  }

  hideFeedbackModal(){
    this.show_modal=false;

  }

}
