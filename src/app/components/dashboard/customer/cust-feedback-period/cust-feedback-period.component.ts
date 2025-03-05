import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlansService } from 'src/app/services/plans.service';
@Component({
  selector: 'app-cust-feedback-period',
  templateUrl: './cust-feedback-period.component.html',
  styleUrls: ['./cust-feedback-period.component.css']
})
export class CustFeedbackPeriodComponent implements OnInit {

  active_menu:any;
  loggedInUser:any;
  feedBackForm!: FormGroup;

  is_loading:boolean=false;
  show_modal:boolean=false;
  feedbackError:any='';

  last_30_days_tickets:any='';
    constructor(
      private router: Router,
      private aRouter:ActivatedRoute,
      private fb: FormBuilder,
      private plan_service: PlansService
    ) { 
      this.active_menu = {
        parent:'tragget-ticket',
        child:'tragget-ticket',
        count_badge: '',
      }
    }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
       } else {
      this.router.navigate(['/home']);
    }
    var formData:any = {user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id};
    this.plan_service.getLast30DaysTickets(formData).subscribe((response:any)=>{
              
      if (response && response.status && response.data ) {

        this.last_30_days_tickets = response.data?.last_30_days_tickets;
      }
    });
    this.feedBackForm = this.fb.group({
      feedback: ['', Validators.required],
      user_id: [this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id]
    });
  }

  onSendFeedback(){
    this.feedbackError='';
    if(this.feedBackForm.invalid){
      this.is_loading=false;
      this.feedbackError='Feedback is required!';
      return
    }

    let data= {
      user_id:this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id,
      feedback: this.feedBackForm.get('feedback')?.value
    };
    this.is_loading=true;
    this.plan_service.sendFeedback(data).subscribe((response:any)=>{
      this.is_loading=false;    
      if (response && response.status ) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          `Feedback sent!`).then(() => { 
            
          });
        this.feedBackForm.reset();
        this.hideFeedbackModal();
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          `Problem in sending feedback!`).then(() => { 
            
          });
      }
    });
  }

  showFeedBackModal(){
    this.is_loading=false;
    this.show_modal=true;
  }

  hideFeedbackModal(){
    this.show_modal=false;

  }
}
