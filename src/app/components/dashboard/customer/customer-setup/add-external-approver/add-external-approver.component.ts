import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CustomerSetupService } from 'src/app/services/customer-setup.service';
import {UserDataService} from 'src/app/services/user-data.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-add-external-approver',
  templateUrl: './add-external-approver.component.html',
  styleUrls: ['./add-external-approver.component.css']
})
export class AddExternalApproverComponent implements OnInit {

  @Output() showModl = new EventEmitter<string>();
  @Output() setAct = new EventEmitter<string>();

  @Input('project_id') project_id=null;
  @Input('current_modal') current_modal: any;

  is_loading:boolean = false;

  addUserForm!: FormGroup;
  userfull_nameError: string = '';
  userEmailError: string = '';
  userProjectError: string = '';
  userContactNumberError:string  = '';
  project_list:any=null;
  loggedinUser : any = {};

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private user_service: UserDataService
  ) { }


  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    this.loggedinUser = userDone;

    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      project_id: ['', Validators.required],
      contact_number: ['', Validators.required]
    });
    if(this.project_id && this.project_id !=""){

      this.addUserForm.get('role_id')?.patchValue(2);
    }

    this.getProjectListing();
  }
  getProjectListing(){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

    this.projectService.projectListing(formData).subscribe(response=>{
      if(response.status && response.data.length>0){
        this.project_list = response.data;
        console.log(this.project_list);
      }else{
      }
    }
    );
  }

  showModal(param:string){
    if(param  == ''){

      this.loggedinUser.is_adduser_active = true;
      localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
      this.setAct.emit('adduser');
    }
    this.showModl.emit(param);
  }

  onSaveUser(){

    this.userEmailError = '';
    this.userfull_nameError = '';
    this.userProjectError  = '';
    this.userContactNumberError = '';


    if (this.addUserForm.get('full_name')?.value == '') {
      this.userfull_nameError = 'Full Name is required';
    }
    if (this.addUserForm.get('email')?.value == '') {
      this.userEmailError = 'Email is required';
    }

    if (this.addUserForm.get('project_id')?.value == '') {
      this.userProjectError = 'Project is required';
    }
    if (this.addUserForm.get('contact_number')?.value == '') {
      this.userContactNumberError = 'Contact Number is required';
    }

    let errors='';
    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserForm.get('email')?.value) ){
      this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors='yes';
    }

    if (this.addUserForm.get('contact_number')?.value != '') {
      let a=this.addUserForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.userContactNumberError  = "Provide a valid contact number.";
        errors='yes';
      }
    }

    if(errors !=''){
      return;
    }

    if (this.addUserForm.invalid) {
      return;
    }


    let data = {
      full_name :  this.addUserForm.get('full_name')?.value,
      email :  this.addUserForm.get('email')?.value,
      role :  'Approver',
      project_id:this.addUserForm.get('project_id')?.value,
      contact_number :  this.addUserForm.get('contact_number')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.is_loading =true;
    this.user_service.inviteByRole(data).subscribe(response=>{

      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userProjectError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
         this.is_loading =false;

        return;
      }else{
        this.addUserForm.reset();
         this.is_loading =false;

         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `success`,
          `User Added Successfully!`).then(() => {

          });
      }
    });


  }


  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addUserForm.get('contact_number')?.patchValue(abc);
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
}
