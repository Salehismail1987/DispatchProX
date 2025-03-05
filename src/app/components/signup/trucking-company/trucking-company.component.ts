import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { ConfirmedValidator } from '../confirmed.validator';
import Swal from 'sweetalert2';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-trucking-company',
  templateUrl: './trucking-company.component.html',
  styleUrls: ['./trucking-company.component.css']
})
export class TruckingCompanyComponent implements OnInit {

  current_step: number = 2;
  setCompanyForm!: FormGroup;
  setPasswordFrom!: FormGroup;

  editNamesForm!: FormGroup;
  country:string = 'Canada';
  companyNameError: string = '';
  totalTrucksError: string = '';
  websiteError: string = '';
  addressError: string = '';
  countryError: string = '';
  cityError: string = '';
  provinceError: string = '';

  full_nameError:string = '';

  emailSendError: string  = '';
  resendCodeMessage:string = '';

  verification_code: string = '';
  codeError: string = '';

  passwordError: string = '';
  confirmPasswordError: string  = '';

  company_details:any;
  account_details:any;

  is_loading_verify_email:boolean = false;
  is_loading_verify_code:boolean = false;
  is_resending_code:boolean = false;

  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;

  inv_code:any ='';
  is_edited_full_name: boolean = false;

  constructor(
    private router: Router,
    private aRouter: ActivatedRoute,
    private fb: FormBuilder,
    private user_service: UserDataService,
    private registerService : RegisterService,
    private truckService: TruckingCompanyService
  ) { }


  ngOnInit(): void {

    this.inv_code = '';
    this.aRouter.queryParams.subscribe(params => {
      this.inv_code = params['tc_inv'];


      if( this.inv_code &&  this.inv_code!=""){
        localStorage.removeItem('TraggetUser');
        localStorage.removeItem('TraggetUserPermission');
        sessionStorage.removeItem('TraggetUserSub');
        localStorage.removeItem('TraggetUserMenuCounts');
        this.checkTruckingCode();
      }else{

      }
    });

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    if(this.inv_code =='' && userDone &&  userDone.full_name !== undefined){
      this.router.navigate(['/dashboard']);
    }else{

      if( sessionStorage.getItem('TraggetAccountInvId')){
        this.inv_code = sessionStorage.getItem('TraggetAccountInvId');
      }else{

        this.inv_code = '';
      }
    }

    if(!sessionStorage.getItem('TraggetAccountDetail') && this.inv_code ==''){
      this.router.navigate(['/home']);
    }




    this.account_details = JSON.parse(sessionStorage.getItem('TraggetAccountDetail') || '{}');
    this.company_details = userDone;
    this.setCompanyForm = this.fb.group({
      company_name: ['', Validators.required],
      website: [''],
      address: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Canada', Validators.required],
      city: ['', Validators.required],
      work_safety_number: [''],
      business_no: [''],
      total_trucks: ['', Validators.required]
    });

    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });
    if(sessionStorage.getItem('TraggetInvEdit')!==null && sessionStorage.getItem('TraggetInvEdit') !=="" && this.inv_code !==''){

      this.is_edited_full_name = true;
    }

    if(this.company_details && this.company_details.company_name !== undefined){
      if(sessionStorage.getItem('TraggetPassword') !="" && sessionStorage.getItem('TraggetPassword') !==null){

        if(this.inv_code !=='' || (sessionStorage.getItem('TraggetAccountRole') !="" && sessionStorage.getItem('TraggetAccountRole') !==null)){
          this.current_step = 5;
        }else{
          this.router.navigate(['/company-type'])
        }


      }else{

        this.current_step=3;
      }
    }else{
      // alert(this.company_details.company_name)
      if(sessionStorage.getItem('TraggetAccountEmailVerified') !="" && sessionStorage.getItem('TraggetAccountEmailVerified') !==null){
        this.current_step = 3;
        if(this.inv_code !=='' || (sessionStorage.getItem('TraggetPassword') !="" && sessionStorage.getItem('TraggetPassword') !==null)){
          this.current_step = 5;

        }
      }else{
        this.registerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
          if (response && response.status ) {
              // alert(JSON.stringify(response))
            this.is_loading_verify_email = false;


          }else{
            this.emailSendError = 'Problem in sending verification Email.';
            this.is_loading_verify_email = false;
          }
        });
      }
    }
    this.editNamesForm = this.fb.group({
      full_name: ['', Validators.required]
    });

  }

  checkTruckingCode(){

    sessionStorage.removeItem('TraggetAccountRole');
    sessionStorage.removeItem('TraggetAccountInvId');
    sessionStorage.removeItem('TraggetAccountDetail');
    sessionStorage.removeItem('TraggetAccountCompanyDetails');
    sessionStorage.removeItem('TraggetAccountEmailVerified');
    sessionStorage.removeItem('TraggetInvEdit');

    let data= {invitation_code: this.inv_code};
    this.truckService.invitationCheckTC(data).subscribe(response=>{
      if (response && !response.status ) {
        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:
            `Invitation link is invalid.`
          }).then(() => {
            this.router.navigate(['/home']);
          });

      }else{

        if(response.user && response.token){
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
            this.router.navigate(['/dashboard']);
          })

        }else if(response.data){

          let data:any = response.data;
          let data_account:any = {
            email: data.email,
            full_name: data.full_name,
            retype_email:data.email,
            inv_id: response.inv_id
          };


          let company_data:any = {
            company_name:data.company_name,
            total_trucks:data.company_trucks
          };

          sessionStorage.setItem('TraggetAccountRole', data.account_type);

          this.account_details = data_account;
          this.company_details = company_data;
          sessionStorage.setItem('TraggetAccountInvId', data.id);
          sessionStorage.setItem('TraggetAccountDetail', JSON.stringify(data_account));
          sessionStorage.setItem('TraggetAccountCompanyDetails', JSON.stringify(company_data ));
          sessionStorage.setItem('TraggetAccountEmailVerified',"true");
          this.current_step = 3;
          this.router.navigate(['/tc_signup']);
          return;
        }

      }
    });

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

    var is_inv = sessionStorage.getItem('TraggetAccountInvId');

    if(is_inv && is_inv !=""){


    sessionStorage.setItem('TraggetPassword',this.setPasswordFrom.get('password')?.value);
    this.current_step = 5;
    }else{


    sessionStorage.setItem('TraggetPassword',this.setPasswordFrom.get('password')?.value);

      this.current_step = 5;
    }
    return;


  }

  setCompanySubmit(){

    if(sessionStorage.getItem('TraggetPassword') =='' || sessionStorage.getItem('TraggetPassword') ==null){
      this.current_step = 5;
    }

    this.companyNameError = '';
    this.totalTrucksError = '';

    this.websiteError = '';
    this.addressError = '';
    this.countryError = '';
    this.cityError = '';
    this.provinceError = '';

    console.log(this.setCompanyForm.value)
    if (this.setCompanyForm.get('company_name')?.value == '' || this.setCompanyForm.get('company_name')?.value == undefined) {
      this.companyNameError = 'Company Name is required';
    }
    if (this.setCompanyForm.get('total_trucks')?.value == ''|| this.setCompanyForm.get('total_trucks')?.value == undefined ) {
      this.totalTrucksError = 'Total Trucks is required';
    }

    if (this.setCompanyForm.get('address')?.value == '' || this.setCompanyForm.get('address')?.value == undefined) {
      this.addressError = 'Address is required';
    }
    if (this.setCompanyForm.get('city')?.value == '' || this.setCompanyForm.get('city')?.value == undefined) {
      this.cityError = 'City is required';
    }
    if (this.setCompanyForm.get('country')?.value == '' || this.setCompanyForm.get('country')?.value == undefined) {
      this.countryError = 'Country is required';
    }
    if (this.setCompanyForm.get('province')?.value == '' || this.setCompanyForm.get('province')?.value == undefined) {
      this.provinceError = 'Province is required';
    }


    if (this.setCompanyForm.invalid) {
      return;
    }

    sessionStorage.setItem('TraggetAccountCompanyDetails', JSON.stringify(this.setCompanyForm.value));

    var is_inv = sessionStorage.getItem('TraggetAccountInvId');
    if(is_inv && is_inv !=""){
      var password  = sessionStorage.getItem('TraggetPassword');
      let data = {
        user_id: is_inv,
        password: password,
        inv_id: this.account_details.inv_id,
        full_name: this.account_details.full_name,
        province: this.setCompanyForm.get('province')?.value,
        city: this.setCompanyForm.get('city')?.value,
        country: this.setCompanyForm.get('country')?.value,
        address: this.setCompanyForm.get('address')?.value,
        business_no: this.setCompanyForm.get('business_no')?.value,
        wsbc_no: this.setCompanyForm.get('work_safety_number')?.value,
        company_website:this.setCompanyForm.get('website')?.value,
        company_name:this.setCompanyForm.get('company_name')?.value
      };

      this.registerService.invTCSave(data).subscribe(response => {
        if (response && response.status ) {
          sessionStorage.removeItem('TraggetAccountRole');
          sessionStorage.removeItem('TraggetAccountEmailVerified');
          sessionStorage.removeItem('TraggetAccountDetail');
          sessionStorage.removeItem('TraggetAccountInvId');
          sessionStorage.removeItem('TraggetAccountCompanyDetails');
          sessionStorage.removeItem('TraggetPassword');
          this.current_step = 6;
          localStorage.removeItem('TraggetUserMenuCounts');
          let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
          localStorage.clear();
          sessionStorage.clear();
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserSub');
          localStorage.removeItem('TraggetUserMenuCounts');

          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          this.user_service.getMenuCounts(data).subscribe(response=>{
            if(response.status){
              // this.menu_counts = response.data;
              localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response.data));
            }
          })
        }
      });

    }else{
      var account_type = sessionStorage.getItem('TraggetAccountRole');
      var password  = sessionStorage.getItem('TraggetPassword');

      let data = {
        full_name:this.account_details.full_name,
        inv_id: this.account_details.inv_id,
        email: this.account_details.email,
        account_type:account_type,
        company_name: this.setCompanyForm.get('company_name')?.value,
        // company_name: this.company_details.company_name,
        company_trucks: this.company_details.total_trucks,
        password: password,
        province: this.setCompanyForm.get('province')?.value,
        city: this.setCompanyForm.get('city')?.value,
        country: this.setCompanyForm.get('country')?.value,
        address: this.setCompanyForm.get('address')?.value,
        business_no: this.setCompanyForm.get('business_no')?.value,
        wsbc_no: this.setCompanyForm.get('work_safety_number')?.value,
        company_website:this.setCompanyForm.get('website')?.value

      };

      this.registerService.singUpSave(data).subscribe(response => {
        if (response && response.status ) {
          sessionStorage.removeItem('TraggetAccountRole');
          sessionStorage.removeItem('TraggetAccountEmailVerified');
          sessionStorage.removeItem('TraggetAccountDetail');
          sessionStorage.removeItem('TraggetAccountCompanyDetails');
          sessionStorage.removeItem('TraggetPassword');

          this.current_step = 6;
          localStorage.removeItem('TraggetUserMenuCounts');
          let data = {user_id:response.user.user_data_request_id ? response.user.user_data_request_id : response.user?.id,account_type: response.user?.user_data_request_account_type ? response.user?.user_data_request_account_type :  response.user?.account_type};
          localStorage.clear();
          sessionStorage.clear();
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserSub');
          localStorage.removeItem('TraggetUserMenuCounts');
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          this.user_service.getMenuCounts(data).subscribe(response=>{
            if(response.status){
              // this.menu_counts = response.data;
              localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response.data));
            }
          })
        }else if(response.errors && response.errors.length>0){

         if(response.errors?.password && response.errors?.password !=''){
          Swal.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:    'Warning',
            text:
            'Password not set, Please set password first!'
          }).then(()=>{
            this.current_step = 3;
          });
         }
         if((response.errors?.full_name && response.errors?.full_name !='') || (response.errors?.email && response.errors?.email !='') ){

          Swal.fire(

            {
              confirmButtonColor:'#17A1FA',
              title:    'Warning',
              text:
              'Full Name and Email are required, Please reset any missing field first!'
            }
            ).then(()=>{

            this.router.navigate(['/signup'])
          });
         }

        }else{

            Swal.fire({
              confirmButtonColor:'#17A1FA',
              title:    'Error',
              text:
              response.message
            })


        }
      });
    }



    this.emailSendError = '';
    this.is_loading_verify_email = true;



  }

  backClick(to:string){

      this.router.navigate([to]);

  }

  backClickStep(step:number){
    if(step){
      this.current_step = step;
    }
  }

  onOtpChange(code:string){
    if(code.length == 6){
      this.verification_code = code;
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

  onVerifyCode(){
    if(this.verification_code !=undefined && this.verification_code !="" && this.verification_code.length == 6){

      this.codeError = '';
      this.is_loading_verify_code = true;

      this.registerService.verifyCode(this.account_details.email, this.verification_code).subscribe(response => {
        if (response && response.status ) {
            // alert(JSON.stringify(response))
          this.is_loading_verify_code = false;
          sessionStorage.setItem('TraggetAccountEmailVerified',"true");
          this.current_step = 3;
        }else{
          this.codeError = 'Invalid or Expired code is entered, enter a valid code!';
          this.is_loading_verify_code = false;
        }
      });
    }else{
      this.codeError = "Please enter the 6-digit Code to continue";
    }
  }

  resendCode(){
    this.is_resending_code  = true;
    this.registerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
      if (response && response.status ) {
        this.is_resending_code = false;
        this.resendCodeMessage = 'Code resend on your email: '+this.account_details.email;
      }else{
        this.is_resending_code = false;
        this.codeError ="Problem in resending code on your email: "+this.account_details.email;
      }
    });
  }

  setTrucks(val:any){
    if(val !=''){
      this.company_details.total_trucks = val;
    }
  }

  onSubmitEditNames(){

    this.full_nameError =  '';
    if(this.editNamesForm.get('full_name')?.value ==''){
      this.full_nameError = 'Full Name is required!';
    }

    if(this.editNamesForm.invalid){
      return;
    }
    var datae:any = sessionStorage.getItem('TraggetAccountDetail');
    let data:any = JSON.parse(datae);
    data.full_name = this.editNamesForm.get('full_name')?.value;

    sessionStorage.setItem('TraggetAccountDetail', JSON.stringify(data));
    this.is_edited_full_name = true;
    sessionStorage.setItem('TraggetInvEdit',JSON.stringify(this.is_edited_full_name));
    this.current_step=3;

  }
  setCountry(event:any){
    if(event.target.value){

      this.country = event.target.value;
    }
  }
}
