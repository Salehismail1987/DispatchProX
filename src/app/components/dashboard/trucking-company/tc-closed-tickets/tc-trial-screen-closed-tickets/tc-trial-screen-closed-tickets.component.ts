import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-tc-trial-screen-closed-tickets',
  templateUrl: './tc-trial-screen-closed-tickets.component.html',
  styleUrls: ['./tc-trial-screen-closed-tickets.component.css']
})
export class TcTrialScreenClosedTicketsComponent implements OnInit {
  loggedinUser: any = {};
  trial_data:any=null;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private plan_service:PlansService,
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      if(!this.loggedinUser?.open_paper_ticket_photo ){

        this.loggedinUser.open_paper_ticket_photo = 'NO';
        localStorage.setItem('TraggetUser',JSON.stringify(this.loggedinUser));
      }
    } else {
      this.router.navigate(['/home']);
    }

    let formData:any = {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id}
    
    this.plan_service.checkFreeTrial(formData).subscribe((response:any)=>{
      if(response && response.data){
       
        this.trial_data = response.data;
      }
    });

  }

}
