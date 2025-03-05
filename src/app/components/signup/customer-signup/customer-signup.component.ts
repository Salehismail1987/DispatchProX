import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { ConfirmedValidator } from '../confirmed.validator';
import Swal from 'sweetalert2';
import { UserDataService } from 'src/app/services/user-data.service';


@Component({
  selector: 'app-customer-signup',
  templateUrl: './customer-signup.component.html',
  styleUrls: ['./customer-signup.component.css']
})
export class CustomerSignupComponent implements OnInit {

  current_step: number = 2;
  setCompanyForm!: FormGroup;
  setPasswordFrom!: FormGroup;

  companyNameError: string = '';
  websiteError: string  ='';
  provinceError: string = '';
  cityError: string  = '';
  businessNoError: string = '';
  wbscNoError: string  = '';
  addressError: string = '';
  countryError: string  = '';
  is_error:boolean =false;

  country:string = 'Canada';
  totalTrucksError: string = '';
  emailSendError: string  = '';
  resendCodeMessage:string = '';

  verification_code: string = '';
  codeError: string = '';

  passwordError: string = '';
  confirmPasswordError: string  = '';
  
  company_details:any={};
  account_details:any ={};

  is_loading_verify_email:boolean = false;
  is_loading_verify_code:boolean = false;
  is_resending_code:boolean = false;
  
  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private user_service: UserDataService,
    private customerService : CustomerService
  ) { }

 
  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    if(userDone &&  userDone.full_name !== undefined){
      this.router.navigate(['/dashboard']);
    }

    if(!sessionStorage.getItem('TraggetAccountRole')){
     
      this.router.navigate(['/home']);
    }
    

    this.account_details = JSON.parse(sessionStorage.getItem('TraggetAccountDetail') || '{}');
    this.company_details = JSON.parse(sessionStorage.getItem('CustomerCompanyDetails') || '{}');
    this.setCompanyForm = this.fb.group({
      company_name: ['', Validators.required],
      company_website: [''],
      address: ['', Validators.required],
      country: ['Canada', Validators.required],
      province: ['', Validators.required],
      city: ['',Validators.required],
      business_no: [''],
      wsbc_no: ['']
    });

    this.setCompanyForm.get('country')?.patchValue('Canada');

    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],      
      confirm_password: ['', Validators.required]
    });

    if(this.company_details && this.company_details.company_name !== undefined){
     
      if(sessionStorage.getItem('CustomerAccountEmailVerified')  !="" && !this.is_error && sessionStorage.getItem('CustomerAccountEmailVerified') !==null){
        this.current_step = 4;
      }else{
        if(this.account_details && this.account_details.email !='' && this.account_details.email !==null && this.account_details.email !==undefined){
          this.emailSendError = '';
          this.is_loading_verify_email = true;
      
          this.customerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
            
            this.is_loading_verify_email = false;
            if (response && response.status ) {
                // alert(JSON.stringify(response))
              this.is_loading_verify_email = false;
      
              if(sessionStorage.getItem('CustomerAccountEmailVerified') !="" && sessionStorage.getItem('CustomerAccountEmailVerified') !==null){
                this.current_step = 3;
      
              }else{
                this.current_step = 2;
              }
            }else{
              this.emailSendError = 'Problem in sending verification Email.';
              this.is_loading_verify_email = false;
            }
          });
        }
      }
    }else{
      if(this.account_details && this.account_details.email !='' && this.account_details.email !==null && this.account_details.email !==undefined){
        this.emailSendError = '';
        this.is_loading_verify_email = true;
    
        this.customerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
          
          this.is_loading_verify_email = false;
          if (response && response.status ) {
              // alert(JSON.stringify(response))
            this.is_loading_verify_email = false;
    
            if(sessionStorage.getItem('CustomerAccountEmailVerified') !="" && sessionStorage.getItem('CustomerAccountEmailVerified') !==null){
              this.current_step = 3;
    
            }else{
              this.current_step = 2;
            }
          }else{
            this.emailSendError = 'Problem in sending verification Email.';
            this.is_loading_verify_email = false;
          }
        });
      }
    }

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

    
    sessionStorage.setItem('TraggetPassword',JSON.stringify(this.setPasswordFrom.get('password')?.value));
    this.current_step= 4;
    
  }

  setCompanySubmit(){

    if(sessionStorage.getItem('TraggetPassword') =='' || sessionStorage.getItem('TraggetPassword') ==null){
      this.current_step = 3;
    }

    this.companyNameError = '';
    this.websiteError= '';
    this.addressError='';
    this.provinceError ='';
    this.cityError ='';
    this.businessNoError = '';
    this.wbscNoError = '';
    this.countryError = '';
    this.is_error = false;
    
    if (this.setCompanyForm.get('company_name')?.value == '' || this.setCompanyForm.get('company_name')?.value == undefined
    ) {
      this.is_error= true;
      this.companyNameError = 'Company Name is required';
    }  

    if (this.setCompanyForm.get('address')?.value == '' || this.setCompanyForm.get('address')?.value == undefined) {
      this.addressError = 'Address is required';
      this.is_error= true;
    }  
    
    if (this.setCompanyForm.get('province')?.value == '' || this.setCompanyForm.get('province')?.value == undefined) {
      this.provinceError = 'Province is required';
      this.is_error= true;
    }  
    
    if (this.setCompanyForm.get('city')?.value == '' || this.setCompanyForm.get('city')?.value == undefined) {
      this.cityError = 'City is required';
      this.is_error= true;
    }  
    

    if(this.setCompanyForm.get('country')?.value =='' || this.setCompanyForm.get('country')?.value == undefined){
      this.countryError  = "Country is required.";
      this.is_error= true;
    }

    

    if(this.is_error){
    
      return;
    }

    if (this.setCompanyForm.invalid) {
      return;
    }

    sessionStorage.setItem('CustomerCompanyDetails', JSON.stringify(this.setCompanyForm.value));
    
    this.emailSendError = '';
    this.is_loading_verify_email = true;
    var account_type = sessionStorage.getItem('TraggetAccountRole');
    this.company_details = this.setCompanyForm.value;
   var pass:any  =  sessionStorage.getItem('TraggetPassword');
    var password  = JSON.parse(pass);
    console.log(this.account_details.full_name)
    let data = {
      full_name:this.account_details.full_name, 
      email: this.account_details.email, 
      account_type:account_type,
      company_name: this.setCompanyForm.get('company_name')?.value,
      // company_name: this.company_details.company_name, 
       company_website: this.company_details.company_website, 
       country: this.company_details.country,
       address: this.company_details.address,
       wsbc_no: this.company_details.wsbc_no,
       city: this.company_details.city,
       province: this.company_details.province,
       business_no: this.company_details.business_no,
       password: password};


    this.customerService.singUpSave(data).subscribe(response => {
      if (response && response.status ) {
        sessionStorage.removeItem('TraggetAccountRole');   
        sessionStorage.removeItem('CustomerAccountEmailVerified');      
        sessionStorage.removeItem('TraggetAccountDetail');
        sessionStorage.removeItem('CustomerCompanyDetails');
        sessionStorage.removeItem('TraggetPassword');
        this.current_step = 5;
      
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
            // this.menu_counts = response.data;
            localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response2.data));
          }
          
        })
        
      }
    });
    // this.customerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
      
    //   this.is_loading_verify_email = false;
    //   if (response && response.status ) {
    //       // alert(JSON.stringify(response))
    //     this.is_loading_verify_email = false;

    //     if(sessionStorage.getItem('CustomerAccountEmailVerified') !="" && sessionStorage.getItem('CustomerAccountEmailVerified') !==null){
    //       this.current_step = 4;

    //     }else{
    //       this.current_step = 3;
    //     }
    //   }else{
    //     this.emailSendError = 'Problem in sending verification Email.';
    //     this.is_loading_verify_email = false;
    //   }
    // });

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

      this.customerService.verifyCode(this.account_details.email, this.verification_code).subscribe(response => {
        if (response && response.status ) {
            // alert(JSON.stringify(response))
          this.is_loading_verify_code = false;
          sessionStorage.setItem('CustomerAccountEmailVerified',"true");
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
    this.resendCodeMessage= '';
    this.codeError ="";
    this.is_resending_code  = true;
    this.customerService.verifyEmail(this.account_details.email, this.account_details.full_name).subscribe(response => {
      if (response && response.status ) {
        this.is_resending_code = false;
        this.resendCodeMessage = 'Code resend on your email: '+this.account_details.email;
      }else{
        this.is_resending_code = false;
        this.codeError ="Problem in resending code on your email: "+this.account_details.email;
      }
    });
  }

  setCountry(event:any){
    if(event.target.value){

      this.country = event.target.value;
    }
  }

}
