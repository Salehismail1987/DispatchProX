import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-profile-nav',
  templateUrl: './customer-profile-nav.component.html',
  styleUrls: ['./customer-profile-nav.component.css']
})
export class CustomerProfileNavComponent implements OnInit {
  
  loggedinUser:any;
  company_details:any;
  customer_details:any;

  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;


  @Input('current_nav') current_nav:any;
  constructor(
    private router : Router
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
      this.company_details= userDone;
      this.customer_details = userDone?.customer ? userDone?.customer : [] ;
    }else{
      this.router.navigate(['/home']);
    }
  }

  setActiveTab(tabName: string) {
    this.current_nav = tabName;
  }

  isActive(tabName: string): boolean {
    return this.current_nav === tabName;
  }
}
