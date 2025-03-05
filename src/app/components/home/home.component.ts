import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loginForm!: FormGroup;
  passwordError: string = '';
  emailError: string = '';
  screen:string = '';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private registerService : RegisterService,
    private user_service: UserDataService
  ) { }

  ngOnInit(): void {


    this.onResize();
    this.responsiveService.checkWidth();

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.actRouter.queryParams.subscribe(params => {

      var link = params['link'];
      if(link && link !==null){
        if(userDone &&  userDone?.full_name ){
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserMenuCounts');
          sessionStorage.removeItem('TraggetUserTrial');
          sessionStorage.removeItem('TraggetUserSub');
          localStorage.setItem('link', link.toString());

          window.location.href = '/home';

        }else{

          localStorage.setItem('link', link.toString());


        }
      }


    });

    if(userDone &&  userDone?.full_name){

      this.router.navigate(['/dashboard']);
      if(userDone && userDone.account_type == 'Driver'){
        if(this.screen !='mobile'){

          this.router.navigate(['/driver-dashboard-scheduler']);
        } else{

          this.router.navigate(['/dashboard']);
        }
      }
    }else{
      localStorage.removeItem('TraggetUser');
      localStorage.removeItem('TraggetUserPermission');
      sessionStorage.removeItem('TraggetUserSub');
      sessionStorage.removeItem('TraggetUserTrial');
      sessionStorage.removeItem('TraggetUserMenuCounts');
    }

  }


  loginSubmit(){

    this.emailError = '';
    this.passwordError = '';

    if (this.loginForm.get('email')?.value == '') {
      this.emailError = 'Email is required';
    }
    if (this.loginForm.get('password')?.value == '') {
      this.passwordError = 'Password is required';
    }

    if (this.loginForm.invalid) {
      return;
    }

    let data = {email:this.loginForm.get('email')?.value, password:this.loginForm.get('password')?.value};
    this.registerService.login(data).subscribe(response => {

      if (response && response.status ) {
        localStorage.removeItem('TraggetUser');
        localStorage.removeItem('TraggetUserPermission');
        sessionStorage.removeItem('TraggetUserSub');
        sessionStorage.removeItem('TraggetUserTrial');
        sessionStorage.removeItem('TraggetUserMenuCounts');
        localStorage.setItem('TraggetUser', JSON.stringify(response.user));
        let link:any=  localStorage.getItem('link');
        sessionStorage.removeItem('TraggetUserMenuCounts');
        let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};

        this.user_service.getMenuCounts(data).subscribe(response2=>{
          if(response2.status){
            // this.menu_counts = response.data;
            sessionStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
          }
          console.log(" im out : ", );

          if(response.user && response.user.role_id?.toString() =="6"){
            console.log(" tivvvvvnnnnnnnnnnnn : ");

            if(this.screen !='mobile'){
              let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')
              currentlyLoggedInProfile.account_type = 'Trucking Company';
              const formData2 = new FormData();
              formData2.append('province', currentlyLoggedInProfile.user_province ? currentlyLoggedInProfile.user_province : (
                currentlyLoggedInProfile.province ? currentlyLoggedInProfile.province :''
              ));
              if(currentlyLoggedInProfile.user_province){
                this.user_service.getTimeZone(formData2).subscribe(response => {
                  if (response.status && response.timezone) {
                    console.log(" this is time zone : ", response.timezone);
                    currentlyLoggedInProfile.time_zone = response.timezone;
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
                  } else {
                    currentlyLoggedInProfile.time_zone = '';
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
                  }
                });

              }
              localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));

              response.user.account_type = 'Trucking Company';
            }else {
              let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')
              currentlyLoggedInProfile.account_type = 'Driver';

              const formData2 = new FormData();
              formData2.append('province',  currentlyLoggedInProfile.user_province ? currentlyLoggedInProfile.user_province : (
                currentlyLoggedInProfile.province ? currentlyLoggedInProfile.province :''
              ));
              if(currentlyLoggedInProfile.user_province){
                this.user_service.getTimeZone(formData2).subscribe(response => {
                  console.log(" this is time zone : ", response.timezone);

                  if (response.status && response.timezone) {
                    currentlyLoggedInProfile.time_zone = response.timezone;
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
                  } else {
                    currentlyLoggedInProfile.time_zone = '';
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
                  }
                });
              }
              localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
              response.user.account_type = 'Driver';
            }
          }else{

            let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')
            if(currentlyLoggedInProfile !== '' && currentlyLoggedInProfile !== '{}' && currentlyLoggedInProfile != undefined )
            {
              const formData2 = new FormData();
              formData2.append('province',  currentlyLoggedInProfile.user_province ? currentlyLoggedInProfile.user_province : (
                currentlyLoggedInProfile.province ? currentlyLoggedInProfile.province :''
              ));
              if(currentlyLoggedInProfile.user_province){
                this.user_service.getTimeZone(formData2).subscribe(response => {
                  console.log(" this is time zone : ", response.timezone);

                  if (response.status && response.timezone) {
                    currentlyLoggedInProfile.time_zone = response.timezone;
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));

                  } else {
                    currentlyLoggedInProfile.time_zone = '';
                    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
                  }
                });
              }
              localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
            }              response.user.account_type = currentlyLoggedInProfile?.account_type;
          }

          if(link ){
            localStorage.removeItem('link');

            this.router.navigate(['/'+link]);
          }

          if(response.user && response.user.account_type == 'Trucking Company' && !response.user.is_setup_shown ){

            this.router.navigate(['/trucking-setup']);
          }else{
            if(response.user && response.user.account_type == 'Driver'){
              if(this.screen !='mobile'){

                this.router.navigate(['/driver-dashboard-scheduler']);
              } else{

                this.router.navigate(['/dashboard']);
              }
            }else{
              this.router.navigate(['/dashboard']);
            }
          }
        })



      }else{

        this.emailError = response.message ? response.message : 'Email or Password is incorrect!'
        return;
      }
    });
  }


  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
    });
  }
}
