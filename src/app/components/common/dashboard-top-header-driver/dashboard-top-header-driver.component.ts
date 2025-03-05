import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
  selector: 'app-dashboard-top-header-driver',
  templateUrl: './dashboard-top-header-driver.component.html',
  styleUrls: ['./dashboard-top-header-driver.component.css']
})
export class DashboardTopHeaderDriverComponent implements OnInit {

  
  @Input('is_dashboard') is_dashboard:any;

  
  @Input('header_text') header_text:string = '';
  loggedinUser:any;

  screen:string = '';
  notifications:any=null;
  
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  constructor(
    private responsiveService: ResponsiveService,
    private router: Router,
    private notification_service:NotificationService
  ) { 
    

    this.responsiveService.checkWidth();
    this.onResize();
  }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone && !userDone.full_name){
      this.router.navigate(['/home'])
    }

    $(document).on('click','.nav-single', function() {
      
      $('#headerDriverMenuPopup').modal('hide');
      $('#headerDriverMenuPopup').hide('modal');
      $('#headerUserMenuPopup').modal('hide');
      $('#headerUserMenuPopup').hide('modal');
      
      $(".modal-backdrop").hide();
      $('.modal-backdrop').removeClass('show');
      
      $('body').removeClass('modal-open');
      
      $('.modal-backdrop').addClass('hide');
    });

    this.getAllNotifications();
  }

  getAllNotifications(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id};
   
    
    this.notification_service.getAllNotifications(data).subscribe(response=>{
     
      if(response.status && response.notifications){
        this.notifications = response.notifications;
      }
    })
  }

  logoutUser(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    sessionStorage.removeItem('TraggetUserTrial');
    localStorage.removeItem('Unknown_disp');

    localStorage.removeItem('TraggetUserMenuCounts');
    this.router.navigate(['/home']);
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
    });
  }

  logout(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    localStorage.removeItem('TraggetUserMenuCounts');
    this.router.navigate(['/home']);
  }
}
