import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tc-contact-projects',
  templateUrl: './tc-contact-projects.component.html',
  styleUrls: ['./tc-contact-projects.component.css']
})
export class TcContactProjectsComponent implements OnInit {

  active_menu:any;
  loggedInUser:any;
  constructor() { }

  ngOnInit(): void {
    this.active_menu = {
      parent:'tc-contacts',
      child:'tc-drivers',
      count_badge: '',
    }
  }

}
