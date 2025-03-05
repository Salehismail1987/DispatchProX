import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-select-company-type',
  templateUrl: './select-company-type.component.html',
  styleUrls: ['./select-company-type.component.css']
})
export class SelectCompanyTypeComponent implements OnInit {

  selected_type:any= '';
  constructor(
    private router: Router,
  ) {

   }

  ngOnInit(): void {
  }

  setRole(role:string){
    
    if(role && role !=""){
      sessionStorage.setItem('TraggetAccountRole', role);
      if(role == 'Driver'){
        this.router.navigate(['/driver-signup']);
      }else{
        this.router.navigate(['/signup'])
      }
    }
  }

}
