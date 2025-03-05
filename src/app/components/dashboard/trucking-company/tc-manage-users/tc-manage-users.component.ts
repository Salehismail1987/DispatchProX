import { Component, OnInit , HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';
declare var $: any;
interface ProjectRole {
  project_id: number;
  user_id: number;
  project_name: string;
  roles: any[]; // Assuming 'role' can have multiple data types; adjust as needed.
}
interface UserRole {
  role_id: number;
}

interface Role {
  id: number;
  name: string;
  selected: boolean; // Add this to track selection state
}



@Component({
  selector: 'app-tc-manage-users',
  templateUrl: './tc-manage-users.component.html',
  styleUrls: ['./tc-manage-users.component.css']
})
export class TcManageUsersComponent implements OnInit {
  active_menu:any;
  loggedInUser:any;
  update_user_check:boolean=false;

  is_user_loading:boolean=false;
  is_shown_update:boolean=false;
  show_remove:boolean=false;
  is_shown_add:boolean=false;
  is_loading:boolean = false;

  loading:boolean=false;
  is_loading_removing:boolean=false;
  users_list:any = null;


  addUserForm!: FormGroup;
  userfull_nameError: string = '';
  userLastNameError: string = '';
  userEmailError: string = '';
  userRoleIDError: string = '';
  userContactNumberError:string  = '';
  imageSrc: string | ArrayBuffer | null = null;


  user_selected:any = '';
  users_project_list:any = null;
  current_modal: string = '';

  updateRoleForm!:FormGroup;
  removing_loading:boolean=false;
  update_loading:boolean=false;
  errorUpdate:string = '';


  dropdownList:any = [];
  selectedItems:any  = [];
  dropdownSettings:any  = {};
  showDropdown = false;

  user_id:any;
  selectedRoles: string[] = [];  // Explicitly type as string[]

  constructor(
    private router: Router,
    private aRouter:ActivatedRoute,
    private fb: FormBuilder,
    private tc_service:TruckingCompanyService,
    private user_service:UserDataService
  ) {
    this.active_menu = {
      parent:'company-settings',
      child:'company-settings',
      count_badge: '',
    }
}
roles = [
  { id: 3, name: 'Admin', selected: false },
  { id: 2, name: 'Approver', selected: false },
  { id: 4, name: 'Dispatcher', selected: false },
  { id: 5, name: 'Superintendent', selected: false }
];
ngOnInit(): void {

  let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
  if (userDone && userDone.id) {
    this.loggedInUser = userDone;
     } else {
    this.router.navigate(['/home']);
  }

  this.user_id = this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id;

  this.addUserForm = this.fb.group({
    full_name: ['', Validators.required],
    last_name: [''],
    email: ['', Validators.required],
    role_ids: this.fb.array([]),
    contact_number: ['']
  });


  this.dropdownList = [
    { item_id: 3, item_text: 'Admin' },
    { item_id: 1, item_text: 'Bookkeeper' }
  ];

  this.selectedItems = [

  ];

  this.updateRoleForm = this.fb.group({
    // full_name: ['', Validators.required],
    last_name: [''],
    email: ['', Validators.required],
    contact_number: [''],
    role_idss: this.fb.array([]),
    // user_id: ['', Validators.required],
    profileImage: [null]  
  });

  this.getAllUsers();
 

  $(document).on('click', '.getinputfield',function(this:any) {
    $('.input-popup-div').hide();
    setTimeout(() => {
      
      $(this).find('.input-popup-div').show();
    }, 300);
  });

  $(window).click(function(e:any) {
    if ( !($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length ) ) {
      
        $('.input-popup-div').hide();
        $('.input-popup-div2').hide();
       
    }

  });

  $(document).on('click', (event: any) => {
    if (!$(event.target).closest('.more-modal, .input-field3, .dropdown-menu3').length) { 
      if ($('.modal-backdrop').is(':visible')) {
        this.closeMore();
      }
    }
  });


  
}

handleInviteSuccess(success: boolean) {
  if (success) {
    this.getAllUsers(); // Method to reload user list
  }
}

showModal(modal: any) {
  this.current_modal = modal;
}

closeMore() {
  this.userRoleIDError  = '';
  this.userContactNumberError = '';
  this.user_selected = '';
  setTimeout(() => {
    $('.modal-backdrop').hide(); 
  }, 100);
  
}


updateSelectedRoles(roleId: number) {
  let role = this.roles.find(r => r.id === roleId);
  if (role) {
    role.selected = !role.selected; // Toggle the 'selected' state
    this.selectedRoles = this.roles.filter(r => r.selected).map(r => r.name);
  }
}
DefaultRoles(user:any) {
  this.selectedRoles = []; // Clear existing roles or initialize
  // Make sure all roles are not selected initially
  this.roles.forEach(role => role.selected = false);

  
  this.user_selected.user_roles.forEach((userRole: UserRole) => {
    // Loop through all available roles to find matches
    this.roles.forEach((role: Role) => {
        if (role.id === userRole.role_id) {
          role.selected = true; // Set selected true if matches
            this.selectedRoles.push(role.name);
        }
    });
});

  
}

showMore(user:any) {
  this.user_selected = user;
 
  setTimeout(() => {
    $('.modal-backdrop').toggle('slow');
  }, 100);
  this.DefaultRoles(user);
}
private restructureProjectUserData(data: any[]): ProjectRole[] {
  const projectUserMap = new Map<string, ProjectRole>();

  for (const item of data) {
    const projectUserIdKey = `${item.project_id}-${item.user_id}`;
    if (projectUserMap?.has(projectUserIdKey)) {
      let projectUserEntry = projectUserMap?.get(projectUserIdKey);
      projectUserEntry?.roles?.push(item.role);
    } else {
      projectUserMap?.set(projectUserIdKey, {
        project_id: item.project_id,
        user_id: item.user_id,
        project_name: item.project.project_name,
        roles: [item.role]
      });
    }
  }

  return Array.from(projectUserMap.values());
}
closeDropdown() {
  this.showDropdown = false;
}
@HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.selectdiv')) {
      if(this.is_shown_add == true){
        this.is_shown_add = false;
      }
    }
  }
  uploadimage(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      
      // FileReader to display the image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = reader.result as string;
      };
      reader.readAsDataURL(file);
  
      // Patch the form control with the file
      this.updateRoleForm.patchValue({
        profileImage: file
      });
      this.updateRoleForm?.get('profileImage')?.updateValueAndValidity();
    }
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', // "short" is a valid value for month representation
      year: 'numeric' // "numeric" is a valid value for year representation
    };
    return date.toLocaleDateString('en-US', options);
  }
  
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

showRemove(){
  setTimeout(() => {
      
    $('.input-popup-div').show();
  }, 300);
}
hideNo(is:any){
  if(is){
   setTimeout(() => {
    
    $(".delete-modal").hide()
    $(".input-popup-div").hide();
   }, 300);
  }
}
setAddForm(){
  this.dropdownList.map((item:any)=>{
    this.addRole(item);
  })

}

setRole(event:any,role_id:any,index:any){
  if(event.target.checked == true){
    this.role_ids.at(index)?.get('selected')?.patchValue(true);
  }else{
    this.role_ids.at(index)?.get('selected')?.patchValue(false);
  }
}

toggleAdd(){
  this.is_shown_add = !this.is_shown_add;
}

toggleUpdate(){
  this.is_shown_update = !this.is_shown_update;
}


addRole(item:any) {
  this.role_ids.push(
    this.fb.group({
      selected:[],
      role_id:[item?.item_id]
    })
  );
}

get role_ids(): FormArray {
  return this.addUserForm.controls["role_ids"] as FormArray;
}

editRole(item:any) {
  let selected = false;
  let roles:any=this.user_selected.user_roles;
  for(var i=0;i<roles.length;i++){
    if(roles[i]?.role_id == item?.item_id){
      selected=true;
      break;
    }
  }
  this.role_idss.push(
    this.fb.group({
      selected:[selected],
      role_id:[item?.item_id]
    })
  );
}

get role_idss(): FormArray {
  return this.updateRoleForm.controls["role_idss"] as FormArray;
}

getAllUsers(){
  this.loading = true;
  const formData = new FormData();
  formData.append('user_id', this.loggedInUser.id);
  this.tc_service.getAllUsers(formData).subscribe((response:any)=>{
    this.loading = false;
    if (response && response.status && response.data ) {

      if(response.data && response.data.length>0){

        this.users_list = response.data;
      }else{
        this.users_list  = null;
      }

      if(response.data && response.ProjectUser.length>0){
        this.users_project_list = this.restructureProjectUserData(response.ProjectUser);

      }else{
        this.users_project_list = null;
      }


    }
  });
}

confirmDelete( user:any){
  if(!user?.id || user?.id==''){
    return;
  }
  var is_invited:any=  user?.parent_user_id ? "YES":"NO";
  const formData = new FormData();
  formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);
  formData.append('delete_id', user.id);
  formData.append('is_invited',is_invited);
  this.is_loading_removing = true;
  this.tc_service.deleteUser(formData).subscribe((response:any)=>{
    this.is_loading_removing = false;
    if (response && response.status && response.message ) {

      $("#editdriver").modal('hide');
      this.getAllUsers()

        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:
            `Deleted!`,
            text:
            response.message

          }).then(() => {
          });
    }else{
      Swal.fire({
        confirmButtonColor:'#17A1FA',
        title:
        `Error!`,
        text:
        `Unable to delete`
      })
    }
  });
}


onSaveUser(){

  this.userEmailError = '';
  this.userfull_nameError = '';
  this.userLastNameError = '';
  this.userRoleIDError  = '';
  this.userContactNumberError = '';


  if (this.addUserForm.get('full_name')?.value == '') {
    this.userfull_nameError = 'Full Name is required';
  }
  if (this.addUserForm.get('email')?.value == '') {
    this.userEmailError = 'Email is required';
  }

  let erros='';

   if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserForm.get('email')?.value) ){
    this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
    erros='yes';
  }


  if (this.addUserForm.get('contact_number')?.value != '') {

    let a=this.addUserForm.get('contact_number')?.value;

    a=a.replace(')','')
    a=a.replace(/\s+/g,'')
    a=a.replace('+','')
    a=a.replace('(','')

    if(a.length<11){
      this.userContactNumberError  = "Provide a valid contact number.";
      erros='yes';
    }
  }
  if( erros!=''){
    return;
  }
  if (this.addUserForm.invalid) {
    return;
  }


  let data = {
    full_name :  this.addUserForm.get('full_name')?.value,
    last_name :  '',
    email :  this.addUserForm.get('email')?.value,
    contact_number :  this.addUserForm.get('contact_number')?.value,
    role_ids: this.addUserForm.get('role_ids')?.value,
    user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id
  }
  this.is_loading =true;
  this.is_user_loading =true;
  this.user_service.inviteByRoleTc(data).subscribe(response=>{

  this.is_user_loading =false;
    if (response && !response.status ) {
      if(response.message){
        Swal.fire({
          title: response.message,
          showCancelButton: false,
          confirmButtonText: 'OK', confirmButtonColor: '#17A1FA',
        }).then(() => {
        });
      }else{
        Swal.fire({
          title: 'Faield to update role',
          showCancelButton: false,
          confirmButtonText: 'OK', confirmButtonColor: '#17A1FA',
        });
      }


      this.userEmailError = response.data.email ? response.data.email : '';
      this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
      this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
      this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
       this.is_user_loading =false;
       this.is_loading =false;


      return;
    }else{
      
      this.addUserForm.reset();
      this.is_loading =false;
      this.getAllUsers()

      $("#adddriver").modal('hide');
       this.is_user_loading =false;
      Swal.fire(

        {
          confirmButtonColor:'#17A1FA',
          title:
          `Success!`,
          text:
          `User Added Successfully!`
        }).then(() => {
        });
    }
  });


}

setValue(type:any,event:any){
  if(event.target.checked){
    if(type && type=='add'){
      this.is_shown_add = false;
    }else{
      this.is_shown_update = false;
    }
  }
  
  $(".selectlistname > input").remove();
}

confirmUpdateRole(){
  this.errorUpdate = '';
  
  this.userEmailError = '';
  this.userfull_nameError = '';
  this.userLastNameError = '';
  this.userRoleIDError  = '';
  this.userContactNumberError = '';
  let erros='';
  
  
  if (this.updateRoleForm.get('full_name')?.value == '') {
    this.userfull_nameError = 'Full Name is required';
  }
  if (this.updateRoleForm.get('email')?.value == '') {
    this.userEmailError = 'Email is required';
  }
  if (!this.selectedRoles || this.selectedRoles.length === 0) {
    this.userRoleIDError = 'User Role is required';
    this.update_user_check = false;
    erros='yes';
    
  }
  
  if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.updateRoleForm.get('email')?.value) ){
    this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
    erros='yes';
  }
  
  
  if (this.updateRoleForm.get('contact_number')?.value != '') {
    
    let a=this.updateRoleForm.get('contact_number')?.value;
    
    a=a.replace(')','')
    a=a.replace(/\s+/g,'')
    a=a.replace('+','')
    a=a.replace('(','')
    
    if(a.length<11){
      this.userContactNumberError  = "Provide a valid contact number.";
      erros='yes';
      this.update_user_check = false;

    }
  }
  if( erros!=''){
    this.update_user_check = false;
    
    return;
  }
  if (this.updateRoleForm.invalid) {
    this.update_user_check = false;
    
    return;
  }

  let invitation_code = this.user_selected.invitation_code;

  let data:any={
    full_name :  this.user_selected.full_name,
    last_name :  '',
    email :  this.updateRoleForm.get('email')?.value,
    contact_number :  this.updateRoleForm.get('contact_number')?.value,
    // role_ids: this.updateRoleForm.get('role_idss')?.value,
    role_ids: this.selectedRoles,
    // user_id: this.user_selected.id,
    company_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id,
    
  }

  if (invitation_code != null) {
    data.invitation_id = this.user_selected.id;  // Assuming you have `user_selected_id` correctly defined
  } else {
    data.user_id = this.user_selected.id;
  }


  if(this.user_selected.invitation_code && this.user_selected.invitation_code !==undefined && this.user_selected.invitation_code !==null && this.user_selected.invitation_code !='null'){
    data.is_invited='YES';
  }else{
    data.is_invited='NO';
  }
  this.update_user_check = true;
  
  this.update_loading = true;
  
  this.user_service.updateUserTC2(data).subscribe((response:any)=>{

    this.update_loading = false;
    if (response && response.status && response.message ) {

      Swal.fire({
        title: response.message,
        showCancelButton: false,
        confirmButtonText: 'OK', confirmButtonColor: '#17A1FA',
      }).then(() => {
      this.updateRoleForm.reset();
      this.user_selected = null;
        this.getAllUsers()
      });

      $("#editdriver").modal('hide');

    }else{

      if(response.message){
        Swal.fire({
          title: response.message,
          showCancelButton: false,
          confirmButtonText: 'OK', confirmButtonColor: '#17A1FA',
        });
      }else{
        Swal.fire({
          title: 'Faield to update role',
          showCancelButton: false,
          confirmButtonText: 'OK', confirmButtonColor: '#17A1FA',
        });
      }

    }
  });
}

setUpdateRoleId(data:any){
  this.user_selected  = data;
  this.updateRoleForm.reset();
  this.role_idss.reset();
  this.role_idss.clear();

  this.updateRoleForm.get('user_id')?.patchValue(data.id);
  this.updateRoleForm.get('email')?.patchValue(data.email);
  this.updateRoleForm.get('full_name')?.patchValue(data.full_name);
  this.updateRoleForm.get('contact_number')?.patchValue(data.contact_number);
  this.dropdownList.map((item:any)=>{
    this.editRole(item);
  })
}


changeNumber(event:any){

  let p:string = event.target.value;
  var charCode = (event.which) ? event.which : event.keyCode;

  let abc= this.formatPhoneNumber(p);
  // console.log(abc)
  this.addUserForm.get('contact_number')?.patchValue(abc);
}

changeNumberEdit(event:any){
  let p:string = event.target.value;
  var charCode = (event.which) ? event.which : event.keyCode;

  let abc= this.formatPhoneNumber(p);
  // console.log(abc)
  this.updateRoleForm.get('contact_number')?.patchValue(abc);
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

changeNumber2(event:any){

  let p:string = event.target.value;
  var charCode = (event.which) ? event.which : event.keyCode;

  let abc= this.formatPhoneNumber2(p);
  // console.log(abc)
  this.updateRoleForm.get('contact_number')?.patchValue(abc);
}

formatPhoneNumber2(input:any) {

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
