import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-deriver-dashboard-desktop-scheduler',
  templateUrl: './deriver-dashboard-desktop-scheduler.component.html',
  styleUrls: ['./deriver-dashboard-desktop-scheduler.component.css']
})
export class DeriverDashboardDesktopSchedulerComponent implements OnInit {

  loggedinUser:any=null;
  dashboard_data:any=null;
  datejobs:any=null;
  date_today:any=null;
  screen:string='desktop';

  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private user_service:UserDataService
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
     let tz = environment.timeZone;
     var d = new Date(); 
     this.date_today = d.toLocaleString('en-US', { timeZone: tz });

     this.getDashboardData();
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
      // if(this.screen=='mobile'){
      //   this.router.navigate(['/dashboard']);
      // }
    });
  }
  
  getDashboardData(){
  
    if(this.loggedinUser && this.loggedinUser?.id){
      let data = {data_for:'Driver Desktop',user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,date:this.date_today,user_type:'Driver'};
  
    this.user_service.getDashboardData(data).subscribe(response => {
      if(response && response.status){
        if(response.data){
          this.dashboard_data = response.data;
         
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

  goToStatus(status:any){
    window.location.href = ('/driver-scheduler?status='+status);
  }

}
