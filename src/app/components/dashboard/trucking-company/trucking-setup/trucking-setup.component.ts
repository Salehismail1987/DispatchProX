import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ResponsiveService } from 'src/app/services/responsive.service';
import {UserDataService} from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trucking-setup',
  templateUrl: './trucking-setup.component.html',
  styleUrls: ['./trucking-setup.component.css']
})
export class TruckingSetupComponent implements OnInit {


  loggedinUser : any = {};
  score:number=0;
  current_step :string = '';
  screen:string='desktop';

  is_driver_loading = false;
  is_user_loading = false;
  is_truck_loading = false;
  is_trailer_loading = false;


  is_driver_done = false;
  is_user_done = false;
  is_truck_done = false;
  is_tc_done = false;

  is_tc_loading = false;

  truckForm!: FormGroup;
  truckIDError: string = '';
  truckTypeError: string = '';
  truckLicensePlateError: string = '';
  truckColorError: string = '';
  truckNicknameError: string = '';
  truckWeightCapacityError: string = '';
  truckWeightCapacityUnitError: string = '';
  truckVolumeCapacityError: string = '';
  truckVolumeCapacityUnitError: string = '';

  trailerForm!: FormGroup;
  trailerIDError: string = '';
  trailerTypeError: string = '';
  trailerLicensePlateError: string = '';
  trailerWeightCapacityError: string = '';
  trailerWeightCapacityUnitError: string = '';
  trailerVolumeCapacityError: string = '';
  trailerVolumeCapacityUnitError: string = '';
  trailerNicknameError:string = '';

  inviteTCForm!: FormGroup;
  inviteTCfull_nameError: string  ='';
  inviteTCcompany_nameError: string  ='';
  inviteTCEmailError: string = '';

  inviteDriverForm!: FormGroup;
  driverfull_nameError: string = '';
  driverEmailError: string = '';
  driverContactNumberError: string = '';
  driverImage : any ;

  addUserForm!: FormGroup;
  userfull_nameError: string = '';
  userEmailError: string = '';
  userRoleIDError: string = '';
  userContactNumberError:string  = '';

  trailer_type:string='1 axle / 1 axle';
  truck_type:string='1 axle / 1 axle';
  trailer_weight:string='ton';
  truck_weight:string='ton';
  trailer_volumn:string='m2';
  truck_volumn:string='m2';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tc_service : TruckingCompanyService,
    private user_service: UserDataService,
    private responsive_service:ResponsiveService
  ) {

    this.responsive_service.checkWidth();
    this.onResize();
  }

  ngOnInit(): void {

    this.trailer_type='1 axle / 1 axle';
    this.truck_type='1 axle / 1 axle';
    this.trailer_weight='ton';
    this.truck_weight='ton';
    this.trailer_volumn='m2';
    this.truck_volumn='m2';

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone &&  userDone.full_name){
      this.router.navigate(['/home']);
    }else{

      if(userDone && userDone.account_type == 'Trucking Company'){


      }else{
        this.router.navigate(['/dashboard']);
      }
    }

    this.truckForm = this.fb.group({
      truck_id: [''],
      truck_type: ['', Validators.required],
      truck_color: [''],
      truck_nickname: ['', Validators.required],
      truck_license_plate: ['', Validators.required],
      weight_capacity: [''],
      weight_capacity_unit: [''],
      volume_capacity: [''],
      volume_capacity_unit: [''],
    }
    );

    this.trailerForm = this.fb.group({
      trailer_id: [''],
      trailer_type: ['', Validators.required],
      trailer_nickname: ['', Validators.required],
      trailer_license_plate: ['', Validators.required],
      weight_capacity: [''],
      weight_capacity_unit: [''],
      volume_capacity: [''],
      volume_capacity_unit: [''],
    }
    );

    this.inviteTCForm = this.fb.group({
      full_name: ['', Validators.required],
      company_name: ['', Validators.required],
      email: ['', Validators.required],
    });

    this.inviteDriverForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      contact_number: [''],
      profile_image: [null,]
    });

    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      role_id: ['', Validators.required],
      contact_number: ['']
    });
  }

  onResize() {
    this.responsive_service.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
    });
  }

  onInviteTC(){
    this.inviteTCfull_nameError = '';
    this.inviteTCcompany_nameError = '';
    this.inviteTCEmailError = '';

    if(this.inviteTCForm.get('full_name')?.value == ''){
      this.inviteTCfull_nameError  = "Full Name is required";
    }

    if(this.inviteTCForm.get('company_name')?.value == ''){
      this.inviteTCcompany_nameError  = "Company Name is required";
    }

    if(this.inviteTCForm.get('email')?.value == ''){
      this.inviteTCEmailError  = "Email is required";
    }

    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteTCForm.get('email')?.value) ){
      this.inviteTCEmailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }



    if (this.inviteTCForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('full_name', this.inviteTCForm.get('full_name')?.value);
    formData.append('company_name', this.inviteTCForm.get('company_name')?.value);
    formData.append('email', this.inviteTCForm.get('email')?.value);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

   this.is_tc_loading =true;
    this.tc_service.inviteTruckingCompany(formData).subscribe(response=>{
      this.is_tc_loading= false;
      if (response && !response.status ) {
        if(response.message && response.message !=""){
          this.inviteTCEmailError = "Problem in inviting (Sending Email) Trucking Company.";
        }else{
          this.inviteTCEmailError = response.data.email ? response.data.email : '';
          this.inviteTCcompany_nameError = response.data.company_name ? response.data.company_name : '';
          this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
          this.is_tc_loading =false;
        }

        return;
      }else{
        this.inviteTCForm.reset();
        this.is_tc_loading =false;
        Swal.fire({
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:
          `An invitation has been sent!`
        }
        ).then(() => {
              this.current_step = '';
          });

      }
    });

  }

  onInviteDriver(){

    this.driverContactNumberError = '';
    this.driverEmailError = '';
    this.driverfull_nameError = '';


    if (this.inviteDriverForm.get('full_name')?.value == '') {
      this.driverfull_nameError = 'Full Name is required';
    }
    if (this.inviteDriverForm.get('email')?.value == '') {
      this.driverEmailError = 'Email is required';
    }

    let errors='';
    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteDriverForm.get('email')?.value) ){
      this.driverEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors='yes';
    }

    if (this.inviteDriverForm.get('contact_number')?.value != '') {
      let a=this.inviteDriverForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.driverContactNumberError  = "Provide a valid contact number.";
        errors='yes';
      }
    }

    if(errors !=''){
      return;
    }

    if (this.inviteDriverForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('full_name', this.inviteDriverForm.get('full_name')?.value);
    formData.append('email', this.inviteDriverForm.get('email')?.value);
    formData.append('contact_number', this.inviteDriverForm.get('contact_number')?.value);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

    formData.append('profile_image', this.driverImage);

    this.is_driver_loading =true;
    this.tc_service.inviteDriver(formData).subscribe(response=>{

    this.is_driver_loading =false;
      if (response && !response.status ) {
        this.driverEmailError = response.data?.email ? response.data.email : '';
        this.driverfull_nameError = response.data?.full_name ? response.data.full_name : '';
        this.driverContactNumberError = response.data?.contact_number ? response.data.contact_number : '';
        if(response.message !=''){
          Swal.fire({
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:
            `Unable send invitation email!`
          }).then(() => {
                this.current_step = '';
            });
        }
        this.is_driver_loading =false;
        return;
      }else{
        this.inviteDriverForm.reset();
        this.driverImage = undefined;
        this.is_driver_loading =false;
        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:
            `An invitation has been sent to Driver!`
          }).then(() => {
              this.current_step = '';
          });
      }
    });


  }

  onSaveUser(){

    this.userEmailError = '';
    this.userfull_nameError = '';
    this.userRoleIDError  = '';
    this.userContactNumberError = '';


    if (this.addUserForm.get('full_name')?.value == '') {
      this.userfull_nameError = 'Full Name is required';
    }
    if (this.addUserForm.get('email')?.value == '') {
      this.userEmailError = 'Email is required';
    }

    if (this.addUserForm.get('role_id')?.value == '') {
      this.userRoleIDError = 'User Role is required';
    }

    let errors='';

     if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserForm.get('email')?.value) ){
      this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors='yes';
    }

    if (this.addUserForm.get('contact_number')?.value != '') {
      let a=this.addUserForm.get('contact_number')?.value;
      a=a.replace(')','')
      a=a.replace(/\s+/g,'')
      a=a.replace('+','')
      a=a.replace('(','')

      if(a.length<11){
        this.userContactNumberError  = "Provide a valid contact number.";
        errors='yes';
      }
    }

    if(errors!=''){
      return;
    }
    if (this.addUserForm.invalid) {
      return;
    }


    let data = {
      full_name :  this.addUserForm.get('full_name')?.value,
      email :  this.addUserForm.get('email')?.value,
      role_id :  this.addUserForm.get('role_id')?.value,
      contact_number :  this.addUserForm.get('contact_number')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.is_user_loading =true;
    this.user_service.inviteByRole(data).subscribe(response=>{

    this.is_user_loading =false;
      if (response && !response.status ) {
        this.userEmailError = response.data?.email ? response.data.email : '';
        this.userfull_nameError = response.data?.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data?.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data?.contact_number ? response.data.contact_number : '';
         this.is_user_loading =false;
        return;
      }else{
        this.addUserForm.reset();
         this.is_user_loading =false;
        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:
            `User Added Successfully!`
          }).then(() => {
              this.current_step = '';
          });
      }
    });


  }



  onSaveTruck(){
    this.truckIDError = '';
    this.truckTypeError = '';
    this.truckColorError = '';
    this.truckNicknameError = '';
    this.truckLicensePlateError = '';
    this.truckVolumeCapacityError = '';
    this.truckVolumeCapacityUnitError = '';
    this.truckWeightCapacityError = '';
    this.truckWeightCapacityUnitError = '';


    if (this.truckForm.get('truck_type')?.value == '') {
      this.truckTypeError = 'Truck Type is required';
    }
    // if (this.truckForm.get('truck_color')?.value == '') {
    //   this.truckColorError = 'Truck Color is required';
    // }
    if (this.truckForm.get('truck_nickname')?.value == '') {
      this.truckNicknameError = 'Truck name is required';
    }
    if (this.truckForm.get('truck_license_plate')?.value == '') {
      this.truckLicensePlateError = 'Truck License Plate is required';
    }
    // if (this.truckForm.get('volume_capacity')?.value == '' || this.truckForm.get('volume_capacity_unit')?.value == '') {
    //   this.truckVolumeCapacityError = 'Truck Volume Capacity & Unit is required';
    // }

    // if (this.truckForm.get('weight_capacity')?.value == '' || this.truckForm.get('weight_capacity_unit')?.value == '') {
    //   this.truckWeightCapacityError = 'Truck Weight Capacity & Unit is required';
    // }

    if (this.truckForm.invalid) {
      return;
    }
    let data = {
      truck_id :  this.truckForm.get('truck_nickname')?.value,
      truck_type :  this.truckForm.get('truck_type')?.value,
      truck_color :  this.truckForm.get('truck_color')?.value,
      truck_nickname :  this.truckForm.get('truck_nickname')?.value,
      truck_license_plate :  this.truckForm.get('truck_license_plate')?.value,
      weight_capacity :  this.truckForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.truckForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.truckForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.truckForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }

     this.is_truck_loading =true;
    this.tc_service.saveTruck(data).subscribe(response=>{

      this.is_truck_loading =false;
      if (response && !response.status ) {
        this.is_truck_loading =false;
        Swal.fire(
           {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:
            'Failed to add truck',
          }).then(() => {

          });

        return;
      }else{
        this.truckForm.reset();
        this.trailer_type='1 axle / 1 axle';
        this.truck_type='1 axle / 1 axle';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        this.is_truck_loading =false;
        Swal.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:
            'Truck Added!',
          }).then(() => {
              this.current_step = '';
          });
      }
    });

  }

  onSaveTrailer(){
    this.trailerIDError = '';
    this.trailerTypeError = '';

    this.trailerLicensePlateError = '';
    this.trailerVolumeCapacityError = '';
    this.trailerVolumeCapacityUnitError = '';
    this.trailerWeightCapacityError = '';
    this.trailerWeightCapacityUnitError = '';

    if (this.trailerForm.get('trailer_id')?.value == '') {
      this.trailerIDError = 'Trailer ID is required';
    }


    if (this.trailerForm.get('trailer_nickname')?.value == '') {
      this.trailerNicknameError = 'Trailer name is required';
    }


    if (this.trailerForm.get('trailer_type')?.value == '') {
      this.trailerTypeError = 'Trailer Type is required';
    }
    if (this.trailerForm.get('trailer_license_plate')?.value == '') {
      this.trailerLicensePlateError = 'Trailer License Plate is required';
    }

    // if (this.trailerForm.get('volume_capacity')?.value == '' || this.trailerForm.get('volume_capacity_unit')?.value == '') {
    //   this.trailerVolumeCapacityError = 'Trailer Volume Capacity & Unit is required';
    // }

    // if (this.trailerForm.get('weight_capacity')?.value == '' || this.trailerForm.get('weight_capacity_unit')?.value == '') {
    //   this.trailerWeightCapacityError = 'Trailer Weight Capacity & Unit is required';
    // }

    if (this.trailerForm.invalid) {
      return;
    }
    let data = {
      trailer_id :  this.trailerForm.get('trailer_nickname')?.value,
      trailer_type :  this.trailerForm.get('trailer_type')?.value,
      trailer_nickname :  this.trailerForm.get('trailer_nickname')?.value,
      trailer_license_plate :  this.trailerForm.get('trailer_license_plate')?.value,
      weight_capacity :  this.trailerForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.trailerForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.trailerForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.trailerForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.is_trailer_loading =true;
    this.tc_service.saveTrailer(data).subscribe(response=>{
      this.is_trailer_loading =false;
      if (response && !response.status ) {
        Swal.fire(
           {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:
            response.message,
          }).then(() => {

          });

        return;
      }else{
        this.trailerForm.reset();
        this.trailer_type='1 axle / 1 axle';
        this.truck_type='1 axle / 1 axle';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:
            'Trailer Added!',
          }).then(() => {
              this.current_step = '';
          });
      }
    });

  }

  goToStep(step:string, from:string){
    if(step==''){
      switch (from) {
        case 'truck':
          this.is_truck_done =true;
          break;
        case 'driver':
          this.is_driver_done =true;
          break;
        case 'user':
          this.is_user_done =true;
        break;
        case 'tc':
          this.is_tc_done =true;
          break;
      }

      if(this.is_truck_done == true && this.is_driver_done == true && this.is_user_done == true && this.is_tc_done == true){


        this.tc_service.setSetupStatus(this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id).subscribe(response=>{
          if(response && response.status){
            localStorage.setItem('TraggetUser', JSON.stringify(response.user));
            this.router.navigate(['/company-after-setup']);
          }
        });
        this.score = 100;
      }else{
        this.score = 0;
        if(this.is_driver_done){
          this.score += 25;
        }
        if(this.is_tc_done){
          this.score+=25;
        }
        if(this.is_truck_done){
          this.score+=25;
        }
        if(this.is_user_done){
          this.score+=25;
        }
      }
    }
    this.current_step = step;
  }

  backLink(to:string){
    if(to == '/dashboard'){
      this.tc_service.setSetupStatus(this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id).subscribe(response=>{

        if (response && !response.status ) {
          this.router.navigate([to]);
        }else{
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          this.router.navigate([to]);
        }
      });
    }
  }

  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.driverImage  =file;
      // alert(file.name)
    }

  }

  getClassForTrailer(){
    if(this.current_step == 'trailer-listing'){
      return 'your-adding goto-trailer-listing active';
    }
    return 'your-adding goto-trailer-listing';
  }

  getClassForTruck(){
    if(this.current_step == 'truck-listing'){
      return 'your-adding bg-purple goto-truck-listing active';
    }
    return 'your-adding bg-purple goto-truck-listing';
  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);

    // console.log(abc)
    this.inviteDriverForm.get('contact_number')?.patchValue(abc);
  }

  changeNumber2(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addUserForm.get('contact_number')?.patchValue(abc);
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
            input = '+1 ('+input;
    }else if(size < 7){
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6);
    }else{
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input;
  }

}
