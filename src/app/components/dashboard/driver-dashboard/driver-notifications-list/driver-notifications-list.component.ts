import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-driver-notifications-list',
  templateUrl: './driver-notifications-list.component.html',
  styleUrls: ['./driver-notifications-list.component.css']
})
export class DriverNotificationsListComponent implements OnInit {
  screen:string = '';
  header_text:string='';
  loggedinUser : any = {};

  loading:boolean=false;
  

  notifications:any=null;
  constructor(
    private router:Router,
    private notification_service: NotificationService,
    
    private responsiveService: ResponsiveService,
  ) { 
    this.responsiveService.checkWidth();
    this.onResize();
  }


  ngOnInit(): void {

    this.responsiveService.checkWidth();
    this.onResize();
   
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    this.getAllNotifications();
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

  getAllNotifications(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id};
    this.loading=true;
    
    this.notification_service.getAllNotifications(data).subscribe(response=>{
      this.loading=false;
      if(response.status && response.notifications){
        this.notifications = response.notifications;
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
      }else if(notf && notf.id && notf?.tc_ticket?.status=='Completed'){
        this.router.navigateByUrl("/tc-request-job-detail/"+dt_id+"?notid="+notf.id+"&&type="+notf.type);
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
}
