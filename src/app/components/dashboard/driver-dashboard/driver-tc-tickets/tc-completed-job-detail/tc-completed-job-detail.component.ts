import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tc-completed-job-detail',
  templateUrl: './tc-completed-job-detail.component.html',
  styleUrls: ['./tc-completed-job-detail.component.css']
})
export class TcCompletedJobDetailComponent implements OnInit {

  @Input('dt_id') dt_id:any=null;
  @Input('from_list') from_list:boolean=false;
  ticket_detail:any=null;
  screen:string='mobile';
  loggedinUser:any;
  driver_ticket_id:any;

  detail_round_id:any=null;


  detail_round:any=null;
  loading_details:boolean=true;

  date_today:any;

  more_tickets:any=null;
  more_more_tickets:any=null;
  active_tab:string='ticket-detail';

  notification_id:any=null;
  notification_type:any=null;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private project_service: ProjectService,
    private ticket_service: TicketService,
    private driver_service: DriverService,
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

      const conversionResult = this.ticket_service.timeConversion(data);

      // console.log('data Api *^&^&* :', data);
      // console.log('conversionResult *^&^&* :', conversionResult);

      return conversionResult;
    }
    else if(requestDetail && round == 2) {
      const dataa = requestDetail;
      // console.log('dataa ** :', dataa);
      // console.log('dataa2 ** :', dataa2);
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
      const amPm = hour12 >= 12 ? ' PM' : ' AM';

      hour12 = hour12 % 12;
      hour12 = hour12 ? hour12 : 12; // the hour '0' should be '12'

      // Format the time to "12:07am" style
      const ticketTime = `${hour12}:${minute}${amPm}`;

      let data = { ticketTime, ticketDate, userTimeZone };
      // console.log('requestDetail Api *^&^&* :', requestDetail);
      const conversionResult = this.ticket_service.timeConversion(data);
      // console.log('data Api *^&^&* :', data);
      // console.log('conversionResult *^&^&* :', conversionResult);

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

  toggleDetail(id:any){

    if(this.detail_round_id !=null){
      this.detail_round_id = null;
    }else{
      this.detail_round_id = id;
    }
  }

  getTicketDetail(){
    this.loading_details=true;
    let data = {is_tc_ticket:"YES",date:this.date_today,user_id:this.loggedinUser.user_data_request_id ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id,driver_ticket_id: this.driver_ticket_id};
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{
      this.loading_details=false;
      if(response.status ){
        this.ticket_detail = response.data.ticket;
        this.more_more_tickets = response?.data?.more_more_tickets;
        this.more_tickets = response?.data?.more_tickets;

      }
    })
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;

    });
  }


  setActiveTab(tab:string){
    this.active_tab=tab;
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

  parseJobTotal(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item?.split(':');
    if(rr[0]){
      var h = rr[0];
      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = hours+(mints/60);
    return hours+' hr '+mints+"min";
  }

  parseDriverTime(hour:any,mints:any){
    var total_time = 0;
    let h =0 ;
    if(parseFloat(mints)){
      h+=parseFloat(mints)/60;
    }
     if(parseFloat(hour)){
      h += parseFloat(hour);
    }

    total_time = h;

    return total_time ? (total_time.toFixed(2))+' hr' :'' ;
  }
  setRound(round_id:any){
    if(round_id){
      this.detail_round = round_id;
    }
  }

  unsetRound(){
    this.detail_round=null;
  }


  parseRoundTime(t:any){
    let d:any = null;
    if(t){
      d = t.toString().replace('h', ' hrs');
      if(d ){
        d = d+'m';
      }
    }
    return d;
  }



}
