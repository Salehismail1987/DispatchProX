import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { CustomerService } from 'src/app/services/customer.service';
import { UserDataService } from 'src/app/services/user-data.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-cust-inv-users',
  templateUrl: './cust-inv-users.component.html',
  styleUrls: ['./cust-inv-users.component.css']
})
export class CustInvUsersComponent implements OnInit {

  loggedinUser: any = {};
  message:any;

  //Data Container
  project: any;
  project_id: any;
  is_loading:boolean = false; 
  is_progress:boolean = false; 
  active_menu:any;

  
  invUserForm!: FormGroup;

  nameError: string  ='';
  emailError: string = '';
  roleError: string = '';

  constructor(
    private router: Router,
    private activeRouter: ActivatedRoute,
    private projectService: ProjectService,    
    private customer_service: CustomerService,    
    private user_service: UserDataService,
    private fb: FormBuilder,
  ) {
    this.active_menu = {
      parent:'projects',
      child:'projects',
      count_badge: '',
    }
   }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
    }else{
      this.router.navigate(['/home']);
    }
    

    this.project_id =  this.activeRouter.snapshot.params['id'];
    if(this.project_id !=""){
      this.projectDetails(this.project_id);
    }

    this.invUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      role: ['2', Validators.required],

    });
  }

  projectDetails(project_id:any){
    this.is_loading = true;
    this.projectService.projectDetails(project_id).subscribe(response=>{
      this.is_loading = false;
      if(response.status && response.data){
        this.project  = response.data;
        
      }
    })
  }

  onInvUserForm(){

    this.emailError = '';
    this.nameError = '';
    this.roleError = '';

    if(this.invUserForm.get('name')?.value ==''){
      this.nameError='Name is required!'
    }
    if(this.invUserForm.get('email')?.value == ''){
      this.emailError='Email is required!'
    }
    
    if(this.invUserForm.get('role')?.value == ''){
      this.roleError='You must a role!'
    }
    if(this.invUserForm.invalid){
      return false;
    }
    let data:any = this.invUserForm.value;
    data.project_id = this.project_id;
    data.first_name =  this.invUserForm.get('name')?.value;
    data.role_id =  this.invUserForm.get('role')?.value;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    this.is_progress = true;
    this.user_service.inviteByRole(data).subscribe(response=>{
              
     
      if (response && !response.status ) {
        this.is_progress =false;  
        if(response.message){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Error`,
            response.message).then(() => { 
              
            });
          return;
        }

        this.nameError = response.data.name ? response.data.name : '';    
        this.emailError = response.data.email ? response.data.email : '';    
        this.roleError = response.data.role ? response.data.role : '';       
      
        return;
      }else{
        
        this.is_progress =false;
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          response.message).then(() => { 
         
          });
        
      }
    });

    return;
  }
}
