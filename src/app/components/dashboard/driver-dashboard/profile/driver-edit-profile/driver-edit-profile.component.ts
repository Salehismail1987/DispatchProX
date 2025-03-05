import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-driver-edit-profile',
  templateUrl: './driver-edit-profile.component.html',
  styleUrls: ['./driver-edit-profile.component.css']
})
export class DriverEditProfileComponent implements OnInit {

  screen:string='mobile';

  profileImage : any ;
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;

  loggedinUser:any;
  profile_details:any=null;
  myGroup:any;

  name:string= '';
  code:string='';
  contact:string='';
  email:string='';
  address:string='';

  loading:boolean=false;
  constructor(
   private router:Router,
    private responsiveService: ResponsiveService,
    private driverService:DriverService
  ) {


  }

  ngOnInit(): void {

    this.myGroup = new FormGroup({
    });
    this.responsiveService.checkWidth();
    this.onResize();
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.profile_details= userDone;

    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    this.name = this.profile_details.full_name;
    this.contact  = this.profile_details.contact_number;
    if(this.contact){

      this.contact= this.contact.replace('+1 ','');
    }
    this.code = this.profile_details.contact_number_code;
    this.email = this.profile_details.email;
    this.address = this.profile_details?.address;
  }

  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.profileImage  =file;
      // alert(file.name)
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

  handleDriverProfileSave(){
    let errors='';
    if(this.name==''){
      errors+='Name';
    }
    if(this.contact=='' || this.contact==null){

      errors+= errors==''? 'Contact':', Contact';
    }

    if(this.address=='' || this.address==null){

      errors+= errors==''? 'Address':', Address';
    }

    if (this.contact != '') {
      let a=this.contact;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<9){
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire("Error","Provide a valid contact number.");
        return
      }
    }

    if(errors !=''){
       const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
        'Error',
        "Please enter "+errors
      )
    }else{
      this.loading=true;

      const formData = new FormData();
      formData.append('name', this.name);
      formData.append('address', this.address);
      formData.append('contact_number', "+1 "+this.contact);
      formData.append('user_id', this.loggedinUser?.id);
      formData.append('code', this.code);
      formData.append('image', this.profileImage);
      console.log(formData)

      this.driverService.updateDriverProfile(formData).subscribe(response=>{

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
          this.profileImage = undefined;
          this.profile_details = response.user;
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));

           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
            `Success`,
            `Profile Updated!`).then(() => {
            });
        }
      });
    }
  }


  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);

    this.contact='';
    this.contact=abc;
    $("#contact").val(abc);
  }

  formatPhoneNumber(input:any) {

    if(input.charAt(0) == '+'){
      // alert(input)
      input = input.substring(3, input.length);

    }
    input = input.replace(/\D/g,'');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0,10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if(size == 0){
            input = input;
    }else if(size < 4){
            input = '('+input;
    }else if(size < 7){
            input = '('+input.substring(0,3)+') '+input.substring(3,6);
    }else{

            input = '('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input;
  }

  switchUser(accountType:string) {
    let currentlyLoggedInProfile = JSON.parse(localStorage.getItem('TraggetUser') || '{}')
    currentlyLoggedInProfile.account_type = accountType;
    localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
    this.loggedinUser.account_type = accountType;
    if(accountType=='Driver'){

      window.location.href = '/driver-dashboard-scheduler';
    }else{

      window.location.href = '/dashboard';
    }
  }
}
