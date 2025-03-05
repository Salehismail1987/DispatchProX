import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-driver-closed-tickets',
  templateUrl: './driver-closed-tickets.component.html',
  styleUrls: ['./driver-closed-tickets.component.css']
})
export class DriverClosedTicketsComponent implements OnInit {
 
  screen:string = '';
  loggedinUser : any = {};

  active_menu :any;
  perPage:number =10;
  page:number =0;
  ticket_pagination:any;
  ticket_detail:any;
  
  tickets: any;
  detail_selected_tab:string = 'ticket_detail';

  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
   }

  ngOnInit(): void { this.responsiveService.checkWidth();
    this.onResize();

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    this.active_menu = {
      parent:'closed-tickets',
      child:'',
      count_badge: '',
    }

    this.getAllRequests()
  }

  getAllRequests(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,perPage: this.perPage, page:this.page};
    this.driver_service.getAllClosedTickets(data).subscribe(response=>{
      if(response.status){
        this.tickets = response.data.all_tickets.data;
        this.ticket_pagination = response.data.all_tickets;
      }
    })
  }

  setDetail(driver_ticket:any){
    this.ticket_detail = driver_ticket;
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
}
