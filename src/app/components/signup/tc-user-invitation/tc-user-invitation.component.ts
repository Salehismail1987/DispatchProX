import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tc-user-invitation',
  templateUrl: './tc-user-invitation.component.html',
  styleUrls: ['./tc-user-invitation.component.css']
})
export class TcUserInvitationComponent implements OnInit {


  setPasswordFrom!: FormGroup;
  editNamesForm!: FormGroup;
  project:any=null;

  full_nameError:string = '';

  passwordError: string = '';
  confirmPasswordError: string  = '';
  full_name:string = '';
  email: string  ='';

  invitation_code: string = '';
  is_loading : boolean = false;
  account_details:any=null;

  current_step:number=0;
  atleast_eight: boolean =false;
  upper_lower: boolean =false;
  number_symbol_space: boolean =false;
  is_edited_full_name:boolean=false;

  parent:any=null;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private user_service : UserDataService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    this.setPasswordFrom = this.fb.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });


    this.actRouter.queryParams.subscribe(params => {

      this.invitation_code = params['user_inv'];

      if(this.invitation_code !=""){
        this.is_loading = true;
        this.checkInvitation();
      }else{
       this.router.navigate(['/home']);
      }
    });

    this.editNamesForm = this.fb.group({
      full_name: ['', Validators.required],
    });
  }

  checkInvitation(){

    let data= {invitation_code: this.invitation_code};

    this.user_service.invitationCheck(data).subscribe(response=>{
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
          this.is_loading = false;
      }else{

        this.is_loading = false;

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

        }else{
          this.email = response.data.email;
          this.full_name = response.data.full_name;
          this.account_details = response.data;
          this.parent = response.data.parent_user;
          sessionStorage.setItem('TraggetUserSignupData', JSON.stringify(response.data));
          this.current_step = 1;
        }

        return;
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

   let account_data =JSON.parse(sessionStorage.getItem('TraggetUserSignupData') || '{}');

    const formData = new FormData();
    var datae:any = sessionStorage.getItem('TraggetUserSignupData');
    let data:any = JSON.parse(datae);
    formData.append('email', account_data?.email ? account_data?.email :  account_data?.email);
    formData.append('user_id', account_data?.user_id);
    formData.append('invitation_code', account_data?.code);
    formData.append('full_name', data?.full_name);
    formData.append('password', this.setPasswordFrom.get('password')?.value);

    this.user_service.userSignup(formData).subscribe(response => {
      if(response && response.status){

        sessionStorage.removeItem('TraggetUserSignupData');
        sessionStorage.removeItem('TraggetInvEdit');
        localStorage.removeItem('TraggetUserMenuCounts');

        localStorage.removeItem('TraggetUserPermission');
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

          this.project = response?.user?.project ? response?.user?.project : null;
          this.current_step=3;
        })

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

  onSubmitEditNames(){

    this.full_nameError =  '';
    if(this.editNamesForm.get('full_name')?.value ==''){
      this.full_nameError = 'Full Name is required!';
    }


    if(this.editNamesForm.invalid){
      return;
    }
    var datae:any = sessionStorage.getItem('TraggetUserSignupData');
    let data:any = JSON.parse(datae);
    data.full_name = this.editNamesForm.get('full_name')?.value;

    sessionStorage.setItem('TraggetUserSignupData', JSON.stringify(data));
    this.is_edited_full_name = true;
    sessionStorage.setItem('TraggetInvEdit',JSON.stringify(this.is_edited_full_name));
    this.current_step=2;

  }

  backClickStep(step:number){
    if(step){
      this.current_step = step;
    }
  }

  backClick(to:string){
    this.router.navigate([to]);
  }
}
