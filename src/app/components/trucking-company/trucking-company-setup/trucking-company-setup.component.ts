import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-trucking-company-setup',
  templateUrl: './trucking-company-setup.component.html',
  styleUrls: ['./trucking-company-setup.component.css']
})
export class TruckingCompanySetupComponent implements OnInit {

  loggedinUser : any = {};
  current_step :string = '';

  is_driver_loading = false;
  is_user_loading = false;
  is_truck_loading = false;
  is_trailer_loading = false;

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

  inviteTCForm!: FormGroup;
  inviteTCfull_nameError: string  ='';
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


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tc_service : TruckingCompanyService,
  ) { }

  ngOnInit(): void {
    this.router.navigate(['/trucking-setup']);
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }else{
      // // if(userDone && userDone.account_type == 'Trucking Company' && !userDone.is_setup_shown ){

      //   this.router.navigate(['/trucking-company-setup']);
      // }else{

      //   this.router.navigate(['/dashboard']);
      // }
    }

    this.truckForm = this.fb.group({
      truck_id: ['', Validators.required],
      truck_type: ['', Validators.required],
      truck_color: ['', Validators.required],
      truck_nickname: ['', Validators.required],
      truck_license_plate: ['', Validators.required],
      weight_capacity: ['', Validators.required],
      weight_capacity_unit: ['', Validators.required],
      volume_capacity: ['', Validators.required],
      volume_capacity_unit: ['', Validators.required],
    }
    );

    this.trailerForm = this.fb.group({
      trailer_id: ['', Validators.required],
      trailer_type: ['', Validators.required],
      trailer_license_plate: ['', Validators.required],
      weight_capacity: ['', Validators.required],
      weight_capacity_unit: ['', Validators.required],
      volume_capacity: ['', Validators.required],
      volume_capacity_unit: ['', Validators.required],
    }
    );

    this.inviteTCForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
    });

    this.inviteDriverForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      contact_number: ['', Validators.required],
      profile_image: [null,]
    });

    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      role_id: ['', Validators.required],
      contact_number: ['', Validators.required]
    });
  }

  onInviteTC(){
    this.inviteTCfull_nameError = '';
    this.inviteTCEmailError = '';

    if(this.inviteTCForm.get('full_name')?.value == ''){
      this.inviteTCfull_nameError  = "Full Name is required";
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
    formData.append('email', this.inviteTCForm.get('email')?.value);
    formData.append('user_id', this.loggedinUser.id);

   this.is_tc_loading =true;
    this.tc_service.inviteTruckingCompany(formData).subscribe(response=>{

      if (response && !response.status ) {
        this.inviteTCEmailError = response.data.email ? response.data.email : '';
        this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.is_tc_loading =false;
        return;
      }else{
        this.inviteTCForm.reset();
        this.is_tc_loading =false;
        Swal.fire(
          `success`,
          `An invitation has been sent!`).then(() => {
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

    if (this.inviteDriverForm.get('contact_number')?.value == '') {
      this.driverContactNumberError = 'Contact Number is required';
    }

    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteDriverForm.get('email')?.value) ){
      this.driverEmailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }

    if(!/\+[1-9]{1}[0-9]{3,14}/.test(this.inviteDriverForm.get('contact_number')?.value)){
      this.driverContactNumberError  = "Enter a valid Contact Number i.e +923405925528";
      return;
    }


    if (this.inviteDriverForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('full_name', this.inviteDriverForm.get('full_name')?.value);
    formData.append('email', this.inviteDriverForm.get('email')?.value);
    formData.append('contact_number', this.inviteDriverForm.get('contact_number')?.value);
    formData.append('user_id', this.loggedinUser.id);

    formData.append('profile_image', this.driverImage);

    this.is_driver_loading =true;
    this.tc_service.inviteDriver(formData).subscribe(response=>{

      if (response && !response.status ) {
        this.driverEmailError = response.data.email ? response.data.email : '';
        this.driverfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.driverContactNumberError = response.data.contact_number ? response.data.contact_number : '';
         this.is_driver_loading =false;
        return;
      }else{
        this.inviteDriverForm.reset();
        this.driverImage = undefined;
        this.is_driver_loading =false;
        Swal.fire(
          `success`,
          `An invitation has been sent to Driver!`).then(() => {
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
    if (this.addUserForm.get('contact_number')?.value == '') {
      this.userContactNumberError = 'Contact Number is required';
    }

     if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addUserForm.get('email')?.value) ){
      this.userEmailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }

    if(!/\+[1-9]{1}[0-9]{3,14}/.test(this.addUserForm.get('contact_number')?.value)){
      this.userContactNumberError  = "Enter a valid Contact Number i.e +923405925528";
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
      user_id: this.loggedinUser.id
    }
    this.is_user_loading =true;
    this.tc_service.addUser(data).subscribe(response=>{

      if (response && !response.status ) {
        this.userEmailError = response.data.email ? response.data.email : '';
        this.userfull_nameError = response.data.full_name ? response.data.full_name : '';
        this.userRoleIDError = response.data.role_id ? response.data.role_id : '';
        this.userContactNumberError = response.data.contact_number ? response.data.contact_number : '';
         this.is_user_loading =false;
        return;
      }else{
        this.addUserForm.reset();
         this.is_user_loading =false;
        Swal.fire(
          `success`,
          `User Added Successfully!`).then(() => {
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

    if (this.truckForm.get('truck_id')?.value == '') {
      this.truckIDError = 'Truck ID is required';
    }
    if (this.truckForm.get('truck_type')?.value == '') {
      this.truckTypeError = 'Truck Type is required';
    }
    if (this.truckForm.get('truck_color')?.value == '') {
      this.truckColorError = 'Truck Color is required';
    }
    if (this.truckForm.get('truck_nickname')?.value == '') {
      this.truckNicknameError = 'Truck Nickname is required';
    }
    if (this.truckForm.get('truck_license_plate')?.value == '') {
      this.truckLicensePlateError = 'Truck License Plate is required';
    }
    if (this.truckForm.get('volume_capacity')?.value == '' || this.truckForm.get('volume_capacity_unit')?.value == '') {
      this.truckVolumeCapacityError = 'Truck Volume Capacity & Unit is required';
    }

    if (this.truckForm.get('weight_capacity')?.value == '' || this.truckForm.get('weight_capacity_unit')?.value == '') {
      this.truckWeightCapacityError = 'Truck Weight Capacity & Unit is required';
    }

    if (this.truckForm.invalid) {
      return;
    }
    let data = {
      truck_id :  this.truckForm.get('truck_id')?.value,
      truck_type :  this.truckForm.get('truck_type')?.value,
      truck_color :  this.truckForm.get('truck_color')?.value,
      truck_nickname :  this.truckForm.get('truck_nickname')?.value,
      truck_license_plate :  this.truckForm.get('truck_license_plate')?.value,
      weight_capacity :  this.truckForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.truckForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.truckForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.truckForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser.id
    }

     this.is_truck_loading =true;
    this.tc_service.saveTruck(data).subscribe(response=>{

      if (response && !response.status ) {
        this.is_truck_loading =false;
        Swal.fire(
          `error`,
          response.message).then(() => {

          });

        return;
      }else{
        this.truckForm.reset();
        this.is_truck_loading =false;
        Swal.fire(
          `success`,
          `Truck Added Successfully.`).then(() => {
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
    if (this.trailerForm.get('trailer_type')?.value == '') {
      this.trailerTypeError = 'Trailer Type is required';
    }
    if (this.trailerForm.get('trailer_license_plate')?.value == '') {
      this.trailerLicensePlateError = 'Trailer License Plate is required';
    }

    if (this.trailerForm.get('volume_capacity')?.value == '' || this.trailerForm.get('volume_capacity_unit')?.value == '') {
      this.trailerVolumeCapacityError = 'Trailer Volume Capacity & Unit is required';
    }

    if (this.trailerForm.get('weight_capacity')?.value == '' || this.trailerForm.get('weight_capacity_unit')?.value == '') {
      this.trailerWeightCapacityError = 'Trailer Weight Capacity & Unit is required';
    }

    if (this.trailerForm.invalid) {
      return;
    }
    let data = {
      trailer_id :  this.trailerForm.get('trailer_id')?.value,
      trailer_type :  this.trailerForm.get('trailer_type')?.value,
      trailer_license_plate :  this.trailerForm.get('trailer_license_plate')?.value,
      weight_capacity :  this.trailerForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.trailerForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.trailerForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.trailerForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser.id
    }
    this.is_trailer_loading =true;
    this.tc_service.saveTrailer(data).subscribe(response=>{
      this.is_trailer_loading =false;
      if (response && !response.status ) {
        Swal.fire(
          `error`,
          response.message).then(() => {

          });

        return;
      }else{
        this.trailerForm.reset();
        Swal.fire(
          `success`,
          `Trailer Added Successfully.`).then(() => {
              this.current_step = '';
          });
      }
    });

  }

  goToStep(step:string){
    this.current_step = step;
  }

  backLink(to:string){
    if(to == '/dashboard'){
      this.tc_service.setSetupStatus(this.loggedinUser.id).subscribe(response=>{

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
}
