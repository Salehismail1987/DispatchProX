import { Component, OnInit } from '@angular/core';

import { Router,ActivatedRoute } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import Swal from 'sweetalert2';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-invitation',
  templateUrl: './driver-invitation.component.html',
  styleUrls: ['./driver-invitation.component.css']
})
export class DriverInvitationComponent implements OnInit {

  invitationSingupForm!: FormGroup;

  fullNameError: string  = '';
  contactError: string = '';
  codeError: string ='';
  email: string = '';
  full_name: string = '';

  invitationSingupFormMobile!: FormGroup;
  provinceError:string = '';
  cityError:string = '';
  addressError:string = '';
  nameError:string='';

  setPasswordFromMobile!: FormGroup;
  setPasswordFrom!: FormGroup;

  passwordError: string = '';
  confirmPasswordError: string  = '';

  countryError:string='';

  verification_code: string = '';
  invitation_code: string = '';
  contact_number:string='';
  profile_image: any;

  current_step: number = 0;
  is_loading : boolean = false;


  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;

  country:string='Canada';
  screen:string = 'desktop';

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private driver_service : DriverService,
    private responsiveService: ResponsiveService,
    private user_service: UserDataService,
    private fb: FormBuilder,
  ) {

    this.responsiveService.checkWidth();
    this.onResize();
  }

  ngOnInit(): void {

    this.responsiveService.checkWidth();
    this.onResize();
    this.invitationSingupForm = this.fb.group({
      email: ['', Validators.required],
      full_name: ['', Validators.required],
      contact_number: ['', Validators.required],
      verification_code: ['49490', Validators.required],
      profile_image: [null,]
    });

    this.setPasswordFromMobile = this.fb.group({
      password: ['', Validators.required],
      name:['',Validators.required],
      contact_number:['',Validators.required],
      confirm_password: ['', Validators.required]
    });

    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });

    this.invitationSingupFormMobile = this.fb.group({

      country: ['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required]
    });



    this.actRouter.queryParams.subscribe(params => {

      this.invitation_code = params['inv'];

      if(this.invitation_code !=""){
        this.is_loading = true;
        if(this.screen!='desktop'){
          window.location.href  = environment.mobileDashboardURL+'invitation?inv='+this.invitation_code;
        }else{

          this.checkInvitation();
        }

      }else{
       this.router.navigate(['/home']);
      }
    });


  }

  checkInvitation(){

    let data= {invitation_code: this.invitation_code};
    this.driver_service.invitationCheck(data).subscribe(response=>{
      if (response && !response.status ) {
        Swal.fire(
          `error`,
          `Invitation link is invalid.`).then(() => {
            this.router.navigate(['/home']);
          });
          this.is_loading = false;
      }else{

        this.is_loading = false;

        if(response.user && response.token){
          sessionStorage.removeItem('TraggetUserMenuCounts');
          let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
          localStorage.clear();
          sessionStorage.clear();
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserSub');
          sessionStorage.removeItem('TraggetUserMenuCounts');
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          this.user_service.getMenuCounts(data).subscribe(response2=>{
            if(response2.status){
              // this.menu_counts = response2.data;
              sessionStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
            }
            if(this.screen == 'mobile' || this.screen=='tablet'){

              this.router.navigate(['/dashboard']);
            }else{

              this.router.navigate(['/driver-dashboard-scheduler']);
            }
          })

        }else{
          this.email = response.data.email;
          this.contact_number = response.data.contact_number;
          this.full_name = response.data.full_name;

          this.setPasswordFromMobile.get('name')?.patchValue(this.full_name)
          this.setPasswordFromMobile.get('contact_number')?.patchValue(this.contact_number)

          this.invitationSingupForm.get('full_name')?.patchValue(this.full_name)
          this.invitationSingupForm.get('email')?.patchValue(this.email)
          sessionStorage.setItem('TraggetDriverSignupData', JSON.stringify(response.data));
          this.current_step = 1;
        }

        return;
      }
    });
  }



  onAccountSaveMobile(){
    this.provinceError = '';
    this.cityError = '';
    this.addressError = '';
    this.countryError='';

    if(this.invitationSingupFormMobile.get('province')?.value == ''){
      this.provinceError  = "Province is required";
    }

    if(this.invitationSingupFormMobile.get('city')?.value == ''){
      this.cityError  = "City is required";
    }
    if(this.invitationSingupFormMobile.get('country')?.value == ''){
      this.countryError  = "Country is required";
    }
    if(this.invitationSingupFormMobile.get('address')?.value == ''){
      this.addressError  = "Address is required";
    }

    if (this.invitationSingupFormMobile.invalid) {
      return;
    }


    let account_details = JSON.parse(sessionStorage.getItem('TraggetDriverSignup') || '{}');
    let account_data =JSON.parse(sessionStorage.getItem('TraggetDriverSignupData') || '{}');



     const formData = new FormData();

     formData.append('profile_image', this.profile_image);

     formData.append('country', this.invitationSingupFormMobile.get('country')?.value ?  this.invitationSingupFormMobile.get('country')?.value : '');
     formData.append('city', this.invitationSingupFormMobile.get('city')?.value ?  this.invitationSingupFormMobile.get('city')?.value : '');
     formData.append('province', this.invitationSingupFormMobile.get('province')?.value ? this.invitationSingupFormMobile.get('province')?.value : '');
     formData.append('address', this.invitationSingupFormMobile.get('address')?.value ? this.invitationSingupFormMobile.get('address')?.value : '');

     formData.append('email', account_details?.email ? account_details?.email :  account_data?.email);
     formData.append('contact_number', account_details?.contact_number ? account_details?.contact_number : '');
     formData.append('full_name', account_details?.full_name ? account_details?.full_name : (account_details?.name ? account_details?.name : ''));
     formData.append('user_id', account_data?.user_id);
     formData.append('invitation_code', account_data?.code);
     formData.append('password', account_details?.password);

     this.driver_service.singUpSave(formData).subscribe(response => {
       if(response && response.status){
         sessionStorage.removeItem('TraggetDriverSignup');
         sessionStorage.removeItem('TraggetDriverSignupData');

         this.current_step = 3;
         sessionStorage.removeItem('TraggetUserMenuCounts');
         let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
         localStorage.clear();
         sessionStorage.clear();
         localStorage.removeItem('TraggetUser');
         localStorage.removeItem('TraggetUserPermission');
         sessionStorage.removeItem('TraggetUserSub');
         sessionStorage.removeItem('TraggetUserMenuCounts');
         this.user_service.getMenuCounts(data).subscribe(response2=>{
           if(response2.status){
             // this.menu_counts = response2.data;
             sessionStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
           }

           localStorage.setItem('TraggetUser', JSON.stringify(response.user));
           if(this.screen == 'mobile' || this.screen=='tablet'){

             this.router.navigate(['/dashboard']);
           }else{

             this.router.navigate(['/driver-dashboard-scheduler']);
           }
         })
       }else{
         Swal.fire(
           `error`,
           response.message).then(() => {

           });
       }
     });
  }


  setPasswordSubmitMobile(){

    this.passwordError = '';
    this.confirmPasswordError = '';

    if(this.setPasswordFromMobile.get('password')?.value == ""){
      this.passwordError = 'Password is required';
    }

    if(this.setPasswordFromMobile.get('confirm_password')?.value == ""){
      this.confirmPasswordError = "Password Confirmation is required";
    }

    if(this.setPasswordFromMobile.get('password')?.value != this.setPasswordFromMobile.get('confirm_password')?.value){
      this.confirmPasswordError = "Password and Confirm Password must be the same.";

      return;
    }

    if(this.atleast_eight || this.number_symbol_space || this.upper_lower){
      this.passwordError = "Please enter password according to given Instructions.";
      return;
    }
    if(this.setPasswordFromMobile.get('name')?.value == ''){
      this.nameError  = "Name is required";
    }

  if(this.setPasswordFromMobile.get('contact_number')?.value == ''){
    this.contactError  = "Contact Number is required";
  }


  let errors='';


  if (this.setPasswordFromMobile.get('contact_number')?.value != '' && this.setPasswordFromMobile.get('contact_number')?.value !=null) {
    let a=this.setPasswordFromMobile.get('contact_number')?.value;
    a=a.replace(')','')
    a=a.replace(/\s+/g,'')
    a=a.replace('+','')
    a=a.replace('(','')

    if(a.length<11){
      this.contactError  = "Provide a valid contact number.";
      errors='yes';
    }
  }else{
    this.contactError  = "Provide a valid contact number.";
    errors='yes';
  }

  if(errors!=''){
    return;
  }

    if (this.setPasswordFromMobile.invalid) {
      return;
    }
    this.full_name = this.setPasswordFromMobile.get('name')?.value;
    this.contact_number = this.setPasswordFromMobile.get('contact_number')?.value;
    sessionStorage.setItem('TraggetDriverSignup', JSON.stringify(this.setPasswordFromMobile.value));
    this.current_step = 2;


  }

  onAccountSave(){
    this.fullNameError = '';
    this.contactError = '';
    this.codeError = '';

    if(this.invitationSingupForm.get('full_name')?.value == ''){
      this.fullNameError  = "Name is required";
    }

    if(this.invitationSingupForm.get('contact_number')?.value == ''){
      this.contactError  = "Contact Number is required";
    }


    let errors='';


    if (this.invitationSingupForm.get('contact_number')?.value != '' && this.invitationSingupForm.get('contact_number')?.value!=null ) {
      let a=this.invitationSingupForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.contactError  = "Provide a valid contact number.";
        errors='yes';
      }
    }else{
      this.contactError  = "Provide a valid contact number.";
      errors='yes';
    }

    if(errors!=''){
      return;
    }
    if (this.invitationSingupForm.invalid) {
      return;
    }

    sessionStorage.setItem('TraggetDriverSignup', JSON.stringify(this.invitationSingupForm.value));
    this.current_step = 2;
  }

  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.profile_image  =file;
      // alert(file.name)
    }
  }

  backClickStep(step:number){
    this.current_step = step;
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

    if(this.setPasswordFrom.get('contact_number')?.value == ''){
      this.contactError  = "Contact Number is required";
    }


     let account_details = JSON.parse(sessionStorage.getItem('TraggetDriverSignup') || '{}');
     let account_data =JSON.parse(sessionStorage.getItem('TraggetDriverSignupData') || '{}');



      const formData = new FormData();

      formData.append('profile_image', this.profile_image);

      formData.append('city', account_details?.city ? account_details?.city : '');
      formData.append('province', account_details?.province ? account_details?.province : '');
      formData.append('address', account_details?.address ? account_details?.address : '');

      formData.append('email', account_details?.email ? account_details?.email :  account_data?.email);
      formData.append('contact_number', account_details?.contact_number ? account_details?.contact_number : '');
      formData.append('user_id', account_data?.user_id);
      formData.append('invitation_code', account_data?.code);
      formData.append('password', this.setPasswordFrom.get('password')?.value);

      this.driver_service.singUpSave(formData).subscribe(response => {
        if(response && response.status){
          sessionStorage.removeItem('TraggetDriverSignup');
          sessionStorage.removeItem('TraggetDriverSignupData');

          this.current_step = 3;
          sessionStorage.removeItem('TraggetUserMenuCounts');
          let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
          localStorage.clear();
          sessionStorage.clear();
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserSub');
          sessionStorage.removeItem('TraggetUserMenuCounts');
          this.user_service.getMenuCounts(data).subscribe(response2=>{
            if(response2.status){
              // this.menu_counts = response2.data;
              sessionStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
            }

            localStorage.setItem('TraggetUser', JSON.stringify(response.user));
            if(this.screen == 'mobile' || this.screen=='tablet'){

              this.router.navigate(['/dashboard']);
            }else{

              this.router.navigate(['/driver-dashboard-scheduler']);
            }
          })
        }else{
          Swal.fire(
            `error`,
            response.message).then(() => {

            });
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

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;

    });
  }

  toDashboard(){
    this.router.navigate(['/dashboard']);
  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.invitationSingupForm.get('contact_number')?.patchValue(abc);
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
            input = '+1 ('+input;
    }else if(size < 7){
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6);
    }else{
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input;
  }

  setUserDetails(){

    this.current_step=2;
  }

  setCountry(event:any){
    if(event.target.value){
      this.country = event.target.value;
    }
  }
}
