import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  is_loading:boolean=false;
  
  is_loading_btn:boolean=false;

  sendLinkForm!:FormGroup;
  first_name:any='';
  current_step:number = 0;

  emailError:string = '';

  
  setPasswordFrom!: FormGroup;
  message:string = '';
  link_email:string = '';
  
  passwordError: string = '';
  confirmPasswordError: string  = '';
  reset_code: any;

  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;

  is_sent_code:boolean = false;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private fb: FormBuilder,
    private user_service:UserDataService
  ) { }

  ngOnInit(): void {

    
    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],      
      confirm_password: ['', Validators.required]
    });

    this.sendLinkForm = this.fb.group({
      email: ['', Validators.required],      
    });

    this.actRouter.queryParams.subscribe(params => {
   
      this.reset_code = params['code'];
    
      if(this.reset_code !="" && this.reset_code !=undefined ){
        this.is_loading = true;
        this.checkCode();
      }else{
       
      }
    });
  }

  
  checkCode(){

    let data= {reset_password_code: this.reset_code};
    this.user_service.verifyResetCode(data).subscribe(response=>{     
      
      this.is_loading = false;         
      if (response && !response.status ) {
        Swal.fire(
         
          {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  
            response.message
          }).then(() => {               
            this.router.navigate(['/home']);
          });
      }else{
        
        this.is_loading = false;
        
        if(response.data && response.status){
          sessionStorage.setItem('ResetTraggetUser', JSON.stringify(response.data));
          this.current_step = 2;
          this.first_name = response.data.full_name;
          this.is_sent_code = false;
        }
       
        return;
      }
    });
  }


  onSendLink(){
    this.emailError = '';
    if(this.sendLinkForm.get('email')?.value ==""){
      this.emailError = 'Email is required';
      return;
    }
    
    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.sendLinkForm.get('email')?.value) ){
      this.emailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }
    this.is_loading_btn = true;
    let data= {email: this.sendLinkForm.get('email')?.value};
    this.user_service.sendResetLink(data).subscribe(response=>{      
      this.is_loading_btn = false;        
      if (response && !response.status ) {
        this.emailError = response.message;
      }else{
        if(response && response.status && response.data){
          this.message = response.message;
          this.is_sent_code = true;
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
   
    const formData = new FormData();
    
    let account_details = JSON.parse(sessionStorage.getItem('ResetTraggetUser') || '{}');

    formData.append('user_id', account_details?.id);
    formData.append('reset_code', account_details?.reset_code);
    formData.append('password', this.setPasswordFrom.get('password')?.value);
    this.is_loading_btn = true;
    this.user_service.resetPassword(formData).subscribe(response => {
      this.is_loading_btn = false;
      if(response && response.status){
        Swal.fire(
        
          {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  
            response.message
          }
          ).then(() => {               
            this.router.navigate(['/home']);
          });
       
      }else{
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  
            response.message
          }).then(() => {               
           
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

  backClickStep(step:number){
    this.current_step = step;
  }

}
