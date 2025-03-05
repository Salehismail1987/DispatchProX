import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  active_menu:any;
  constructor(
    private router:Router
  ) { 
    this.active_menu = {
      parent:'settings',
      child:'company-settings',
      count_badge: '',
    }
  }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    

    if(!userDone ||  userDone.full_name == undefined ){
      this.router.navigate(['/home']);
    }
  }

}
