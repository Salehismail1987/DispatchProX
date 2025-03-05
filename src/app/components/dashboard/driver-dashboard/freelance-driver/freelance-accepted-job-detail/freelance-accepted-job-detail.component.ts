import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-freelance-accepted-job-detail',
  templateUrl: './freelance-accepted-job-detail.component.html',
  styleUrls: ['./freelance-accepted-job-detail.component.css']
})
export class FreelanceAcceptedJobDetailComponent implements OnInit {

  @Input('dt_id') dt_id:any=null;
  @Input('from_list') from_list:boolean=false;
  ticket_detail:any=null;
  screen:string='mobile';
  loggedinUser:any;
  driver_ticket_id:any;

  active_tab:string='ticket-detail';


  ticket_to_decline:any=null;
  show_reason:boolean=false;

  reason_decline:string='';
  reason_error:string='';

  loading_reject:boolean=false;
  loading_start:boolean=false;

  loading_details:boolean=true;

  more_tickets:any=null;
  more_more_tickets:any=null;
  date_today:any;

  approver:any=null;
  dispatcher:any=null;
  rounds:any=null;

  notification_id:any=null;
  notification_type:any=null;

  new_paper_ticket_id:any=null;
  paper_ticket_id_error:any='';
  hide_modal_paper_ticket:boolean=false;
  loading_update:boolean=false;
 constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private ticket_service: TicketService,
    private freelance_service:   FreelanceDriverServiceService,
    private notification_service:   NotificationService,
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
  }

  ngOnInit(): void {

    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });

    this.responsiveService.checkWidth();
    this.onResize();

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    this.driver_ticket_id = this.actRouter.snapshot.params['id'] ? this.actRouter.snapshot.params['id']:'';

    if(this.dt_id && this.dt_id!=null && this.from_list){
      this.driver_ticket_id = this.dt_id;
    }
    if(this.driver_ticket_id){
      this.getTicketDetail()
    }

    this.actRouter.queryParams.subscribe(params => {
      if(params['notid']){

        if(params['type']){
          this.notification_type = params['type'];
          this.notification_id = params['notid'];

          if(this.notification_type != 'New Driver Job'){
            let data:any={notification_id:params['notid']};
            this.notification_service.markNotificationViewed(data).subscribe(response=>{

              if(response.status ){

              }
            })
          }else{
            let data:any={notification_id:this.notification_id};
            this.notification_service.markNotificationViewed(data).subscribe(response=>{
              this.loading_details=false;
              if(response.status ){

              }
            })
          }

        }else{

          this.notification_id = params['notid'];
          let data:any={notification_id:params['notid']};
          this.notification_service.markNotificationViewed(data).subscribe(response=>{

            if(response.status ){

            }
          })
        }

      }
    });
  }


  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    let conversionResult = {convertedDate: '', convertedTime: ''};

    if (requestDetail?.ticket_date && requestDetail?.ticket_time && round == 1) {
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const ticketTime = requestDetail.ticket_time; // Ticket time
      const ticketDate = requestDetail.ticket_date; // Ticket date

      let data = { ticketTime, ticketDate, userTimeZone };
      const conversionResult = this.ticket_service.timeConversion(data);
      // console.log(" data *********", data );
      // console.log("conversionResult  *********", conversionResult);
      return conversionResult;
    }
    else {
      // Return an empty object if required details are missing
      return conversionResult;
    }
  }

  getTicketDetail(){
    this.loading_details=true;
    let filter = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,id: this.driver_ticket_id};
    let data:any={
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      filter:filter,
      date:this.date_today,
      record_name: 'freelance_ticket'
    }
    this.freelance_service.getFreelancerDataDetail(data).subscribe(response=>{
      this.loading_details=false;
      if(response.status ){
        this.ticket_detail = response.data;
        this.rounds = this.ticket_detail?.rounds ? this.ticket_detail?.rounds:null;
        this.dispatcher = this.ticket_detail?.dispatcher;
        this.approver = this.ticket_detail?.approver;
        this.new_paper_ticket_id = this.ticket_detail?.paper_ticket_id;

        this.more_more_tickets = response.data?.more_more_tickets;
        this.more_tickets = response.data?.more_tickets;
        console.log(this.ticket_detail)
      }
    })
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='desktop' || this.screen=='tablet'){
        this.router.navigate(['/driver-dashboard-scheduler']);
      }
    });
  }

  setActiveTab(tab:string){
    this.active_tab=tab;
  }


  handleDecline(ticket:any){
    if(ticket && ticket?.id){
      this.show_reason=false;
      this.ticket_to_decline=ticket;
    }
  }

  getReason(ticket:any){
    this.show_reason=true;
  }

  cancelDecline(){
    this.show_reason =false;
    this.reason_decline='';
    this.ticket_to_decline=null;
  }

  setReason(event:any){
    if(event.target.value){
      this.reason_decline =event.target.value;
    }
  }

  declineHandler(){

    if(this.reason_decline=='' ){
      this.reason_error='Please enter reason for Decline.';
      return;
    }

    let data = {
        rejection_reason: this.reason_decline,
        is_rejected:1,
        status:'Declined'
      };
    let where={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      id: this.ticket_to_decline.id,
    }

    let formData:any={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      data:data,
      filter:where,
      update_stats:true,
      record_name:'freelance_ticket'
    }

    this.loading_reject=true;

    this.freelance_service.updateFreelancerData(formData).subscribe(response=>{
      this.loading_reject=false;
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          response.message).then(() => {
            this.show_reason =false;
            this.reason_decline='';
            this.ticket_to_decline=null;
            this.ticket_detail=null;
            this.router.navigate(['/dashboard']);
          });
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    })

  }

  handleStartJob(){
    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });


    let data = {
      started_at: this.date_today,
      is_started:1,
      status:'Driving'
    };

    let where={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      id: this.ticket_detail.id,
    }

    let formData:any={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      data:data,
      filter:where,
      update_stats:true,
      action:'start_job',
      record_name:'freelance_ticket'
    }

    this.loading_start=true;

    this.freelance_service.updateFreelancerData(formData).subscribe(response=>{
      this.loading_start=false;
      if(response.status){

            this.router.navigateByUrl('/freelance-inprogress-detail/'+this.ticket_detail.id)
        // })
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

        })
      }
    });

  }

  moveToStatus(status:any,dt_id:any){
    if(status=='Accepted'){
      window.location.href= "/freelance-accepted-detail/"+dt_id;
    }else if(status=='Completed'){
      this.router.navigate(["/freelance-completed-detail",dt_id]);
    }else if(status=='Driving'){
      this.router.navigate(["/freelance-inprogress-detail",dt_id]);
    }else if(status=='Approved'){
      this.router.navigate(["/freelance-approved-detail",dt_id]);
    }else{

      this.router.navigate(["/request-job-detail",dt_id]);
    }
  }

  setHidePaperTicketModal(){
    this.hide_modal_paper_ticket = !this.hide_modal_paper_ticket;
  }

  setNewTicketId(event:any){
    if(event.target.value){
      this.new_paper_ticket_id = event.target.value;
    }
  }
  handlePaperTicketId(){

    this.loading_update = true;
    if(!this.new_paper_ticket_id){
      this.paper_ticket_id_error = 'Paper ticket id is required!';
      return;
    }
    let data ={
      action:'update_paper_ticket_id',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      paper_ticket_id:this.new_paper_ticket_id
    }
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      this.loading_update = false;
      if(response.status){
        this.new_paper_ticket_id=null;
        this.hide_modal_paper_ticket=false;
        this.getTicketDetail();
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Paper ticket id updated!'
        );
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to update paper ticket id!'
        );
      }
    });
  }

}
