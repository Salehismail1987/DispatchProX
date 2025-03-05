import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-tc-approver-projects',
  templateUrl: './tc-approver-projects.component.html',
  styleUrls: ['./tc-approver-projects.component.css']
})
export class TcApproverProjectsComponent implements OnInit {
  loggedinUser: any = {};
  message:any;

  // Listing Contanier
  project_list: any;
  sort_by:any = 'recently created';
  search_by:any = '';
  current_modal: string = '';

  active_menu:any;
  
  
  constructor(
    private router: Router,
    private projectService: ProjectService,
    private user_service:UserDataService
  ) { 
    this.active_menu = {
      parent:'projects',
      child:'projects',
      count_badge: '',
    }
  }

  ngOnInit(): void {
    this.sort_by = 'job_number';
    this.search_by = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
    }else{
      this.router.navigate(['/home']);
    }
    this.getMenuCounts()
    this.getProjectListing();
  }
  is_only_approver(roles:any){

    let is_approver:boolean=false;
    if(roles && roles?.length>0){
      roles.map((item:any)=>{
        is_approver = item?.role?.role_name == "Approver" ? true : false;
      });

      
      if(roles.length== 1 && is_approver){
        is_approver = true;
      }else{
        is_approver = false;
      }
    }
   

    return is_approver;
  }
  getMenuCounts(){
    let data = {is_tc_approver:'YES',orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type:this.loggedinUser?.user_data_request_account_type ?this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type};
   
    if(this.is_only_approver(this.loggedinUser?.user_roles) || this.loggedinUser?.account_type=='Customer'){
       data = {is_tc_approver:'YES',orginal_user_id:null,user_id:this.loggedinUser.id ,account_type: this.loggedinUser?.account_type};
     
    }
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
        
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  
    
  }
  getProjectListing(){
    const formData = new FormData();

    formData.append('is_tc_ticket', 'YES');
    formData.append('user_id', this.loggedinUser?.id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('source', 'Approver');

    this.projectService.projectListing(formData).subscribe(response=>{
      if(response.status && response.data.length>0){
        this.project_list = response.data;
        console.log(this.project_list);
      }else{
        this.message = response.message;
      }
    }
    );
  }
}
