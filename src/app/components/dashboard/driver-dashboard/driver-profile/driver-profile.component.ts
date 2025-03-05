import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css']
})
export class DriverProfileComponent implements OnInit {

  screen:string = 'mobile';
  notifications:any=null;
  loggedinUser : any = {};

  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  active_menu :any;
  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
    private notification_service: NotificationService
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

    this.active_menu = {
      parent:'profile',
      child:'',
      count_badge: '',
    }

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

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='desktop' || this.screen=='tablet'){
        this.router.navigate(['/driver-dashboard-scheduler']);
      }
    });
  }

  logout(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    localStorage.removeItem('TraggetUserMenuCounts');
    this.router.navigate(['/home']);
  }

  backTo(to:any){
    this.router.navigate(['/'+to]);
  }
}
