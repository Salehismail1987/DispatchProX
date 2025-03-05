import { Component, Input, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
  selector: 'app-driver-header',
  templateUrl: './driver-header.component.html',
  styleUrls: ['./driver-header.component.css']
})
export class DriverHeaderComponent implements OnInit {

  @Input('active_menu') active_menu:any;
  
  loggedinUser : any = {};

  screen:string  ='';
  
  menu_counts:any = {};
  
  backendAPIURL = environment.apiBackendUrl;
  constructor(
    private responsiveService: ResponsiveService,
    private user_service:UserDataService,
    private router: Router
  ) { 
    
  }

  ngOnInit(): void {
    
    this.onResize();
    this.responsiveService.checkWidth();
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    let data = {user_id:userDone?.id,account_type: userDone?.user_data_request_account_type ?
userDone?.user_data_request_account_type : userDone?.account_type};
    this.getMenuCounts(data);

    $(document).on('click','#sidebarCollapse', function() {

      if($('#sidebar').hasClass('active')){
        setTimeout(() => {          
          $('#sidebar').removeClass('active');
        }, 500);
      }else{
        setTimeout(() => {          
          
          $('#sidebar').addClass('active');
        }, 500);
      }
    });

  }

  getMenuCounts(data:any){
 
      
    var count:any =localStorage.getItem('TraggetUserMenuCounts');
    let counts = JSON.parse(count);
  
    if(counts && counts !==null && counts!==undefined){
      this.menu_counts= counts;
      console.log(this.menu_counts)
    }else{
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
          this.menu_counts = response.data;
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(this.menu_counts));
        }
      })
  
    }
  }


  logoutUser(){
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    sessionStorage.removeItem('TraggetUserTrial');
    localStorage.removeItem('TraggetUserMenuCounts');
    localStorage.removeItem('Unknown_disp');
    this.router.navigate(['/home']);
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
    });
  }

  driverNavigate(to:any,param:any){
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([to], {queryParams: {"status": param}});
  } 

}

