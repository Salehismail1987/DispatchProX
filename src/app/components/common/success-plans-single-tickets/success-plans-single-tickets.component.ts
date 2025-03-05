import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-success-plans-single-tickets',
  templateUrl: './success-plans-single-tickets.component.html',
  styleUrls: ['./success-plans-single-tickets.component.css']
})
export class SuccessPlansSingleTicketsComponent implements OnInit {
  loggedInUser:any;
  constructor(
    private router: Router,
    private aRouter:ActivatedRoute,
    private plan_service: PlansService

  ) { }

  ngOnInit(): void {
    const queryParams = this.aRouter.snapshot.queryParams;
    const queryString = new URLSearchParams(queryParams).toString();

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|android|blackberry|mobile|windows phone/.test(userAgent);
    const isTablet = /ipad|tablet/.test(userAgent);

    var width = window.innerWidth;
    if (isMobile || width <= 768){
      const targetUrl = `${environment.mobileDashboardURL}success-plan-single-tickets?${queryString}`;
      window.location.href = targetUrl;
    }



    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
       } else {
      this.router.navigate(['/home']);
    }

    this.aRouter.queryParams.subscribe(params => {

      if(params['id'] && params['id'] !=""){

        if(params['state'] && params['state'] === 'succeeded'){
          const formData = new FormData();

          formData.append('user_id', this.loggedInUser.id);
          formData.append('plan',  "10-Pack");
          formData.append('sub_id', '');
          formData.append('id', params['id']);
          formData.append('invoice_id', '');


          this.plan_service.saveUserPlan(formData).subscribe(response => {
            if(response.status && response.message){
              Swal.fire(

              {
                confirmButtonColor:'#17A1FA',
                title:   'Success',
                text:
                response.message
              }).then(()=>{
                this.router.navigate(['/dashboard'])
              });


            }else{
              Swal.fire(
              {
                confirmButtonColor:'#17A1FA',
                title:    'Warning',
                text:
                'Problem in Processing Payments. Contact support.'
              }).then(()=>{
                this.router.navigate(['/dashboard'])
              });
            }
          });
        }

      }
    });
  }

}
