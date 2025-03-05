import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CanvasJS } from '@canvasjs/angular-charts';
import { Router } from '@angular/router';
import { TraggetUserMenuCountsService } from 'src/app/services/local-storage.service';
import { PlansService } from 'src/app/services/plans.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
import { TicketService } from 'src/app/services/ticket.service';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tragget_tickets:any=null;
  loggedinUser: any;

  dashboardData: any;
  last_30_days_tickets:any=0;
  last_30_days_closed_tickets:any=0;
  feedBackForm!: FormGroup;

  is_loading:boolean=false;
  show_modal:boolean=false;
  graph_data:any=null;
  feedbackError:any='';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private plan_service: PlansService,
    private user_service: UserDataService,
    private ticket_service:TicketService,
    private traggetUserMenuCountsService: TraggetUserMenuCountsService
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('TraggetUser');
    if (!user) {
      this.router.navigate(['/home']);
    }
    let userDone = JSON.parse(user);

    this.loggedinUser = userDone;

    if (!this.loggedinUser) {
      this.router.navigate(['/home']);
    }

    if (userDone && userDone.account_type == 'Trucking Company' && userDone.is_setup_shown && parseInt(userDone.is_setup_shown.toString()) == 0) {
      this.router.navigate(['/trucking-setup']);
    } else if (userDone && userDone.account_type == 'Customer' && userDone.is_setup_shown && parseInt(userDone.is_setup_shown.toString()) == 0) {
      this.router.navigate(['/customer-setup']);
    } else {

    }

    if(this.loggedinUser?.account_type !='Driver'){

      this.getDashboardData();
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

    }


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


  getDashboardData() {
    if (this.loggedinUser) {

      let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, user_type: "Trucking Company" };

      this.user_service.getDashboardData(data).subscribe(response => {
        if (response && response.status) {
          if (response.data) {
            this.dashboardData = response.data;
            if(this.dashboardData?.total>0){

              this.dashboardData.perc_subs_remaining = (parseFloat(this.dashboardData?.remaining.toString()) / parseFloat(this.dashboardData?.total.toString()))*100;
            }else{
              this.dashboardData.perc_subs_remaining =0;
            }

            this.dashboardData.total_available =  parseFloat(this.dashboardData.remaining) + parseFloat(this.dashboardData.remaining_single);
            let traggetUserMenuCounts: any = localStorage.getItem('TraggetUserMenuCounts');
            traggetUserMenuCounts = JSON.parse(traggetUserMenuCounts);
            traggetUserMenuCounts.requests = this.dashboardData?.total_requests ? this.dashboardData?.total_requests : 0;
            this.traggetUserMenuCountsService.setTraggetUserMenuCounts(traggetUserMenuCounts);
          }

        } else {

        }
      });

    }
  }

  moveToStatus(status: string) {
    if (status == 'Approved') {
      this.router.navigate(['/tc-closed-tickets']);
    } else {
      this.router.navigate(['/tc-ticket-listing'], { queryParams: { 'status': status } });
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
