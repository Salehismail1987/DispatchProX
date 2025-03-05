import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-account-switcher',
  templateUrl: './account-switcher.component.html',
  styleUrls: ['./account-switcher.component.css']
})
export class AccountSwitcherComponent implements OnInit {

  screen:string='mobile';
  
  loggedinUser : any = {};
  constructor(
    private router: Router,
    
    private responsiveService: ResponsiveService,
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
   }

  ngOnInit(): void {
    this.responsiveService.checkWidth();
    this.onResize();
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      } else {
      this.router.navigate(['/home']);
    }

  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      
    });
  }

  switchUser(accountType:string) {
    let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')
    currentlyLoggedInProfile.account_type = accountType;
    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
    this.loggedinUser.account_type = accountType;
    if(accountType=='Driver'){
      if(this.screen=='mobile'){
        window.location.href = '/dashboard';
      }else{
        window.location.href = '/driver-dashboard-scheduler';
      }
      
    }else{

      window.location.href = '/dashboard';
    }
  }

}
