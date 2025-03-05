import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-freelance-request-job-detail',
  templateUrl: './freelance-request-job-detail.component.html',
  styleUrls: ['./freelance-request-job-detail.component.css']
})
export class FreelanceRequestJobDetailComponent implements OnInit {
  
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

  loading_details:boolean=true;
  
  more_tickets:any=null;
  date_today:any;
  notification_id:any=null;
  notification_type:any=null;

  more_more_tickets:any=null;

  approver:any=null;
  dispatcher:any=null;
  rounds:any=null;

 constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private user_service:   UserDataService,
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

   
  }

  getTicketDetail(){
    this.loading_details=true;
    let data = {date:this.date_today,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,driver_ticket_id: this.driver_ticket_id};
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{
      this.loading_details=false;
      if(response.status ){
        this.ticket_detail = response.data;
        this.rounds = this.ticket_detail?.rounds ? this.ticket_detail?.rounds:null;
        this.dispatcher = this.ticket_detail?.dispatcher;
        this.approver = this.ticket_detail?.approver;
        
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
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, 
        ticket_id: this.ticket_to_decline.id,
        reason: this.reason_decline
      };
    
    this.loading_reject=true;
    
    this.driver_service.rejectDriverTicket(data).subscribe(response=>{
      this.loading_reject=false;
      if(response.status){

        if(this.notification_id && this.notification_type=='New Driver Job'){
          let data:any={notification_id:this.notification_id};
          this.notification_service.markNotificationViewed(data).subscribe(response=>{
            this.loading_details=false;
            if(response.status ){
              
            }
          })
        }
        
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

  handleAcceptTicket(driver_ticket:any){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, ticket_id:driver_ticket.ticket_id};
    this.driver_service.acceptDriverTicket(data).subscribe(response=>{
      if(response.status){
        if(response.status){

          if(this.notification_id && this.notification_type=='New Driver Job'){
            let data:any={notification_id:this.notification_id};
            this.notification_service.markNotificationViewed(data).subscribe(response=>{
              this.loading_details=false;
              if(response.status ){
                
              }
            })
          }
        }
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          response.message).then(() => { 
            this.router.navigate(['/accepted-job-detail',driver_ticket.id]);
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

  moveToStatus(status:any,dt_id:any){
    if(status=='Accepted'){

      this.router.navigate(["/accepted-job-detail",dt_id]);
    }else if(status=='Completed'){
      this.router.navigate(["/completed-job-detail",dt_id]);
    }else if(status=='Driving'){
      this.router.navigate(["/inprogress-job-detail",dt_id]);
    }else if(status=='Approved'){
      this.router.navigate(["/approved-job-detail",dt_id]);
    }else{

      window.location.href= "/request-job-detail/"+dt_id;
    }    
  }
}
