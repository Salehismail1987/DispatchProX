import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { parseBounds } from 'html2canvas/dist/types/css/layout/bounds';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';

@Component({
  selector: 'app-customer-setup',
  templateUrl: './customer-setup.component.html',
  styleUrls: ['./customer-setup.component.css']
})
export class CustomerSetupComponent implements OnInit {

  loggedinUser: any = {};
  current_modal: string = '';

  //To mark action buttons active
  is_new_project_active: boolean = false;
  is_invitepeople_active: boolean = false;
  is_adduser_active: boolean = false;
  hide_options:boolean=false;

  score:number=0;
  //
  constructor(
    private router: Router,
    private tc_service:TruckingCompanyService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.account_type == 'Customer'){
       
    }else{
      this.router.navigate(['/dashboard']);
    }

    // if(userDone.is_setup_shown){
    //   this.hide_options = true;
    // }else{

    //   this.is_new_project_active = userDone.is_new_project_active;
    //   this.is_invitepeople_active = userDone.is_invitepeople_active;
    //   this.is_adduser_active = userDone.is_adduser_active;
    // }
   

    // if(this.is_new_project_active == true && this.is_invitepeople_active == true && this.is_adduser_active == true){
    //   this.hide_options = true;
    // }

    this.loggedinUser = userDone;
// alert(parseInt(userDone.is_setup_shown.toString()))
    // if (userDone && userDone.account_type == 'Customer' && userDone.is_setup_shown &&  parseInt(userDone.is_setup_shown.toString()) == 1) {

    //    this.router.navigate(['/dashboard']);
    // }

  }

  showModal(modal: any) {
    // if( (modal=='new-project' && this.is_new_project_active == true) || (modal=='add-users' && this.is_adduser_active == true) || (modal=='invite-people' && this.is_invitepeople_active ==true)){
      
    //   return;
    // }
    this.current_modal = modal;
  }

  setActive(type: any) {
    switch (type) {
      case 'adduser':
        this.is_adduser_active = true;
        break;
      case 'invitepeople':
        this.is_invitepeople_active = true;
        break;
      case 'newproject':
        this.is_new_project_active = true;
        break;
    }
    if(this.is_new_project_active == true && this.is_invitepeople_active == true && this.is_adduser_active == true){
      
      
      this.tc_service.setSetupStatus(this.loggedinUser.id).subscribe(response=>{
        if(response && response.status){
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          // this.hide_options = true;
        }
      });
      this.score=100;
    }else{
        this.score = 0;
        if(this.is_new_project_active){
          this.score += 33.33;
        }
        if(this.is_invitepeople_active){
          this.score+=33.33;
        }
        if(this.is_adduser_active){
          this.score+=33.33;
        }
        
      }
  }
  getScore(scroe:any){
    var t= parseInt((scroe/33.33).toFixed(0));
    
    return t;
  }

}
