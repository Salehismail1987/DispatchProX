import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent implements OnInit {
  @Input('active_menu') active_menu:any;

  loggedinUser : any = {};
  customer:any;

  backendAPIURL = environment.apiBackendUrl;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    this.customer = {full_name:this.loggedinUser.full_name,email:this.loggedinUser.email,company:this.loggedinUser.company_name}

  }

  logoutUser(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    sessionStorage.removeItem('TraggetUserTrial');
    localStorage.removeItem('TraggetUserMenuCounts');
    localStorage.removeItem('Unknown_disp');
    this.router.navigate(['/home']);
  }

}
