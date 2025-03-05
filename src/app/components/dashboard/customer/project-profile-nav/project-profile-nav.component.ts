import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-profile-nav',
  templateUrl: './project-profile-nav.component.html',
  styleUrls: ['./project-profile-nav.component.css']
})
export class ProjectProfileNavComponent implements OnInit {

  @Input('current_nav') current_nav:any;
  @Input('project_id') project_id:any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
 
  }

  backTo(to:any){
    if(to){
      this.router.navigateByUrl(to+'?project_id='+this.project_id)
    }
  }

}
