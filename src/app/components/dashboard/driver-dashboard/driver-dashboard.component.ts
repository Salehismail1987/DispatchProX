import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit {

  screen:string = '';
  is_legend_hidden:boolean=false;
  header_text:string='';
  loggedinUser : any = {};

  active_menu :any;
  perPage:number =10;
  page:number =0;
  ticket_pagination:any;
  ticket_detail:any;
  current_round:any=null;

  rounds:any=null;

  tickets: any = null;
  detail_selected_tab:string = 'ticket_detail';

  ticket_to_decline:any=null;
  show_reason:boolean=false;

  reason_decline:string='';
  reason_error:string='';

  loading_reject:boolean=false;
  date_today:any;
  ticket_date:any=null;
  datejobs:any=[];

  dashboard_data:any;
  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private user_service:   UserDataService
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
   }

  ngOnInit(): void {
    this.responsiveService.checkWidth();
    this.onResize();
    this.header_text = 'Dashboard';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    if(this.screen=='desktop'){
      this.router.navigate(['/driver-dashboard-2'])
    }
    this.active_menu = {
      parent:'requests',
      child:'',
      count_badge: '',
    }

    // this.getAllRequests()
    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });
    this.getDashboardData();
    this.getDashboardCalendarData();
    // Getting user timezone
    let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')


    const formData2 = new FormData();
    formData2.append('province',  currentlyLoggedInProfile.user_province ? currentlyLoggedInProfile.user_province : (
      currentlyLoggedInProfile.province ? currentlyLoggedInProfile.province :''
    ));
    if(currentlyLoggedInProfile.user_province){
      this.user_service.getTimeZone(formData2).subscribe(response => {
        console.log(" this is time zone : ", response.timezone);

        if (response.status && response.timezone) {
          currentlyLoggedInProfile.time_zone = response.timezone;
          localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
        } else {
          currentlyLoggedInProfile.time_zone = environment.timeZone;
          localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
        }
      });
    }
    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));

  }


  getDashboardData(){

      if(this.loggedinUser && this.loggedinUser?.id){
        let data = {user_id:this.loggedinUser.user_data_request_id ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id,date:this.date_today,user_type:'Driver',skipCalendar:'YES'};

      this.user_service.getDashboardData(data).subscribe(response => {
        if(response && response.status){
          if(response.data){
            this.dashboard_data = response.data;
            this.setRounds();
            this.currentRound(this.rounds);
            console.log(this.dashboard_data)

            this.datejobs = response.data?.calendar_data;
              $('#pnlEventCalendar').calendarMobile({
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

                  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  onSelect: function(event:any) {
                      $('#lblEventCalendar').text(event.label);
                  }
              });
          }

        }else{

        }
      });


      }

  }

  getDashboardCalendarData(){

    if(this.loggedinUser && this.loggedinUser?.id){
      let data = {user_id:this.loggedinUser.user_data_request_id ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id,date:this.date_today,user_type:'Driver'};

    this.user_service.getDriverCalendarData(data).subscribe(response => {
      if(response && response.status){
        if(response.data){

          this.datejobs = response.data?.calendar_data;
            $('#pnlEventCalendar').calendarMobile({
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                onSelect: function(event:any) {
                    $('#lblEventCalendar').text(event.label);
                }
            });
        }

      }else{

      }
    });


    }

  }

  getAllRequests(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,perPage: this.perPage, page:this.page};
    this.driver_service.getAllRequests(data).subscribe(response=>{
      if(response.status && response.data.all_tickets.total  && parseInt(response.data.all_tickets.total.toString())>0  ){
        this.tickets = response.data.all_tickets.data;
        this.ticket_pagination = response.data.all_tickets;
      }
    })
  }

  setDetail(driver_ticket:any){
    this.ticket_detail = driver_ticket;
  }

  setRounds(){
    let round= this.dashboard_data?.current_job?.rounds ?  this.dashboard_data?.current_job?.rounds : null;
    if(round ){
      this.rounds = JSON.parse(round);
    }
  }

  changePage(page: any) {
    this.page = page;
    this.getAllRequests();
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

  backToList(){
    this.ticket_detail = null;
    this.detail_selected_tab = 'ticket_detail';
  }

  changeDetailTab(tab:any){
    this.detail_selected_tab = tab;
  }


  handleAcceptTicket(driver_ticket:any){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, ticket_id:driver_ticket.ticket_id};
    this.driver_service.acceptDriverTicket(data).subscribe(response=>{
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
            this.router.navigate(['/driver-accepted-tickets']);
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


  // handleRejectTicket(driver_ticket:any){
  //   let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, ticket_id:driver_ticket.ticket_id};
  //   this.driver_service.rejectDriverTicket(data).subscribe(response=>{
  //     if(response.status){
  //       Swal.fire(
  //         `Success`,
  //         response.message).then(() => {
  //           this.getAllRequests();
  //           this.ticket_detail = null;
  //         });
  //     }else{
  //       Swal.fire(
  //         `Error`,
  //         response.message).then(() => {

  //         });
  //     }
  //   })
  // }

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
            this.getAllRequests();
            this.show_reason =false;
            this.reason_decline='';
            this.ticket_to_decline=null;
            this.ticket_detail=null;
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

  redirectNotification( notf:any, dt_id:any){

    if(notf?.is_self_dispatched){
      if(notf && notf?.is_self_dispatched && notf.id && notf?.freelance_driver_ticket?.status=='Accepted'){
        this.router.navigateByUrl("/freelance-accepted-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.freelance_driver_ticket?.status=='Completed'){
        this.router.navigateByUrl("/freelance-completed-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.freelance_driver_ticket?.status=='Driving'){
        this.router.navigateByUrl("/freelance-inprogress-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.freelance_driver_ticket?.status=='Approved'){
        this.router.navigateByUrl("/freelance-approved-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else{

        this.router.navigateByUrl("/request-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }
    }else{

      if(notf && notf.id && notf?.ticket?.status=='Accepted'){

        this.router.navigateByUrl("/accepted-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Completed'){
        this.router.navigateByUrl("/completed-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Driving'){
        this.router.navigateByUrl("/inprogress-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Approved'){
        this.router.navigateByUrl("/approved-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Cancelled'){
        this.router.navigateByUrl("/cancelled-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else{

        this.router.navigateByUrl("/request-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }
    }
  }

  redirectTcNotification( notf:any, dt_id:any){

    if(notf?.is_tc_ticket=='YES'){
      if(notf && notf?.is_tc_ticket=='YES' && notf.id && notf?.tc_ticket?.status=='Accepted'){
        this.router.navigateByUrl("/tc-accepted-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.tc_ticket?.status=='Completed'){
        this.router.navigateByUrl("/tc-completed-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.tc_ticket?.status=='Driving'){
        this.router.navigateByUrl("/tc-inprogress-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.tc_ticket?.status=='Approved'){
        this.router.navigateByUrl("/tc-approved-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.tc_ticket?.status=='Cancelled'){
        this.router.navigateByUrl("/tc-cancelled-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else{

        this.router.navigateByUrl("/tc-request-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }
    }else{

      if(notf && notf.id && notf?.ticket?.status=='Accepted'){

        this.router.navigateByUrl("/accepted-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Completed'){
        this.router.navigateByUrl("/completed-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Driving'){
        this.router.navigateByUrl("/inprogress-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Approved'){
        this.router.navigateByUrl("/approved-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else if(notf && notf.id && notf?.ticket?.status=='Cancelled'){
        this.router.navigateByUrl("/cancelled-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }else{

        this.router.navigateByUrl("/request-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
      }
    }
  }

  currentRound(rounds:any){
    let round=0;
    if(rounds && rounds?.length>0){
      rounds.map((roun:any)=>{

        if(roun?.driver_start_time && roun?.driver_start_time!==null && (!roun?.end_time || roun?.end_time == null || roun?.end_time=='')){
          round =roun?.round_no;
        }
      })

      if(round>0){
        this.current_round= round;

      }else{
        this.current_round =0;
      }

    }
  }

  is_round_started(rounds:any){
    let is_started=false;
    if(rounds && rounds?.length>0){
      rounds.map((roun:any)=>{
        if(roun.driver_start_time && roun.driver_start_time!==null && (!roun.end_time || roun.end_time == null || roun.end_time=='')){
          is_started = true;
        }
      })
    }
    return is_started=true;
  }

  getVal(){
    if($("#pnlEventCalendar  table tr td div.selected job-status").length>0){
      $("#pnlEventCalendar  table tr td div.selected job-status").remove();
    }
    let date = $("#pnlEventCalendar  table tr td div.selected").text();
    if($("#pnlEventCalendar  table tr td div.selected").length>0 && date !=null && date !==''){

      let month_year = $("#pnlEventCalendar  .header-month-title").text();

      let monthyear=[];
      monthyear= month_year.toString().split(' ');
      let month:any = this.get_month_number(monthyear[0])
      let year = monthyear[1];
      var d = date.split(" ");
      console.log(d);
      if(d && d.length>0 ){
        date = d[0];
        if(parseInt(date.toString())<10){
          date= "0"+date;
        }
        this.ticket_date = date+'-'+month+'-'+year;

      }

    }

    let ticket_id = $(".calendar-frame > table > tbody > tr > td > div.selected > span.ticket-id").text();
    let status = $(".calendar-frame > table > tbody > tr > td > div.selected > span.ticket-status").text();
    let is_self_dispatched = $(".calendar-frame > table > tbody > tr > td > div.selected > span.is_self_dispatched").text();

    let is_tc_ticket = $(".calendar-frame > table > tbody > tr > td > div.selected > span.is_tc_ticket").text();

    if(ticket_id && ticket_id !==undefined && ticket_id !==null ){
      console.log(ticket_id,status,is_self_dispatched)
      if(status && status !==undefined && status !==null ){

        if(this.ticket_date){
          this.router.navigateByUrl('/driver-tickets-calendar-list/'+this.ticket_date);
        }
        // if(status=='accepted'){

        //   if(is_self_dispatched == 'true' || is_self_dispatched==true){
        //     this.router.navigateByUrl("/freelance-accepted-detail/"+ticket_id);
        //   }else if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-accepted-job-detail/"+ticket_id);
        //   }else{
        //     this.router.navigateByUrl("/accepted-job-detail/"+ticket_id);
        //   }
        // }else if(status=='completed'){
        //   if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-completed-job-detail/"+ticket_id);
        //   }else{
        //     this.router.navigateByUrl("/completed-job-detail/"+ticket_id);
        //   }
        // }else if(status=='Driving'){
        //   if(is_self_dispatched == 'true' || is_self_dispatched==true){
        //     this.router.navigateByUrl("/freelance-inprogress-detail/"+ticket_id);
        //   }else if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-inprogress-job-detail/"+ticket_id);
        //   }else{
        //     this.router.navigateByUrl("/inprogress-job-detail/"+ticket_id);
        //   }
        // }else if(status=='approved'){
        //   if(is_self_dispatched == 'true' || is_self_dispatched==true){

        //     this.router.navigateByUrl("/freelance-approved-detail/"+ticket_id);
        //   }else if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-approved-job-detail/"+ticket_id);
        //   }else{

        //     this.router.navigateByUrl("/approved-job-detail/"+ticket_id);
        //   }
        // }else if(status=='cancelled'){
        //   if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-cancelled-job-detail/"+ticket_id);
        //   }else{

        //     this.router.navigateByUrl("cancelled-job-detail/"+ticket_id);
        //   }
        // }else{
        //   if(is_tc_ticket && is_tc_ticket=='YES'){
        //     this.router.navigateByUrl("/tc-request-job-detail/"+ticket_id);
        //   }else{
        //     this.router.navigateByUrl("/request-job-detail/"+ticket_id);
        //   }
        // }
      }

    }
  }


  get_month_number(month_name:any){
    let month=null;
    switch (month_name) {
      case 'Jan':
        month = '01';
        break;
      case 'Feb':
        month = '02';
        break;
      case 'Mar':
        month = '03';
        break;
      case 'Apr':
        month = '04';
        break;
      case 'May':
        month = '05';
        break;
      case 'Jun':
        month = '06';
        break;
      case 'Jul':
        month = '07';
        break;
      case 'Aug':
        month = '08';
        break;
      case 'Sep':
        month = '09';
        break;
      case 'Oct':
        month = '10';
        break;
      case 'Nov':
        month = '11';
        break;
      case 'Dec':
        month = '12';
        break;
    }
    return month;
  }

  checkLegend(event:any){
    if(event.target.checked){
      this.is_legend_hidden=true;
    }else{
      this.is_legend_hidden=false;
    }
  }
}
