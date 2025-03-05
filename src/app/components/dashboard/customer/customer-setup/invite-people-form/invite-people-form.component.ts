import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomerSetupService } from 'src/app/services/customer-setup.service';
import { UserDataService } from 'src/app/services/user-data.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-invite-people-form',
  templateUrl: './invite-people-form.component.html',
  styleUrls: ['./invite-people-form.component.css']
})
export class InvitePeopleFormComponent implements OnInit {


  @Output() showModl = new EventEmitter<string>();
  @Output() setAct = new EventEmitter<string>();
  @Output() onInviteSuccess = new EventEmitter<boolean>();

  @Input('current_modal') current_modal: any;

  is_loading:boolean = false;

  loggedinUser : any = {};

  inviteTCForm!: FormGroup;
  inviteTCcompany_nameError: string  ='';
  inviteTCfull_nameError: string  ='';
  inviteTCEmailError: string = '';
  userfull_nameError: string = '';
  userEmailError: string = '';
  userRoleIDError: string = '';
  userContactNumberError:string  = '';
  addUserForm!: FormGroup;
  addUserFormTc!: FormGroup;
  selectedRoles: string[] = [];
  showDropdown = false;

  constructor(
    private fb: FormBuilder,
    private cs_service: CustomerSetupService,
    private user_service:UserDataService
  ) { }
  roles = [
    { id: 3, name: 'Admin', selected: false },
    { id: 2, name: 'Approver', selected: false },
    { id: 4, name: 'Dispatcher', selected: false },
    { id: 5, name: 'Superintendent', selected: false }
  ];
  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    this.loggedinUser = userDone;


    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      role_id: ['3', Validators.required],
      contact_number: ['']
    });
    this.addUserFormTc = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      role_id: ['3', Validators.required],
      contact_number: ['']
    });

    this.inviteTCForm = this.fb.group({
      company_name: ['', Validators.required],
      full_name: ['', Validators.required],
      email: ['', Validators.required],
    });
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  closeDropdown() {
    this.showDropdown = false;
  }
  updateSelectedRoles(roleId: number) {
    let role = this.roles.find(r => r.id === roleId);
    if (role) {
      role.selected = !role.selected;
      this.selectedRoles = this.roles.filter(r => r.selected).map(r => r.name);
    }
  }
  showModal(param:string){
    if(param  == ''){

      this.loggedinUser.is_adduser_active = true;
      localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
      this.setAct.emit('invitepeople');
    }
    this.showModl.emit(param);
  }


  onSaveUser(){
    console.log(" imi hu", this.addUserForm);
    this.userEmailError = '';
    this.userfull_nameError = '';
    this.userRoleIDError  = '';
    this.userContactNumberError = '';
    
    if (this.addUserForm.get('full_name')?.value == '') {
      this.userfull_nameError = 'Full Name is required';
    }
    if (this.addUserForm.get('email')?.value == '') {
      this.userEmailError = 'Email is required';
    }
    if (this.addUserForm.get('role_id')?.value == '') {
      this.userRoleIDError = 'User Role is required';
    }
    // if (this.addUserForm.get('contact_number')?.value == '') {
    //   this.userRoleIDError = 'contact number is required';
    // }
    
    let errors='';
    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserForm.get('email')?.value) ){
      this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors='yes';
    }
    console.log(" imi hu2");
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
    
    if(errors!=''){
      return;
    }
    
    if (this.addUserForm.invalid) {
      return;
    }
    
    
    let data = {
      full_name :  this.addUserForm.get('full_name')?.value,
      email :  this.addUserForm.get('email')?.value,
      role_id :  this.addUserForm.get('role_id')?.value,
      contact_number :  this.addUserForm.get('contact_number')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    console.log(" imi data ", data);
    this.is_loading =true;

    this.user_service.inviteByRole(data).subscribe(response=>{

      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
        this.is_loading =false;

        return;
      }else{
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
            this.onInviteSuccess.emit(true); // Emit success event
            this.showModal('');
          });
      }
    });


  }
  onSaveUserTc(){
    this.userEmailError = '';
    this.userfull_nameError = '';
    this.userRoleIDError  = '';
    this.userContactNumberError = '';
    
    if (this.addUserFormTc.get('full_name')?.value == '') {
      this.userfull_nameError = 'Full Name is required';
      console.log(" imi userfull_nameError ", this.userfull_nameError);
    }
    if (this.addUserFormTc.get('email')?.value == '') {
      this.userEmailError = 'Email is required';
    }
    if (this.addUserFormTc.get('role_id')?.value == '') {
      this.userRoleIDError = 'User Role is required';
    }
    
    let errors='';
    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserFormTc.get('email')?.value) ){
      this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors='yes';
    }
    if (this.addUserFormTc.get('contact_number')?.value != '') {
      let a=this.addUserFormTc.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.userContactNumberError  = "Provide a valid contact number.";
        errors='yes';
      }
    }
    
    if(errors!=''){
      return;
    }
    
    if (this.addUserFormTc.invalid) {
      return;
    }
    
    
    let data = {
      full_name :  this.addUserFormTc.get('full_name')?.value,
      email :  this.addUserFormTc.get('email')?.value,
      role_ids: this.roles,

      contact_number :  this.addUserFormTc.get('contact_number')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }

    this.is_loading =true;
    // return;

    this.user_service.inviteByRoleTc(data).subscribe(response=>{

      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
        this.is_loading =false;

        return;
      }else{
        this.is_loading =false;

         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-blue22 text-white mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `success`,
          `User Added Successfully!`).then(() => {
            this.onInviteSuccess.emit(true);
            this.showModal('');
          });
      }
    });


  }

  changeNumberTc(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addUserFormTc.get('contact_number')?.patchValue(abc);
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

  onSaveUser2(){

    this.userEmailError = '';
    this.userfull_nameError = '';
    this.userRoleIDError  = '';
    this.userContactNumberError = '';


    if (this.addUserForm.get('full_name')?.value == '') {
      this.userfull_nameError = 'Full Name is required';
    }
    if (this.addUserForm.get('email')?.value == '') {
      this.userEmailError = 'Email is required';
    }
    if (this.addUserForm.get('role_id')?.value == '') {
      this.userRoleIDError = 'User Role is required';
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

    if(errors!=''){
      return;
    }

    if (this.addUserForm.invalid) {
      return;
    }


    let data = {
      full_name :  this.addUserForm.get('full_name')?.value,
      email :  this.addUserForm.get('email')?.value,
      role_id :  this.addUserForm.get('role_id')?.value,
      contact_number :  this.addUserForm.get('contact_number')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.user_service.inviteByRoleTc(data).subscribe(response=>{

      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
        return;
      }else{
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



  onInviteTC(){
    this.inviteTCcompany_nameError = '';
    this.inviteTCfull_nameError = '';
    this.inviteTCEmailError = '';

    if(this.inviteTCForm.get('company_name')?.value == ''){
      this.inviteTCcompany_nameError  = "Company Name is required";
    }
    if(this.inviteTCForm.get('full_name')?.value == ''){
      this.inviteTCfull_nameError  = "Full Name is required";
    }

    if(this.inviteTCForm.get('email')?.value == ''){
      this.inviteTCEmailError  = "Email is required";
    }

    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteTCForm.get('email')?.value) ){
      this.inviteTCEmailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }



    if (this.inviteTCForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('company_name', this.inviteTCForm.get('company_name')?.value);
    formData.append('full_name', this.inviteTCForm.get('full_name')?.value);
    formData.append('email', this.inviteTCForm.get('email')?.value);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

   this.is_loading =true;
    this.cs_service.inviteTruckingCompany(formData).subscribe(response=>{

      if (response && !response.status ) {
        this.is_loading =false;
        if(response.message){
          this.inviteTCEmailError = response.message;
          return;
        }

        this.inviteTCEmailError = response.data.email ? response.data.email : '';
        this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.inviteTCcompany_nameError = response.data.company_name ? response.data.company_name : '';

        return;
      }else{
        this.is_loading =false;
        this.inviteTCForm.reset();
        this.getMenuCounts();
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `success`,
          `An invitation has been sent!`).then(() => {

          });

      }
    });

  }
  getMenuCounts(){
    let data = {orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};

      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){

          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  }
}
