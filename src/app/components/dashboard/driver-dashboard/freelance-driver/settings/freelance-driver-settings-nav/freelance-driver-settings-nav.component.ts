import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-freelance-driver-settings-nav',
  templateUrl: './freelance-driver-settings-nav.component.html',
  styleUrls: ['./freelance-driver-settings-nav.component.css']
})

export class FreelanceDriverSettingsNavComponent implements OnInit {
  
  @Input('active_link') active_link:any;
  @Input('current_nav') current_nav:any;

  loggedinUser:any=null;
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  
  constructor(
    private router: Router,
  ) { }
  active_menu:any;
  
  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    
    if(!userDone ||  userDone.full_name == undefined){
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


