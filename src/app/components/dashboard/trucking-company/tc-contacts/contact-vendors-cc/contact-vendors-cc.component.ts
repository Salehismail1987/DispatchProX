import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AnyForUntypedForms } from '@angular/forms';
import { Router } from '@angular/router';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import { ContactService } from 'src/app/services/contact.service';
declare var $: any;

@Component({
  selector: 'app-contact-vendors-cc',
  templateUrl: './contact-vendors-cc.component.html',
  styleUrls: ['./contact-vendors-cc.component.css']
})
export class ContactVendorsCcComponent implements OnInit {
  active_menu: any;
  loggedinUser: any;
  isChecked: boolean = false;
  isCheckedEdit2: boolean = false;
  isCheckedEdit4: boolean = false;
  isCheckedEdit3: boolean = false;
  update_loading: boolean = false;
  isCheckedEdit: boolean = false;
  isCheckedAdd: boolean = false;
  country: string = '';
  countryCustomer: string = '';
  provinceCustomer: string = '';
  province: string = '';
  isDesktop: boolean = false;
  addCustomerAddressVisible = false;
  editCustomerAddressVisible = false;

  companies_list: any = null;
  is_inv_user: boolean = false;
  selected_contact: any;
  contacts_id: number = 0;
  show_edit_contact: boolean = false;
  show_add_contact: boolean = false;
  user_id: any;

  loading: boolean = false;
  loading_resend: any = null;
  loading_cancel:any = null;
  is_tc_loading: boolean = false;
  show_edit_project: boolean = false;
  addCustomerAddress: boolean = false;
  search_by: any = null;
  search_by2: any = null;
  sort_by: any = null;
  cust_sort_by: any = null;
  selected_project: any = null;
  is_loading_add: string = '';
  is_loading_remove: string = '';
  is_remove: boolean = false;
  form_clicked: boolean = false;
  editProject!: FormGroup;
  editVendor!: FormGroup;

  perPage: number = 25;
  page: number = 0;
  pagination: any = null;
  customer_pagination: any = null;
  customers_list: any = null;

  edit_company: any = null;
  edit_customer: any = null;
  EditCustomerAddress: any = null;
  ADDCustomerAddress: any = null;
  EDITCustomerAddress: any = null;

  inviteTCForm!: FormGroup;
  inviteTCcompany_nameError: string = '';
  inviteTCfull_nameError: string = '';
  inviteTCEmailError: string = '';

  removing_contact_loading: boolean = false;
  editContactForm!: FormGroup;
  editComp_ContactForm!: FormGroup;
  editComp_Form!: FormGroup;
  addContactForm!: FormGroup;
  addCustomerContactForm!: FormGroup;
  editCustomerContactForm!: FormGroup;
  addCompanyContactForm!: FormGroup;
  addCustomerAddressForm!: FormGroup;
  editCustomerAddressForm!: FormGroup;

  addCustomerForm!: FormGroup;
  editCustomerForm!: FormGroup;
  customerContacts: any = null;
  companyContacts: any = null;
  companyTrucks_Trailers: any = null;
  Add_companyContacts: any[] = []; // Initialize as an empty array
  custom_truck_rates: any[] = []; // Initialize as an empty array
  Edit_Comp_Contact: any = null;

  editContact: any = null;
  addContact: any = null;
  addCustomerContact: any = null;
  editCustomerContact = false;
  editComp_Contact = false;
  isAddCustomerModalOpen = false;
  isEditCustomerModalOpen = false;

  Edit_com_errorName: string = '';
  Edit_com_errorPhone: string = '';
  Edit_com_errorEmail: string = '';

  add_cust_phoneError: string = '';
  errorName: string = '';
  errorPhone_VI: string = '';
  ac_errorName: string = '';
  ac_errorPhone: string = '';
  aac_errorPhone: string = '';
  aac_errorName: string = '';
  aac_errorEmail: string = '';

  ECC_errorName: string = '';
  ECC_errorPhone: string = '';
  ECC_errorEmail: string = '';

  errorCompanyName: string = '';
  errorCustomerAddAddress: string = '';
  errorCustomerEditAddress: string = '';
  errorEmail: string = '';
  EC_errorEmail: string = '';
  EC_errorName: string = '';
  EC_errorCompanyName: string = '';
  EC_errorPhone: string = '';
  EC_errorCustomerAddress: string = '';

  ac_errorEmail: string = '';
  usa_provinces: any = [];

  canada_provinces: any = [];

  ev_businessNumber_error: string = '';
  ev_city_error: string = '';
  ev_province_error: string = '';
  ev_country_error: string = '';

  ac_city_error: string = '';
  ac_province_error: string = '';
  ac_country_error: string = '';
  ec_city_error: string = '';
  ec_province_error: string = '';
  ec_country_error: string = '';

  company_id: any = null;

  is_loading_add_contact: boolean = false;
  is_loading_add_contact_company: boolean = false;

  is_loading_add_customes_address: boolean = false;
  is_loading_edit_customes_address: boolean = false;
  is_loading_add_customer: boolean = false;
  is_loading_edit_customer: boolean = false;
  is_loading_edit_contact: boolean = false;

  toEnableContacts: any = [];
  toDisable: any = [];

  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;
  edit_country: any = null;
  constructor(private fb: FormBuilder,
    private router: Router,
    private trucking_service: TruckingCompanyService,
    private contact_service: ContactService,
    private user_service: UserDataService,
  ) {
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
    this.active_menu = {
      parent: 'tc-contacts',
      child: 'tc-company',
      count_badge: '',
    };
    this.checkScreenSize();
  }
  onResize(event: any) {
    this.checkScreenSize();
  }
  ngOnInit(): void {
    this.checkScreenSize();

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;
    this.getAllTCCompanies();
    this.getAllTCCustomers();

    this.inviteTCForm = this.fb.group({
      full_name: ['', Validators.required],
      company_name: ['', Validators.required],
      email: ['', Validators.required],
    });


    this.editProject = this.fb.group({
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      project_id: ['', Validators.required],
    })

    this.editVendor = this.fb.group({
      project_name: ['', Validators.required],
      business_no: [''],
      work_safety: [''],
      street: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
      post_code: [''],

      project_id: ['', Validators.required],
    });

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
    this.addCustomerContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      is_send_invoice: [''],
      role: [''],
      contact_type: [''],
      user_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id],
      company_id: [''],
    });
    this.editCustomerContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      is_send_invoice: [''],
      role: [''],
      contact_type: [''],
      user_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id],
      company_id: [''],
    });

    this.addCompanyContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      is_send_invoice: [''],
      role: [''],
      contact_type: [''],
      user_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id],
      company_id: ['', Validators.required],
    });
    this.addCustomerAddressForm = this.fb.group({

      street: [''],
      city: [''],
      country: [''],
      province: [''],
      post_code: [''],
      is_send_dispatch: [''],
    });
    this.editCustomerAddressForm = this.fb.group({

      street: [''],
      city: [''],
      country: [''],
      province: [''],
      post_code: [''],
      is_send_dispatch: [''],
    });

    this.addCustomerForm = this.fb.group({
      company_name: ['', Validators.required],
      email: ['', Validators.required],
      contact_number: [''],
      address: [''],
      street: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      Contacts: [''],
      Single: [100],
      Tandem: [110],
      Tridem: [120],
      quard: [140],
      Pony: [100],
      tri_pony: [110],
      quard_wag: [120],
      Transfer: [120],
      Custom_truck_trailer_rates_list: [[]],

      Role: [''],
      is_send_dispatch: [''],
      is_send_invoice: [''],
      province: ['', Validators.required],
      post_code: [''],
      account_type: ['Customer'],
      full_name: ['', Validators.required],
      trucking_company_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id]
    });


    this.editCustomerForm = this.fb.group({
      customer_id: ['', Validators.required],
      company_name: ['', Validators.required],
      email: ['', Validators.required],
      country: ['Canada', Validators.required],
      contact_number: [''],
      address: [''],
      city: [''],
      Role: [''],

      Single: [100],
      Tandem: [110],
      Tridem: [120],
      quard: [140],
      Pony: [100],
      tri_pony: [110],
      quard_wag: [120],
      Transfer: [120],

      Custom_truck_trailer_rates_list: [[]],

      is_send_dispatch: [''],
      is_send_invoice: [''],
      province: [''],
      post_code: [''],
      account_type: ['Customer'],
      full_name: ['', Validators.required],
      trucking_company_id: [this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id]
    });


    this.editContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      contacts_id: [''],
      Role: [''],
      is_send_dispatch: [''],
      update_id: [''],
    });
    this.editComp_ContactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      contacts_id: [''],
      Role: [''],
      is_send_invoice: [''],

      update_id: [''],
    });
    this.editComp_Form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      contacts_id: [''],
      Role: [''],
      is_send_dispatch: [''],

      update_id: [''],
    });


    $(document).on('click', '.openOptionModal', function (this: any) {
      $(this).closest('.modal-div').find('.option-modal').toggle();
    });
    $(document).on('click', '.btnaction', function (this: any) {
      $(this).closest('.option-modal').hide();
    });
    $(document).on('click', '.btnselectlist', function (this: any) {
      $(this).closest('.selectdiv').find('.selectlistdiv').toggle('slow');
    });
    $(document).on('click', '.selectlistitems li', function (this: any) {
      $(this).closest('.selectdiv').find('.selectlistdiv').hide();
      $(this).closest('.selectdiv').find('.selectlistname').html($(this).html());
    });


    $(document).on('click', '.getinputfield', function (this: any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });
    $(document).on('click', '.getinputfield2', function (this: any) {
      $('.input-popup-div2').hide();
      $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });



    $(document).on('click', '.getinputfield3', function (this: any) {
      $('.input-popup-div3').hide();
      $(this).find('.input-popup-div3').show();
      // console.log("cshhh3")

    });
    $(document).on('click', '.input-popup-div3', function (e: any) {
      e.stopPropagation();  // Correctly stop event propagation
    });
    $(document).on('click', '.getinputfield4', function (this: any) {
      $('.input-popup-div4').hide();
      $(this).find('.input-popup-div4').show();
      // console.log("cshhh4")

    });
    $(document).on('click', '.input-popup-div4', function (e: any) {
      e.stopPropagation();  // Correctly stop event propagation
    });


    $(window).click(function (e: any) {
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
        $('.input-popup-div').hide();
        $('.input-popup-div2').hide();
      }

      if (!($(e.target).hasClass('getinputfield3') || $(e.target).closest('.getinputfield3').length)) {
        $('.input-popup-div3').hide();
        // console.log("closinggg3")
      }
      if (!($(e.target).hasClass('getinputfield4') || $(e.target).closest('.getinputfield4').length)) {
        $('.input-popup-div4').hide();
        // console.log("closinggg4")
      }


    });

    // console.log(" this issss   ", this.is_loading_remove);



  }
  checkScreenSize() {
    this.isDesktop = window.innerWidth > 767.98;
  }


  openAddCustomerModal() {
    this.isAddCustomerModalOpen = true;
    this.emptyAddCustomerForm();
  }
  openEditCustomerModal(customer: any) {
    this.editCustomerAddressVisible = false;
    this.editCustomerContact = false;
    this.editCustomerForm?.get('customer_id')?.patchValue(customer?.id);

    this.editCustomerForm?.get('city')?.patchValue(customer?.city);
    this.editCustomerForm?.get('country')?.patchValue(customer?.country);
    this.editCustomerForm?.get('province')?.patchValue(customer?.province);
    this.editCustomerForm?.get('address')?.patchValue(customer?.address);
    this.editCustomerForm?.get('post_code')?.patchValue(customer?.post_code);
    this.editCustomerForm?.get('is_send_dispatch')?.patchValue(customer?.is_send_dispatch);


    console.log(" this is the customer to be EDIT *** ::: ", customer)
    this.isEditCustomerModalOpen = true;
    this.setCustomer(customer);
    this.reset_errors_msgs();
  }




  handleUpdateProject() {
    console.log(this.editProject.value)

    this.form_clicked = true;

    // let data:any=this.updateProject.value;
    // data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    // data.project_id = this.selected_project?.id;
    // data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    // data.action = 'tc_project';

    this.is_loading_add = 'update_project';
    // this.tc_dispatch_service.updateData(data).subscribe(response=>{
    //   this.is_loading_add='';
    //   if(response.status ){
    //     Swal.fire(  {
    //       confirmButtonColor:'#17A1FA',
    //       title:    'Success',
    //       text:
    //       response.message
    //     })
    //     this.updateProject.reset();
    //     this.approvers.reset();
    //     this.approvers.clear();
    //     this.getData();
    //   }
    // });
  }
  handleRemoveProject() {
    // console.log(this.updateProject.value)

    // this.form_clicked=true;

    setTimeout(() => {

      $(".confirm").show()
    }, 10);


    // let data:any=this.updateProject.value;
    // data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    // data.project_id = this.selected_project?.id;
    // data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    // data.action = 'tc_project';

    // this.is_loading_remove='remove_project';
    // this.tc_dispatch_service.updateData(data).subscribe(response=>{
    //   this.is_loading_add='';
    //   if(response.status ){
    //     Swal.fire(  {
    //       confirmButtonColor:'#17A1FA',
    //       title:    'Success',
    //       text:
    //       response.message
    //     })
    //     this.updateProject.reset();
    //     this.approvers.reset();
    //     this.approvers.clear();
    //     this.getData();
    //   }
    // });
  }

  handleDeleteDS() {

    this.form_clicked = true;

    let data: any = {};
    data.TC_id = this.edit_company?.id;
    var is_invitation = 'NO';
    if (this.edit_company?.invitation_code) {
      is_invitation = 'YES';
    }
    data.is_invitation = is_invitation;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;


    this.trucking_service.removeTruckingCompany(data).subscribe((response: { status: any; message: any; }) => {
      this.is_loading_add = '';
      if (response.status) {
        console.log("\n\n\n TC is remioved successfully");
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title: 'Success',
          text:
            response.message,


          // title: 'Do you want to save the changes?',
          // showDenyButton: true,
          // showCancelButton: true,
          confirmButtonText: 'OK.',
          // denyButtonText: `Don't save`,



        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            // window.location.reload();
            // Swal.fire('Saved!', '', 'success')
          }
        })

        this.getData();
        this.getAllTCCompanies();

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
      $("#vendorinfo").hide('modal')
      $("#vendorinfo").modal('hide')
    }, 1000);

    setTimeout(() => {
      // window.location.reload();
    }, 2000);

    // this.show_edit_project = false;
    // window.location.reload();
  }

  hideDSButton() {
    setTimeout(() => {

      $(".confirm").hide()
    }, 200);
  }

  closeremoveModal() {
    this.show_edit_project = false;
  }
  addContactt() {
    this.addContact = true;
  }
  addCustomerContactt() {
    this.addCustomerContact = true;
  }
  toogle_Add_CustomerContactt(company: any = null) {
    if (!this.editCustomerAddressVisible) {
      this.editCustomerContact = !this.editCustomerContact;
    }

    if (company && company != null) {
      this.addCompanyContactForm.get('company_id')?.patchValue(company?.id);

    }
    else {
      this.addCompanyContactForm.get('company_id')?.patchValue('');

    }
  }




  toogle_Edit_CustomerContactt(contact: any = null) {
    if (contact && contact != null) {
      this.editComp_Contact = !this.editComp_Contact;
    }

    if (contact && contact != null) {
      this.editComp_ContactForm.get('update_id')?.patchValue(contact.id);
    }

    else {
      this.editComp_ContactForm.get('update_id')?.patchValue('');

    }
  }




  toogleAddCustomerContactt() {
    if (!this.addCustomerAddressVisible) {
      this.addCustomerContact = !this.addCustomerContact;
    }
  }

  closeAddCustomerModal() {
    this.isAddCustomerModalOpen = false;
    $('#addCustomer').modal('hide');
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');
  }

  closeEditCustomerModal() {
    this.edit_customer = false;
    this.isEditCustomerModalOpen = false;
    $('#editCustomer').modal('hide');
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');
  }
  closeEditContactModal() {
    this.editContact = false;
    $('#editContact').modal('hide');
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');

  }




  closeEditComp_ContactModal() {
    this.editComp_Contact = false;
  }




  closeAddContactModal() {
    this.addContact = false;
    this.addCustomerContact = false;
    // this.addContact = true;

    $('#addContact').modal('hide');
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');

  }

  toggleAddAddressCustomer() {

    // this.addCustomerAddress = !this.addCustomerAddress;
    this.addCustomerAddressVisible = !this.addCustomerAddressVisible;
    this.ADDCustomerAddress = '';

  }
  toggleeditAddressCustomer() {
    if (this.edit_customer && this.edit_customer.trucking_company_id == this.loggedinUser?.id) {
      this.editCustomerAddressVisible = !this.editCustomerAddressVisible;

    }
  }
  toggleEditProject() {
    if (!this.is_inv_user) {
      this.show_edit_project = !this.show_edit_project;
    }
    // this.show_edit_project = !this.show_edit_project;
    if (this.show_edit_project) {

      this.edit_country = this.edit_company?.country != null && this.edit_company?.country != 'null' ? ', ' + this.edit_company?.country : this.edit_company?.customer?.country;
    } else {
      this.edit_country = null;
    }
    if (this.edit_company) {
      let defaultProjectName = this.edit_company.company_name || this.edit_company.user?.company_name || '';
      let defaultProjectId = this.edit_company?.id || '';

      this.editVendor.controls['project_name'].setValue(defaultProjectName);
      this.editVendor.controls['project_id'].setValue(defaultProjectId);
      this.editVendor.patchValue({
        project_name: defaultProjectName
      });
      this.country = this.edit_company?.customer?.country != '' && this.edit_company?.customer?.country !== null ? this.edit_company?.customer?.country : 'Canada';
      this.province = this.edit_company?.customer?.province != '' && this.edit_company?.customer?.province !== null ? this.edit_company?.customer?.province : 'Canada';

    }

    // if(this.show_edit_project){
    //   this.editProject.get('project_id')?.patchValue(this.selected_project?.id);
    //   this.editProject.get('job_number')?.patchValue(this.selected_project?.job_number);
    //   this.editProject.get('street')?.patchValue(this.selected_project?.project_location);
    //   this.editProject.get('city')?.patchValue(this.selected_project?.city);
    //   this.editProject.get('project_name')?.patchValue(this.selected_project?.project_name);
    //   this.editProject.get('state')?.patchValue(this.selected_project?.state);
    // }
  }

  closeChildModals() {
    // this.edit_company = false;
    this.closeremoveModal();
    this.closeEditContactModal();
    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');

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
        this.form_clicked = false;
        this.is_loading_add = '';


        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text:
              response.message
          }
        ).then(() => {

        });

        this.show_edit_project = !this.show_edit_project

        this.getAllTCCompanies();
        this.getAllTCCustomers();
        this.closeChildModals();
        this.handleClose();

      } else {
        this.form_clicked = false;
        this.is_loading_add = '';

        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Warning`,
            text:
              response.message
          }
        ).then(() => {

        });
      }
    })





  }
  getData() {
    // let data={user_id:this.user_id,action:'all_construction_companies'}
    // this.tc_dispatch_service.getAllData(data).subscribe(response => {

    //   if (response.status && response.data) {
    //     this.cc_lists = response.data;

    //   }
    // });
    // let data2={user_id:this.user_id,action:'all_tc_approvers'}
    // this.tc_dispatch_service.getAllData(data2).subscribe(response => {

    //   if (response.status && response.data) {
    //     this.appr_lists = response.data;

    //   }
    // });


    //  data={user_id:this.user_id,action:'tc_projects'}
    // this.tc_dispatch_service.getAllData(data).subscribe(response => {

    //   if (response.status && response.data) {
    //     this.projects_list = response.data;
    //     if(this.selected_cc){
    //       response.data.map((item:any)=>{
    //         if(item.id == this.selected_cc.id){
    //           this.selected_cc = item;
    //         }
    //         if(this.selected_project){
    //           item.projects.map((item2:any)=>{
    //             if(item2.id == this.selected_project.id && (item2.trucking_company_id == this.selected_project.trucking_company_id || item2.user_id == this.selected_project.user_id)){
    //               this.selected_project = item2;
    //               this.addApprovers(this.selected_project);
    //             }
    //           });
    //         }
    //       })
    //     }
    //   }
    // });
  }



  setToEnable(id: any, event: any) {
    // console.log(id,event)
    if (event.target.checked) {

      this.toEnableContacts[this.toEnableContacts.length] = id;
      this.toDisable.filter(function (item: any) {
        return item !== id
      })
    } else {

      this.toEnableContacts = this.toEnableContacts.filter(function (item: any) {
        return item !== id
      })

      this.toDisable[this.toDisable.length] = id;

    }

    // console.log(this.toDisable)
  }

  getMenuCounts() {
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  getAllTCCustomers() {
    let data: any = {
      user_id: this.user_id,
      is_pagination: 'true',
      is_contact_call: 'YES',
      search_by: this.search_by2,
      sort_by: this.cust_sort_by,
    };
    this.loading = true;


    this.trucking_service.getAllTCCustomers(data).subscribe(response => {
      this.loading = false;
      if (response.status && response.data) {
        this.customers_list = response.data;
      } else {
        this.customers_list = null;

      }
    })
  }


  getAllTCCompanies() {

    this.loading = true;
    let data: any = {
      user_id: this.user_id,
      is_pagination: 'true',
      is_contact_call: 'YES',
      sort_by: this.sort_by,
      search_by: this.search_by
    }


    data.page = this.page;
    this.trucking_service.getAllTCCompanies(data).subscribe(response => {
      this.loading = false;
      if (response.status && response.data) {
        this.companies_list = response.data?.data;
        this.pagination = response.data;
      } else {

      }
    })
  }

  changePage(page: any) {
    this.page = page;
    this.getAllTCCompanies();
  }


  handlePerPage(event: any) {
    if (event.target.value) {
      this.perPage = event.target.value;
      this.getAllTCCompanies();
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

  resendInv(tc_id: any, type: any) {
    const formData = new FormData();
    this.loading_resend = tc_id;
    formData.append('user_id', this.user_id);
    formData.append('inv_id', tc_id);

    this.trucking_service.resendTCInv(formData).subscribe(response => {

      this.loading_resend = null;
      if (response.status && response.message) {
        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        }
        )
      } else {
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title:
              `Error`,
            text:
              response.message
          })
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


        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        }
        )
        this.getAllTCCompanies();
        this.edit_company = null;
        $("#vendorinfo").modal('hide');
        $("body").removeClass('modal-open');
        $(".modal-backdrop").hide();
        setTimeout(() => {

          $(".confirm").hide();
          $("#vendorinfo").hide("modal")
          $("#vendorinfo").modal("hide")

        }, 1000);

      } else {

        Swal.fire({
          confirmButtonColor: '#17A1FA',
          title:
            `Success`,
          text:
            response.message
        }
        )
      }
    })
  }

  onInviteTC() {
    this.inviteTCcompany_nameError = '';
    this.inviteTCfull_nameError = '';
    this.inviteTCEmailError = '';

    if (this.inviteTCForm.get('company_name')?.value == '') {
      this.inviteTCcompany_nameError = "Company Name is required";
    }
    if (this.inviteTCForm.get('full_name')?.value == '') {
      this.inviteTCfull_nameError = "Full Name is required";
    }

    if (this.inviteTCForm.get('email')?.value == '') {
      this.inviteTCEmailError = "Email is required";
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteTCForm.get('email')?.value)) {
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
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.is_tc_loading = true;
    this.trucking_service.inviteTruckingCompany(formData).subscribe(response => {
      this.is_tc_loading = false;
      if (response && !response.status) {
        if (response.message && response.message != "") {

          Swal.fire(

            {
              confirmButtonColor: '#17A1FA',
              title:
                `Error`,
              text:
                "Problem in inviting (Sending Email) Trucking Company."
            }
          ).then(() => {

          });
        } else {
          this.inviteTCEmailError = response.data.email ? response.data.email : '';
          this.inviteTCcompany_nameError = response.data.company_name ? response.data.company_name : '';
          this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
          this.is_tc_loading = false;
        }

        return;
      } else {

        this.inviteTCForm.reset();
        this.getAllTCCompanies();
        this.getMenuCounts();
        this.is_tc_loading = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text:
              `An invitation has been sent!`
          }).then(() => {
            $(".modal-backdrop").remove();
            $('#newInvTC').modal('toggle');
          });

      }
    });

  }

  setCompany(company: any) {
    this.closeremoveModal();
    this.closeEditContactModal();
    this.edit_company = company;
    // this.addContactForm?.get('company_id')?.patchValue(company?.id);
    this.customerContacts = company?.contacts;
    this.getCustomerContacts(this.edit_company);
    this.is_inv_user = (company?.invitation_code != '' && company?.is_accepted == 0) || (company?.invitation_code == '' && company?.user?.is_active == 0) ? true : false;

  }
  setCustomer(company: any) {
    this.companyTrucks_Trailers = [];

    this.edit_customer = company;
    this.companyContacts = company?.contacts;

    this.getCompanyContacts(this.edit_customer);
    this.getCompanyTruckTrailer(this.edit_customer);

    if (!this.edit_customer?.country) {
      this.edit_customer.country = 'Canada';
    }
    const edit_customerr = this.edit_customer || {};

    const addressParts = [
      edit_customerr.address,
      edit_customerr.city,
      edit_customerr.province,
      edit_customerr.country,
      edit_customerr.post_code
    ];
    console.log(this.edit_customer?.country, this.edit_customer?.province)
    this.editCustomerForm?.get('city')?.patchValue(edit_customerr?.city);
    this.editCustomerForm?.get('country')?.patchValue(edit_customerr?.country ? edit_customerr?.country : 'Canada');
    this.editCustomerForm?.get('province')?.patchValue(edit_customerr?.province);
    this.editCustomerForm?.get('address')?.patchValue(edit_customerr?.address);
    this.editCustomerForm?.get('post_code')?.patchValue(edit_customerr?.post_code);
    // Filter out any parts that are null, undefined, or empty strings
    const filteredAddressParts = addressParts.filter(part => part && part.trim() !== '');

    // Join the filtered parts with a comma
    this.EditCustomerAddress = filteredAddressParts.join(', ');

  }
  handleClose() {
    this.edit_company = false;

    $('.modal-backdrop').addClass('hide');

    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');
  }

  setEditContact(contact: any, flag: any = 1) {
    if (flag == 2) {
      this.Edit_Comp_Contact = contact;
      this.toogle_Edit_CustomerContactt(contact)
    }
    else {
      if (this.show_edit_project) {
        return;
      }
      this.editContact = contact;
      this.editContactForm.get('name')?.patchValue(contact?.name);
      this.editContactForm.get('update_id')?.patchValue(contact?.id);
      this.editContactForm.get('is_send_dispatch')?.patchValue(contact?.is_send_dispatch);
      this.isCheckedEdit4 = contact?.is_send_dispatch == 1 ? true : false;
      this.editContactForm.get('phone')?.patchValue(contact?.phone && contact?.phone != "null" ? contact?.phone : '');
      this.editContactForm?.get('email')?.patchValue(contact?.email);
      this.editContactForm.get('contact_type')?.patchValue(contact?.contact_type);
      this.editContactForm.get('Role')?.patchValue(contact?.role ? contact?.role : '');

    }

  }

  setRoleEditTCContact(role: any) {
    if (role) {
      this.editContactForm.get('Role')?.patchValue(role);
    }
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
    else if (check == 6) {

      this.isCheckedEdit4 = !this.isCheckedEdit4;
      this.editContactForm.get('is_send_dispatch')?.patchValue(this.isCheckedEdit4 ? 1 : 0);
    }

    else if (check == 5) {
      this.isCheckedEdit3 = !this.isCheckedEdit3;
    }
  }
  handleEditComp_Contact() {

    this.Edit_com_errorName = '';
    this.Edit_com_errorPhone = '';
    this.Edit_com_errorEmail = '';
    let errors = false;


    if (this.editComp_ContactForm.get('name')?.value == '') {
      this.Edit_com_errorName = 'Name is required';
    }

    if (this.editComp_ContactForm.get('email')?.value == '') {
      this.Edit_com_errorEmail = 'Email is reqiured';
    }
    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.editComp_ContactForm.get('email')?.value)) {
      this.Edit_com_errorEmail = 'Enter a valid email';
      return;
    }


    if (this.editComp_ContactForm.get('phone')?.value !== undefined && this.editComp_ContactForm.get('phone')?.value != null && this.editComp_ContactForm.get('phone')?.value != '') {
      let a = this.editComp_ContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.Edit_com_errorPhone = "Phone number is invalid";
        errors = true;
      }
    }





    if (this.editComp_ContactForm.invalid || errors) {
      return;
    }
    const formData = new FormData();
    formData.append('update_id', this.editComp_ContactForm.get('update_id')?.value);
    formData.append('phone', this.editComp_ContactForm.get('phone')?.value);
    formData.append('email', this.editComp_ContactForm.get('email')?.value);
    formData.append('name', this.editComp_ContactForm.get('name')?.value);
    formData.append('role', this.editComp_ContactForm.get('Role')?.value);
    formData.append('is_send_invoice', this.editComp_ContactForm.get('is_send_invoice')?.value ? '1' : '0');


    this.is_loading_edit_contact = true;
    this.contact_service.updateContacts(formData).subscribe(response => {
      this.is_loading_edit_contact = false;

      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';

        return;
      } else {
        // $('#editContact').modal('toggle');
        // this.editContact = false;
        this.editComp_ContactForm.reset();
        this.getCompanyContacts(this.edit_customer);
        this.closeEditComp_ContactModal();
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Contact Updated Successfully!`
          }
        ).then(() => {
          // this.getCompanyContacts(this.edit_company)
        });
      }
    });
  }
  handleEditContact() {


    let errors = false;
    this.errorPhone_VI = '';
    this.errorEmail = '';
    this.errorName = '';
    if (this.editContactForm.get('name')?.value == '') {
      this.errorName = 'Name is required';
    }

    if (this.editContactForm.get('email')?.value == '') {
      this.errorEmail = 'Email is reqiured';
    }

    if (this.editContactForm.get('phone')?.value !== undefined && this.editContactForm.get('phone')?.value != null && this.editContactForm.get('phone')?.value != '') {
      let a = this.editContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.errorPhone_VI = "Phone number is invalid";
        errors = true;
      }
    }


    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.editContactForm.get('email')?.value)) {
      this.errorEmail = 'Enter a valid email';
      return;
    }
    if (this.editContactForm.invalid || errors) {
      return;
    }
    const isSendDispatchValue = this.editContactForm.get('is_send_dispatch')?.value ? 1 : 0;
    const formData = new FormData();
    formData.append('update_id', this.editContactForm.get('update_id')?.value);
    formData.append('phone', this.editContactForm.get('phone')?.value);
    formData.append('email', this.editContactForm.get('email')?.value);
    formData.append('name', this.editContactForm.get('name')?.value);
    formData.append('role', this.editContactForm.get('Role')?.value);
    formData.append('is_send_dispatch', this.isCheckedEdit4 ? '1' : '0');

    this.is_loading_edit_contact = true;
    this.contact_service.updateContacts(formData).subscribe(response => {
      this.is_loading_edit_contact = false;

      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';

        return;
      } else {
        this.getCustomerContacts(this.edit_company);
        // $('#editContact').modal('toggle');
        // this.editContact = false;
        this.closeEditContactModal();
        this.editContactForm.reset();
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Contact Updated Successfully!`
          }
        ).then(() => {
          this.getCustomerContacts(this.edit_company)
        });
      }
    });
  }

  setRole(type: any, role: any) {
    if (type == 'add') {

      this.addContactForm.get('role')?.patchValue(role);

    }
    else if (type == 'edit') {

      this.editContactForm.get('Role')?.patchValue(role);
    }
    else if (type == 'edit_VI') {

      this.editContactForm.get('Role')?.patchValue(role);
    }
    else if (type == 'add_Customer') {

      this.addCustomerContactForm.get('role')?.patchValue(role);
    }
    else if (type == 'add_Comp_Customer') {

      this.addCompanyContactForm.get('role')?.patchValue(role);
    }
    else if (type == 'add_Company_Customer') {

      this.addCustomerContactForm.get('role')?.patchValue(role);
    }
    else if (type == 'edit_Customer') {

      this.editCustomerContactForm.get('role')?.patchValue(role);
    }
  }


  toggleEditContact(user: any, flag: any = 1) {

    if (this.show_edit_project) {
      return;
    }
    this.selected_contact = '';
    this.contacts_id = 0;
    this.selected_contact = user;
    if (this.edit_company && flag == 1) {
      this.editContactForm.controls['name'].setValue(user.full_name);
      this.editContactForm.controls['email'].setValue(user.email);
      this.editContactForm.controls['phone'].setValue(user.contact_number);
      // this.editContactForm= this.isChecked ? true : false;

      this.update_loading = true;

    }

    if (flag == 2) {
      this.editContactForm.controls['contacts_id'].setValue(user.id);
      this.editContactForm.controls['name'].setValue(user.name);
      this.editContactForm.controls['email'].setValue(user.email);
      this.editContactForm.controls['phone'].setValue(user?.phone ? user?.phone : '');
      this.editContactForm.controls['Role'].setValue(user?.role ? user?.role : '');
      this.editContactForm.controls['is_send_dispatch'].setValue(user.is_send_dispatch);
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


  handleComp__AddContact() {
    this.aac_errorEmail = '';
    this.aac_errorPhone = '';
    this.aac_errorName = '';
    if (this.addCustomerContactForm.get('name')?.value == '') {
      this.aac_errorName = 'Name is required';
    }

    if (this.addCustomerContactForm.get('email')?.value == '') {
      this.aac_errorEmail = 'Email is reqiured';
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addCustomerContactForm.get('email')?.value)) {
      this.aac_errorEmail = 'Enter a valid email';
      return;
    }



    if (this.addCustomerContactForm.get('phone')?.value !== undefined && this.addCustomerContactForm.get('phone')?.value != null && this.addCustomerContactForm.get('phone')?.value != '') {
      let a = this.addCustomerContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.aac_errorPhone = "Phone number is invalid";
        // errors='yes';
      }
    }


    if (this.addCustomerContactForm.invalid) {
      return;
    }

    this.addCustomerContactForm.get('user_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    const newContact = this.addCustomerContactForm.value;

    this.Add_companyContacts.push(newContact);
    this.addCustomerContactForm.reset();
    this.closeAddContactModal();



  }
  handleAddContact() {
    this.ac_errorEmail = '';
    this.ac_errorPhone = '';
    this.ac_errorName = '';
    if (this.addContactForm.get('name')?.value == '') {
      this.ac_errorName = 'Name is required';
    }

    if (this.addContactForm.get('email')?.value == '') {
      this.ac_errorEmail = 'Email is reqiured';
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addContactForm.get('email')?.value)) {
      this.ac_errorEmail = 'Enter a valid email';
      return;
    }
    if (this.addContactForm.get('phone')?.value !== undefined && this.addContactForm.get('phone')?.value != null && this.addContactForm.get('phone')?.value != '') {
      let a = this.addContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.ac_errorPhone = "Phone number is invalid";
        // errors='yes';
      }
    }





    if (this.addContactForm.invalid) {
      return;
    }
    // console.log("  this is on adding contact edit company:: ",this.edit_company );

    this.is_loading_add_contact = true;
    let data: any = this.addContactForm.value;
    if (this.edit_company && this.edit_company?.invitation_code != '' && this.edit_company?.invitation_code != undefined) {
      data.company_id = null;
      data.invitation_id = this.edit_company.id;
      this.addContactForm?.get('invitation_id')?.patchValue(this.edit_company?.id);
    } else {
      this.addContactForm?.get('company_id')?.patchValue(this.edit_company?.id);

      data.company_id = this.edit_company.id;
    }
    this.contact_service.addContacts(this.addContactForm.value).subscribe(response => {

      this.is_loading_add_contact = false;
      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';

        return;
      } else {

        this.addContactForm.reset();
        this.addContactForm.get('user_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
        this.is_loading_add_contact = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Contact Added Successfully!`
          }
        ).then(() => {

        });
        this.getCustomerContacts(this.edit_company)
        // $('#addContact').modal('toggle');
        this.closeAddContactModal();
      }
    });

  }
  handleAdd_CustomerContact() {
    this.ECC_errorEmail = '';
    this.ECC_errorPhone = '';
    this.ECC_errorName = '';
    let errors = false;
    if (this.addCompanyContactForm.get('name')?.value == '') {
      this.ECC_errorName = 'Name is required';
    }

    if (this.addCompanyContactForm.get('email')?.value == '') {
      this.ECC_errorEmail = 'Email is reqiured';
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addCompanyContactForm.get('email')?.value)) {
      this.ECC_errorEmail = 'Enter a valid email';
      return;
    }


    if (this.addCompanyContactForm.get('phone')?.value !== undefined && this.addCompanyContactForm.get('phone')?.value != null && this.addCompanyContactForm.get('phone')?.value != '') {
      let a = this.addCompanyContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.ECC_errorPhone = "Phone number is invalid";
        errors = true;
      }
    }


    if (this.addCompanyContactForm.invalid) {
      return;
    }

    this.is_loading_add_contact_company = true;

    let data: any = this.addCompanyContactForm.value;
    if (this.edit_customer?.open_paper_ticket_photo) {

    } else {
      data.tc_company_id = data.company_id;
      data.company_id = null;
    }

    this.contact_service.addContacts(data).subscribe(response => {

      this.is_loading_add_contact_company = false;
      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';

        return;
      } else {

        this.addCompanyContactForm.reset();
        this.addCompanyContactForm.get('user_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
        this.is_loading_add_contact_company = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Contact Added Successfully!`
          }
        ).then(() => {

        });
        this.getCompanyContacts(this.edit_customer)
        // $('#addContact').modal('toggle');
        this.toogle_Add_CustomerContactt();
      }
    });

  }
  handleAddCustomerContact() {
    this.ac_errorEmail = '';
    this.ac_errorPhone = '';
    this.ac_errorName = '';
    if (this.addCustomerContactForm.get('name')?.value == '') {
      this.ac_errorName = 'Name is required';
    }

    if (this.addCustomerContactForm.get('email')?.value == '') {
      this.ac_errorEmail = 'Email is reqiured';
    }


    if (this.addCustomerContactForm.get('phone')?.value !== undefined && this.addCustomerContactForm.get('phone')?.value != null && this.addCustomerContactForm.get('phone')?.value != '') {
      let a = this.addCustomerContactForm.get('phone')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.ac_errorPhone = "Phone number is invalid";
        // errors='yes';
      }
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addCustomerContactForm.get('email')?.value)) {
      this.ac_errorEmail = 'Enter a valid email';
      return;
    }




    if (this.addCustomerContactForm.invalid) {
      return;
    }

    this.is_loading_add_contact = true;
    let data: any = this.addCustomerContactForm.value;
    if (this.edit_company && this.edit_company?.invitation_code != '' && this.edit_company?.invitation_code != undefined) {
      data.company_id = null;
      data.invitation_id = this.edit_company.id;
      this.addCustomerContactForm?.get('invitation_id')?.patchValue(this.edit_company?.id);
    } else {
      this.addCustomerContactForm?.get('company_id')?.patchValue(this.edit_company?.id);

      data.company_id = this.edit_company.id;
    }
    this.contact_service.addContacts(this.addCustomerContactForm.value).subscribe(response => {

      this.is_loading_add_contact = false;
      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';

        return;
      } else {

        this.addCustomerContactForm.reset();
        this.addCustomerContactForm.get('user_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
        this.is_loading_add_contact = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Contact Added Successfully!`
          }
        ).then(() => {

        });
        this.getCustomerContacts(this.edit_company)
        // $('#addContact').modal('toggle');
        this.closeAddContactModal();
      }
    });

  }
  handleAddCustomerAddress() {
    this.ac_city_error = '';
    this.ac_country_error = '';
    this.ac_province_error = '';
    this.ADDCustomerAddress = '';
    let errors = false;
    if (this.addCustomerAddressForm.get('city')?.value == '') {
      this.ac_city_error = 'City is required';
      errors = true;
    }

    if (this.addCustomerAddressForm.get('country')?.value == '') {
      this.ac_country_error = 'Country is reqiured';
      errors = true;
    }


    if (this.addCustomerAddressForm.get('province')?.value == '') {
      this.ac_province_error = "Province is reqiured";
      errors = true;
    }

    if (this.addCustomerAddressForm.invalid) {
      errors = true;
      return;
    }

    let AC_city: any = this.addCustomerAddressForm.get('city')?.value;
    let AC_country: any = this.addCustomerAddressForm.get('country')?.value;
    let AC_province: any = this.addCustomerAddressForm.get('province')?.value;
    let AC_street: any = this.addCustomerAddressForm.get('street')?.value;
    let AC_post_code: any = this.addCustomerAddressForm.get('post_code')?.value;
    let AC_is_send_dispatch: any = this.addCustomerAddressForm.get('is_send_dispatch')?.value;

    this.ADDCustomerAddress = (AC_street ? AC_street + ', ' : '') + (AC_city ? AC_city + ', ' : '') + (AC_province ? AC_province + ', ' : '') + (AC_country ? AC_country + ', ' : '') + (AC_post_code ? AC_post_code + ', ' : '');




    this.is_loading_add_customes_address = true;

    this.addCustomerForm?.get('city')?.patchValue(AC_city);
    this.addCustomerForm?.get('country')?.patchValue(AC_country);
    this.addCustomerForm?.get('province')?.patchValue(AC_province);
    if (AC_street != '') {
      this.addCustomerForm?.get('street')?.patchValue(AC_street);
    }
    if (AC_post_code != '') {
      this.addCustomerForm?.get('post_code')?.patchValue(AC_post_code);
    }
    if (AC_is_send_dispatch != '') {
      this.addCustomerForm?.get('is_send_dispatch')?.patchValue(AC_is_send_dispatch);
    }

    this.is_loading_add_customes_address = false;
    if (!errors) {
      this.addCustomerAddressVisible = false;
      this.errorCustomerAddAddress = '';

    }
    if (!errors) {
      this.addCustomerAddressVisible = false;
      this.errorCustomerAddAddress = '';

    }


  }



  handleEditCustomerAddress() {

    this.ec_city_error = '';
    this.ec_country_error = '';
    this.ec_province_error = '';
    this.EDITCustomerAddress = '';
    let errors = false;

    if (this.editCustomerAddressForm.get('city')?.value == '') {
      this.ec_city_error = 'City is required';
      errors = true;
    }

    if (this.editCustomerAddressForm.get('country')?.value == '') {
      this.ec_country_error = 'Country is reqiured';
      errors = true;
    }


    if (this.editCustomerAddressForm.get('province')?.value == '') {
      this.ec_province_error = "Province is reqiured";
      errors = true;
    }

    if (this.editCustomerAddressForm.invalid) {
      errors = true;
      return;
    }


    let AC_city: any = this.editCustomerAddressForm.get('city')?.value;
    let AC_country: any = this.editCustomerAddressForm.get('country')?.value;
    let AC_province: any = this.editCustomerAddressForm.get('province')?.value;
    let AC_street: any = this.editCustomerAddressForm.get('street')?.value;
    let AC_post_code: any = this.editCustomerAddressForm.get('post_code')?.value;
    let AC_is_send_dispatch: any = this.editCustomerAddressForm.get('is_send_dispatch')?.value;

    this.EDITCustomerAddress = (AC_street ? AC_street + ', ' : '') + (AC_city ? AC_city + ', ' : '') + (AC_province ? AC_province + ', ' : '') + (AC_country ? AC_country + ', ' : '') + (AC_post_code ? AC_post_code + ', ' : '');
    this.EditCustomerAddress = (AC_street ? AC_street + ', ' : '') + (AC_city ? AC_city + ', ' : '') + (AC_province ? AC_province + ', ' : '') + (AC_country ? AC_country + ', ' : '') + (AC_post_code ? AC_post_code + ', ' : '');

    if (this.EDITCustomerAddress.endsWith(', ')) {
      this.EDITCustomerAddress = this.EDITCustomerAddress.slice(0, -2);
    }
    if (this.EditCustomerAddress.endsWith(', ')) {
      this.EditCustomerAddress = this.EditCustomerAddress.slice(0, -2);
    }


    this.is_loading_edit_customes_address = true;


    this.editCustomerForm?.get('city')?.patchValue(AC_city);
    this.editCustomerForm?.get('country')?.patchValue(AC_country);
    this.editCustomerForm?.get('province')?.patchValue(AC_province);
    if (AC_street != '') {
      this.editCustomerForm?.get('address')?.patchValue(AC_street);
    }
    if (AC_post_code != '') {
      this.editCustomerForm?.get('post_code')?.patchValue(AC_post_code);
    }
    if (AC_is_send_dispatch != '') {
      this.editCustomerForm?.get('is_send_dispatch')?.patchValue(AC_is_send_dispatch);
    }

    this.is_loading_edit_customes_address = false;
    if (!errors) {
      this.editCustomerAddressVisible = false;
      this.errorCustomerEditAddress = '';
      this.EC_errorCustomerAddress = '';

    }

  }
  handledefault_AddressData() {

    this.ec_city_error = '';
    this.ec_country_error = '';
    this.ec_province_error = '';
    this.EDITCustomerAddress = '';
    let errors = false;

    if (this.editCustomerAddressForm.get('city')?.value == '') {
      this.ec_city_error = 'City is required';
      errors = true;
    }

    if (this.editCustomerAddressForm.get('country')?.value == '') {
      this.ec_country_error = 'Country is reqiured';
      errors = true;
    }


    if (this.editCustomerAddressForm.get('province')?.value == '') {
      this.ec_province_error = "Province is reqiured";
      errors = true;
    }

    if (this.editCustomerAddressForm.invalid) {
      errors = true;
      return;
    }



    let AC_city: any = this.editCustomerAddressForm.get('city')?.value;
    let AC_country: any = this.editCustomerAddressForm.get('country')?.value;
    let AC_province: any = this.editCustomerAddressForm.get('province')?.value;
    let AC_street: any = this.editCustomerAddressForm.get('street')?.value;
    let AC_post_code: any = this.editCustomerAddressForm.get('post_code')?.value;
    let AC_is_send_dispatch: any = this.editCustomerAddressForm.get('is_send_dispatch')?.value;



    this.editCustomerForm?.get('city')?.patchValue(AC_city);
    this.editCustomerForm?.get('country')?.patchValue(AC_country);
    this.editCustomerForm?.get('province')?.patchValue(AC_province);
    if (AC_street != '') {
      this.editCustomerForm?.get('address')?.patchValue(AC_street);
    }
    if (AC_post_code != '') {
      this.editCustomerForm?.get('post_code')?.patchValue(AC_post_code);
    }
    if (AC_is_send_dispatch != '') {
      this.editCustomerForm?.get('is_send_dispatch')?.patchValue(AC_is_send_dispatch);
    }



  }


  emptyAddCustomerForm() {

    this.custom_truck_rates = [];

    const trucks = [
      { name: 'Single', type: 'TRUCK', rate: 100 },
      { name: 'Tandem', type: 'TRUCK', rate: 110 },
      { name: 'Tridem', type: 'TRUCK', rate: 120 },
      { name: 'Quard-Axle', type: 'TRUCK', rate: 140 },
      { name: 'Pony', type: 'TRAILER', rate: 100 },
      { name: 'Tri Pony', type: 'TRAILER', rate: 110 },
      { name: 'Quad (wagon)', type: 'TRAILER', rate: 120 },
      { name: 'Transfer', type: 'TRAILER', rate: 120 }
    ];

    trucks.forEach(truck => {
      if (truck.name == 'Quard-Axle') {
        this.addCustomerForm?.get('quard')?.patchValue(truck.rate);
      }
      else if (truck.name == 'Tri Pony') {
        this.addCustomerForm?.get('tri_pony')?.patchValue(truck.rate);
      }
      else if (truck.name == 'Quad (wagon)') {
        this.addCustomerForm?.get('quard_wag')?.patchValue(truck.rate);
      }
      else {
        this.addCustomerForm?.get(truck.name)?.patchValue(truck.rate);
      }
    });


    this.addCustomerAddressForm?.get('city')?.patchValue('');
    this.addCustomerAddressForm?.get('country')?.patchValue('');
    this.addCustomerAddressForm?.get('province')?.patchValue('');
    this.addCustomerAddressForm?.get('address')?.patchValue('');
    this.addCustomerAddressForm?.get('post_code')?.patchValue('');
    this.ADDCustomerAddress = '';
    this.country = '';
  }
  handleAddCustomer() {
    this.errorEmail = '';
    this.errorName = '';
    this.errorCompanyName = '';
    this.errorCustomerAddAddress = '';
    let errors = false;
    this.custom_truck_rates = [];

    const trucks = [
      { name: 'Single', type: 'TRUCK', rate: 100 },
      { name: 'Tandem', type: 'TRUCK', rate: 110 },
      { name: 'Tridem', type: 'TRUCK', rate: 120 },
      { name: 'Quard-Axle', type: 'TRUCK', rate: 140 },
      { name: 'Pony', type: 'TRAILER', rate: 100 },
      { name: 'Tri Pony', type: 'TRAILER', rate: 110 },
      { name: 'Quad (wagon)', type: 'TRAILER', rate: 120 },
      { name: 'Transfer', type: 'TRAILER', rate: 120 }
    ];

    trucks.forEach(truck => {
      if (truck.name == 'Quard-Axle') {
        const rate = this.addCustomerForm.get('quard')?.value;
        if (rate !== '' && rate != undefined) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else if (truck.name == 'Tri Pony') {
        const rate = this.addCustomerForm.get('tri_pony')?.value;
        if (rate !== '' && rate != undefined) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else if (truck.name == 'Quad (wagon)') {
        const rate = this.addCustomerForm.get('quard_wag')?.value;
        if (rate !== '' && rate != undefined) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else {
        // this.addCustomerForm?.get(truck.name)?.patchValue(truck.rate);
        const rate = this.addCustomerForm.get(truck.name)?.value;
        if (rate !== '' && rate != undefined) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
    });

    if (this.custom_truck_rates.length > 0) {
      this.addCustomerForm.get('Custom_truck_trailer_rates_list')?.patchValue(this.custom_truck_rates);
    }


    if (this.addCustomerForm.get('full_name')?.value == '') {
      this.errorName = 'Contact person name is required';
    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.addCustomerForm.get('email')?.value)) {
      this.errorEmail = 'Enter a valid email';
      errors = true;
    }
    if (this.addCustomerForm.get('email')?.value == '') {
      this.errorEmail = 'Email is reqiured';
    }


    if (this.addCustomerForm.get('contact_number')?.value == '') {
    }

    if (this.addCustomerForm.get('contact_number')?.value !== undefined && this.addCustomerForm.get('contact_number')?.value != null && this.addCustomerForm.get('contact_number')?.value != '') {
      let a = this.addCustomerForm.get('contact_number')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.add_cust_phoneError = 'Phone is invalid';
        errors = true;
      }
    }

    if (this.addCustomerForm.get('company_name')?.value == '') {
      this.errorCompanyName = 'Company name is reqiured';
    }
    if (this.addCustomerForm.get('city')?.value == '' || this.addCustomerForm.get('country')?.value == '' || this.addCustomerForm.get('province')?.value == '') {
      this.errorCustomerAddAddress = 'Address is reqiured';
    }

    if (this.addCustomerForm.invalid || errors) {
      return;
    }
    if (this.Add_companyContacts) {
      this.addCustomerForm.get('Contacts')?.patchValue(this.Add_companyContacts);
    }
    this.is_loading_add_customer = true;
    this.trucking_service.saveCustomer(this.addCustomerForm.value).subscribe(response => {

      this.is_loading_add_customer = false;
      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';
        this.errorCompanyName = response.data.company_name ? response.data.company_name : '';
        return;
      } else {

        this.addCustomerForm.reset();
        this.addCustomerForm.get('trucking_company_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
        this.addCustomerForm.get('account_type')?.patchValue('Customer');
        this.is_loading_add_customer = false;
        this.getAllTCCustomers();

        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Customer Added Successfully!`
          }
        ).then(() => {
          this.closeAddCustomerModal();
        });
        $('#addCustomer').modal('toggle');
      }
    });

  }

  reset_errors_msgs() {
    this.EC_errorName = '';
    this.EC_errorEmail = '';
    this.EC_errorPhone = '';
    this.EC_errorCompanyName = '';
    this.EC_errorCustomerAddress = '';
    this.custom_truck_rates = [];

  }
  handleEditCustomer() {
    let errors = false;

    this.reset_errors_msgs();



    const trucks = [
      { name: 'Single', type: 'TRUCK', rate: 100 },
      { name: 'Tandem', type: 'TRUCK', rate: 110 },
      { name: 'Tridem', type: 'TRUCK', rate: 120 },
      { name: 'Quard-Axle', type: 'TRUCK', rate: 140 },
      { name: 'Pony', type: 'TRAILER', rate: 100 },
      { name: 'Tri Pony', type: 'TRAILER', rate: 110 },
      { name: 'Quad (wagon)', type: 'TRAILER', rate: 120 },
      { name: 'Transfer', type: 'TRAILER', rate: 120 }
    ];


    trucks.forEach(truck => {


      if (truck.name == 'Quard-Axle') {
        const rate = this.editCustomerForm.get('quard')?.value;
        if (rate !== '' && rate != undefined && rate !== null) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else if (truck.name == 'Tri Pony') {
        const rate = this.editCustomerForm.get('tri_pony')?.value;
        if (rate !== '' && rate != undefined && rate !== null) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else if (truck.name == 'Quad (wagon)') {
        const rate = this.editCustomerForm.get('quard_wag')?.value;
        if (rate !== '' && rate != undefined && rate !== null) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
      else {
        const rate = this.editCustomerForm.get(truck.name)?.value;
        if (rate !== '' && rate != undefined && rate !== null) {
          this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
        }
      }
    });

    if (this.custom_truck_rates.length > 0) {
      this.editCustomerForm.get('Custom_truck_trailer_rates_list')?.patchValue(this.custom_truck_rates);
    }

    this.editCustomerAddressVisible = false;
    if (this.editCustomerForm.get('city')?.value == '' || this.editCustomerForm.get('country')?.value == '' || this.editCustomerForm.get('province')?.value == '') {

      this.EC_errorCustomerAddress = 'Address is reqiured';
      this.editCustomerAddressVisible = true;
      errors = true;
    } else {

    }
    if (this.editCustomerForm.get('full_name')?.value == '') {
      this.EC_errorName = 'Contact person name is required';
      errors = true;
    }

    if (this.editCustomerForm.get('contact_number')?.value !== undefined && this.editCustomerForm.get('contact_number')?.value != null && this.editCustomerForm.get('contact_number')?.value != '') {
      let a = this.editCustomerForm.get('contact_number')?.value;
      a = a.replace(')', '')
      a = a.replace(/\s+/g, '')
      a = a.replace('+', '')
      a = a.replace('(', '')

      if (a.length < 11) {
        this.EC_errorPhone = 'Phone is invalid';
        errors = true;
      }
    }





    if (this.editCustomerForm.get('email')?.value == '') {
      this.EC_errorEmail = 'Email is reqiured';
      errors = true;

    }

    if (!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.editCustomerForm.get('email')?.value)) {
      this.EC_errorEmail = 'Enter a valid email';
      errors = true;
      return;
    }


    if (this.editCustomerForm.get('company_name')?.value == '') {
      this.EC_errorCompanyName = 'Company name is reqiured';
      errors = true;

    }

    console.log(this.editCustomerForm.value, this.editCustomerForm.invalid);

    if (this.editCustomerForm.invalid || errors) {
      return;
    }


    this.is_loading_edit_customer = true;
    let data: any = this.editCustomerForm.value
    data.tc_customer = this.edit_customer?.open_paper_ticket_photo ? 'NO' : "YES";
    this.trucking_service.updateCustomer(this.editCustomerForm.value).subscribe(response => {

      this.is_loading_edit_customer = false;
      if (response && !response.status) {
        this.errorEmail = response.data.email ? response.data.email : '';
        this.errorName = response.data.name ? response.data.name : '';
        this.errorCompanyName = response.data.company_name ? response.data.company_name : '';
        return;
      } else {

        this.editCustomerForm.reset();
        this.editCustomerForm.get('trucking_company_id')?.patchValue(this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
        this.editCustomerForm.get('account_type')?.patchValue('Customer');
        this.is_loading_edit_customer = false;
        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `success`,
            text:
              `Customer Updated Successfully!`
          }
        ).then(() => {
          this.getAllTCCustomers();
          this.closeEditCustomerModal();
        });
      }
    });

  }

  handleRemoveContact(id: any) {
    this.removing_contact_loading = true;
    Swal.fire({
      title: 'Do you want to delete this user?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('delete_id', id);
        this.contact_service.removeContacts(formData).subscribe((response: any) => {
          this.removing_contact_loading = false;
          if (response && response.status && response.message) {


            Swal.fire({
              title: response.message,
              showCancelButton: false,
              confirmButtonText: 'Ok',
              denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
            });
            this.getCustomerContacts(this.edit_company)

          } else {
            Swal.fire(

              {
                confirmButtonColor: '#17A1FA',
                title:
                  'Error!',
                text:
                  'Unable to delete!'
              }
            )

          }
        });

      }
    })
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
  getCompanyContacts(customer: any, flag: any = 1) {
    const formData = new FormData();
    if (customer && customer?.id) {
      let tc_company = 'NO';
      if (customer?.open_paper_ticket_photo) {
        tc_company = 'NO';
      } else {
        tc_company = 'YES';
      }
      formData.append('tc_company', tc_company);
      formData.append('company_id', customer.id);
    }
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    this.contact_service.getContacts(formData).subscribe(response => {
      if (response.status && response.contacts) {
        this.companyContacts = response.contacts;

      } else {

      }
    })
  }
  getCompanyTruckTrailer(customer: any) {
    const formData = new FormData();
    if (customer && customer?.id) {

      formData.append('company_id', customer.id);
    }
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    this.contact_service.getTrucks_Trailers(formData).subscribe(response => {
      if (response.status && response.contacts && response.contacts.length > 0) {
        this.companyTrucks_Trailers = response.contacts;

        const trucks = [
          { name: 'Single', type: 'TRUCK', rate: 100 },
          { name: 'Tandem', type: 'TRUCK', rate: 110 },
          { name: 'Tridem', type: 'TRUCK', rate: 120 },
          { name: 'Quard-Axle', type: 'TRUCK', rate: 140 },
          { name: 'Pony', type: 'TRAILER', rate: 100 },
          { name: 'Tri Pony', type: 'TRAILER', rate: 110 },
          { name: 'Quad (wagon)', type: 'TRAILER', rate: 120 },
          { name: 'Transfer', type: 'TRAILER', rate: 120 }
        ];

        this.companyTrucks_Trailers.map((item: any) => {

          trucks.forEach(truck => {
            if (item.name == truck.name && item.rate) {

              if (item.name == 'Quard-Axle') {
                this.editCustomerForm?.get('quard')?.patchValue(item.rate);
              }
              else if (item.name == 'Tri Pony') {
                this.editCustomerForm?.get('tri_pony')?.patchValue(item.rate);
              }
              else if (item.name == 'Quad (wagon)') {
                this.editCustomerForm?.get('quard_wag')?.patchValue(item.rate);
              }
              else {
                this.editCustomerForm?.get(item.name)?.patchValue(item.rate);

              }
            }

          });

        })

        trucks.forEach(truck => {
          let itm: any;


          if (truck.name == 'Quard-Axle') {
            itm = this.editCustomerForm?.get('quard')?.value;
          }
          else if (truck.name == 'Tri Pony') {
            itm = this.editCustomerForm?.get('tri_pony')?.value;
          }
          else if (truck.name == 'Quad (wagon)') {
            itm = this.editCustomerForm?.get('quard_wag')?.value;
          }
          else {
            itm = this.editCustomerForm?.get(truck.name)?.value;
          }
          if (itm != '' && itm != null) {
          }
          else {
            if (truck.name == 'Quard-Axle') {
              this.editCustomerForm?.get('quard')?.patchValue(truck.rate);
            }
            else if (truck.name == 'Tri Pony') {
              this.editCustomerForm?.get('tri_pony')?.patchValue(truck.rate);
            }
            else if (truck.name == 'Quad (wagon)') {
              this.editCustomerForm?.get('quard_wag')?.patchValue(truck.rate);
            }
            else {
              this.editCustomerForm?.get(truck.name)?.patchValue(truck.rate);

            }
          }

        });

      } else {

        const trucks = [
          { name: 'Single', type: 'TRUCK', rate: 100 },
          { name: 'Tandem', type: 'TRUCK', rate: 110 },
          { name: 'Tridem', type: 'TRUCK', rate: 120 },
          { name: 'Quard-Axle', type: 'TRUCK', rate: 140 },
          { name: 'Pony', type: 'TRAILER', rate: 100 },
          { name: 'Tri Pony', type: 'TRAILER', rate: 110 },
          { name: 'Quad (wagon)', type: 'TRAILER', rate: 120 },
          { name: 'Transfer', type: 'TRAILER', rate: 120 }
        ];

        trucks.forEach(truck => {
          if (truck.name == 'Quard-Axle') {
            this.editCustomerForm?.get('quard')?.patchValue(truck.rate);
          }
          else if (truck.name == 'Tri Pony') {
            this.editCustomerForm?.get('tri_pony')?.patchValue(truck.rate);
          }
          else if (truck.name == 'Quad (wagon)') {
            this.editCustomerForm?.get('quard_wag')?.patchValue(truck.rate);
          }
          else {
            this.editCustomerForm?.get(truck.name)?.patchValue(truck.rate);

          }

        });
      }
    })
  }

  setEditCountry(event: any) {
    if (event && event.target.value) {
      this.edit_country = event.target.value;
      this.country = event.target.value;
    }
  }
  setEditCustomer(event: any) {
    if (event && event.target.value) {
      this.edit_country = event.target.value;
      this.country = event.target.value;
    }
  }
  setEditCustomerCountry(event: any) {
    if (event && event.target.value) {
      this.edit_customer.country = event.target.value;
    }
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

  changeNumber(event: any, type: any) {

    let p: string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    // let abc= this.formatPhoneNumber(p);
    let abc = type == '1' ? this.formatbusinessNumber(p) : this.formatPhoneNumber(p);

    if (type == 'add') {

      this.addContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'Customer_add') {

      this.editCustomerContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'Edit_Customer_contact') {

      this.editComp_ContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'Comp_Customer_add') {

      this.addCompanyContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == '1') {

      this.editVendor.get('business_no')?.patchValue(abc);
    }
    else if (type == 'add-cus') {

      this.editContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'add-company') {

      this.addCustomerContactForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'edit-cus') {

      this.editCustomerForm.get('phone')?.patchValue(abc);
    }
    else if (type == 'edit_customer') {

      this.editCustomerForm.get('contact_number')?.patchValue(abc);
    }
    else if (type == 'add_customer') {

      this.addCustomerForm.get('contact_number')?.patchValue(abc);
    }
    else if (type == 'edit') {

      this.editContactForm.get('phone')?.patchValue(abc);
    }
  }

  formatbusinessNumber(input: any): string {
    input = input.replace(/\D/g, '');

    input = input.substring(0, 10);

    let part1, part2, part3;

    const size = input.length;
    if (size < 4) {
      part1 = input;
      return part1;
    } else if (size < 8) {
      part1 = input.substring(0, 3);
      part2 = input.substring(3, 7);
      return `${part1}-${part2}`;
    } else {
      part1 = input.substring(0, 3);
      part2 = input.substring(3, 7);
      part3 = input.substring(7, 10);
      return `${part1}-${part2}-${part3}`;
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


  searchBy(search_by: any) {
    if (search_by) {
      this.search_by = search_by;

      this.getAllTCCompanies();
      return;
    }
    this.search_by = '';
    this.getAllTCCompanies();
  }
  searchBy2(search_by: any) {
    if (search_by) {
      this.search_by2 = search_by;

      this.getAllTCCustomers();
      return;
    }
    this.search_by2 = '';
    this.getAllTCCustomers();
  }

  setSortBy(sortBy: any) {
    if (sortBy) {
      $('.input-popup-div3').hide();


      this.sort_by = sortBy;
      setTimeout(() => {

        $(".add-comp").hide();
      }, 700);
      this.getAllTCCompanies();
      return;
    }
    $('.input-popup-div3').hide();

    this.sort_by = 'recently_invited';
    this.getAllTCCompanies();
  }
  setSortByCust(sortBy: any) {
    if (sortBy) {

      this.cust_sort_by = sortBy;

      $('.input-popup-div4').hide();

      setTimeout(() => {

        $(".add-comp2").hide();
      }, 700);
      this.getAllTCCustomers();
      return;
    }
    this.cust_sort_by = 'customer_name';

    $('.input-popup-div4').hide();

    this.getAllTCCustomers();
  }
}
