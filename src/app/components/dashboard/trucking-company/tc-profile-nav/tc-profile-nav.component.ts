import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tc-profile-nav',
  templateUrl: './tc-profile-nav.component.html',
  styleUrls: ['./tc-profile-nav.component.css']
})
export class TcProfileNavComponent implements OnInit {
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  
  @Input('loggedinUser') loggedinUser:any;
  @Input('current') current:any;
  constructor() { }

  ngOnInit(): void {
  }

  isActive(tabName: string): boolean {
    return this.current === tabName;
  }

  setActiveTab(tabName: string) {
    this.current = tabName;
  }



}
