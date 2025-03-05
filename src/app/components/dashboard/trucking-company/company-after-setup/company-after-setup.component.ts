import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-after-setup',
  templateUrl: './company-after-setup.component.html',
  styleUrls: ['./company-after-setup.component.css']
})
export class CompanyAfterSetupComponent implements OnInit {

  loggedinUser : any = {};
  constructor(
    private router:Router
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone &&  userDone.full_name){
      this.router.navigate(['/home']);
    }
  }

}
