import { Component, Directive, ElementRef, Input, OnInit, ViewRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
import {  ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CountupTimerComponent, countUpTimerConfigModel } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { environment } from 'src/environments/environment';
import { map, timer } from 'rxjs';
import { Subject, interval } from 'rxjs';
import { ProjectService } from 'src/app/services/project.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { TicketService } from 'src/app/services/ticket.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $: any;
export interface Entry {
  created: Date;
  id:string;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-freelance-inprogress-job-detail',
  templateUrl: './freelance-inprogress-job-detail.component.html',
  styleUrls: ['./freelance-inprogress-job-detail.component.css']
})
export class FreelanceInprogressJobDetailComponent implements OnInit {

  @Input('dt_id') dt_id:any=null;
  @Input('from_list') from_list:boolean=false;

  loading_send_approval:boolean=false;

  hours:any=null;
  ticket_detail:any=null;
  screen:string='mobile';
  loggedinUser:any;
  driver_ticket_id:any;
  round_to_start:any=null;
  round_in_progress:any=null;

  edited_hours:any=null;
  edited_mints:any;
  new_dump_site_name:any='';


  active_tab:string='rounds-detail';

  private destroyed$ = new Subject();


  approver:any=null;
  dispatcher:any=null;
  rounds:any=null;

  roundTime:any;
  jobTime:any;

  all_rounds_done:boolean = false;

  ticket_to_decline:any=null;
  show_reason:boolean=false;

  reason_decline:string='';
  reason_error:string='';

  loading_reject:boolean=false;
  notes_for_approval:any;

  loading_details:boolean=true;

  more_tickets:any=null;
  more_more_tickets:any=null;
  date_today:any;

  dump_sites:any =null;

  // Round Updates
  new_dum_site:string='';
  current_site:string='';
  new_material_taken_out:string='';
  driver_round_notes:string='';
  show_round_update_popup:string='';
  update_round_id:any=null;

  new_material_error:string='';
  round_notes_error:string='';
  new_dumpsite_error:string ='';

  job_notes_error:string='';
  pickup_site_error:string='';
  detail_round_id:any=null;
  loading_update:boolean=false;

  show_notes_popup:boolean=false;
  show_time_edit_popup:boolean=false;
  notification_id:any=null;
  notification_type:any=null;
  pickup_site:any=null;

  new_paper_ticket_id:any=null;
  paper_ticket_id_error:any='';
  hide_modal_paper_ticket:boolean=false;

  show_add_dumpsite:boolean=false;
  addDumpsite!:FormGroup;
  loading_add:boolean=false;
  isFormClicked:boolean=false;

  hide_modal_paper_ticket_photo:boolean=false;
  loading_paper_ticket:boolean=false;
  new_paper_ticket_photo:any=null;
  paper_ticket_photo_error:any='';
  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private fb : FormBuilder,
    private driver_service: DriverService,
    private responsiveService: ResponsiveService,
    private project_service: ProjectService,
    private freelance_driver: FreelanceDriverServiceService,
    private freelance_service:   FreelanceDriverServiceService,
    private changeDetector: ChangeDetectorRef,
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
              this.loading_details=false;
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
            this.loading_details=false;
            if(response.status ){

            }
          })
        }

      }
    });


    this.addDumpsite = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
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
      const conversionResult = this.ticket_service.timeConversion2(data);
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

  getRoundToStart(){

    if(this.ticket_detail ){

      if(this.ticket_detail?.rounds && this.ticket_detail?.rounds){
        let rounds = [];

        rounds = this.ticket_detail?.rounds;

        for(var i =0 ;i<rounds.length;i++ )
        {

          if(rounds[i] && rounds[i].id && (rounds[i].driver_start_time == '' || rounds[i].driver_start_time == null) ){

            this.round_to_start = rounds[i];

            break;
          }

        }
      }
    }
  }


  setHidePaperTicketPhotoModal(){
    this.hide_modal_paper_ticket_photo = !this.hide_modal_paper_ticket_photo;
  }
  onFileSelected(event:any)
  {
    this.new_paper_ticket_photo = event.target.files[0];

    this.handlePaperTicketPhoto();
  }

  handlePaperTicketPhoto(){
    this.paper_ticket_photo_error = '';
    if(!this.new_paper_ticket_photo){
      this.paper_ticket_photo_error = 'Paper ticket photo is required!';
      return;
    }

    const formData = new FormData();
    formData.append('user_id',  this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('ticket_id',  this.ticket_detail.id);
    formData.append('paper_ticket_photo',  this.new_paper_ticket_photo);
    formData.append('is_freelance_ticket',  'YES');
    this.loading_paper_ticket=true;
    this.driver_service.updatePaperTicketPhoto(formData).subscribe(response=>{
      this.loading_paper_ticket=false;
      if(response.status){
        // alert(this.edited_hours)
        this.new_paper_ticket_photo=null;
        this.paper_ticket_photo_error = '';
        this.hide_modal_paper_ticket_photo=false;
        this.getTicketDetail();


      }else{

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to update paper ticket photo!'
        );
      }
    });
  }

  setPickupSite(event:any){
    if(event.target.value){
      this.pickup_site = event.target.value

    }
  }
  getRoundInProgress(){
    if(this.ticket_detail ){

      if(this.ticket_detail?.rounds && this.ticket_detail?.rounds){
        let rounds = [];
        rounds = this.ticket_detail?.rounds;
        for(var i =0 ;i<rounds.length;i++ )
        {
          if(rounds[i] && rounds[i].id && rounds[i].driver_start_time !=null && !rounds[i].end_time ){
            this.round_in_progress = rounds[i];
            console.log(this.round_in_progress)
            if(this.round_in_progress && this.round_in_progress?.driver_start_time){
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }
            break;
          }
        }
    }

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
        if(this.ticket_detail?.project?.dump_sites){
          this.dump_sites = JSON.parse(this.ticket_detail?.project?.dump_sites);
        }

        this.more_more_tickets = response.data?.more_more_tickets;
        this.more_tickets = response.data?.more_tickets;


        this.hours = [];
       var total=parseInt(this.ticket_detail?.driver_hours);
       total =total>0? total+50: 1+50;
        for(var i=0;i<total;i++){
          this.hours.push( i);
        }
        this.hours.unshift(-2, -1);


        if(this.edited_hours !==''){

        }else{
          this.edited_hours= this.ticket_detail?.driver_hours;
          this.edited_mints = this.ticket_detail?.driver_minutes;
        }


        this.getRoundToStart();
        this.getRoundInProgress();

        this.starttime();

        if(response.data?.all_done){
          this.all_rounds_done = true;
          this.round_in_progress=null;
          this.round_to_start=null;

        }
        if(this.ticket_detail && this.ticket_detail?.started_at && this.ticket_detail?.started_at !=''){

          this.jobTime = new Date(this.ticket_detail?.started_at);
        }


        this.changeDetector.detectChanges();

      }
    })
  }


  projectDetails(project_id:any){

    this.project_service.projectDetails(project_id).subscribe(response=>{

      if(response.status && response.data){

        this.dump_sites = response.data?.dump_sites;

      }
    })
  }


  handleAddRound(){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      action:'add_round'
    }

    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      if(response.status){
        if(response.data){
          if(response.data.all_done){
            this.all_rounds_done = true;
          }else{

            this.all_rounds_done = false;
            this.ticket_detail = response.data.driver_ticket;
            if(this.ticket_detail?.started_at && this.ticket_detail.started_at !=''){
              this.jobTime = new Date(this.ticket_detail.started_at);
            }
            this.round_in_progress = response.data.started_round;
            if(this.round_in_progress && this.round_in_progress?.driver_start_time){
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);

            }

            this.getRoundInProgress();
            this.getTicketDetail();
            if(response.data.is_existing_round =='YES'){
              this.handleStartRound(response.data.started_round)
            }
            if((this.ticket_detail?.is_without_rounds=='1' || this.ticket_detail?.is_without_rounds==1) && this.ticket_detail?.rounds?.length==1){
              window.location.href='/freelance-inprogress-detail/'+this.ticket_detail?.id;
            }
          }
        }
      }else{
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to add round!'
        );
      }
    })
  }

  handleSendApproval(){
    if((!this.ticket_detail?.paper_ticket_id || !this.ticket_detail?.paper_ticket_photo)){
      if(!this.ticket_detail?.paper_ticket_id && !this.ticket_detail?.paper_ticket_photo ){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Paper ticket ID and Picture of the paper ticket required by the dispatcher'
        );
      }

      if(!this.ticket_detail?.paper_ticket_id && this.ticket_detail?.paper_ticket_photo ){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Paper ticket ID required by the dispatcher'
        );
      }

      if( !this.ticket_detail?.paper_ticket_photo && this.ticket_detail?.paper_ticket_id ){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Picture of the paper ticket required by the dispatcher'
        );
      }
      return;
    }



    let data ={
      action:"approve_ticket",
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      notes_for_approver:this.notes_for_approval,
      edited_hours:this.edited_hours,
      edited_mints:this.edited_mints
    }
    this.loading_send_approval=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      this.loading_send_approval=false;
      if(response.status){
        this.getTicketDetail();
        this.round_in_progress = null;
        this.round_to_start = null;
        this.router.navigateByUrl('/freelance-approved-detail/'+this.ticket_detail.id);
      }else{
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to approve.'
        );
      }
    });
  }

  handleEndJob(){

    this.all_rounds_done = true;
    this.round_in_progress =null;
    this.round_to_start = null;
    this.getTicketCompleteData();
  }

  getZoneTime(time:any){
    let tz = environment.timeZone;
    var d = new Date(time);
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    return new Date(samp_date);
   }

  starttime(){
    interval(1000).subscribe(() => {
      if (!(this.changeDetector as ViewRef).destroyed) {
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getElapsedTime(entry:any): TimeSpan {
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
    console.log(minutes)
    if(minutes<10){
      minutes = 0+minutes;
    }
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
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

  handleEndRound(round:any){
    let data ={
      action:"round_ended",
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      round_id:round.id,
    }

    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      if(response.status){
        if(response.data.all_done){
          this.all_rounds_done = true;
          this.round_in_progress =null;
          this.round_to_start = null;

          this.getTicketDetail();
          // this.getTicketCompleteData();
        }else{
          this.getTicketDetail();
          this.round_in_progress = null;
          this.getRoundToStart();
        }
      }else{
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to end the round!'
        );
      }
    });
  }

  getTicketCompleteData(skip_time:boolean=false){
    let data ={
      action:'complete_data',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
    }
    this.loading_send_approval=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      this.loading_send_approval=false;
      if(response.status){
        this.ticket_detail = response.data.driver_ticket;
        if(!skip_time){
          this.edited_hours=  this.ticket_detail?.driver_hours;
          this.edited_mints = this.ticket_detail?.driver_minutes;
        }
        this.getTicketDetail();
      }
    });
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

    if(!this.new_paper_ticket_id){
      this.paper_ticket_id_error = 'Paper ticket id is required!';
      return;
    }

    let data ={
      action: 'update_paper_ticket_id',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      paper_ticket_id: this.new_paper_ticket_id
    }

    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{

      if(response.status){
        // alert(this.edited_hours)
        this.new_paper_ticket_id=null;
        this.hide_modal_paper_ticket=false;
        this.getTicketDetail();
        // const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'btn bg-pink width-200'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire(
        //   'Success',
        //   'Paper ticket id updated!'
        // );

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

  handleStartRound(round:any){

    if((  this.ticket_detail?.is_without_rounds =='1' || this.ticket_detail?.is_without_rounds ==1 )&& !round.dump_site || !round.material_taken_out ){
       const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
        title:"Warning",
        text:'Material taken out, pickup site and dumpsite are required',
        confirmButtonColor:"#FDD7E4",

      })
      return;
    }
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.id,
      round_id:round.id,
      action:'start_round'
    }

    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      if(response.status){
        if(response.data){
          this.getTicketDetail();
          this.starttime();
          if(response.data.all_done){
            this.all_rounds_done = true;
          }else{

            if(this.ticket_detail?.started_at && this.ticket_detail.started_at !=''){
              this.jobTime = new Date(this.ticket_detail.started_at);
            }
            this.round_in_progress = response.data.started_round;
            if(this.round_in_progress && this.round_in_progress?.driver_start_time){
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }
          }

        }
      }else{
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

  setRoundPopup(type:any,round_id:any,current_site:string='',notes:string='',material:string=''){
    if(type !==""){
      this.show_round_update_popup = type;
    }
    if(round_id !=''){
      this.update_round_id = round_id;
    }

    if(current_site !=""){
      if(type=='pickupsite-popup'){
        this.pickup_site = current_site;
      }else{
        this.new_dum_site= current_site;
        this.new_dum_site= current_site;
      }

    }

    if(notes !=''){
      this.driver_round_notes = notes;
    }

    if(material !=""){
      this.new_material_taken_out = material;
    }
  }

  closeRoundPopup(){
    this.update_round_id=null;
    this.show_round_update_popup='';
    this.new_material_taken_out='';
    this.new_dum_site='';
    this.driver_round_notes='';
    this.loading_update=false;
  }

  setNewDumpSite(dumpsite:any,dump_site_name:any){
    if(dumpsite !=""){
      this.new_dum_site = dumpsite;
      this.new_dump_site_name = dump_site_name;
    }
  }

  setNewMaterial(event:any){

    if(event.target.value !=""){

      this.new_material_taken_out = event.target.value;
    }
  }

  setNewNotes(event:any){

      this.driver_round_notes = event.target.value;

  }

  handleSiteChange(){

    this.new_dumpsite_error='';
    if(this.new_dum_site ==""){
      this.new_dumpsite_error=" Please select a dumpsite.";
      return;
    }

    let data={
      action:'change_round_dumpsite',
      ticket_id: this.ticket_detail?.id,
      round_id:this.update_round_id,
      dump_site_id: this.new_dum_site,
      dump_site_name:this.new_dump_site_name
    };
     this.loading_update=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      this.loading_update=false;
      if(response.status){
        //  const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'btn bg-pink width-200'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire(
        //   `Success`,
        //   'Dumpsite changed!').then(() => {
        //   })

          this.closeRoundPopup();
          this.getTicketDetail();
        }else{
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Error`,
            'Unable to change dumpsite').then(() => {

            })
        }
      });


  }

  handleUpdatePickupSite(){

    this.pickup_site_error='';
    if(this.pickup_site ==""){
      this.pickup_site_error=" Please enter pickup site.";
      return;
    }

    let data={
      action:'change_round_pickup_site',
      ticket_id:this.ticket_detail?.id,
      round_id:this.update_round_id,
      pickup_site: this.pickup_site
    };
     this.loading_update=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{
      this.loading_update=false;
      if(response.status){
        //  const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'btn bg-pink width-200'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire(
        //   `Success`,
        //   'Pickup site changed!').then(() => {
        //   })
          this.closeRoundPopup();
          this.getTicketDetail();
        }else{
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Error`,
            'Unable to change pickup site!').then(() => {

            })
        }
      });


  }

  handleNewMaterial(){
    this.new_material_error='';
    if(this.new_material_taken_out ==""){
      this.new_material_error=" Please enter new material.";
      return;
    }

    let data={
        action:'change_material',
        ticket_id:this.ticket_detail?.id,
        round_id:this.update_round_id,
        material_taken_out: this.new_material_taken_out
      };
     this.loading_update=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{

      this.loading_update=false;
      if(response.status){

          this.closeRoundPopup();
          this.getTicketDetail();
        }else{
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Error`,
            'Unable to update material taken out!').then(() => {

            })
        }
      });
  }

  handleNewNotes(){

    this.round_notes_error='';


    let data={
      action:'update_round_notes',
      ticket_id:this.ticket_detail?.id,
      round_id:this.update_round_id,
      driver_notes: this.driver_round_notes
    };
    this.loading_update=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{

      this.loading_update=false;
      if(response.status){
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          'Round notes updated!').then(() => {
            this.closeRoundPopup();
            this.getTicketDetail();
          })
        }else{
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Error`,
            'Unable to update round notes!').then(() => {

            })
        }
      });
  }

  updateJobNotes(){
    this.job_notes_error='';
    if(this.notes_for_approval ==""){
      this.job_notes_error=" Please enter notes.";
      return;
    }

    let data={
      action:'update_job_notes',
      ticket_id:this.ticket_detail.id,
      notes_for_approval: this.notes_for_approval
    };
     this.loading_update=true;
    this.freelance_service.freelanceTicketAction(data).subscribe(response=>{

      this.loading_update=false;
      if(response.status){

        this.show_notes_popup=false;
        this.getTicketDetail();

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

  toggleDetail(id:any){

    if(this.detail_round_id !=null){
      this.detail_round_id = null;
    }else{
      this.detail_round_id = id;
    }
  }

  showNotesPopup(){
    this.show_notes_popup =  !this.show_notes_popup;
    // alert(this.show_notes_popup)
  }

  showEditTimePopup(){
    this.show_time_edit_popup= !this.show_time_edit_popup;

    setTimeout(() => {
      let elmnt:any = document.getElementById("hour-active"); // let if use typescript

      if( elmnt !==undefined){
        elmnt.scrollIntoView({block: "center"}); // this will scroll elem to the top
        // window.scrollTo(0, 0);

      }

    },1000);
    setTimeout(() => {
      let elmnt:any = document.getElementById("hour-active"); // let if use typescript

      if( elmnt !==undefined){
        elmnt.scrollIntoView({block: "center"}); // this will scroll elem to the top
        // window.scrollTo(0, 0);

      }

    },2000);


  }

  get_mints(mints:any){
    let mint:any= parseInt(mints.toString());
    let minutes=0;
  }

  setHours(hours:any){
    this.edited_hours = hours;
  }

  setMinutes(mints:any){
    this.edited_mints = mints;
  }

  moveToStatus(status:any,dt_id:any){
    if(status=='Accepted'){

      this.router.navigate(["/accepted-job-detail",dt_id]);
    }else if(status=='Completed'){
      this.router.navigate(["/completed-job-detail",dt_id]);
    }else if(status=='Driving'){
      window.location.href= "/inprogress-job-detail/"+dt_id;
    }else if(status=='Approved'){
      this.router.navigate(["/approved-job-detail",dt_id]);
    }else{

      window.location.href= "/request-job-detail/"+dt_id;
    }
  }

  parseJobTime(rounds:any){
    var time:any = '';
    var hours = 0;
    var mints = 0;
    if(rounds && rounds.length>0){
      rounds.map((item:any)=>{

        var rr = [];
        if(item?.round_time){
          rr= item.round_time.split(' ');
        }

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
      })
    }

    return Math.round(hours)+' hr '+Math.round(mints)+' min'
  }

  showAddDumpSite(){
    this.isFormClicked=false;
    this.show_add_dumpsite=true;
  }

  hideAddDumpSite(){
    this.isFormClicked=false;
    this.show_add_dumpsite=false;
  }

  handleAddDumpsite(){

    this.isFormClicked=true;
    if(this.addDumpsite.invalid){
      return;
    }


    let formData:any=this.addDumpsite.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    formData.project_id = this.ticket_detail?.project.id;

    formData.is_default = 0;
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'dumpsite',
      project_id: this.ticket_detail?.project.id,
      data: formData
    }

    this.loading_add=true;
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.loading_add=false;
      if(response.status ){
        this.addDumpsite.reset();
        this.show_add_dumpsite=false;
        this.isFormClicked=false;
        this.getTicketDetail()
      }
    });
  }
}


