import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-tc-accepted-job-detail',
  templateUrl: './tc-accepted-job-detail.component.html',
  styleUrls: ['./tc-accepted-job-detail.component.css']
})
export class TcAcceptedJobDetailComponent implements OnInit {

  detail_round:any=null;

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

  notification_id:any=null;
  notification_type:any=null;

 constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private user_service:   UserDataService,
    private ticket_service: TicketService,
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

    if (requestDetail?.ticket?.ticket_date && requestDetail?.ticket?.ticket_time && round == 1) {
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const ticketTime = requestDetail.ticket.ticket_time; // Ticket time
      const ticketDate = requestDetail.ticket.ticket_date; // Ticket date

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion2(data);

      return conversionResult;
    }
    else if(requestDetail && round == 2) {
      const dataa = requestDetail?.ticket?.ticket_truck_type_rounds[0]?.first_truck_start_at;
      const dataa2 = requestDetail?.ticket?.ticket_time;
      // console.log('dataa ** :', dataa);
      // console.log('dataa2 ** :', dataa2);
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const ticketTime = dataa ? dataa : dataa2 ; // Ticket time
      const ticketDate = requestDetail.ticket.ticket_date; // Ticket date

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion(data);

      return conversionResult;
    }
    else if(requestDetail && round == 3) {
      const dataa = requestDetail?.ticket_truck_type?.ticket_truck_type_rounds[0]?.start_time;
      // console.log('dataa ** :', dataa);
      // console.log('dataa2 ** :', dataa2);
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const ticketTime = dataa ? dataa : '' ; // Ticket time
      const ticketDate = requestDetail.ticket.ticket_date; // Ticket date

      let data = { ticketTime, ticketDate, userTimeZone };
      const conversionResult = this.ticket_service.timeConversion(data);
      if(!dataa) {
        conversionResult.convertedTime = '';
      }
      // console.log('data  :', data);

      return conversionResult;
    }
    else if(requestDetail && round == 4) {
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const requestDetailStr = String(requestDetail);

      const [ticketDate, timePart] = requestDetailStr.split(' ');

      // Extract the hour and minute from the time part
      const [hour, minute] = timePart.split(':');

      // Convert hour to 12-hour format and determine AM or PM
      let hour12 = parseInt(hour, 10);
      const amPm = hour12 >= 12 ? 'pm' : 'am';

      hour12 = hour12 % 12;
      hour12 = hour12 ? hour12 : 12; // the hour '0' should be '12'

      // Format the time to "12:07am" style
      const ticketTime = `${hour12}:${minute}${amPm}`;

      let data = { ticketTime, ticketDate, userTimeZone };
      // console.log('requestDetail Api *^&^&* :', requestDetail);
      const conversionResult = this.ticket_service.timeConversion(data);
      // console.log('data Api *^&^&* :', data);
      // console.log('conversionResult *^&^&* :', conversionResult);

      // console.log('data  :', data);

      return conversionResult;
    }
    else {
      // Return an empty object if required details are missing
      return conversionResult;
    }
  }

  getFormattedDate(dateString:any) {
    if(dateString){
      const parts = dateString.split('-');
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return '';
  }

  getTicketDetail(){
    this.loading_details=true;
    let data = {is_tc_ticket:'YES',date:this.date_today,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,driver_ticket_id: this.driver_ticket_id};
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{
      this.loading_details=false;
      if(response.status ){
        this.ticket_detail = response.data.ticket;
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
        is_tc_ticket:'YES',
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        ticket_id: this.ticket_to_decline.id,
        reason: this.reason_decline
      };

    this.loading_reject=true;

    this.driver_service.rejectDriverTicket(data).subscribe(response=>{
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

    let data = {
      is_tc_ticket:'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_id: this.ticket_detail?.ticket?.id
    };

    this.loading_start=true;

    this.driver_service.startJob(data).subscribe(response=>{
      this.loading_start=false;
      if(response.status){

            this.router.navigateByUrl('/tc-inprogress-job-detail/'+this.ticket_detail.id)
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

      this.router.navigate(["/tc-accepted-job-detail",dt_id]);
    }else if(status=='Completed'){
      this.router.navigate(["/tc-completed-job-detail",dt_id]);
    }else if(status=='Driving'){
      this.router.navigate(["/tc-inprogress-job-detail",dt_id]);
    }else if(status=='Approved'){
      this.router.navigate(["/tc-approved-job-detail",dt_id]);
    }else{

      window.location.href= "/tc-request-job-detail/"+dt_id;
    }
  }

  setRound(round_id:any){
    if(round_id){
      this.detail_round = round_id;
    }
  }

  unsetRound(){
    this.detail_round=null;
  }
}
