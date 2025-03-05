import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlansService } from 'src/app/services/plans.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-tc-trial-period',
  templateUrl: './tc-trial-period.component.html',
  styleUrls: ['./tc-trial-period.component.css']
})
export class TcTrialPeriodComponent implements OnInit {
  active_menu:any;
  loggedInUser:any;
  days_left:any = null;
  is_free_trial:any =null;
  is_subscribed:any='NO';
  is_expired:any='NO';
  menu_counts:any = null;
  last_30_days_tickets:any=0;
  last_30_days_closed_tickets:any=0;
    constructor(
      private router: Router,
      private aRouter:ActivatedRoute,
      private fb: FormBuilder,
      private ticket_service: TicketService,
      private user_service:UserDataService,
      private plan_service: PlansService
    ) { 
      this.active_menu = {
        parent:'tragget-ticket',
        child:'tragget-ticket',
        count_badge: '',
      }

      let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
      if (userDone && userDone.id) {
        this.loggedInUser = userDone;
         } else {
        this.router.navigate(['/home']);
      }
  
      
      var tt:any= sessionStorage.getItem('TraggetUserSub');
      
      if(tt && tt!==null){
          
        let userSubs = this.user_service.decryptData(tt);
        this.is_subscribed = userSubs;
      
      }else{
        let data = { user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id, account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type : userDone?.account_type };

        this.user_service.getSubStatus(data).subscribe(response=>{
          if(response.status ){

            if(response.is_valid == true){
              this.is_subscribed = 'YES';
              let datas:any= this.user_service.encryptData(this.is_subscribed);
              sessionStorage.setItem('TraggetUserSub',(datas));
            }else{

            }
          }
        });
      }

      let formData:any = {user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id}
    
      this.plan_service.checkFreeTrial(formData).subscribe((response:any)=>{
        if(response && response.data){
          this.days_left = response.data.days_to_expired;
          this.is_free_trial = response.data.is_free_trial;
          let datas:any= this.user_service.encryptData(this.is_free_trial);
          sessionStorage.setItem('TraggetUserTrial',(datas));
          this.is_expired=response.data.is_expired;
          if(this.is_expired=='YES'){
            this.router.navigate(['tc-tragget-tickets']);
          }
        }else{
          let datas:any= this.user_service.encryptData(this.is_free_trial);
          sessionStorage.setItem('TraggetUserTrial',(datas));
    
          var tt:any= sessionStorage.getItem('TraggetUserSub');
       
          if(tt && tt!==null){
              
            let userSubs = this.user_service.decryptData(tt);
            this.is_subscribed = userSubs;
            if(this.is_subscribed=='YES'){
              
              this.router.navigate(['/tc-tragget-tickets']);
            }
          }else{
            let data = { user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id, account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type : userDone?.account_type };

            this.user_service.getSubStatus(data).subscribe(response=>{
              if(response.status ){
      
                if(response.is_valid == true){
                  this.is_subscribed = 'YES';
                  let datas:any= this.user_service.encryptData(this.is_subscribed);
                  sessionStorage.setItem('TraggetUserSub',(datas));
                  
                  this.router.navigate(['/tc-tragget-tickets']);
                }else{

                }
              }
            });
          }
        }
      });
    }

  ngOnInit(): void {
  
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
       } else {
      this.router.navigate(['/home']);
    }

    let data = { user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id, account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type : userDone?.account_type };

    var count: any = localStorage.getItem('TraggetUserMenuCounts');
    let counts = JSON.parse(count);

    if (counts && counts !== null && counts !== undefined) {
      this.menu_counts = counts;
      console.log(this.menu_counts)
    } else {
      this.user_service.getMenuCounts(data).subscribe(response => {
        if (response.status) {
          this.menu_counts = response.data;
          localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(this.menu_counts));
        }
      })

    }
    var formData:any = {user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id};
    this.plan_service.getLast30DaysTickets(formData).subscribe((response:any)=>{
              
      if (response && response.status && response.data ) {

        this.last_30_days_tickets = response.data?.last_30_days_tickets;
      }
    });
    this.ticket_service.get30DaysClsoedTickets(formData).subscribe((response:any)=>{
              
      if (response && response.status && response.data ) {

        this.last_30_days_closed_tickets = response.data?.last_30_days_closed_tickets;
      }
    });


  }

}
