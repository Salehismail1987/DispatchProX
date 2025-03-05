import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-driver-contact-us',
  templateUrl: './driver-contact-us.component.html',
  styleUrls: ['./driver-contact-us.component.css']
})
export class DriverContactUsComponent implements OnInit {

  screen:string='mobile';
  
  loggedinUser:any;
  profile_details:any=null;

  subject:any=null;
  message:any=null;

  loading:boolean=false;

  constructor(
   private router:Router,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService
  ) { 

    
  }

  ngOnInit(): void {
    this.responsiveService.checkWidth();
    this.onResize();
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    
    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='desktop' || this.screen=='tablet'){
        this.router.navigate(['/driver-dashboard-scheduler']);
      }
    });
  }

  handleContact(){
    let errors='';
    if(this.subject=='' || this.subject ==null){
      errors = 'Subject';
    }

    if(this.message=='' || this.message ==null){
      errors += errors==''? 'Message':', Message';
    }

    if(errors !=''){
       const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Error','Please enter '+errors);
    }else{
      
      this.loading=true;
     
      const formData = new FormData();
      formData.append('subject', this.subject);
      formData.append('message', this.message);
      formData.append('user_id', this.loggedinUser?.id);

      this.driver_service.contactTragget(formData).subscribe(response=>{   
           this.loading =false;
        if (response && !response.status ) {
             const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Error`,
            response.message).then(() => { 
            });
          return;
        }else{
          this.subject='';
          this.message='';
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Success`,
            `Email has been sent!`).then(() => { 
              
            });
        }
      });
    }

  }

}
