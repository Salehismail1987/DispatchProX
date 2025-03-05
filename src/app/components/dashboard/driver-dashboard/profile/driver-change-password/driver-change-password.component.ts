import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-driver-change-password',
  templateUrl: './driver-change-password.component.html',
  styleUrls: ['./driver-change-password.component.css']
})
export class DriverChangePasswordComponent implements OnInit {
  screen:string='mobile';
  confirm_password:string='';
  old_password:string='';
  new_password:string='';

  number_symbol_space:boolean=false;
  atleast_eight:boolean=false;
  upper_lower:boolean=false;
  timer:any=null;
  intervals:any=[];
  current_modal:string='';
  otp_time_hours:number=0;
  otp_time_seconds:number=0;
  timer_display:string='';

  code:string='';

  loading_code:boolean=false;
  loading_password:boolean=false;

  loggedinUser:any;
  show_resend:boolean=false;
  profile_details:any=null;
  constructor(
   private router:Router,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService
  ) { 

    
  }

  ngOnInit(): void {
    this.responsiveService.checkWidth();
    this.onResize();
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
   
    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
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


  startTimer(){
    if(this.otp_time_seconds == 60000){
       this.timer = setInterval(()=>{
        this.startTimer();
      }, 1000)

      this.intervals.push(this.timer);
    
    }
     
      if (this.otp_time_seconds <= 0) {
        this.timer_display= '00 : 00';
          clearInterval(this.timer);
        
          this.expireOTP();
          this.timer=null;
          console.log(this.intervals)
          this.intervals.forEach(clearInterval);
      }else{
        this.otp_time_seconds -= 1000;
        var sec=this.otp_time_seconds/1000;
        this.timer_display= '00 : ' + (sec<10 ? "0"+sec:sec);
      }
  }

  expireOTP(){
    let data={user_id:this.loggedinUser.id};
    this.driver_service.expireOTPPassword(data).subscribe(response=>{
      
      if(response.status){
        this.show_resend=true;
      }else{

      }
    });
  
  }

  verifyPassword(){
    let errors='';
    if(this.old_password ==''){
      errors = 'Old Password';
    }
    if(this.new_password ==''){
      errors += errors==''? 'New Password': ', New Password';
    }
    if(this.confirm_password ==''){
      errors += errors==''? 'Confirm Password': ' and Confirm Password';
    }

    if(errors!=''){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        'Error','Please enter '+errors
        );
      return;
    }

    if(this.confirm_password != this.new_password){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        'Warning','New Password and Confirm Password must be same'
        );
      return;
    }

    let data={user_id:this.loggedinUser.id, old_password:this.old_password}
    this.driver_service.verifyOldPassword(data).subscribe(response=>{
      
      this.loading_code=false;
      if(response.status){
        this.otp_time_seconds = 60000;
        this.show_resend=false;
        this.timer_display='00:00';
        this.current_modal='verify-code';
        this.timer=null;
        
        this.intervals.forEach(clearInterval);
        this.startTimer();
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Error`,
            response.message).then(() => { 
              
            })
        }
      });

    
  }

  onOtpChange(code:string){
    if(code.length == 4){      
      this.code = code;
    }else{
      // Swal.fire('Warning','OTP length is 4 digit.')
    }
  }

  handleVerifyCode(){
    
    if(this.code ==""){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire('Warning','OTP is required')
      return;
    }

    let errors='';
    if(this.old_password ==''){
      errors = 'Old Password';
    }
    if(this.new_password ==''){
      errors += errors==''? 'New Password': ', New Password';
    }
    if(this.confirm_password ==''){
      errors += errors==''? 'Confirm Password': ' and Confirm Password';
    }

    if(errors!=''){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        'Error','Please enter '+errors
        );
      return;
    }

    if(this.confirm_password != this.new_password){
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        'Warning','New Password and Confirm Password must be same'
        );
      return;
    }

    let data={user_id:this.loggedinUser?.id,code: this.code, password:this.new_password};
     this.loading_password=true;
    this.driver_service.verifyDriverPasswordCode(data).subscribe(response=>{
      
      this.loading_password=false;
      if(response.status){
          this.current_modal='success';
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Error`,
            response.message).then(() => { 
              
            })
        }
      });
  }

  checkPassword(event:any){
    this.atleast_eight = true;
    this.number_symbol_space = true;
    this.upper_lower = true;
    
    if(!event.target.value || event.target.value.length < 8){
      this.atleast_eight = true;
    }else{
      this.atleast_eight = false;
    }

    if(/(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]/.test(event.target.value)){
      this.upper_lower = false;
    }
    if(/(?=.*?[0-9])|(?=\s)|(?=.*?[#?!+_@$%^&*-])/.test(event.target.value)){
      this.number_symbol_space = false;
    }
    return
  }
}
