import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
import { ContactService } from 'src/app/services/contact.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-hour-sheets',
  templateUrl: './hour-sheets.component.html',
  styleUrls: ['./hour-sheets.component.css']
})

export class HourSheetsComponent implements OnInit {
  active_menu: any;
  loggedinUser: any;
  trucks_list: any = null;
  trailers_list: any = null;
  drivers_list: any = null;

  user_id: any;

  loading: boolean = false;
  loading_update: boolean = false;
  loading_resend: any = null;
  loading_cancel:any=null;
  is_driver_loading: boolean = false;
  is_loading_removing: boolean = false;
  is_trailer_loading: boolean = false;
  is_truck_loading: boolean = false;

  driverImage: any = null;
  driver_detail: any = null;

  perPage: number = 25;
  page: number = 0;
  pagination: any = null;

  inviteDriverForm!: FormGroup;
  driverfull_nameError: string = '';
  driverLastNameError: string = '';
  driverEmailError: string = '';
  driverContactNumberError: string = '';

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
  trailerNicknameError: string = '';


  trailer_type: string = '1 axle / 1 axle';
  truck_type: string = '1 axle / 1 axle';
  trailer_weight: string = 'ton';
  truck_weight: string = 'ton';
  trailer_volumn: string = 'm2';
  truck_volumn: string = 'm2';

  driver_rate: any = null;
  current_step: string = 'truck-listing';

  edit_phone: string = '';
  edit_email: string = '';
  edit_phone_error: string = '';
  edit_email_error: string = '';

  show_edit_phone: boolean = false;
  show_edit_email: boolean = false;


  search_by: any = null;
  search_by2: any = null;
  sort_by: any = null;
  cust_sort_by: any = null;


  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;
  constructor(
    private router: Router,
    private trucking_service: TruckingCompanyService,
    private contact_service: ContactService,
    private user_service: UserDataService,
    private fb: FormBuilder,
  ) {
    this.active_menu = {
      parent: 'tc-contacts',
      child: 'tc-drivers',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    this.getTCDrivers();
    this.getTCTrailers();
    this.getTCTrucks();
    this.inviteDriverForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      contact_number: [''],
      profile_image: [null,]
    });

    this.trailer_type = 'Pony';
    this.truck_type = 'Single';
    this.trailer_weight = 'ton';
    this.truck_weight = 'ton';
    this.trailer_volumn = 'm2';
    this.truck_volumn = 'm2';

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
    $(document).on('click', '.btnaction', function (this: any) {
      $(this).closest('.option-modal').hide();
    });
    $(document).on('click', '.openCalendar', function () {
      $('.calenderweek').show();
    });

    $(document).on('click', '.getinputfield', function (this: any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });
    $(document).on('click', '.getinputfield2', function (this: any) {
      $('.input-popup-div2').hide();
      $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });
    $(window).click(function (e: any) {
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
        $('.input-popup-div').hide();
        $('.input-popup-div2').hide();
      }

    });

    $(document).on('click', '.btnremove', function (this: any) {
      $(this).closest('.modal-div').find('.delete-modal').show();
    });
    $(document).on('click', '.btnaction', function (this: any) {
      $(this).closest('.delete-modal').hide();
    });
  }

  setDriver(driver: any) {
    this.driver_rate = '';
    this.driver_detail = driver;
    this.edit_email = driver?.email;
    this.edit_phone = driver?.contact_number;
    driver?.sub_users.map((item:any)=>{
      if(item.parent_user_id== this.user_id){
        this.driver_rate = item?.driver_hour_rate ? item?.driver_hour_rate : '';

      }
    })

  }
  changeEditNumber(event: any) {

    let p: string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc = this.formatPhoneNumber(p);
    // console.log(abc)
    $('#edit_contact_number').val(abc);
    this.edit_phone = abc;
    setTimeout(() => {

      $('#edit_contact_number').val(abc);
      this.edit_phone = abc;
    }, 400);
    return;
  }

  updateDriverPhone() {
    const formData = new FormData();
    this.loading_update = true;
    formData.append('user_id', this.user_id);
    if (this.driver_detail?.invitation_code != '' && this.driver_detail?.invitation_code !== undefined) {

      formData.append('invitation_id', this.driver_detail?.id);
    } else {
      formData.append('driver_id', this.driver_detail?.id);

    }
    formData.append('phone', this.edit_phone);

    this.trucking_service.updateDriverPhone(formData).subscribe(response => {

      this.loading_update = false;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        })
        this.getTCDrivers();
        this.hideEditModal('edit_phone')
        this.driver_detail.contact_number = this.edit_phone;
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Error`,
          text:
            response.message
        })
      }
    })
  }

  hideEditModal(type: any) {
    if (type == 'edit_phone') {
      this.show_edit_phone = false;

      setTimeout(() => {

        $('.input-popup-div2').hide();
      }, 500);
    }

    if (type == 'edit_email') {
      this.show_edit_email = false;
    }
  }

  showEditModal(type: any) {
    if (type == 'edit_phone') {
      this.show_edit_phone = true;
      setTimeout(() => {

        $('.input-popup-div2').show();
      }, 500);
    }

    if (type == 'edit_email') {
      this.show_edit_email = true;
    }
  }

  setTruck(truck: any) {
    if (truck && truck?.id) {

      this.driver_detail.default_truck_id = truck?.id;
      this.driver_detail.default_truck = truck;
      console.log(this.driver_detail);
      setTimeout(() => {
        $(".truck-div").hide();
       }, 300);
    }
  }

  setTrailer(trailer: any) {
    if (trailer && trailer?.id) {

      this.driver_detail.default_trailer_id = trailer?.id;
      this.driver_detail.default_trailer = trailer;
      console.log(this.driver_detail);
      setTimeout(() => {
        $(".trailer-div").hide();
       }, 300);
    }

  }

  getTCTrucks() {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');

    formData.append('type', 'truck');

    this.trucking_service.getTCTrucks(formData).subscribe(response => {
      if (response.status && response.data) {
        this.trucks_list = response.data;
      } else {

      }
    })
  }

  getTCTrailers() {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');

    formData.append('type', 'trailer');

    this.trucking_service.getTCTrucks(formData).subscribe(response => {
      if (response.status && response.data) {
        this.trailers_list = response.data;

      } else {

      }
    })
  }

  getTCDrivers() {

    this.loading = true;
    let data: any = {
      user_id: this.user_id,
      is_pagination: 'true',
      is_contact: 'YES'
    };
    data.page = this.page;
    this.trucking_service.getTCDrivers(data).subscribe(response => {
      this.loading = false;
      if (response.status && response.data) {
        this.drivers_list = response.data?.data;
        this.pagination = response.data;
      } else {

      }
    })
  }

  changePage(page: any) {
    this.page = page;
    this.getTCDrivers();
  }


  handlePerPage(event: any) {
    if (event.target.value) {
      this.perPage = event.target.value;
      this.getTCDrivers();
    }
  }

  parsePage(page: any) {
    return parseInt(page.toString());
  }

  notSkip(value: string) {
    if (value.indexOf('Next') >= 0 || value.indexOf('Previous') >= 0) {
      return false;
    } else {
      return true;
    }
    return false;
  }

  updateDriver() {
    const formData = new FormData();
    this.loading_update = true;
    formData.append('user_id', this.user_id);
    if (this.driver_detail?.invitation_code != '' && this.driver_detail?.invitation_code !== undefined) {

      formData.append('invitation_id', this.driver_detail?.id);
    } else {
      formData.append('driver_id', this.driver_detail?.id);

    }
    formData.append('default_truck_id', this.driver_detail?.default_truck_id);
    formData.append('default_trailer_id', this.driver_detail?.default_trailer_id);
    formData.append('driver_hour_rate', $("#driver_hour_rate").val());

    this.trucking_service.setDefaultTruckTrailer(formData).subscribe(response => {

      this.loading_update = false;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        })
        this.getTCDrivers();
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Error`,
          text:
            response.message
        })
      }
    })
  }

  deleteDriver(id: any) {
    const formData = new FormData();
    this.loading_update = true;
    formData.append('user_id', this.user_id);
    if (this.driver_detail?.invitation_code != '' && this.driver_detail?.invitation_code !== undefined) {

      formData.append('invitation_id', this.driver_detail?.id);
    } else {
      formData.append('driver_id', this.driver_detail?.id);

    }

    this.trucking_service.removeDriver(formData).subscribe(response => {

      this.loading_update = false;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        })
        this.getTCDrivers();
        $(".modal-backdrop ").remove()
        $("#driverinfo").toggle("modal")
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Error`,
          text:
            response.message
        })
      }
    })
  }

  onSaveTruck() {
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

    if (this.truckForm.get('truck_nickname')?.value == '') {
      this.truckNicknameError = 'Truck name is required';
    }
    if (this.truckForm.get('truck_license_plate')?.value == '') {
      this.truckLicensePlateError = 'Truck License Plate is required';
    }


    if (this.truckForm.invalid) {
      return;
    }
    let data = {
      truck_id: this.truckForm.get('truck_nickname')?.value,
      truck_type: this.truckForm.get('truck_type')?.value,
      truck_color: this.truckForm.get('truck_color')?.value,
      truck_nickname: this.truckForm.get('truck_nickname')?.value,
      truck_license_plate: this.truckForm.get('truck_license_plate')?.value,
      weight_capacity: this.truckForm.get('weight_capacity')?.value,
      weight_capacity_unit: this.truckForm.get('weight_capacity_unit')?.value,
      volume_capacity: this.truckForm.get('volume_capacity')?.value,
      volume_capacity_unit: this.truckForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }

    this.is_truck_loading = true;
    this.trucking_service.saveTruck(data).subscribe(response => {

      this.is_truck_loading = false;
      if (response && !response.status) {
        this.is_truck_loading = false;
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title: 'Error',
            text:
              'Failed to add truck',
          }).then(() => {

          });

        return;
      } else {
        this.truckForm.reset();
        this.trailer_type = 'Pony';
        this.truck_type = 'Single';
        this.trailer_weight = 'ton';
        this.truck_weight = 'ton';
        this.trailer_volumn = 'm2';
        this.truck_volumn = 'm2';
        this.is_truck_loading = false;
        this.current_step = 'truck-listing';
        this.getTCTrucks();
        $(".modal-backdrop").remove();
        $('#newTruck').modal('toggle');
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title: 'Success',
            text:
              'Truck Added!',
          }).then(() => {
            this.current_step = '';
          });
      }
    });

  }

  onSaveTrailer() {
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



    if (this.trailerForm.invalid) {
      return;
    }
    let data = {
      trailer_id: this.trailerForm.get('trailer_nickname')?.value,
      trailer_type: this.trailerForm.get('trailer_type')?.value,
      trailer_nickname: this.trailerForm.get('trailer_nickname')?.value,
      trailer_license_plate: this.trailerForm.get('trailer_license_plate')?.value,
      weight_capacity: this.trailerForm.get('weight_capacity')?.value,
      weight_capacity_unit: this.trailerForm.get('weight_capacity_unit')?.value,
      volume_capacity: this.trailerForm.get('volume_capacity')?.value,
      volume_capacity_unit: this.trailerForm.get('volume_capacity_unit')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.is_trailer_loading = true;
    this.trucking_service.saveTrailer(data).subscribe(response => {
      this.is_trailer_loading = false;
      if (response && !response.status) {
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title: 'Error',
            text:
              response.message,
          }).then(() => {

          });

        return;
      } else {
        this.trailerForm.reset();
        this.trailer_type = 'Pony';
        this.truck_type = 'Single';
        this.trailer_weight = 'ton';
        this.truck_weight = 'ton';
        this.trailer_volumn = 'm2';
        this.truck_volumn = 'm2';
        this.current_step = 'truck-listing';
        $(".modal-backdrop").remove();
        $('#newTruck').modal('toggle');
        this.getTCTrailers();
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title: 'Success',
            text:
              'Trailer Added!',
          }).then(() => {
            this.current_step = '';
          });
      }
    });

  }

  resendInv(driver_id: any) {
    const formData = new FormData();
    this.loading_resend = driver_id;
    formData.append('user_id', this.user_id);
    formData.append('driver_id', driver_id);

    this.trucking_service.resendDriverInv(formData).subscribe(response => {

      this.loading_resend = null;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        })
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Error`,
          text:
            response.message
        })
      }
    })
  }


  cancelInv(driver_id: any) {
    const formData = new FormData();
    this.loading_cancel = driver_id;
    formData.append('user_id', this.user_id);
    formData.append('invitation_id', driver_id);

    this.user_service.cancelInv(formData).subscribe(response => {

      this.loading_cancel = null;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        })
        this.getTCDrivers();
        $("#driverinfo").hide('modal')
        $("body").removeClass('modal-open');
        $(".modal-backdrop").hide();
        this.driver_detail = null;
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Error`,
          text:
            response.message
        })
      }
    })
  }

  onInviteDriver() {

    this.driverContactNumberError = '';
    this.driverEmailError = '';
    this.driverfull_nameError = '';
    this.driverLastNameError = '';


    if (this.inviteDriverForm.get('full_name')?.value == '') {
      this.driverfull_nameError = 'Full Name is required';
    }
    if (this.inviteDriverForm.get('email')?.value == '') {
      this.driverEmailError = 'Email is required';
    }

    let errors = '';



    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteDriverForm.get('email')?.value)) {
      this.driverEmailError = 'Enter a valid email i.e exampl@gmail.com';
      errors = 'yes';
    }

    if ((this.inviteDriverForm.get('email')?.value) == this.loggedinUser?.email) {
      this.driverEmailError = 'you can not invite your self, entered email is registered with your account !';
      errors = 'yes';
    }

    if (errors != '') {
      return;
    }


    if (this.inviteDriverForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('full_name', this.inviteDriverForm.get('full_name')?.value);
    formData.append('email', this.inviteDriverForm.get('email')?.value);
    formData.append('contact_number', this.inviteDriverForm.get('contact_number')?.value);
    formData.append('user_id', this.user_id);

    formData.append('profile_image', this.driverImage);

    this.is_driver_loading = true;
    this.trucking_service.inviteDriver(formData).subscribe(response => {

      this.is_driver_loading = false;
      if (response && !response.status) {
        this.driverEmailError = response.data?.email ? response.data.email : '';
        this.driverfull_nameError = response.data?.full_name ? response.data.full_name : '';
        this.driverContactNumberError = response.data?.contact_number ? response.data.contact_number : '';
        if (response.message != '') {
          Swal.fire(

            {
              confirmButtonColor: '#17A1FA',
              title:
                `Warning`,
              text:
                `Unable to send invitation email!`
            }
          ).then(() => {
          });
        }

        return;
      } else {
        this.inviteDriverForm.reset();
        this.driverImage = undefined;
        this.is_driver_loading = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text:
              `An invitation has been sent to Driver!`
          }
        ).then(() => {

        });
        this.getTCDrivers()
        $(".modal-backdrop").remove();
        $('#adddriver').modal('toggle');
      }
    });


  }


  changeNumber(event: any) {

    let p: string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc = this.formatPhoneNumber(p);
    // console.log(abc)
    this.inviteDriverForm.get('contact_number')?.patchValue(abc);
  }

  formatPhoneNumber(input: any) {

    if (input.charAt(0) == '+') {
      // alert(input)
      input = input.substring(3, input.length);

    }
    input = input.replace(/\D/g, '');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0, 10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if (size == 0) {
      input = input;
    } else if (size < 4) {
      input = '+1 (' + input;
    } else if (size < 7) {
      input = '+1 (' + input.substring(0, 3) + ') ' + input.substring(3, 6);
    } else {
      input = '+1 (' + input.substring(0, 3) + ') ' + input.substring(3, 6) + ' ' + input.substring(6, 10);
    }
    return input;
  }


  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "btn-status mybtn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return " btn-status mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Driving':
        return " btn-status mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Approved':
        return " btn-status mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Accepted':
        return " btn-status mybtn mybtn-back-yellow width-fit-content btn-text-very-small2";
        break;
      case 'Completed':
        return "btn-status mybtn bg-green width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Cancelled':
        return "btn-status mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
        break;

    }
    return " btn-status mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  goToStep(step: string, from: string) {
    if (step && step != '') {

      this.current_step = step;
    } else {

      this.current_step = 'truck-listing';
    }
  }

  setAsDriver() {
    let data = {
      user_id: this.loggedinUser.id,
      role_id: 6
    }

    this.trucking_service.setAsDriver(data).subscribe({
      next: (data) => {
        let currentlyLoggedInProfile = data.result.user;
        localStorage.setItem('TraggetUser', JSON.stringify(currentlyLoggedInProfile));
        this.loggedinUser = currentlyLoggedInProfile;
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text: 'Request completed Successfully'
          })
      },
      error: (e) => {
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title:
              `Error`,
            text: e?.error?.result?.message?e.error.result.message: JSON.stringify(e.error.errors)
          })
      }
    })
  }

  
  searchBy(search_by: any) {
    if (search_by) {
      this.search_by = search_by;

      this.getTCDrivers();
      return;
    }
    this.search_by = '';
    this.getTCDrivers();
  }
  searchBy2(search_by: any) {
    if (search_by) {
      this.search_by2 = search_by;

      this.getTCDrivers();
      return;
    }
    this.search_by2 = '';
    this.getTCDrivers();
  }

  setSortBy(sortBy: any) {
    if (sortBy) {
      $('.input-popup-div3').hide();


      this.sort_by = sortBy;
      setTimeout(() => {

        $(".add-comp").hide();
      }, 700);
      this.getTCDrivers();
      return;
    }
    $('.input-popup-div3').hide();

    this.sort_by = 'recently_invited';
    this.getTCDrivers();
  }
  setSortByCust(sortBy: any) {
    if (sortBy) {

      this.cust_sort_by = sortBy;

      $('.input-popup-div4').hide();

      setTimeout(() => {

        $(".add-comp2").hide();
      }, 700);
      this.getTCDrivers();
      return;
    }
    this.cust_sort_by = 'customer_name';

    $('.input-popup-div4').hide();

    this.getTCDrivers();
  }







}