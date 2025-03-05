import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-customer-project-listing',
  templateUrl: './customer-project-listing.component.html',
  styleUrls: ['./customer-project-listing.component.css']
})
export class CustomerProjectListingComponent implements OnInit {

  loggedinUser: any = {};
  message:any;

  // Listing Contanier
  project_list: any;
  sort_by:any = 'recently created';
  search_by:any = '';
  current_modal: string = '';

  active_menu:any;
  loading_project:boolean=true;

  constructor(
    private router: Router,
    private projectService: ProjectService
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
    this.getProjectListing();
  }

  getProjectListing(){
    const formData = new FormData();
    this.loading_project = true;
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('ignore_removed', 'NO');
    formData.append('listing_call','YES');

    this.projectService.projectListing(formData).subscribe(response=>{
      this.loading_project= false;
      if(response.status && response.data.length>0){
        this.project_list = response.data;
        console.log(this.project_list);
      }else{
        this.message = response.message;
      }
    }
    );
  }

  handleChange(value:any){

    this.sort_by = value;
    this.getProjectListing();

  }

  searchBy(value:any){
    this.search_by  =value;
    this.getProjectListing();
  }

  showModal(modal: any) {
    this.current_modal = modal;
  }

  setActive(type: any) {
    this.sort_by='recently created';
    this.getProjectListing();
  }

}
