import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-driver-tickets-calendar-list',
  templateUrl: './driver-tickets-calendar-list.component.html',
  styleUrls: ['./driver-tickets-calendar-list.component.css']
})
export class DriverTicketsCalendarListComponent implements OnInit {

  tickets_list:any=null;
  loggedinUser:any=null;
  screen:string='mobile';
  loading:boolean=true;
  
  active_tab:string='ticket-detail';

  date_today:any=null;
  driver_ticket_date:any=null;
  
  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private ticket_service: TicketService,
    private driver_service: DriverService
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

    this.driver_ticket_date = this.actRouter.snapshot.params['calendar_date'] ? this.actRouter.snapshot.params['calendar_date']:'';
    if(this.driver_ticket_date){
      this.getDriverTicketsByDate();
    }
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


  getDriverTicketsByDate(){

      this.loading=true;
      let data = {ticket_date:this.driver_ticket_date,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id};
      this.driver_service.getDriverTicketsByDate(data).subscribe(response=>{
        this.loading=false;
        if(response.status ){
          this.tickets_list = response.data;
        }
      })
     
  }

}
