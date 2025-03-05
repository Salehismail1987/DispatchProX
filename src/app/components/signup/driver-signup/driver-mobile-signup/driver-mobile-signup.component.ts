import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { RegisterService } from 'src/app/services/register.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-driver-mobile-signup',
  templateUrl: './driver-mobile-signup.component.html',
  styleUrls: ['./driver-mobile-signup.component.css']
})
export class DriverMobileSignupComponent implements OnInit {

  setProfileForm!: FormGroup;
  setPasswordFrom!: FormGroup;

  disable_submit_profile:boolean=false;
  is_loading_resend:boolean=false;
  is_loading_verify:boolean=false;

  email:any='';
  code:string='';
  verification_code:string='';

  errorfull_name:string='';
  errorEmail:string='';
  errorCode:string='';
  emailCodeSendError:string='';

  is_aggreed_terms:boolean=false;
  show_modal_aggreement:boolean=false;

  details:any=null;
  is_verified:boolean=false;


  passwordError: string = '';
  confirmPasswordError: string  = '';



  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;

  is_loading_password:boolean=false;
  current_step:string='';
  constructor(
    private router: Router,
    private aRouter: ActivatedRoute,
    private fb: FormBuilder,
    private driverService : DriverService,
    private user_service: UserDataService,
    private registerService: RegisterService,
    private responsiveService: ResponsiveService
  ) { }


  ngOnInit(): void {
    this.setProfileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      contact_number: ['', Validators.required]
    });
    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });

    let driveProfileDetails:any = sessionStorage.getItem('TraggetDriverDetail');
    if(driveProfileDetails && driveProfileDetails !==null && driveProfileDetails !=undefined){
      driveProfileDetails = JSON.parse(driveProfileDetails);
      this.details =driveProfileDetails;
    }

    this.code='+1';
    let isDoneProfile:any = sessionStorage.getItem('TraggetDriverSignupDetailsDone');

    if(isDoneProfile && isDoneProfile !==undefined && isDoneProfile !==''){
      if(JSON.parse(isDoneProfile)==true){
        this.current_step='password';
        this.is_verified=true;
      }else{
        this.current_step='code';
      }
    }else{
      if(driveProfileDetails?.full_name!==undefined && driveProfileDetails?.full_name !='' && driveProfileDetails?.full_name !==null){
        this.current_step='code';
      }else{
        this.current_step='';
      }
    }
    if(driveProfileDetails?.full_name!==undefined && driveProfileDetails?.full_name !='' && driveProfileDetails?.full_name !==null){

      this.setProfileForm.get('full_name')?.patchValue(driveProfileDetails?.full_name);
      this.setProfileForm.get('email')?.patchValue(driveProfileDetails?.email);
      this.setProfileForm.get('contact_number')?.patchValue(driveProfileDetails?.contact_number);


    }
  }

  setStep(step:string){
    this.current_step=step;
  }

  onSubmitProfile(){
    this.errorfull_name='';
    this.errorEmail='';
    this.errorCode='';


    if (this.setProfileForm.get('full_name')?.value == '' || this.setProfileForm.get('full_name')?.value == undefined) {
      this.errorfull_name = 'Full name is required';
    }



    if (this.setProfileForm.get('email')?.value == '' || this.setProfileForm.get('email')?.value == undefined) {
      this.errorEmail = 'Email is required';
    }

    if(this.setProfileForm.invalid){

      return;
    }


    this.registerService.checkEmail(this.setProfileForm.get('email')?.value).subscribe(response=>{

      if (response && !response.status ) {
        this.errorEmail  = response.message ? response.message : 'Email already taken, choose a different email.';
        return;
      }else{



        if(!this.is_aggreed_terms){


          const swalWithCustomButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink'
            },
            buttonsStyling: false
          })
          swalWithCustomButtons.fire(
            'Warning','You have to accept terms and conditions'
            );
          return;

        }

        sessionStorage.setItem('TraggetDriverDetail',JSON.stringify(this.setProfileForm.value))
        this.details=this.setProfileForm.value;
        if(!this.is_verified){

          this.sendVerificationCode();
          this.current_step='code';
        }else{
          this.current_step='password'
        }



      }

    });

  }

  emailChange(){
    this.is_verified=false;
  }

  sendVerificationCode(is_resend:boolean=false){
    if(is_resend){
      this.is_loading_resend=true;
      this.disable_submit_profile=true;
    }
    this.registerService.verifyEmail(this.setProfileForm.get('email')?.value, this.setProfileForm.get('full_name')?.value).subscribe(response => {
      if(is_resend){
        this.is_loading_resend=false;
        this.disable_submit_profile=false;

      }
      if (response && response.status ) {

        this.current_step='code';
      }else{

        if(is_resend){
          if(response.message !=''){

          }else{

          }
        }
      }
    });

  }


  /* Agreement & Terms Related*/
  setTermsAgree(){
    this.is_aggreed_terms = true;

    this.show_modal_aggreement=false;
  }

  handleTermsClick(event:any){

    if(event.target.checked){
      this.is_aggreed_terms=true;
    }else{
      this.is_aggreed_terms=false;
    }

  }

  showModal(){
    this.show_modal_aggreement=true;
  }

  hideModal(){
    this.show_modal_aggreement=false;

  }

  cancelModal(){
    this.show_modal_aggreement=false;
    this.is_aggreed_terms=false;

  }



  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);


    this.setProfileForm.get('contact_number')?.patchValue(abc);

  }

  formatPhoneNumber(input:any) {

    if(input.charAt(0) == '+'){
      // alert(input)
      input = input.substring(3, input.length);

    }
    input = input.replace(/\D/g,'');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0,10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if(size == 0){
            input = input;
    }else if(size < 4){
            input = '('+input;
    }else if(size < 7){
            input = '('+input.substring(0,3)+') '+input.substring(3,6);
    }else{

            input = '('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input;
  }


  onOtpChange(code:string){
    if(code.length == 6){
      this.verification_code = code;
    }
  }

  verifyHandle(){
    if(this.verification_code && this.verification_code!='' && this.verification_code!=null){

      this.registerService.verifyCode(this.details?.email, this.verification_code).subscribe(response => {
        if(response && response.status){
          sessionStorage.setItem('TraggetDriverSignupDetailsDone',JSON.stringify(true));
          this.is_verified=true;
          this.current_step='password';
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Warning`,
            'Invalid or expired code.').then(

            );
        }
      });
    }else{
      this.errorCode='Please enter a code.';
    }
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

  setPasswordSubmit(){

    this.passwordError = '';
    this.confirmPasswordError = '';

    if(this.setPasswordFrom.get('password')?.value == ""){
      this.passwordError = 'Password is required';
    }

    if(this.setPasswordFrom.get('confirm_password')?.value == ""){
      this.confirmPasswordError = "Password Confirmation is required";
    }

    if(this.setPasswordFrom.get('password')?.value != this.setPasswordFrom.get('confirm_password')?.value){
      this.confirmPasswordError = "Password and Confirm Password must be the same.";

      return;
    }

    if(this.atleast_eight || this.number_symbol_space || this.upper_lower){
      this.passwordError = "Please enter password according to given Instructions.";
      return;
    }

    if (this.setPasswordFrom.invalid) {
      return;
    }

    let account_data =JSON.parse(sessionStorage.getItem('TraggetDriverDetail') || '{}');

    const formData = new FormData();

    formData.append('full_name', account_data?.full_name ? account_data?.full_name : '');

    formData.append('email', account_data?.email ? account_data?.email :  account_data?.email);
    formData.append('contact_number', account_data?.contact_number ? account_data?.contact_number : '');
    formData.append('password', this.setPasswordFrom.get('password')?.value);

    this.is_loading_password=true;

    this.driverService.singUpNewDriver(formData).subscribe(response => {
      this.is_loading_password=false;
      if(response && response.status){
        sessionStorage.removeItem('TraggetDriverDetail');
        sessionStorage.removeItem('TraggetDriverSignupDetailsDone');

        localStorage.removeItem('TraggetUserMenuCounts');
        let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem('TraggetUser');
        localStorage.removeItem('TraggetUserPermission');
        sessionStorage.removeItem('TraggetUserSub');
        localStorage.removeItem('TraggetUserMenuCounts');
        localStorage.setItem('TraggetUser', JSON.stringify(response.user));
        this.user_service.getMenuCounts(data).subscribe(response2=>{
          if(response2.status){
            // this.menu_counts = response2.data;
            localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
          }
          this.router.navigate(['/driver-mobile-after-signup']);
        })

      }else{
        const swalWithCustomButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink'
          },
          buttonsStyling: false
        })
        swalWithCustomButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    });
  }

}
