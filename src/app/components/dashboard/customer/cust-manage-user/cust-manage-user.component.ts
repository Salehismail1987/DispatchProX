import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CustomerService } from 'src/app/services/customer.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { ProjectService } from 'src/app/services/project.service';

declare var $: any;

interface ProjectRole {
  project_id: number;
  invitation_id:number;
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
  selector: 'app-cust-manage-user',
  templateUrl: './cust-manage-user.component.html',
  styleUrls: ['./cust-manage-user.component.css']
})
export class CustManageUserComponent implements OnInit {


  dropdownList:any = [];
  selectedItems:any  = [];
  dropdownSettings:any  = {};

  is_user_loading:boolean=false;
  approver_selected:any=null;
  loading:boolean=false;
  is_loading:boolean=false;

  users_list:any = null;
  users_project_list:any = null;
  external_approvers:any=null;

  active_menu:any;
  loggedinUser:any;

  addUserForm!: FormGroup;
  userfull_nameError: string = '';
  userEmailError: string = '';
  userRoleIDError: string = '';
  UpdateuserRoleIDError: string = '';
  userContactNumberError:string  = '';
  UpdateuserContactNumberError:string  = '';
  current_modal: string = '';

  update_user_check:boolean=false;
  update_role:any = '';
  user_selected:any = '';
  profileImage : any ;

  updateUserForm!:FormGroup;
  updateApproverForm!:FormGroup;
  updateRoleForm!:FormGroup;
  removing_loading:boolean=false;
  update_loading:boolean=false;
  errorUpdate:string = '';
  errorUpdateUser:string = '';
  imageSrc: string | ArrayBuffer | null = null;

  user_role:any;
  loading_approvers:boolean=false;
  user_id:any;
  constructor(
    private aRouter:ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cust_service: CustomerService,
    private user_service:UserDataService,
    private project_service:ProjectService
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
  selectedRoles: string[] = [];  // Explicitly type as string[]
  selectedRoles2: string[] = [];  // Explicitly type as string[]
  showDropdown = false;


  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      } else {
      this.router.navigate(['/home']);
    }


    this.user_id= this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;


    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      role_id: ['', Validators.required],
      contact_number: ['', Validators.required]
    });

    this.updateUserForm = this.fb.group({
      // full_name: ['', Validators.required],
      email: [this.user_selected?.email, Validators.required ],
      // role_id: ['', Validators.required],
      contact_number: [this.user_selected?.contact_number, Validators.required ],
      profileImage: [null]
    });


    this.updateApproverForm = this.fb.group({
      // full_name: ['', Validators.required],
      email: [this.approver_selected?.email, Validators.required ],
      // role_id: ['', Validators.required],
      contact_number: [this.approver_selected?.contact_number, Validators.required ],
      profileImage: [null]
    });


    this.dropdownList = [
      { item_id: 3, item_text: 'Admin' },
      { item_id: 2, item_text: 'Approver' },
      { item_id: 4, item_text: 'Dispatcher' },
      { item_id: 5, item_text: 'Superintendent' }
    ];

    this.dropdownSettings = {
      idField: 'item_id',
      textField: 'item_text',
      allowSearchFilter: true,
      enableCheckAll:false,
    };
    this.selectedItems = [

    ];





    this.updateRoleForm = this.fb.group({
      new_role_id: [this.selectedItems, Validators.required],
      user_id: [''],
      invitation_id: [''],
    });

    this.getAllUsers();
    this.getProjectUsers();

    $(document).on('click', (event: any) => {
      // Check if the clicked area is outside of `.more-modal`
      if (!$(event.target).closest('.more-modal, .input-field3, .dropdown-menu3').length) {        // Also ensure that the modal-backdrop is currently visible
        if ($('.modal-backdrop').is(':visible')) {
          this.closeMore();
        }
      }
    });

    $(document).on('click', '.getinputfield',function(this:any) {
      $('.input-popup-div').hide();
      setTimeout(() => {

        $(this).find('.input-popup-div').show();
      }, 300);
    });

    $(window).click(function(e:any) {
      if ( !($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length ) ) {

          $('.input-popup-div').hide();

      }

    });




  }


  getProjectUsers(){
    const formData = new FormData();
    this.loading_approvers = true;
    formData.append('user_id', this.loggedinUser?.id);

    this.project_service.getAllExternalApprovers(formData).subscribe(response=>{

      this.loading_approvers = false;
      if(response.status && response.data){
        this.external_approvers = response?.data;

      }else{

      }
    })
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


  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  updateSelectedRoles(roleId: number) {
    let role = this.roles.find(r => r.id === roleId);
    if (role) {
      role.selected = !role.selected; // Toggle the 'selected' state
      this.selectedRoles = this.roles.filter(r => r.selected).map(r => r.name);
      // console.log(" this is this.selectedRoles ", this.selectedRoles);
    }
    // this.selectedRoles = this.roles.filter(role => role.selected).map(role => role.name);
  }
  DefaultRoles(user:any) {
    console.log(" this user_selected ::: ", this.user_selected);
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

    console.log(" after default logic this selectedRoles ::: ", this.selectedRoles);

  }

  handleInviteSuccess(success: any) {
    if (success) {
      this.getAllUsers(); // Method to reload user list
      this.getProjectUsers();
    }
  }

  showMore2(user:any) {
    this.approver_selected = user  ;
    this.approver_selected.email = user?.user?.email ? user?.user?.email : (user?.invitation?.email ? user?.invitation?.email: user?.email)
    this.approver_selected.contact_number = user?.user?.contact_number ? user?.user?.contact_number : (user?.invitation?.contact_number ? user?.invitation?.contact_number: user?.contact_number)
    setTimeout(() => {
      $('.modal-backdrop-approver').toggle();
    }, 100);
  }

  closeMore2() {
    this.approver_selected = '';
    setTimeout(() => {
      $('.modal-backdrop-approver').hide();
    }, 100);

  }

  showMore(user:any) {
    this.user_selected = user;
    this.user_role = this.user_selected.user_roles[0].role_id;
    // console.log('this.user_selected',this.user_selected );
    // console.log('this.role_id',this.user_selected.user_roles[0].role_id );
    // {{user_selected.user_roles[0].role.role_name}}
    setTimeout(() => {
      $('.modal-backdrop').toggle();

    }, 100);
    this.DefaultRoles(user);
  }

  closeMore() {
    this.UpdateuserRoleIDError  = '';
    this.UpdateuserContactNumberError = '';
    this.user_selected = '';
    setTimeout(() => {
      $('.modal-backdrop').hide();
    }, 100);

  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', // "short" is a valid value for month representation
      year: 'numeric' // "numeric" is a valid value for year representation
    };
    return date.toLocaleDateString('en-US', options);
  }


  // uploadimage(event:any) {
  //   let file = event.target.files[0];
  //   if(file){
  //     this.profileImage  =file;
  //     // this.saveCompanyProfile();
  //     // alert(file.name)
  //   }
  // }
  // uploadimage(event: Event): void {
  //   const element = event.target as HTMLInputElement;
  //   if (element.files && element.files.length > 0) {
  //     const file = element.files[0];
  //       //   let file = event.target.files[0];

  //     const reader = new FileReader();
  //     reader.onload = e => this.imageSrc = reader.result; // safely assigned
  //     reader.readAsDataURL(file);
  //     this.updateUserForm.patchValue({
  //       profileImage: element.files[0]
  //     });
  //   }
  // }

  //
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
      this.updateUserForm.patchValue({
        profileImage: file
      });
      this.updateUserForm?.get('profileImage')?.updateValueAndValidity();
    }
  }

showModal(modal: any) {
  this.current_modal = modal;
}

setActive(type: any) {
  this.getProjectUsers();
  this.getAllUsers()
}

private restructureProjectUserData(data: any[]): ProjectRole[] {
  // Using a Map to uniquely identify each project_id and user_id combination
  const projectUserMap = new Map<string, ProjectRole>();

  for (const item of data) {
    const projectUserIdKey = `${item.project_id}-${item.user_id}`;
    if (projectUserMap?.has(projectUserIdKey)) {
      // Existing project and user combination, add role to the roles array
      let projectUserEntry = projectUserMap?.get(projectUserIdKey);
      projectUserEntry?.roles?.push(item.role);
    } else {
      // New project and user combination
      projectUserMap?.set(projectUserIdKey, {
        project_id: item.project_id,
        user_id: item.user_id,
        invitation_id: item?.invitation_id,
        project_name: item.project.project_name,
        roles: [item.role]
      });
    }
  }

  // Convert the Map values to an array and return
  return Array.from(projectUserMap.values());
}
  getAllUsers(){
    this.loading = true;
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.cust_service.getAllUsers(formData).subscribe((response:any)=>{
      this.loading = false;
      if (response && response.status && response.data ) {

        if(response.data && response.data.length>0){

          this.users_list = response.data;
          console.log("users_list ::: ", this.users_list)
        }else{
          this.users_list = null;
        }
        if(response.data && response.ProjectUser.length>0){
          this.users_project_list = this.restructureProjectUserData(response.ProjectUser);

          // this.users_project_list = response.ProjectUser;
          console.log("ProjectUser ::: ", this.users_project_list)
        }else{
          this.users_project_list = null;
        }
      }
    });
  }

  confirmDelete(id:any,update_role:any){
    if(!id || id==''){
      return;
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'mybtn mybtn-back-yellow width-fit-content mybtn-padding',
        denyButton:'mybtn mybtn-yellow-border width-fit-content mybtn-padding',
        cancelButton:'mybtn mybtn-yellow-border width-fit-content mybtn-padding'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Do you want to delete this user?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: `Cancel`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
        formData.append('delete_id', id);
        var is_invitation= update_role?.invitation_code ? 'YES':'NO';
        formData.append('is_invitation',is_invitation);
        this.removing_loading = true;
        this.cust_service.deleteUser(formData).subscribe((response:any)=>{
          this.removing_loading = false;
          if (response && response.status && response.message ) {

            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire('Deleted!', response.message, 'success');
            this.getAllUsers();

            $("#contactedit").modal('hide');
            $("#contactedit").hide('modal');
          }else{
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire('Error!', 'Unable to delete!', 'error')
          }
        });

      }
    })
  }


  onSaveUser(){

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
    this.is_user_loading =true;
    this.user_service.inviteByRole(data).subscribe(response=>{

    this.is_user_loading =false;
      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
         this.is_user_loading =false;
        return;
      }else{
        this.addUserForm.reset();
         this.is_user_loading =false;
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `success`,
          `User Added Successfully!`).then(() => {
            this.getAllUsers()
          });
      }
    });


  }


  confirmUpdateRole(){
    this.errorUpdate = '';

    var items= this.updateRoleForm.get('new_role_id')?.value;

    let selected:any=[];
    for(var i=0;i<items.length;i++){
      let data= items[i].item_text;

      if((data.includes("Approver"))){
        data='Approver';
      }

      if((data.includes("Admin"))){
        data='Admin';
      }
      if((data.includes("Dispatcher"))){
        data='Dispatcher';
      }

      if((data.includes("Superintendent"))){
        data='Superintendent';
      }
      selected[i]=data;
    }

    if(selected.length<1){
      this.errorUpdate='Role selection required.'
      return;
    }
    const formData = new FormData();
    let data:any  = {
      company_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      user_id: this.updateRoleForm.get('user_id')?.value,
      invitation_id: this.updateRoleForm.get('invitation_id')?.value,
      new_role_id:selected
    };
    this.update_loading = true;
    this.user_service.updateRole(data).subscribe((response:any)=>{
      this.update_loading = false;

      if (response && response.status && response.message ) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK',
          });
          this.update_role = null;
          this.updateRoleForm.reset();
          this.getAllUsers()
          $("#contactedit").modal('hide');
          $("#contactedit").hide('modal');
      }else{
        if(response.message){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: 'Faield to update role',
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }

      }
    });
  }

  confirmUpdateApprover(){

    this.UpdateuserContactNumberError = '';

    if (this.updateApproverForm.get('contact_number')?.value == '') {
      this.UpdateuserContactNumberError = 'User contact number is required';
    }

    let errors='';

    if (this.updateApproverForm.get('contact_number')?.value != '') {
      let a=this.updateApproverForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.UpdateuserContactNumberError  = "Provide a valid contact number.";
        errors='yes';
        this.update_user_check = false;
      }
    }

    if(errors!=''){
      this.update_user_check = false;
      return;
    }

    if (this.updateApproverForm.invalid) {
      this.update_user_check = false;
      return;
    }

    let invitation_code = this.approver_selected?.invitation?.invitation_code;

    let data: any = {
      full_name: this.approver_selected?.user?.full_name,
      email: this.updateApproverForm.get('email')?.value,
      // role_id: this.user_role,
      external_approver:'YES',
      contact_number: this.updateApproverForm.get('contact_number')?.value,
      profileImage: this.updateApproverForm.get('profileImage')?.value
    };

    // Check if invitation_code exists and is not null
    if (invitation_code != null) {
      data.invitation_id = this.approver_selected.invitation_id;  // Assuming you have `approver_selected_id` correctly defined
    } else {
      data.user_id = this.approver_selected.user_id;
    }
    this.update_user_check = true;

    this.is_loading = true;
    this.user_service.updateUserInfo(data).subscribe((response:any)=>{
      this.update_loading = false;

      if (response && response.status && response.message ) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK',
          });
          this.update_role = null;
          this.updateApproverForm.reset();
          this.closeMore2();
          this.getProjectUsers();
          this.is_loading = false;

      }else{
        if(response.message){
          this.is_loading = false;

          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: 'Faield to update User info',
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }

      }
    });
  }

  confirmUpdateUser(){

    this.UpdateuserRoleIDError  = '';
    this.UpdateuserContactNumberError = '';

    if (!this.selectedRoles || this.selectedRoles.length === 0) {
      this.UpdateuserRoleIDError = 'User Role is required';
      this.update_user_check = false;

    }
    if (this.updateUserForm.get('contact_number')?.value == '') {
      this.UpdateuserContactNumberError = 'User contact number is required';
    }

    let errors='';

    if (this.updateUserForm.get('contact_number')?.value != '') {
      let a=this.updateUserForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.UpdateuserContactNumberError  = "Provide a valid contact number.";
        errors='yes';
        this.update_user_check = false;
      }
    }

    if(errors!=''){
      this.update_user_check = false;
      return;
    }

    if (this.updateUserForm.invalid) {
      this.update_user_check = false;
      return;
    }

    let invitation_code = this.user_selected.invitation_code;

    let data: any = {
      full_name: this.user_selected.full_name,
      email: this.updateUserForm.get('email')?.value,
      // role_id: this.user_role,
      role_ids: this.selectedRoles,
      contact_number: this.updateUserForm.get('contact_number')?.value,
      profileImage: this.updateUserForm.get('profileImage')?.value
    };

    // Check if invitation_code exists and is not null
    if (invitation_code != null) {
      data.invitation_id = this.user_selected.id;  // Assuming you have `user_selected_id` correctly defined
    } else {
      data.user_id = this.user_selected.id;
    }
    this.update_user_check = true;
    console.log(" confirmUpdateUser :: data ::: ", data);
    // console.log(" this user_selected e ::: ", this.user_selected);

    this.is_loading = true;
    this.user_service.updateUserInfo(data).subscribe((response:any)=>{
      this.update_loading = false;

      if (response && response.status && response.message ) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK',
          });
          this.update_role = null;
          this.updateUserForm.reset();
          this.closeMore();
          this.getAllUsers();
          this.is_loading = false;

      }else{
        if(response.message){
          this.is_loading = false;

          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }else{
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire({
            title: 'Faield to update User info',
            showCancelButton: false,
            confirmButtonText: 'OK'
          });
        }

      }
    });
  }

  setUpdateRoleId(data:any){
 this.update_role  = data;
  // console.log(this.update_role.user_roles);
    if(data.invitation_code){

      this.updateRoleForm.get('invitation_id')?.patchValue(data.id);
    }else{

      this.updateRoleForm.get('user_id')?.patchValue(data.id);
    }

    let selected:any=[];
    let roles:any=this.update_role.user_roles;
   for(var i=0;i<roles.length;i++){
      selected[i] = {
        item_id: roles[i]?.role_id, item_text: roles[i]?.role?.role_name
      };
   }
    this.selectedItems = selected;
    // console.log(selected)

    this.updateRoleForm.get('new_role_id')?.patchValue(this.selectedItems);
  }
  removeUser(data:any){
    console.log(" removeUser data :: ", data);

    if(!data.id || data.id==''){
      return;
    }
    const fullName = this.user_selected ? this.user_selected.full_name : 'the user';
    const formData = new FormData();
        formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
        formData.append('delete_id', data.id);
        var is_invitation= data?.invitation_code ? 'YES':'NO';
        formData.append('is_invitation',is_invitation);
        this.removing_loading = true;
        this.cust_service.removeUser(formData).subscribe((response:any)=>{
          this.removing_loading = false;
          if (response && response.status && response.message ) {

            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire('Removed!', response.message, 'success');
            this.closeMore();
            this.getAllUsers();
          }else{
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire('Error!', 'Unable to Remove!', 'error')
          }
        });


    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'mybtn mybtnn mybtn-back-yellow width-fit-content mybtn-padding',
    //     cancelButton: 'mybtn mybtn-yellow-border width-fit-content mybtn-padding',
    //     denyButton: 'mybtn mybtn-yellow-border width-fit-content mybtn-padding',
    //     actions: 'swal2-actions-flex-end'  // Custom class for actions container
    //   },
    //   buttonsStyling: false
    // })
    // swalWithBootstrapButtons.fire({
    //   title: `Remove ${fullName} from the list?`,
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes',
    //   denyButtonText: `No`,
    // }).then((result) => {
    //   /* Read more about isConfirmed, isDenied below */
    //   if (result.isConfirmed) {
    //     const formData = new FormData();
    //     formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    //     formData.append('delete_id', data.id);
    //     var is_invitation= data?.invitation_code ? 'YES':'NO';
    //     formData.append('is_invitation',is_invitation);
    //     this.removing_loading = true;
    //     this.cust_service.removeUser(formData).subscribe((response:any)=>{
    //       this.removing_loading = false;
    //       if (response && response.status && response.message ) {

    //         const swalWithBootstrapButtons = Swal.mixin({
    //           customClass: {
    //             confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
    //           },
    //           buttonsStyling: false
    //         })
    //         swalWithBootstrapButtons.fire('Removed!', response.message, 'success');
    //         this.closeMore();
    //         this.getAllUsers();
    //       }else{
    //         const swalWithBootstrapButtons = Swal.mixin({
    //           customClass: {
    //             confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
    //           },
    //           buttonsStyling: false
    //         })
    //         swalWithBootstrapButtons.fire('Error!', 'Unable to Remove!', 'error')
    //       }
    //     });

    //   }
    // })

  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addUserForm.get('contact_number')?.patchValue(abc);
  }
  changeRole(event:any){

    let p:string = event.target.value;

    // let abc= this.formatPhoneNumber(p);
    this.user_role = p;
    // this.addUserForm.get('contact_number')?.patchValue(abc);
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
    this.updateUserForm.get('contact_number')?.patchValue(abc);
  }

  changeNumber3(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber2(p);
    // console.log(abc)
    this.updateApproverForm.get('contact_number')?.patchValue(abc);
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
