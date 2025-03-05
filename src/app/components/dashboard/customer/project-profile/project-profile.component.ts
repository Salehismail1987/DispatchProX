import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, ValidationErrors } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-project-profile',
  templateUrl: './project-profile.component.html',
  styleUrls: ['./project-profile.component.css']
})
export class ProjectProfileComponent implements OnInit {

  self_user:any=null;
  loggedinUser: any = {};
  message:any;
  projectUsersForm!:FormGroup;

  //Data Container
  project: any;
  project_id: any;
  selected_project_id:any;
  is_loading:boolean = false;  
  project_approvers:any;

  approver_list: any;
  supridendents_list:any;
  dispatchers_list:any;

  updateProjForm!: FormGroup;

  updateProjJobNumberError: string  ='';
  updateProjNameError: string = '';
  updateProjStartDateError: string = '';
  updateProjEndDateError: string = '';
  updateProjLocationError: string = '';
  updateProjApproverError: string = '';
  updateProjDumpSiteError: string = '';
  updateProjRoundError: string = '';
  active_menu:any;

  remove_user_name:string='';
  remove_user_type:string='';
  remove_idx:any=null;

  show_list_app:boolean=false;
  show_list_app_id:any=null;
  show_list_disp:boolean=false;
  show_list_disp_id:any=null;
  show_list_sup:boolean=false;

  approver_term_search:string = '';
  dispatcher_term_search:string = '';
  sup_term_search:string='';

  project_supr_name:string='';
  project_supr_email:string='';
  project_supr_no:string ='';
  project_supr_id:string='';

  current_modal:string='';

  

  constructor(    
    private router: Router,
    private activeRouter: ActivatedRoute,
    private projectService: ProjectService,    
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
    
    this.getApprovers();
    this.getDispatchers();
    this.getSupridentents();


    this.updateProjForm = this.fb.group({
      job_number: ['', Validators.required],
      project_name: ['', Validators.required],
      project_location: ['', Validators.required],
      start_date: [''],
      planned_enddate: [''],
      default_rounds: [''],
      project_id:[''],
      supridendent_id:[''],
      dump_sites: this.fb.array([]),      
      approvers: this.fb.array([]),
      dispatchers: this.fb.array([]),
    });
    
    $(document).click(function(e:any) {
      
      var container = $(".background-customer");
      var input = $(".selectcustomerfield");
   
      if (!container.is(e.target) && container.has(e.target).length === 0) {
          if (!input.is(e.target) && input.has(e.target).length === 0) {

              container.hide();
          }
      }
    });
  }

  addDumpSite() { 
    this.dump_sites.push(
      this.fb.group({       
        name:[],
        location: [],
      })
    )
  }

  addApprover(approver:any) {
   
    this.approvers.push(
      this.fb.group({       
        approver_id:[approver?.id],
        email:[approver?.email],
        no:[approver?.contact_number],
        name:[approver.full_name]
      })
    ); 
    $("#search-approver"+this.approvers.length).val('');
  }

  addDispatcher(dispatcher:any) { 
    this.dispatchers.push(
      this.fb.group({       
        dispatcher_id:[dispatcher.id],
        email:[dispatcher.email],
        no:[dispatcher.contact_number],
        name:[dispatcher.full_name]
        
      })
    ); 
    
    $("#search-dispatcher"+this.approvers.length).val('');
  }

  get dispatchers(): FormArray{
    return this.updateProjForm.controls["dispatchers"] as FormArray;
  }

  get approvers(): FormArray {
    return this.updateProjForm.controls["approvers"] as FormArray;
  }

  setUser(idx:any,type:any,name:any){
    if(name ===undefined){
      return;
    }
    if(type == 'Approver'){
      this.remove_user_name = name;
      this.remove_user_type = 'Approver';
    }else if(type == 'Dispatcher'){
      this.remove_user_name = name;
      this.remove_user_type = 'Dispatcher';
    }
    this.remove_idx=idx;
  }
  
  removeUser(idx:any){
    if(this.remove_user_type =='Approver'){
      this.approvers.removeAt(this.remove_idx);
      this.remove_user_name = '';
      this.remove_user_type = '';
      this.remove_idx='';
    }else if(this.remove_user_type == 'Dispatcher'){
      this.dispatchers.removeAt(this.remove_idx);
      this.remove_user_name = '';
      this.remove_user_type = '';
      this.remove_idx='';
    }
  }

  cancelRemoveUser(){
    this.remove_user_name = '';
    this.remove_user_type = '';
    this.remove_idx='';
  }

  projectDetails(project_id:any){
    this.is_loading = true;
    this.projectService.projectDetails(project_id).subscribe(response=>{
      this.is_loading = false;
      if(response.status && response.data){
        this.project  = response.data;
        this.project_approvers = this.project.project_approvers;
       
        this.project_supr_name = this.project.project_supridentent && this.project.project_supridentent[0] && this.project.project_supridentent[0].user && this.project.project_supridentent[0].user.full_name ? this.project.project_supridentent[0].user.full_name :'';

        this.project_supr_id =   this.project.project_supridentent && this.project.project_supridentent[0] && this.project.project_supridentent[0].user_id;

        this.project_supr_email = this.project.project_supridentent &&  this.project.project_supridentent[0] && this.project.project_supridentent[0].user && this.project.project_supridentent[0].user.email ? this.project.project_supridentent[0].user.email:'';

        this.project_supr_no = this.project.project_supridentent &&  this.project.project_supridentent[0] && this.project.project_supridentent[0].user && this.project.project_supridentent[0].user.contact_number ? this.project.project_supridentent[0].user.contact_number:'';
       
        let usr_id =this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
       
        this.self_user = this.loggedinUser.user_data_request_id? this.loggedinUser?.parent_user : this.loggedinUser;
        this.project_approvers && this.project_approvers.length>0 && this.project_approvers.map((item:any)=>{
          
          if(item?.user?.id !=usr_id){
            this.addApprover(item.user);
          }else{
            this.self_user = item.user;
          }             
        })

       
       
        this.project.project_dispatchers && this.project.project_dispatchers.length>0 && this.project.project_dispatchers.map((item:any)=>{
          this.addDispatcher(item.user); 
                  
        })

        this.project.dump_sites && this.project.dump_sites.length>0 && this.project.dump_sites.map(()=>{
          this.addDumpSite();
        })

        if(this.dump_sites.controls.length < 1){
          this.addDumpSite();
        }

        if(this.approvers.controls.length < 1){
          this.addApprover([]);
        }

        if(this.dispatchers.controls.length < 1){
          this.addDispatcher([]);
        }
      }
    })
  }

  setSupridentent(user:any){
    
    this.project_supr_email=user?.email;
    this.project_supr_no=user?.contact_number;
    this.project_supr_name=user?.full_name;
    this.project_supr_id=user?.id;
    
   
  }
  setApprover(index:any,item:any){
   
      this.approvers.at(index).get('approver_id')?.patchValue(item.id)
      this.approvers.at(index).get('email')?.patchValue(item.email)
      this.approvers.at(index).get('no')?.patchValue(item.contact_number)     
      this.approvers.at(index).get('name')?.patchValue(item.full_name)  
     
  }
  
  setDispatcher(index:any,item:any){

    this.dispatchers.at(index).get('dispatcher_id')?.patchValue(item.id)
    this.dispatchers.at(index).get('email')?.patchValue(item.email)
    this.dispatchers.at(index).get('no')?.patchValue(item.contact_number)
    this.dispatchers.at(index).get('name')?.patchValue(item.full_name)
       
  }
  
  getApprovers(){
    const formData = new FormData();

    formData.append('term', this.approver_term_search);
    formData.append('type', 'All');
    
    formData.append('project_id', this.project_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
   
    this.user_service.getUserList(formData).subscribe(response=>{

      if(response.status && response.data){
        this.approver_list = response.data;
        
      }else{  
        
      }
    })
  }

  getSupridentents(){
    const formData = new FormData();

    formData.append('type', 'All');
    
    formData.append('term', this.sup_term_search);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    
    this.user_service.getUserList(formData).subscribe(response=>{

      if(response.status && response.data){
        this.supridendents_list = response.data;
        
      }else{  
        
      }
    })
  }

  getDispatchers(){
    const formData = new FormData();

    formData.append('type', 'All');
    formData.append('term', this.dispatcher_term_search);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
   
    this.user_service.getUserList(formData).subscribe(response=>{

      if(response.status && response.data){
        this.dispatchers_list = response.data;
        
      }else{  
        
      }
    })
  }

  
  get dump_sites(): FormArray {
    return this.updateProjForm.get('dump_sites') as FormArray;
  }
 

  onUpdateProject(){
    this.updateProjJobNumberError  ='';
    this.updateProjNameError = '';
    this.updateProjStartDateError = '';
    this.updateProjEndDateError = '';
    this.updateProjLocationError = '';
    this.updateProjApproverError = '';
    this.updateProjDumpSiteError = '';
    this.updateProjRoundError = '';

    if(this.updateProjForm.get('job_number')?.value == ''){
      this.updateProjJobNumberError  = "Job Number is required";
    }
    
    if(this.updateProjForm.get('project_name')?.value == ''){
      this.updateProjNameError  = "Project Name is required";
    }
  
    if(this.updateProjForm.get('planned_enddate')?.value == ''){
      this.updateProjEndDateError  = "Planned End Date is required";
    }

    if(this.updateProjForm.get('project_location')?.value == ''){
      this.updateProjLocationError  = "Project Location is required";
    }
    
   
    // if(this.updateProjForm.get('default_rounds')?.value == ''){
    //   this.updateProjRoundError  = "Please enter Default Rounds.";
    // }
   
    // if(this.approvers.controls.length>0 ){

    // }else{
    //   this.updateProjApproverError = 'At least one approver is required.';
    //   return;
    // }
    
    console.log(this.updateProjForm.value)
    if (this.updateProjForm.invalid) {
      // Object.keys(this.updateProjForm.controls).forEach((key:any) => {
      //   const controlErrors: any = this.updateProjForm.get(key)?.errors;
      //   if (controlErrors != null) {
      //     Object.keys(controlErrors).forEach(keyError => {
      //      console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
      //     });
      //   }
      // });
      return;
    }
    
    this.is_loading =true;
    this.projectService.updateProject(this.updateProjForm.value).subscribe(response=>{
              
      if (response && !response.status ) {
        this.is_loading =false;  
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

        this.updateProjApproverError = response.data.approver_id ? response.data.approver_id : '';    
        this.updateProjEndDateError = response.data.planned_enddate ? response.data.planned_enddate : '';    
        this.updateProjStartDateError = response.data.start_date ? response.data.start_date : '';     
        this.updateProjJobNumberError = response.data.job_number ? response.data.job_number : '';     
        this.updateProjNameError = response.data.project_name ? response.data.project_name : '';      
        this.updateProjLocationError = response.data.project_location ? response.data.project_location : '';      
        this.updateProjRoundError = response.data.default_rounds ? response.data.default_rounds : '';        
        this.updateProjApproverError = response.data.default_rounds ? response.data.approver_id : '';  
      
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
          `Success`,
          `Project Profile updated!`).then(() => { 
         
          });
        
      }
    });

   
  }

  onSaveUsers(){
      
  }
  
  showAppList(idx:any){
    this.show_list_app = !this.show_list_app;
    this.show_list_disp = false;
    this.show_list_app_id= idx;
    this.show_list_disp_id ='';
  }
  
  showDispList(idx:any){
    this.show_list_disp = !this.show_list_disp;
    this.show_list_app = false;
    this.show_list_disp_id= idx;
    this.show_list_app_id= '';
  }

  showSupList(){
    this.show_list_sup = !this.show_list_sup;
    this.show_list_app = false;
    this.show_list_app_id= '';
    this.show_list_disp = false;
    this.show_list_disp_id ='';
  }
  searchAppComp(event:any){
    if(event.target.value){
     this.approver_term_search = event.target.value;
      this.getApprovers()
    }else{
      this.approver_term_search='';
      this.getApprovers()
    }
    
  }

  searchDispComp(event:any){
    if(event.target.value){
      this.dispatcher_term_search = event.target.value;
       this.getDispatchers()
     }else{
      this.dispatcher_term_search='';
      this.getDispatchers()
     }
  }

  searchSupComp(event:any){
    if(event.target.value){
      this.sup_term_search = event.target.value;
       this.getSupridentents()
     }else{
      this.sup_term_search='';
      this.getSupridentents()
     }
  }

  showModalUser(){
    this.current_modal='add-users';
  }

  showModalUserRole(){
    this.current_modal='add-users';
    this.selected_project_id = this.project_id;
  }

  showModal(event:any){
    this.current_modal='';
  }

  

  setActive(event:any){
    this.current_modal='';
    this.getApprovers();
    this.getDispatchers();
    this.getSupridentents();
  }
}
