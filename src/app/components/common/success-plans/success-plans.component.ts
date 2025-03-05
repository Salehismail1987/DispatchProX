import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-success-plans',
  templateUrl: './success-plans.component.html',
  styleUrls: ['./success-plans.component.css']
})
export class SuccessPlansComponent implements OnInit {

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
      if (isMobile  || width <= 768){
        const targetUrl = `${environment.mobileDashboardURL}success-plan?${queryString}`;
        window.location.href = targetUrl;
      }


    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
       } else {
      this.router.navigate(['/home']);
    }

    this.aRouter.queryParams.subscribe(params => {
      if(params['plan'] && params['plan'] !=""){
        if(params['state'] && params['state'] === 'succeeded'){
          const formData = new FormData();

          formData.append('user_id', this.loggedInUser.id);
          formData.append('plan', params['plan']);
          formData.append('sub_id', params['sub_id']);
          formData.append('id', params['id']);
          formData.append('invoice_id', params['invoice_id']);


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
