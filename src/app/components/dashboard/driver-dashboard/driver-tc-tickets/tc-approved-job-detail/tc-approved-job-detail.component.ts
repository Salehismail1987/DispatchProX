import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tc-approved-job-detail',
  templateUrl: './tc-approved-job-detail.component.html',
  styleUrls: ['./tc-approved-job-detail.component.css']
})
export class TcApprovedJobDetailComponent implements OnInit {


  @Input('dt_id') dt_id:any=null;
  @Input('from_list') from_list:boolean=false;

  ticket_detail:any=null;
  screen:string='mobile';
  loggedinUser:any;
  driver_ticket_id:any;

  detail_round:any=null;

  detail_round_id:any=null;


  loading_details:boolean=true;

  date_today:any;
  is_downloading:boolean=false;


  active_tab:string='ticket-detail';

  notification_id:any=null;
  notification_type:any=null;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
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

  toggleDetail(id:any){

    if(this.detail_round_id !=null){
      this.detail_round_id = null;
    }else{
      this.detail_round_id = id;
    }
  }

  getTicketDetail(){
    this.loading_details=true;
    let data = {is_tc_ticket:'YES',date:this.date_today,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,driver_ticket_id: this.driver_ticket_id};
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{
      this.loading_details=false;
      if(response.status ){
        this.ticket_detail = response.data.ticket;

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

  parseHour(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item.split(' ');
    if(rr[0]){
      var h = rr[0];
      h = h.replace('h','');

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
    return total.toFixed(2)+' hr';
  }

  hourData(hour:any,mint:any){
    var mint_per = mint/60 ;
    if(mint_per>0 && mint_per <0.25){
        mint_per = 0.25;
    }
    if(mint_per>0.25 && mint_per <0.50){
      mint_per = 0.50;
    }
    if(mint_per>0.50 && mint_per <0.75){
      mint_per = 0.75;
    }
    if(mint_per>0.75 && mint_per <1){
      hour = hour+1;
      mint_per =0;
    }
    return parseFloat(hour)+parseFloat(mint_per.toString())+' hr';
  }
  setActiveTab(tab:string){
    this.active_tab=tab;
  }

  parseJobTime(rounds:any){
    var time:any = '';
    var hours = 0;
    var mints = 0;
    if(rounds && rounds.length>0){

      rounds.map((item:any)=>{
        if(item && item.round_time){
          var rr  = item.round_time.split(' ');
          if(rr[0]){
            var h = rr[0];
            h = h.replace('h','');

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
            hours+=Math.round(toadd_h);
             mints = mints%60;
          }
        }

      })
    }
    return Math.round(hours)+' hr '+mints+'min'
  }

  handlePDFDownload(ticket:any){
    let approver_time = '';
     if(ticket){
       if(this.ticket_detail?.ticket?.status == 'Approved' && this.ticket_detail?.approver_time !=''){
         approver_time= this.ticket_detail?.approver_time ? this.ticket_detail?.approver_time: '';

       }
       if(this.ticket_detail?.ticket?.status == 'Approved' && (this.ticket_detail?.approver_time =='' || this.ticket_detail?.approver_time =='null' || this.ticket_detail?.approver_time ==null)){
         approver_time=  this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min";
       }

      let data={
        is_tc_ticket:'YES',
       job_total: this.parseJobTime( this.ticket_detail?.ticket?.ticket_truck_type_rounds),
       approver_time:approver_time,
       driver_total:this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min",
       user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
       ticket_id:this.ticket_detail.ticket_id

      }

     this.is_downloading =true;
     this.ticket_service.downloadClosedTicketPDF(data).subscribe(response=>{

       this.is_downloading = false;
       if (response && !response.status ) {
         if(response.message !=""){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Error', response.message)

         }
       }else{

         const link = document.createElement('a');
         link.setAttribute('target', '_blank');
         link.setAttribute('href', environment.apiClosedPDFURL+response.file_name);
         link.setAttribute('download', response.file_name);
         document.body.appendChild(link);
         link.click();
         link.remove();
       }
     });
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
    return hours+'  hr '+mints+"min";
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
