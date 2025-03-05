import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerTicketPopupComponent } from '../customer-ticket-popup/customer-ticket-popup.component';
import { environment } from 'src/environments/environment';
import { DriverService } from 'src/app/services/driver.service';
import * as moment from 'moment-timezone';
import { last } from 'rxjs';

declare var $: any;
export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}
interface Ticket {
  ticket_no: any; // Consider using a more specific type if possible, like string or number
  ticket_truck_type_rounds?: { /* properties of rounds objects */ }[]; // Optional property, adjust the type as needed
}
@Component({
  selector: 'app-customer-project-tracker',
  templateUrl: './customer-project-tracker.component.html',
  styleUrls: ['./customer-project-tracker.component.css']
})
export class CustomerProjectTrackerComponent implements OnInit {
  @ViewChild(CustomerTicketPopupComponent) opUpObj :CustomerTicketPopupComponent | undefined;

  @Input('project') project:any;
  @Input('project_id') project_id:any;

  last_round:any=null;
  perPage: number = 25;
  page: number = 1;
  ticket_pagination: any;
  search_status:any = null;
  jobTime: any;
  edited_hours: any = null;
  edited_mints: any;
  today: Date = new Date();

  current_modal:any=null;
  loading:boolean=false;
  self_id:any;
  trucking_companies_list: any;
  approver_list:any;
  approver_id:any = null;
  approver:any=null;
  trucking_company_id:any = null;
  trucking_company:any = null;
  ticket_detail:any=null;
  duration_type:any ='Daily';
  date_today:any = null;
  current_date:any = null;
  start_date:any = null;
  end_date:any = null;
  first_dispatch:any=null;
  days_diff:any= null;

  tracker_data:any = null;
  tracker_tickts:any = null;
  tracker_stats:any=null;
  loggedinUser: any = {};
  selected_round:any =null;
  show_add_round:boolean=false;
  new_dumpsite:any=null;
  new_material_out:any = null;

  constructor(
    private activeRouter: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private driver_service: DriverService,
    private datePipe:DatePipe,
    private customer_service:CustomerService
  ) { }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
      this.self_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    }else{
      this.router.navigate(['/home']);
    }

    $(document).on("click", ".closepop", function(this:any) {

      $('.closepop').closest('.inapp-popup').hide();
    });

    $(document).on("click", ".openpop", function(this:any) {
      $(this).closest('.mainpopupdiv').find('.inapp-popup').toggle();
    });
    this.project_id =  this.activeRouter.snapshot.params['id'];
    if(this.project_id !=""){
      this.projectDetails(this.project_id);
    }

    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });


    this.date_today = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
    this.current_date = this.date_today;
    this.getProjectTrackingData();
    this.getTruckingCompanies();
    setInterval(() => {
      $(".modal-backdrop").hide();
      $('.modal-backdrop').removeClass('show');

      $('body').removeClass('modal-open');
      $("body").css({"paddingRight":'0px'})
      $("body").css({"overflow-y":'scroll'})

      $('.modal-backdrop').addClass('hide');
    }, 1000);
  }

  compareDates(dateString1: any, dateString2: any): boolean {
    function parseDateString(dateString: any): Date {
      const parts = dateString.split('-');
      const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return date;
    }

    const date1 = parseDateString(dateString1);
    const date2 = parseDateString(dateString2);

    return date1.getTime() >= date2.getTime();
  }
  compareDates2(dateString1: string): boolean {

    const parseDateString = (dateString: string): Date => {
      const parts = dateString.split('-');

      const year = +parts[0];
      const month = +parts[1] - 1;
      const day = +parts[2];
      return new Date(Date.UTC(year, month, day));
    };

    const getStartOfWeek = (date: Date) => {
      const day = date.getUTCDay();
      const diff = date.getUTCDate() - day;
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
    };

    const getEndOfWeek = (startDate: Date) => {
      return new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 6));
    };

    const currentDate = parseDateString(dateString1);
    const startDate = parseDateString(this.start_date);
    const endDate = parseDateString(this.end_date);

    const startOfWeek = getStartOfWeek(startDate);
    const endOfWeek = getEndOfWeek(startOfWeek);

    if( currentDate.getTime() >= endOfWeek.getTime() ){
      return false;
    }

    if( currentDate.getTime() <= startOfWeek.getTime() ){
      return true;
    }

    return currentDate.getTime() >= startOfWeek.getTime() && currentDate.getTime() <= endOfWeek.getTime();
  }



  prevDate(){
    if(this.duration_type == 'Daily'){
      // let d = new Date(this.current_date);
      // const newDate = new Date(d);
      // const result = new Date(newDate.setDate(newDate.getDate() - 1));
      // this.current_date = this.datePipe.transform(new Date(result), 'yyyy-MM-dd');
      var currentDate =      moment(this.current_date).subtract(1,'days');
      this.current_date = currentDate.format("YYYY-MM-DD");
      this.search_status=null;
      this.getProjectTrackingData();
    }
    if(this.duration_type == 'Weekly'){

      var currentDate =      moment(this.start_date).subtract(3,'days');
      var weekStart = currentDate.clone().startOf('isoWeek');

      var weekEnd = currentDate.clone().endOf('isoWeek');

      if(moment(weekStart).add(1,'days').format('dddd') == 'Monday'){
        this.start_date = moment(weekStart).add(1,'days').format("YYYY-MM-DD");
      }else{
        this.start_date = moment(weekStart).format("YYYY-MM-DD");
      }

      if(moment(weekEnd).add(1,'days').format("YYYY-MM-DD") == 'Sunday'){
        this.end_date  = (moment(weekEnd).add(1,'days').format("YYYY-MM-DD"));
      }else{
        this.end_date  = (moment(weekEnd).format("YYYY-MM-DD"));
      }
      this.search_status=null;
      this.getProjectTrackingData();
    }

  }

  nextDate(){
    if(this.duration_type == 'Daily'){
      // let d = new Date(this.current_date);
      // const newDate = new Date(d);
      // const result = new Date(newDate.setDate(newDate.getDate() + 1));
      // this.current_date = this.datePipe.transform(new Date(result), 'yyyy-MM-dd');
      var currentDate =      moment(this.current_date).add(1,'days');
      this.current_date = currentDate.format("YYYY-MM-DD");
      this.search_status=null;
      this.getProjectTrackingData();
    }
    if(this.duration_type == 'Weekly'){

      // let e = new Date(this.end_date);
      // let newStartDate = new Date(e.setDate(e.getDate() + 1));
      // this.start_date = this.datePipe.transform(newStartDate, 'yyyy-MM-dd');
      // // this.start_date = this.end_date;
      // let d = new Date(this.end_date);
      // const newDate = new Date(d);
      // const result = new Date(newDate.setDate(newDate.getDate() + 7));
      // this.end_date = this.datePipe.transform(new Date(result), 'yyyy-MM-dd');

      var currentDate =      moment(this.end_date).add(3,'days');
      var weekStart = currentDate.clone().startOf('isoWeek');

      var weekEnd = currentDate.clone().endOf('isoWeek');



      if(moment(weekStart).add(1,'days').format('dddd') == 'Monday'){
        this.start_date = moment(weekStart).add(1,'days').format("YYYY-MM-DD");
      }else{
        this.start_date = moment(weekStart).format("YYYY-MM-DD");
      }

      if(moment(weekEnd).add(1,'days').format("YYYY-MM-DD") == 'Sunday'){
        this.end_date  = (moment(weekEnd).add(1,'days').format("YYYY-MM-DD"));
      }else{
        this.end_date  = (moment(weekEnd).format("YYYY-MM-DD"));
      }
      this.search_status=null;
      this.getProjectTrackingData();
    }
  }

  startDateChange(event:any){
    if(event && event.target.value){
      this.start_date = event.target.value;
      this.days_diff =  this.calculateDiff(this.start_date);
      this.end_date=this.date_today;

      this.search_status=null;
      this.getProjectTrackingData();
    }
  }

  calculateDiff(dateSent:any){
      let currentDate = new Date(this.date_today);
      dateSent = new Date(dateSent);

      return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) ) /(1000 * 60 * 60 * 24));
  }

  getWeekString(){
   return moment(this.start_date).format('MMM DD')+' - '+ moment(this.end_date).format('MMM DD');

  }
  getTruckingCompanies(){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

    this.customer_service.getCustomerCompanies(formData).subscribe(response=>{

      if(response.status && response.data){
        this.trucking_companies_list = response.data;

      }else{

      }
    })
  }


  getProjectTrackingData(){

    let data:any ={
      perPage:  this.perPage.toString(),
      start_date:this.start_date,
      end_date:this.end_date,
      current_date:this.current_date,
      duration_type:this.duration_type,
      page: this.page.toString(),
      trucking_company_id:this.trucking_company_id,
      filter_approver_id:this.approver_id,
      project_id: this.project_id? this.project_id:null,
      search_status:this.search_status,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }

    this.loading=true;

    this.projectService.getProjectTickets(data).subscribe(response=>{

    this.loading=false;
      if(response.status && response.data){
        this.tracker_data = response.data;
        this.tracker_stats = this.tracker_data?.tracker_stats;
        this.tracker_tickts = this.tracker_data?.tracker_tickets?.data;
        this.ticket_pagination = this.tracker_data?.tracker_tickets;
        // console.log(this.tracker_tickts)
      }else{

      }
    })
  }

  projectDetails(project_id:any){
    this.projectService.projectDetails(project_id).subscribe(response=>{
      if(response.status && response.data){
        this.project  = response.data;
        this.first_dispatch = response.data?.first_dispatch;
      }
    })
  }

  setTC(tc:any){
    if(tc){
      this.trucking_company_id = tc?.id;
      this.trucking_company = tc;
      this.search_status=null;
      this.getProjectTrackingData();
      $('.closepop').closest('.inapp-popup').hide();
    }
  }
  setTC_All(){

    this.trucking_company = null;
      this.trucking_company_id = null;
      this.search_status=null;
      this.getProjectTrackingData();
      $('.closepop').closest('.inapp-popup').hide();

  }

  setApprover(appr:any){
    if(appr){
      this.approver_id = appr?.id;
      this.approver = appr;
      this.search_status=null;
      this.getProjectTrackingData();
      $('.closepop').closest('.inapp-popup').hide();
    }
  }

  showModal(modal: any) {
    // if( (modal=='new-project' && this.is_new_project_active == true) || (modal=='add-users' && this.is_adduser_active == true) || (modal=='invite-people' && this.is_invitepeople_active ==true)){

    //   return;
    // }
    this.current_modal = modal;
  }

  setActive(event:any){
    this.current_modal='';
    this.getTruckingCompanies();
  }

  setDuration(dur_type:any){
    if(dur_type){
      this.duration_type = dur_type;
      switch (dur_type) {
        case 'Daily':
            this.current_date = this.date_today;
            this.search_status=null;
            this.getProjectTrackingData();
          break;
        case 'Weekly':
            this.start_date = this.date_today;
            // let d = new Date(this.start_date);
            // const newDate = new Date(d);
            // const result = new Date(newDate.setDate(newDate.getDate() + 7));
            // this.end_date = this.datePipe.transform(new Date(result), 'yyyy-MM-dd');
            // this.getProjectTrackingData();
            // this.search_status=null;



          var currentDate =      moment(this.start_date);

          var weekStart = currentDate.clone().startOf('isoWeek');
          var weekEnd = currentDate.clone().endOf('isoWeek');

          if(moment(weekStart).add(1,'days').format('dddd') == 'Monday'){
            this.start_date = moment(weekStart).add(1,'days').format("YYYY-MM-DD");
          }else{
            this.start_date = moment(weekStart).format("YYYY-MM-DD");
          }

          if(moment(weekEnd).add(1,'days').format("YYYY-MM-DD") == 'Sunday'){
            this.end_date  = (moment(weekEnd).add(1,'days').format("YYYY-MM-DD"));
          }else{
            this.end_date  = (moment(weekEnd).format("YYYY-MM-DD"));
          }


          console.log(this.start_date,this.end_date );
          // let currentDate = new Date(this.date_today);

          // let dayOfWeek = currentDate.getDay();

          // if (dayOfWeek === 0) {
          //     dayOfWeek = 7;
          // }

          // let diffToMonday = currentDate.getDate() - (dayOfWeek - 1);
          // let monday = new Date(currentDate.setDate(diffToMonday));
          // let sunday = new Date(monday);
          // sunday.setDate(monday.getDate() + 6);
          // this.start_date = this.datePipe.transform(monday, 'yyyy-MM-dd');
          // this.end_date = this.datePipe.transform(sunday, 'yyyy-MM-dd');
          this.search_status = null;
          this.getProjectTrackingData();
          break;
        case 'Total':
            this.start_date = this.first_dispatch ? this.first_dispatch?.ticket_date: (this.project?.start_date? this.project?.start_date: this.current_date);

            this.days_diff =  this.calculateDiff(this.start_date);
            this.end_date=this.current_date;
            this.search_status=null;
            this.getProjectTrackingData();
          break;
      }
    }
  }

  setDetailTicket(ticket:any){
    this.ticket_detail = ticket;
    this.opUpObj?.showPaperTicket();
  }

  getLastDoneRound(rounds:any){
    let last_done_round:any = null;
    if(rounds){
      rounds?.map((round:any)=>{
        if(round?.driver_start_time !=null && round?.end_time!=null){
          last_done_round = round;
        }
      });

    }
    return last_done_round;
  }

  getDoneRounds(rounds:any){
   let ttoal_done:any=0;
    if(rounds){
      rounds?.map((round:any)=>{
        if(round?.driver_start_time !=null && round?.end_time!=null){
          ttoal_done++;
        }
      });

    }
    return ttoal_done;
  }

  setRound_2(tickt:any,round:any){
    const fullModalId = `userInProgressModal_2${tickt.ticket_no}`;
    const modalElement = document.getElementById(fullModalId);

    this.ticket_detail = tickt;
    if (this.ticket_detail && this.ticket_detail?.driver_ticket?.started_at && this.ticket_detail?.driver_ticket?.started_at != '') {
      this.jobTime = new Date(this.ticket_detail?.driver_ticket?.started_at);
    }
    this.selected_round=null;
    if(round){
      // console.log(this.getRoundInProgress(tickt));
      this.selected_round = round;
      if (modalElement) {
        modalElement.classList.add('modal-animating');

        $("#userInProgressModal_2"+tickt?.ticket_no).modal('show');
        // $(".modal-backdrop").hide();
        // $('.modal-backdrop').removeClass('show');

        // $('.modal-backdrop').addClass('hide');
        setTimeout(() => modalElement.classList.add('modal-show'), 500);
      }
    }
  }
  setRound(tickt:any,round:any){
    const fullModalId = `userInProgressModal${tickt.ticket_no}`;
    const modalElement = document.getElementById(fullModalId);

    this.ticket_detail = tickt;
    if (this.ticket_detail && this.ticket_detail?.driver_ticket?.started_at && this.ticket_detail?.driver_ticket?.started_at != '') {
      this.jobTime = new Date(this.ticket_detail?.driver_ticket?.started_at);
    }
    this.selected_round=null;
    if(round){
      // console.log(this.getRoundInProgress(tickt));
      this.selected_round = round;
      if (modalElement) {
        modalElement.classList.add('modal-animating');

        $("#userInProgressModal"+tickt?.ticket_no).modal('show');
        // $(".modal-backdrop").hide();
        // $('.modal-backdrop').removeClass('show');

        // $('.modal-backdrop').addClass('hide');
        setTimeout(() => modalElement.classList.add('modal-show'), 500);
      }
    }
  }

  getLastRoundId(tickt:any){

    let last_round:any= null;
    if(tickt?.ticket_truck_type_rounds?.length>0){
      let isFound:boolean=false;
      tickt?.ticket_truck_type_rounds?.map((round:any)=>{
        if(round?.driver_start_time ==null && !isFound)
        last_round=round;
        isFound=true;
      })
      if(!last_round){
        tickt?.ticket_truck_type_rounds?.map((round:any)=>{
          last_round=round;
        })
      }

    }
    return last_round?.id;
  }

  showModalTicket(tickt:any,modal:any){
    this.show_add_round = false;
    const fullModalId = `${modal}${tickt.ticket_no}`;
    this.ticket_detail = tickt;

    const modalElement = document.getElementById(fullModalId);
    if (modalElement) {
      modalElement.classList.add('modal-animating');

      $("#"+modal+tickt?.ticket_no).modal('show')

      setTimeout(() => modalElement.classList.add('modal-show'), 500);
    }
  }

  showAddRound(){
    this.show_add_round = true;
  }
  setNewMaterialOut(event:any){
    if(event && event.target.value){
      this.new_material_out = event.target.value;
    } else if(event && !event.target.value){
      this.new_material_out = null;
    }
  }

  setNewDumpsite(ds:any){
    if(ds){
      this.new_dumpsite = ds;
    }
  }

  getLastRound(tickt:any,modal:any){
    const fullModalId = `${modal}${tickt.ticket_no}`;
    const modalElement = document.getElementById(fullModalId);

    this.last_round= null;
    this.ticket_detail = tickt;
    if(tickt?.ticket_truck_type_rounds?.length>0){
      let isFound:boolean=false;
      tickt?.ticket_truck_type_rounds?.map((round:any)=>{
        if(round?.driver_start_time ==null && !isFound)
        this.last_round=round;
        isFound=true;
      })
      if(!this.last_round){
        tickt?.ticket_truck_type_rounds?.map((round:any)=>{
          this.last_round=round;
        })
      }

      if (modalElement) {
        modalElement.classList.add('modal-animating');

        $("#"+modal+tickt?.ticket_no).modal('show')
        // $(".modal-backdrop").hide();
        // $('.modal-backdrop').removeClass('show');

        // $('.modal-backdrop').addClass('hide');
        setTimeout(() => modalElement.classList.add('modal-show'), 500);
      }
    }
  }

  closee(ticket: any, modalId: string) {

    const fullModalId = `${modalId}${ticket.ticket_no}`;
    const modalElement = document.getElementById(fullModalId);

    if (modalElement) {
      // Directly remove the 'modal-show' class
      modalElement.classList.remove('modal-show');

      // Optionally, remove 'modal-animating' after the animation completes to reset the modal state
      setTimeout(() => {
        modalElement.classList.remove('modal-animating');

        // Now, actually hide the modal. Assuming you're using Bootstrap's modal functionality:
        $('#' + fullModalId).modal('hide');
        $('.modal-backdrop').hide()
        $('body').removeClass('modal-open');
        $('.modal-backdrop').addClass('hide');
        $('body').css({overflow: 'auto'})
      }, 500); // This timeout duration should match the CSS transition duration
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "heading-12-400-normal text-color-black bg-pending-ticket br-5px text-center p-2 w-100px";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "heading-12-400-normal text-white bg-color-F4BE1B br-5px text-center p-2 w-100px";
        break;
      case 'Approved':
        return "heading-12-400-normal text-white bg-color-17A1FA br-5px text-center p-2 w-100px";
        break;
        case 'Accepted':
          return "heading-12-400-normal text-color-black bg-color-FFF8B8 br-5px text-center p-2 w-100px";
          break;
      case 'Completed':
        return "heading-12-400-normal text-white bg-color-33D1A2 br-5px text-center p-2 w-100px";
        break;


    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  changePage(page: any) {
    this.page = page;

    window.scrollTo(0,0);
    this.getProjectTrackingData();

  }

  parsePage(page: any) {
    return parseInt(page.toString());
  }

  notSkip(value: string) {
    if (value.indexOf('Next') >= 0 || value.indexOf('Previous') >= 0) {
      return false;
    } else {
      return true;
    }
    return false;
  }

  handleEndJob() {

    this.getTicketCompleteData();
  }

  handleAddRound() {
    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver?.id ? this.ticket_detail?.driver_ticket?.driver?.id : this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail?.driver_ticket?.ticket_id ? this.ticket_detail?.driver_ticket?.ticket_id : '',
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id ?  this.ticket_detail?.driver_ticket?.id : '',
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type?.id ?  this.ticket_detail?.ticket_truck_type?.id : ''
    }
    // console.log(" this is data : ", data);
    this.driver_service.addRound(data).subscribe(response => {
      if (response.status) {
        if (response.data) {
          if (response.data.all_done) {
          } else {

            let data:any ={
              perPage:  this.perPage.toString(),
              start_date:this.start_date,
              end_date:this.end_date,
              current_date:this.current_date,
              duration_type:this.duration_type,
              page: this.page.toString(),
              trucking_company_id:this.trucking_company_id,
              filter_approver_id:this.approver_id,
              project_id: this.project_id? this.project_id:null,
              search_status:this.search_status,
              user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
            }
            this.loading=true;
            this.projectService.getProjectTickets(data).subscribe(response=>{

              this.loading=false;
                if(response.status && response.data){
                  this.tracker_data = response.data;
                  this.tracker_tickts = this.tracker_data?.tracker_tickets?.data;
                  let tickett_no =  this.ticket_detail?.ticket_no ? this.ticket_detail?.ticket_no : '';
                    this.tracker_tickts.forEach((ticket: Ticket) => {
                    if(tickett_no == ticket.ticket_no){
                      this.ticket_detail = ticket;

                      if (this.ticket_detail && this.ticket_detail?.driver_ticket?.started_at && this.ticket_detail?.driver_ticket?.started_at != '') {
                        this.jobTime = new Date(this.ticket_detail?.driver_ticket?.started_at);
                      }

                      if (Array.isArray(ticket.ticket_truck_type_rounds) && ticket.ticket_truck_type_rounds.length > 0) {
                        this.selected_round = ticket.ticket_truck_type_rounds[ticket.ticket_truck_type_rounds.length - 1];
                      }
                    }
                  });
                }else{
                }
              });
          }
        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    })
  }

  handleSendApproval() {
    this.getElapsedTime(this.jobTime);
    let data:any = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail.id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id,
      notes_for_approver: '',
      edited_hours: this.ticket_detail?.driver_ticket?.driver_hours,
      edited_mints: this.ticket_detail?.driver_ticket?.driver_minutes
      // edited_hours: this.edited_hours,
      // edited_mints: this.edited_mints
    }

    this.driver_service.sendForApprovel(data).subscribe(response => {

      if (response.status) {
        $("#userInProgressModal").modal('hide')
        this.ticket_detail = response.data.driver_ticket;
        this.selected_round = null;
        this.ticket_detail = null;
        this.search_status=null;
       this.getProjectTrackingData();
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    });
  }

  getTicketCompleteData(skip_time: boolean = false) {
    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail?.id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id
    }

    this.driver_service.getTicketCompleteData(data).subscribe(response => {

      this.ticket_detail.driver_ticket = response.data.driver_ticket;
      if (response.status) {
        if (!skip_time) {
          this.edited_hours = response.data.driver_ticket?.driver_hours;
          this.edited_mints = response.data.driver_ticket?.driver_minutes;
          // console.log(this.edited_hours, this.edited_mints)
        }
        // this.getProjectTrackingData();
        this.search_status=null;
        this.handleSendApproval();
      }
    });
  }
  getTicketCompleteData2(skip_time: boolean = false) {
    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail?.id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id
    }

    this.driver_service.getTicketCompleteData(data).subscribe(response => {
      this.ticket_detail.driver_ticket = response.data.driver_ticket;
      if (response.status) {
        if (!skip_time) {
          this.edited_hours = response.data.driver_ticket?.driver_hours;
          this.edited_mints = response.data.driver_ticket?.driver_minutes;
        }
        // this.getProjectTrackingData();
        this.search_status=null;
        // this.handleSendApproval();
      }
    });
  }

  handleStartJob(ticket:any){

    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      ticket_id: this.ticket_detail?.id
    };


    this.driver_service.startJob(data).subscribe(response=>{
      if(response.status){
        this.closee(ticket, 'userAcceptedModal');
        this.search_status=null;
          //  $('#userAcceptedModal').modal('hide');
           this.getProjectTrackingData();
        // })
      }else{

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    });

  }


  handleStartRound(round: any) {

    if ((this.ticket_detail?.is_without_rounds == '1' || this.ticket_detail?.is_without_rounds == 1) && !round.dump_site || !round.material_taken_out) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        title: "Warning",
        text: 'Material taken out, pickup site and dumpsite are required',
        confirmButtonColor: "#FDD7E4",

      })
      return;
    }
    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail?.id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      round_id: round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id
    }

    this.driver_service.startRound(data).subscribe(response => {
      if (response.status) {
        if (response.data) {

          if (response.data.all_done) {
            this.search_status=null;
            this.getProjectTrackingData();
            $("#userInProgressModal").modal('hide');
          } else {
            this.search_status=null;
            this.getProjectTrackingData();

            $("#userInProgressModal").modal('hide');
          }

        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    })
  }

  getElapsedTime(entry: any): TimeSpan {
    let date_now = new Date();
    var samp_date = date_now.toLocaleString('en-US', { timeZone: environment.timeZone });
    let time1 = new Date(samp_date);

    let totalSeconds = Math.floor((time1.getTime() - entry.getTime()) / 1000);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (totalSeconds >= 3600) {
      hours = Math.floor(totalSeconds / 3600);
      totalSeconds -= 3600 * hours;
    }

    if (totalSeconds >= 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }

    seconds = totalSeconds;
    // console.log(minutes)
    if (minutes < 10) {
      minutes = 0 + minutes;
    }

     this.edited_hours = hours;
     this.edited_mints =  minutes;
    // console.log(" this is the edit hours : ",  this.edited_hours);
    // console.log(" this is the edited_mints : ",  this.edited_mints);
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  }

  handleEndRound(round: any) {
    let data = {
      user_id: this.ticket_detail?.driver_ticket?.driver_id,
      ticket_id: this.ticket_detail.id,
      driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
      round_id: round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id
    }

    this.driver_service.endRound(data).subscribe(response => {
      if (response.status) {
        if (response.data.all_done) {
          this.search_status=null;
          this.getProjectTrackingData();

          $("#userInProgressModal"+round?.ticket_no).modal('hide');
          // this.ticket_detail = response.data.driver_ticket;
          this.getTicketCompleteData2();
        } else {
          // this.ticket_detail = response.data.driver_ticket;
          this.search_status=null;
          this.getProjectTrackingData();

          $("#userInProgressModal"+round?.ticket_no).modal('hide');
        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    });
  }
  setSearchStatus(status:any){
    if(status){
      this.search_status = status;
      this.page=1;
      this.getProjectTrackingData();
    }
  }

  getRoundInProgress2() {
    let round_in_progress:any = null;

    if (this.ticket_detail && this.ticket_detail?.ticket) {

      if (this.ticket_detail?.ticket?.ticket_truck_type_rounds && this.ticket_detail?.ticket?.ticket_truck_type_rounds) {
        let rounds = [];
        rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {
          if (rounds[i] && rounds[i].id && rounds[i].driver_start_time != null && !rounds[i].end_time) {
            round_in_progress = rounds[i];
            // if (round_in_progress && round_in_progress?.driver_start_time) {
            //   this.roundTime = new Date(round_in_progress?.driver_start_time);
            // }
            break;
          }
        }
      }

    }
    return round_in_progress;
  }
  getRoundInProgress(ticket:any) {
    let round_in_progress:any = null;
    if (ticket ) {

      if (ticket?.ticket_truck_type_rounds && ticket?.ticket_truck_type_rounds) {
        let rounds = [];
        rounds = ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {
          if (rounds[i] && rounds[i].id && rounds[i].driver_start_time != null && !rounds[i].end_time) {
            round_in_progress = rounds[i];
            // if (this.round_in_progress && this.round_in_progress?.driver_start_time) {
            //   this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            // }
            break;
          }
        }
      }

    }
    return round_in_progress;
  }

  getAllRoundDone(ticket:any){
    let all_done:any=true;
    if(ticket){
      ticket?.ticket_truck_type_rounds?.map((item:any)=>{
        if(!item?.end_time){
          all_done=false;
        }
      })
    }
    return all_done;
  }
  getRoundToStart(ticket:any) {

    let round_to_start = null;
    if (ticket && ticket) {

      if (ticket?.ticket_truck_type_rounds && ticket?.ticket_truck_type_rounds) {
        let rounds = [];

        rounds = ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {


          if (rounds[i] && rounds[i].id && (rounds[i].driver_start_time == '' || rounds[i].driver_start_time == null)) {

            round_to_start = rounds[i];
            break;
          }

        }
      }
    }
    return round_to_start;
  }

  hanldeAddRound(){

    if(!this.new_dumpsite || !this.new_material_out){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        'Warning',
        'Material taken out and dumpsite are required!'
      );
      return;
    }
    let data = {

        user_id: this.ticket_detail?.driver_ticket?.driver_id,
        ticket_id: this.ticket_detail.id,
        driver_ticket_id: this.ticket_detail?.driver_ticket?.id,
        material_taken_out: this.new_material_out,
        dumpsite: this.new_dumpsite?.dump_site,
        ticket_truck_type_id: this.ticket_detail?.ticket_truck_type_id
      }

      this.driver_service.addRound(data).subscribe(response => {
        if (response.status) {
          if (response.data) {
            if (response.data.all_done) {

            } else {
              this.closee('userInProgressModal',this.ticket_detail)

              this.ticket_detail.driver_ticket = response.data.driver_ticket;
              this.ticket_detail.ticket_truck_type_rounds = response.data.driver_ticket?.ticket?.ticket_truck_type_rounds;
              this.show_add_round=false;


              let data:any ={
                perPage:  this.perPage.toString(),
                start_date:this.start_date,
                end_date:this.end_date,
                current_date:this.current_date,
                duration_type:this.duration_type,
                page: this.page.toString(),
                trucking_company_id:this.trucking_company_id,
                filter_approver_id:this.approver_id,
                project_id: this.project_id? this.project_id:null,
                search_status:this.search_status,
                user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
              }

              this.loading=true;

              this.projectService.getProjectTickets(data).subscribe(response=>{

              this.loading=false;
                if(response.status && response.data){
                  this.tracker_data = response.data;
                  this.tracker_stats = this.tracker_data?.tracker_stats;
                  this.tracker_tickts = this.tracker_data?.tracker_tickets?.data;
                  this.ticket_pagination = this.tracker_data?.tracker_tickets;
                  // console.log(this.tracker_tickts)
                  let ticket2:any =  null;
                  this.tracker_tickts.map((ticket:any)=>{
                    if(ticket?.id == this.ticket_detail?.id){
                      ticket2 = ticket;
                    }
                  });
                  setTimeout(() => {

                        this.showModalTicket(ticket2,'userInProgressModal')


                  }, 3000);
                }else{

                }
              })



              if (this.ticket_detail?.driver_ticket?.started_at && this.ticket_detail?.driver_ticket?.started_at != '') {
                this.jobTime = new Date(this.ticket_detail?.driver_ticket?.started_at);
              }

            }
          }
        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Error',
            response.message
          );
        }
      })

  }
}
