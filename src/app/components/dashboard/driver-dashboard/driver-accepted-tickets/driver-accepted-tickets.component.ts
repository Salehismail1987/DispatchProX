import { Component, OnInit, ViewRef } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {  ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CountupTimerComponent, countUpTimerConfigModel } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { environment } from 'src/environments/environment';
import { map, timer } from 'rxjs';
import { Subject, interval } from 'rxjs';

import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import Swal from 'sweetalert2';
import { NotificationService } from 'src/app/services/notification.service';

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
  selector: 'app-driver-accepted-tickets',
  templateUrl: './driver-accepted-tickets.component.html',
  styleUrls: ['./driver-accepted-tickets.component.css'],
  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverAcceptedTicketsComponent implements OnInit {

  screen:string = '';
  loggedinUser : any = {};

  active_menu :any;
  perPage:number =10;
  page:number =0;
  ticket_pagination:any;
  ticket_detail:any;
  round_to_start:any;
  round_in_progress:any;

  tickets: any;
  detail_selected_tab:string = 'ticket_detail';
  all_rounds_done:boolean = false;
  private destroyed$ = new Subject();
  
  roundTime:any;
  jobTime:any;

  notes_for_approval:string = '';
  
  ticket_to_decline:any=null;
  show_reason:boolean=false;

  reason_decline:string='';
  reason_error:string='';

  loading_reject:boolean=false;

  notification_id:any=null;
  notification_type:any=null;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private actRouter:ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private timerService: CountupTimerService,
    private notification_service: NotificationService
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
   }

   
  ngOnInit(): void { this.responsiveService.checkWidth();

    this.responsiveService.checkWidth();  
    this.onResize();
   
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    this.active_menu = {
      parent:'accepted-tickets',
      child:'',
      count_badge: '',
    }

    this.getAllRequests();
    this.starttime();
    
    if(this.ticket_detail && this.ticket_detail?.started_at && this.ticket_detail?.started_at !=''){
      
      this.jobTime = new Date(this.ticket_detail?.started_at);
    }
   

    this.changeDetector.detectChanges();
    this.getRoundToStart();

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

  getRoundToStart(){
   
    if(this.ticket_detail && this.ticket_detail?.ticket){
     
      if(this.ticket_detail?.ticket?.ticket_truck_type_rounds && this.ticket_detail?.ticket?.ticket_truck_type_rounds){
        let rounds = [];
        rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds;
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


  getRoundInProgress(){
    if(this.ticket_detail && this.ticket_detail?.ticket){
     
      if(this.ticket_detail?.ticket?.ticket_truck_type_rounds && this.ticket_detail?.ticket?.ticket_truck_type_rounds){
        let rounds = [];
        rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds;
        for(var i =0 ;i<rounds.length;i++ )
        {
          if(rounds[i] && rounds[i].id && rounds[i].driver_start_time !=null && !rounds[i].end_time ){
            this.round_in_progress = rounds[i];
            if(this.round_in_progress && this.round_in_progress?.driver_start_time){
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }            
            break;
          }
        }
    }
      
    }
  }

  getAllRequests(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,perPage: this.perPage, page:this.page};
    this.driver_service.getAllAcceptedTickets(data).subscribe(response=>{
      if(response.status){
        this.tickets = response.data.all_tickets.data;
        this.ticket_pagination = response.data.all_tickets;
      }
    })
  }

  setDetail(driver_ticket:any){
    
    driver_ticket.is_started = parseInt(driver_ticket.is_started.toString())
    this.ticket_detail = driver_ticket;
    this.getRoundToStart();
    if(this.ticket_detail?.started_at && this.ticket_detail?.started_at !=''){
      
      this.jobTime =new Date(this.ticket_detail?.started_at);
    }
    if((this.all_rounds_done ===true || this.ticket_detail?.ended_at !==null ) && !this.round_in_progress && !this.round_to_start){
      
      this.getTicketCompleteData();
    }else{
     
      this.getRoundInProgress();
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
    });
  }

  backToList(){
    this.ticket_detail = null;
    this.detail_selected_tab = 'ticket_detail';
  }

  changeDetailTab(tab:any){
    this.detail_selected_tab = tab;
    
  }

  handleStartRound(round:any){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      round_id:round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.startRound(data).subscribe(response=>{
      if(response.status){
        if(response.data){
          this.getAllRequests();
          this.starttime();
          if(response.data.all_done){
            this.all_rounds_done = true;
          }else{            
            this.ticket_detail = response.data.driver_ticket;
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

  handleEndRound(round:any){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      round_id:round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.endRound(data).subscribe(response=>{
      if(response.status){
        if(response.data.all_done){
          this.all_rounds_done = true;
          this.round_in_progress =null;
          this.round_to_start = null;
          
          this.ticket_detail = response.data.driver_ticket;
          this.getTicketCompleteData();
        }else{            
          this.ticket_detail = response.data.driver_ticket;
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
          response.message
        );
      }
    });
  }

  getTicketCompleteData(){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }
    this.driver_service.getTicketCompleteData(data).subscribe(response=>{
      if(response.status){
        this.ticket_detail = response.data.driver_ticket;
      }
    });
  }

  handleAddRound(){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.addRound(data).subscribe(response=>{
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

  handleSendApproval(){
    let data ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id,
      notes_for_approver:this.notes_for_approval
    }
    
    this.driver_service.sendForApprovel(data).subscribe(response=>{
      if(response.status){
        this.ticket_detail = response.data.driver_ticket;
        this.round_in_progress = null;
        this.round_to_start = null;

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
    });
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
}
