import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from 'src/app/services/contact.service';
import { CustomerSetupService } from 'src/app/services/customer-setup.service';
import { CustomerService } from 'src/app/services/customer.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-customer-tc-contacts',
  templateUrl: './customer-tc-contacts.component.html',
  styleUrls: ['./customer-tc-contacts.component.css']
})
export class CustomerTcContactsComponent implements OnInit {


  loggedinUser: any = {};
  addContactForm!: FormGroup;
  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;
  province: string = '';
  canada_provinces: any = [];
  usa_provinces: any = [];
  loading_resend: any = null;
  loading_cancel: any = null;
  // Listing Contanier
  data_list: any;
  selected_contact: any;
  data_pagination: any;
  sort_by: any = 'id';
  perPage: number = 25;
  page: number = 1;
  contacts_id: number = 0;
  search_by: any = '';
  search_date: string = '';

  ev_businessNumber_error: string = '';
  ev_city_error: string = '';
  ev_province_error: string = '';
  ev_country_error: string = '';

  ec_name_error: string = '';
  ec_phone_error: string = '';
  ec_email_error: string = '';
  ac_name_error: string = '';
  ac_phone_error: string = '';
  ac_email_error: string = '';

  search_date_to: string = '';
  search_status: any = '';
  is_loading: boolean = false;
  is_loading_Add_contact: boolean = false;
  is_loading_Edit_contact: boolean = false;
  addCustomerForm!: FormGroup;
  customerContacts: any = null;
  edit_company: any = null;
  editContact: any = null;

  isChecked: boolean = false;
  isCheckedEdit: boolean = false;
  isCheckedEdit2: boolean = false;
  isCheckedAdd: boolean = false;
  is_inv_user: boolean = false;

  //************* remove popup modifications */
  show_edit_project: boolean = false;
  show_edit_contact: boolean = false;
  show_add_contact: boolean = false;
  is_remove: boolean = false;
  form_clicked: boolean = false;
  is_loading_add: string = '';
  editProject!: FormGroup;
  editVendor!: FormGroup;
  addcontact!: FormGroup;
  editcontact!: FormGroup;
  country: string = '';

  update_loading: boolean = false;



  user_id: any = null;
  current_modal: string = '';
  active_menu: any;

  is_loading_edit_contact: boolean = false;
  removing_contact_loading: boolean = false;

  toEnableContacts: any = [];
  toDisable: any = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private contact_service: ContactService,
    private customer_setup_service: CustomerSetupService,
    private customer_service: CustomerService,
    private user_service: UserDataService
  ) {
    this.active_menu = {
      parent: 'contacts',
      child: 'customer-companies',
      count_badge: '',
    };
    this.canada_provinces = [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "NewFoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon"
    ];

    this.usa_provinces = [
      "Alaska AK",
      " Alabama	AL",
      "Arizona AZ",
      "Arkansas AR",
      "California CA",
      "Colorado CO",
      "Connecticut CT",
      "Delaware DE",
      "Florida FL",
      "Georgia GA",
      "Hawaii HI",
      "Idaho iD",
      "Illinois IL",
      "Indiana IN",
      "Iowa IA",
      "Kansas KS",
      "Kentucky KY",
      "Louisiana LA",
      "Maine ME",
      "Maryland MD",
      "Massachusetts MA",
      "Michigan MI",
      "Minnesota MN",
      "Montana	MT",
      "Nebraska NE",
      "Nevada NV",
      "New Hampshire NH",
      "New Jersey NJ",
      "New Mexico NM",
      "New York NY",
      "North Carolina NC",
      "North Dakota ND",
      "Ohio OH",
      "Oklahoma OK",
      "Oregon OR",
      "Pennsylvania[D] PA",
      "Rhode Island RI",
      "South Carolina SC",
      "South Dakota SD",
      "Tennessee TN",
      "Texas TX",
      "Utah UT",
      "Vermont VT",
      "Virginia[D] VA",
      "Washington WA",
      "West Virginia WV",
      "Wisconsin WI",
      "Wyoming WY",
    ];
  }

  ngOnInit(): void {

    this.sort_by = 'id';
    this.search_by = '';

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }


    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;
    this.addContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      is_send_dispatch: [''],
      role: [''],
      contact_type: [''],
      user_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id],
      company_id: [''],
    });

    this.getDataListing();

    this.editProject = this.fb.group({
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      project_id: ['', Validators.required],
    });

    this.editVendor = this.fb.group({
      project_name: ['', Validators.required],
      business_no: [''],
      work_safety: [''],
      street: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
      post_code: [''],

      // address: ['' ],
      // job_number: [''],
      // state: [''],
      project_id: ['', Validators.required],
    });

    this.addcontact = this.fb.group({
      user_id: ['', Validators.required],
      name: ['', Validators.required],
      company_id: [''],
      invitation_id: [''],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      Role: [''],
      Send_dispatch: [''],

    });
    this.editcontact = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      contacts_id: [''],
      email: ['', [Validators.required, Validators.email]],
      Role: [''],
      Send_dispatch: [''],
    });

    $(window).click((e: any) => {
      if (!($(e.target).hasClass('add_contct_form') || $(e.target).closest('.add_contct_form').length)) {
        if (this.show_add_contact) {
          this.show_add_contact = !this.show_add_contact;
        }
      }
    });



    $(document).on('click', '.getinputfield', function (this: any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });



    // // Prevent event propagation if clicking inside the .input-popup-div3
    $(document).on('click', '.input-popup-div', function (e: any) {
      e.stopPropagation();
    });


    $(window).click(function (e: any) {

      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
        $('.input-popup-div').hide();
      }

    });

  }


  closeChildModals() {
    this.show_add_contact = false;
    this.show_edit_project = false;
    this.show_edit_contact = false;

  }


  forbiddenEmailValidator(existingEmails: Array<string>): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (existingEmails.includes(control.value)) {
        return { forbiddenEmail: { value: control.value } };
      }
      return null;
    };
  }
  changeNumber(event: any, form: any) {

    let p: string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc = form == 1 ? this.formatbusinessNumber(p) : this.formatPhoneNumber(p);


    if (form == 1) {
      this.editVendor.get('business_no')?.patchValue(abc);
    }
    else if (form == 2) {
      this.editcontact.get('phone')?.patchValue(abc);
    }
    else if (form == 3) {
      this.addcontact.get('phone')?.patchValue(abc);
    }
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

  formatbusinessNumber(input: any): string {
    // First, remove all non-digit characters from the input
    input = input.replace(/\D/g, '');

    // Ensure the input is trimmed to exactly 10 characters to fit 'xxx-xxxx-xxx'
    input = input.substring(0, 10);

    // Variables to hold the parts of the formatted number
    let part1, part2, part3;

    // Based upon the length of the string, we add formatting as necessary
    const size = input.length;
    if (size < 4) {
      // If the input is less than 4 digits, it's just the first part
      part1 = input;
      return part1;
    } else if (size < 8) {
      // If the input is between 4 and 7 digits, split into the first and second parts
      part1 = input.substring(0, 3);
      part2 = input.substring(3, 7);
      return `${part1}-${part2}`;
    } else {
      // For inputs of 8 to 10 digits, split into all three parts
      part1 = input.substring(0, 3);
      part2 = input.substring(3, 7);
      part3 = input.substring(7, 10);
      return `${part1}-${part2}-${part3}`;
    }
  }


  handleDeleteDS() {

    // this.form_clicked=true;

    let data: any = {};
    var is_invitation = 'NO';
    if (this.edit_company?.invitation_code) {
      is_invitation = 'YES';
    }
    data.is_invitation = is_invitation;

    data.TC_id = this.edit_company?.user?.id ? this.edit_company?.user?.id : this.edit_company?.id;

    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;


    this.customer_service.removeVendors(data).subscribe((response: { status: any; message: any; }) => {
      // this.is_loading_add='';
      if (response.status) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', 'Company Invitation Cancelled!').then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            // window.location.reload();
            // Swal.fire('Saved!', '', 'success')
          }
        })

        // this.getData();
        this.getDataListing();

      } else {
        console.log("\n\n\n Sorry TC is not remioved");

        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title: 'Error',
          text:
            response.message
        })
      }
    });

    setTimeout(() => {

      $(".confirm").hide();
      $("#vendorinfo").hide("modal")
      $("#vendorinfo").modal("hide")

    }, 1000);


    setTimeout(() => {
      // window.location.reload();

    }, 2000);

  }
  updateSenddispatch(check: any = 1) {
    if (check == 1) {
      this.isChecked = !this.isChecked;
    }
    else if (check == 2) {
      this.isCheckedEdit = !this.isCheckedEdit;
    }
    else if (check == 3) {
      this.isCheckedAdd = !this.isCheckedAdd;
    }
    else if (check == 4) {
      this.isCheckedEdit2 = !this.isCheckedEdit2;
    }
  }
  closeremoveModal() {
    this.show_edit_project = false;
  }
  handleRemoveProject() {

    setTimeout(() => {

      $(".confirm").show()
    }, 50);

  }
  handleRemovecontact() {

    setTimeout(() => {

      $(".confirm").show()
    }, 50);

  }
  hideDSButton() {
    setTimeout(() => {

      $(".confirm").hide()
    }, 200);
  }

  closeEditProject() {
    setTimeout(() => {

      this.show_edit_project = false;
    }, 200);
  }

  closeEditContact() {
    setTimeout(() => {

      this.show_edit_contact = false;
    }, 200);
  }

  toggleEditProject() {

    if (!this.is_inv_user) {
      this.show_edit_project = !this.show_edit_project;
    }
    if (this.edit_company) {
      console.log(" this is the project :: ", this.edit_company);
      let defaultProjectName = this.edit_company.company_name || this.edit_company.user?.company_name || '';
      let defaultProjectId = this.edit_company.user?.id || '';

      this.editVendor.controls['project_name'].setValue(defaultProjectName);
      this.editVendor.controls['project_id'].setValue(defaultProjectId);
      this.editVendor.patchValue({
        project_name: defaultProjectName
      });
      this.country = this.edit_company?.user?.customer?.country != '' && this.edit_company?.user?.customer?.country !== null ? this.edit_company?.user?.customer?.country : 'Canada';
      this.province = this.edit_company?.user?.customer?.province != '' && this.edit_company?.user?.customer?.province !== null ? this.edit_company?.user?.customer?.province : 'Canada';

    }


  }
  handleClose() {
    this.edit_company = false;
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');
  }

  toggleEditContact(user: any, flag: any = 1) {

    this.selected_contact = '';
    this.contacts_id = 0;
    this.selected_contact = user;
    if (this.edit_company && flag == 1) {
      this.editcontact.controls['name'].setValue(user.full_name);
      this.editcontact.controls['email'].setValue(user.email);
      this.editcontact.controls['phone'].setValue(user.contact_number);
      this.isCheckedEdit = this.isChecked ? true : false;

      this.update_loading = true;

    }
    if (flag == 2) {
      this.editcontact.controls['contacts_id'].setValue(user.id);
      this.editcontact.controls['name'].setValue(user.name);
      this.editcontact.controls['email'].setValue(user.email);
      this.editcontact.controls['phone'].setValue(user.phone);
      this.editcontact.controls['Role'].setValue(user.role);
      this.editcontact.controls['Send_dispatch'].setValue(user.is_send_dispatch);
      this.isCheckedEdit2 = user.is_send_dispatch ? true : false;
      this.contacts_id = user.role;
      this.update_loading = true;
    }

    if (this.show_edit_project) {
      return;
    }
    if (this.show_add_contact) {
      return;
    }
    if (!this.is_inv_user) {
      this.show_edit_contact = !this.show_edit_contact;
    }
  }

  toggleAddContact(editContact: any) {
    this.addcontact.controls['user_id'].setValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    if (editContact && editContact.invitation_code != '' && editContact.invitation_code != undefined) {
      this.addcontact.controls['invitation_id'].setValue(editContact.id);
    }
    else {
      this.addcontact.controls['company_id'].setValue(editContact.id);
    }


    this.addcontact.controls['name'].setValue('');
    this.addcontact.controls['email'].setValue('');
    this.addcontact.controls['phone'].setValue('');
    this.isCheckedAdd = false;
    if (!this.is_inv_user) {
      this.show_add_contact = !this.show_add_contact;
    }

  }
  setCountry(event: any) {
    if (event.target.value) {
      this.country = event.target.value;
    }

  }
  onEditProject() {

    console.log(this.editProject.value)
    if (this.editProject.invalid) {
      return;
    }

    this.form_clicked = true;


    this.is_loading_add = 'edit_project';


  }
  onEditVendor() {
    this.ev_businessNumber_error = '';
    this.ev_city_error = '';
    this.ev_province_error = '';
    this.ev_country_error = '';

    let errors = '';

    if (this.editVendor.get('city')?.value == '') {
      this.ev_city_error = 'City is required';
      errors = 'yes';
    }
    if (this.editVendor.get('country')?.value == '') {
      this.ev_country_error = 'Country is required';
      errors = 'yes';
    }
    if (this.editVendor.get('province')?.value == '') {
      this.ev_province_error = 'Province is required';
      errors = 'yes';
    }

    if (this.editVendor.get('business_no')?.value !== undefined && this.editVendor.get('business_no')?.value != null && this.editVendor.get('business_no')?.value != '') {
      let a = this.editVendor.get('business_no')?.value;
      a = a.replace(/\D/g, '')

      if (a.length < 10) {
        this.ev_businessNumber_error = "Provide valid business number.";
        errors = 'yes';
      }
    }

    if (this.editVendor.invalid || errors == 'yes') {
      return;
    }

    this.form_clicked = true;

    this.is_loading_add = 'editVendor';

    const formData = new FormData();
    formData.append('business_no', this.editVendor.get('business_no')?.value);
    formData.append('work_safety', this.editVendor.get('work_safety')?.value);
    formData.append('street', this.editVendor.get('street')?.value);
    formData.append('city', this.editVendor.get('city')?.value);
    formData.append('province', this.editVendor.get('province')?.value);
    formData.append('country', this.editVendor.get('country')?.value);
    formData.append('post_code', this.editVendor.get('post_code')?.value);
    formData.append('project_id', this.editVendor.get('project_id')?.value);
    formData.append('project_name', this.editVendor.get('project_name')?.value);


    this.contact_service.updateVendor(formData).subscribe(response => {
      if (response.status) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
        this.show_edit_project = !this.show_edit_project

        this.getDataListing();
        this.closeChildModals();
        this.handleClose();

      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
      }
    })





  }
  onEditContact() {

    this.ec_name_error = '';
    this.ec_phone_error = '';
    this.ec_email_error = '';

    if (this.editcontact.get('name')?.value == '') {
      this.ec_name_error = 'Name is required';
    }
    if (this.editcontact.get('email')?.value == '') {
      this.ec_email_error = 'Email is required';
    }
    let errors = '';
    if (this.editcontact.get('email')?.value !== undefined && this.editcontact.get('email')?.value != null && this.editcontact.get('email')?.value != '') {
      let email = this.editcontact.get('email')?.value;

      // Remove leading and trailing whitespaces (optional)
      email = email.trim();

      // Check for spaces in the email
      if (email.includes(' ')) {
        this.ec_email_error = "Email should not contain spaces.";
        errors = 'yes';
      }

      // Check if '@' is present
      if (!email.includes('@')) {
        this.ec_email_error = "Email must contain '@'.";
        errors = 'yes';
      }

      // Additional check for presence of a domain part
      const parts = email.split('@');
      if (parts.length === 2 && parts[1].indexOf('.') === -1) {
        this.ec_email_error = "Email must contain a domain (e.g., 'example.com').";
        errors = 'yes';
      }

      // Check for common email format using regular expression
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.ec_email_error = "Provide a valid email address.";
        errors = 'yes';
      }
    }



    // let errors='';
    if (this.editcontact.get('phone')?.value !== undefined && this.editcontact.get('phone')?.value != null && this.editcontact.get('phone')?.value != '') {
      let a = this.editcontact.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.ec_phone_error = "Provide a valid contact number.";
        errors = 'yes';
      }
    }


    if (this.editcontact.invalid || this.ec_phone_error != '') {
      return;
    }


    if (this.editcontact.invalid || errors == 'yes') {
      return;
    }

    let send_dispatch = false;


    const formData = new FormData();
    formData.append('update_id', this.editcontact.get('contacts_id')?.value);
    formData.append('phone', this.editcontact.get('phone')?.value);
    formData.append('email', this.editcontact.get('email')?.value);
    formData.append('name', this.editcontact.get('name')?.value);
    formData.append('role', this.editcontact.get('Role')?.value);
    formData.append('is_send_dispatch', this.isCheckedEdit2 ? '1' : '0');

    if (this.selected_contact.invitation_id || this.selected_contact.company_id) {
      this.contact_service.updateContacts(formData).subscribe(response => {
        if (response.status) {

          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Success', response.message);
          this.getCustomerContacts(this.edit_company);
        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Success', response.message);
        }
      })
    }



    this.show_edit_contact = !this.show_edit_contact;

    this.form_clicked = true;


    this.is_loading_add = 'editcontact';
    this.selected_contact = '';
  }
  onAddContact() {

    this.ac_name_error = '';
    this.ac_phone_error = '';
    this.ac_email_error = '';

    if (this.addcontact.get('name')?.value == '') {
      this.ac_name_error = 'Name is required';
    }
    if (this.addcontact.get('email')?.value == '') {
      this.ac_email_error = 'Email is required';
    }
    let errors = '';
    if (this.addcontact.get('email')?.value !== undefined && this.addcontact.get('email')?.value != null && this.addcontact.get('email')?.value != '') {
      let email = this.addcontact.get('email')?.value;

      // Remove leading and trailing whitespaces (optional)
      email = email.trim();

      // Check for spaces in the email
      if (email.includes(' ')) {
        this.ac_email_error = "Email should not contain spaces.";
        errors = 'yes';
      }

      // Check if '@' is present
      if (!email.includes('@')) {
        this.ac_email_error = "Email must contain '@'.";
        errors = 'yes';
      }

      // Additional check for presence of a domain part
      const parts = email.split('@');
      if (parts.length === 2 && parts[1].indexOf('.') === -1) {
        this.ac_email_error = "Email must contain a domain (e.g., 'example.com').";
        errors = 'yes';
      }

      // Check for common email format using regular expression
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.ac_email_error = "Provide a valid email address.";
        errors = 'yes';
      }
    }



    // let errors='';
    if (this.addcontact.get('phone')?.value !== undefined && this.addcontact.get('phone')?.value != null && this.addcontact.get('phone')?.value != '') {
      let a = this.addcontact.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.ac_phone_error = "Provide a valid contact number.";
        errors = 'yes';
      }
    }


    if (this.addcontact.invalid || this.ac_phone_error != '') {

      return;
    }


    if (this.addcontact.invalid || errors == 'yes') {
      return;
    }

    let send_dispatch = 'false';
    if (this.isCheckedEdit) {
      send_dispatch = 'true';
    }
    this.form_clicked = true;

    const formData = new FormData();
    this.is_loading_add = 'addcontact';

    if (this.addcontact.get('invitation_id')?.value && this.addcontact.get('invitation_id')?.value != '') {
      formData.append('invitation_id', this.addcontact.get('invitation_id')?.value);
    }
    else if (this.addcontact.get('company_id')?.value && this.addcontact.get('company_id')?.value != '') {
      formData.append('company_id', this.addcontact.get('company_id')?.value);
    }



    formData.append('user_id', this.addcontact.get('user_id')?.value);
    formData.append('email', this.addcontact.get('email')?.value);
    formData.append('name', this.addcontact.get('name')?.value);
    formData.append('phone', this.addcontact.get('phone')?.value);
    formData.append('role', this.addcontact.get('Role')?.value);
    formData.append('is_send_dispatch', send_dispatch);

    this.contact_service.addContacts(formData).subscribe(response => {
      if (response.status) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
        this.getCustomerContacts(this.edit_company);
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
      }
    })

    this.show_add_contact = !this.show_add_contact;
  }


  getDataListing() {
    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_status', this.search_status);
    formData.append('search_date', this.search_date);

    formData.append('search_date_to', this.search_date_to);

    this.customer_service.getContactCompanies(formData).subscribe(response => {

      this.is_loading = false;
      if (response.status && response.data) {
        this.data_list = response.data?.data;
        this.data_pagination = response.data;
        console.log(this.data_list);
        console.log(this.data_list);
        console.log("data_list ::: ", this.data_list);
      } else {

      }
    }
    );
  }

  handleChange(value: any) {

    this.sort_by = value;
    this.getDataListing();

  }
  handleSortByList(event: any) {
    this.sortBy(event)
    $('.input-popup-div').hide();

  }

  searchBy(value: any) {

    this.search_by = value;
    this.getDataListing();

  }

  handlePerPage(event: any) {
    if (event.target.value) {
      this.perPage = event.target.value;
      this.getDataListing();
    }
  }

  handlePage(page: any) {
    if (page) {
      this.page = page;
      this.getDataListing();
    }
  }

  sortBy(value: any) {
    if (value && value != '') {
      this.sort_by = value;
      this.getDataListing();
    }
  }

  handleStatus(event: any) {
    this.search_status = event.target.value;
    this.getDataListing()
  }

  changePage(page: any) {
    this.page = page;
    this.getDataListing();
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

  changeDate(event: any) {
    this.search_date = event.target.value;
    this.getDataListing();
  }


  showModal(modal: any) {
    this.current_modal = modal;
  }

  setActive(type: any) {

    this.getDataListing()
  }

  getMenuCounts() {
    let data = { orginal_user_id: this.loggedinUser.id, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  actionSend(type: any, data_id: any) {
    let data = { type: type, data_id: data_id, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id };

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'mr-4 btn mybtn-back-yellow ',
        cancelButton: 'btn btn-dark',
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: type != 'cancel' ? 'Do you want to delete this user?' : 'Do you want to cancel this invitation?',
      showCancelButton: true,
      confirmButtonText: type != 'cancel' ? 'Delete' : 'Yes Cancel',
      cancelButtonText: `Close`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.customer_service.customerAction(data).subscribe(response => {

          if (response.status) {
            if (type == "cancel") {
              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
                },
                buttonsStyling: false
              })
              swalWithBootstrapButtons.fire('Success', 'Company Invitation Cancelled!');
              this.getMenuCounts();
            } else {

              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
                },
                buttonsStyling: false
              })
              swalWithBootstrapButtons.fire('Success', 'Company Deleted Successfully!');
            }
            this.getDataListing()
          } else {
            if (type == "cancel") {
              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
                },
                buttonsStyling: false
              })
              swalWithBootstrapButtons.fire('Error', 'Failed to Cancel Invitation!');
            } else {
              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
                },
                buttonsStyling: false
              })
              swalWithBootstrapButtons.fire('Error', 'Failed to Delete Company!');
            }
          }
        }
        );
      }

    });

  }

  dateRangeCreated(event: any) {

    this.search_date = event[0].toJSON().split('T')[0];

    this.search_date_to = event[1].toJSON().split('T')[0];

    this.getDataListing();
  }

  setCompany(company: any) {
    this.edit_company = company;
    this.addContactForm?.get('company_id')?.patchValue(company?.id);
    this.customerContacts = company?.contacts;
    this.getCustomerContacts(this.edit_company);
    this.closeChildModals();



    this.is_inv_user = (company?.invitation_code != '' && company?.is_accepted == 0) || (company?.invitation_code == '' && company?.user?.is_active == 0) ? true : false;
  }

  setToEnable(id: any, event: any) {

  }

  setEditContact(contact: any) {

  }

  getCustomerContacts(customer: any) {

    const formData = new FormData();
    if (customer && customer?.invitation_code != '' && customer?.invitation_code != undefined) {


      formData.append('invitation_id', customer.id);
    } else {

      formData.append('company_id', customer.id);

    }
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    this.contact_service.getContacts(formData).subscribe(response => {
      if (response.status && response.contacts) {
        this.customerContacts = response.contacts;
      } else {

      }
    })
  }
  addCustomerContacts(customer: any) {

    const formData = new FormData();
    if (customer && customer?.invitation_code != '' && customer?.invitation_code != undefined) {


      formData.append('invitation_id', customer.id);
    } else {

      formData.append('company_id', customer.id);

    }
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    this.contact_service.addContacts(formData).subscribe(response => {
      if (response.status && response.contacts) {
        this.customerContacts = response.contacts;
      } else {

      }
    })
  }
  updateCustomerContacts(customer: any) {

    const formData = new FormData();
    if (customer && customer?.invitation_code != '' && customer?.invitation_code != undefined) {


      formData.append('invitation_id', customer.id);
    } else {

      formData.append('company_id', customer.id);

    }
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    this.contact_service.updateContacts(formData).subscribe(response => {
      if (response.status && response.contacts) {
        this.customerContacts = response.contacts;
      } else {

      }
    })
  }

  cancelInv(tc_id: any, type: any) {
    const formData = new FormData();
    this.loading_cancel = tc_id;
    formData.append('user_id', this.user_id);
    formData.append('invitation_id', tc_id);

    this.user_service.cancelInv(formData).subscribe(response => {

      this.loading_cancel = null;
      if (response.status && response.message) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
        this.getDataListing();
        this.edit_company = null;
        $("#modalEditProject").modal('hide');
        $("body").removeClass('modal-open');
        $(".modal-backdrop").hide();
        setTimeout(() => {

          $(".confirm").hide();
          $("#vendorinfo").hide("modal")
          $("#vendorinfo").modal("hide")

        }, 1000);

      } else {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Error', response.message);
      }
    })
  }


  resendInv(tc_id: any, type: any) {
    const formData = new FormData();
    this.loading_resend = tc_id;
    formData.append('user_id', this.user_id);
    formData.append('inv_id', tc_id);

    this.customer_setup_service.resendTcInv(formData).subscribe(response => {

      this.loading_resend = null;
      if (response.status && response.message) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message);
      } else {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Error', response.message);
      }
    })
  }

  handleUpdate() {

  }

  handleDone() {
    this.editContact = null;
    let data = { user_id: this.user_id, contacts: this.toEnableContacts, disable: this.toDisable };
    this.contact_service.dispatchingStatus(data).subscribe((response: any) => {
      this.removing_contact_loading = false;
      if (response && response.status && response.message) {


        Swal.fire({
          title: response.message,
          showCancelButton: false,
          confirmButtonText: 'Ok',
          denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
        });
        this.getCustomerContacts(this.edit_company)
        this.toEnableContacts = [];
        this.toDisable = []
      } else {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            'Error!',
          text:
            'Unable to mark contacts!'
        })
      }
    });
  }
}
