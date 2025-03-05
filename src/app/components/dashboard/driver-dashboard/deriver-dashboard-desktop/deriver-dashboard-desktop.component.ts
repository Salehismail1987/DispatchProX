import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-deriver-dashboard-desktop',
  templateUrl: './deriver-dashboard-desktop.component.html',
  styleUrls: ['./deriver-dashboard-desktop.component.css']
})
export class DeriverDashboardDesktopComponent implements OnInit {
  show_scheduler:boolean=false;
  loggedinUser:any=null;
  screen:string='desktop';
  active_menu:any;
  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
    private user_service: UserDataService,
    private tc_service:TruckingCompanyService
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

    
    this.updateMenuCounts();
    if(parseInt(this.loggedinUser?.is_setup_shown.toString())==1  ){
      this.router.navigate(['/driver-dashboard-scheduler']);
    }
  }


  updateMenuCounts(){
    let data = {user_id:this.loggedinUser?.id,account_type: this.loggedinUser?.account_type};
     
    this.user_service.getMenuCounts(data).subscribe(response=>{
      if(response.status){
        localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response.data));
      }
    })
  }
  
  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='mobile'){
        this.router.navigate(['/dashboard']);
      }
    });
  }

  setSetupStatus(event:any){
    if(event.target.checked){
      this.tc_service.setSetupStatus(this.loggedinUser.id).subscribe(response=>{
        if(response && response.status){
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          
        }
      });
    }
      
  }

  showScheduler(){
    this.router.navigate(['/driver-dashboard-scheduler']);
  }

}
