import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';
import Swal from 'sweetalert2';

import { ConfirmedValidator } from './confirmed.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  is_aggreed_terms:boolean=false;
  show_modal_aggreement:boolean=false;
  accountType:string = '';
  signUpForm!: FormGroup;
  full_nameError: string = '';
  emailError: string = '';
  retypeEmailError: string = '';

  is_signupform_done: boolean = false;
  show_signup: boolean = false;

  account_details: any ;

  constructor(
    private regsiterService : RegisterService,

    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    this.account_details = JSON.parse(sessionStorage.getItem('TraggetAccountDetail') || '{}');
    this.signUpForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      retype_email: ['', Validators.required],
    }
    );

    var account_type = sessionStorage.getItem('TraggetAccountRole');
    if(account_type !==undefined && account_type !==null && account_type !=''){
      this.accountType = account_type;
    }else{
      this.router.navigate(['/company-type']);
    }

    if(this.account_details &&   this.account_details.full_name !== undefined){
      this.show_signup =false;
      this.is_signupform_done = true;
      if(account_type =='Trucking Company'){

        this.router.navigate(['/tc_signup']);
      }else if(account_type =='Driver'){
        this.router.navigate(['/driver-signup']);
      }else{

        this.router.navigate(['/customer_signup']);
      }

    }else{
      this.show_signup =true;
      this.is_signupform_done = false;
    }

  }

  onSubmitSignup(){


    this.emailError = '';
    this.full_nameError = '';
    this.retypeEmailError = '';

    if (this.signUpForm.get('full_name')?.value == '' || this.signUpForm.get('full_name')?.value ==undefined) {
      this.full_nameError = 'Full Name is required';
    }

    if (this.signUpForm.get('email')?.value == '' ) {
      this.emailError = 'Email is required';
    }


    if (this.signUpForm.get('retype_email')?.value == '') {
      this.retypeEmailError = 'Retype Email is required';

    }

    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.signUpForm.get('retype_email')?.value) || !/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.signUpForm.get('email')?.value)){
      this.emailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }

    if (
      this.signUpForm.get('email')?.value !=
      this.signUpForm.get('retype_email')?.value
    ) {
      this.retypeEmailError = 'Email and Retype Email must match';
      return;
    }

    if (this.signUpForm.invalid) {
      return;
    }

    if(!this.is_aggreed_terms){
      Swal.fire(

        {
          confirmButtonColor:'#17A1FA',
          title:    'Warning',
          text:
          'You must agree to terms and conditions.'
        }).then(() => {
         return;
        });
        return;
    }
    this.regsiterService.checkEmail(this.signUpForm.get('email')?.value).subscribe(response=>{

      if (response && !response.status ) {
        this.emailError  = response.message ? response.message : 'Email already taken, choose a different email.';
        return;
      }else{
        sessionStorage.setItem('TraggetAccountDetail', JSON.stringify(this.signUpForm.value));

        this.is_signupform_done = true;
        this.show_signup=false;
        if(this.accountType == 'Customer'){

          this.router.navigate(['/customer_signup']);
        }else if(this.accountType =='Driver'){
          this.router.navigate(['/driver-signup']);
        }else{

        this.router.navigate(['/tc_signup']);
        }
      }

    })

  }

  backClick(){
    this.show_signup = true;
  }

  setTermsAgree(){
    this.is_aggreed_terms = true;
    this.show_modal_aggreement=false;
  }

  handleTermsClick(event:any){
    if(event.target.checked){
      this.is_aggreed_terms=true;
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
}
