import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-freelance-manage-tc',
  templateUrl: './freelance-manage-tc.component.html',
  styleUrls: ['./freelance-manage-tc.component.css']
})
export class FreelanceManageTcComponent implements OnInit {
  loggedinUser:any=null;
  date_today:any=null;
  active_menu:any;
  is_loading:any='';
  date:any=null;

  is_default:any=false;
  form_clicked:boolean=false;
  inviteTC!: FormGroup;

  trucking_companies:any=null;
  company_detail:any=null;
  hour_rate:any='';
  total_approved_ticket_count:any=null;
  contact_detail:any=null;

  canada_provinces:any=[];
  usa_provinces:any=[];
  province: string = '';
  country:any='Canada';

  addTC!: FormGroup;
  editAddress!:FormGroup;
  addContact!: FormGroup;
  editContact!: FormGroup;


  show_edit_address: boolean = false;
  show_edit_contact: boolean = false;
  show_add_contact:boolean=false;

  constructor(
    private router: Router,

    private freelance_driver:FreelanceDriverServiceService,
    private fb : FormBuilder,
  ) {
    this.active_menu = {
      parent:'settings',
      child:'settings',
      count_badge: '',
    }

    this.canada_provinces=[
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

    this.usa_provinces=[
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
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;

    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });

    let cDay = d.getDate();
    let cMonth = d.getMonth() + 1;
    let cYear = d.getFullYear();
    this.date = cDay + "-" + cMonth + "-" + cYear ;

    $(document).on('click','.btnremove', function(this:any) {
        $(this).closest('.modal-div').find('.delete-modal').toggle('slow');
    });
    $(document).on('click','.btnremove1', function(this:any) {
      $(this).closest('.modal-div1').find('.delete-modal1').toggle('slow');
  });

    $(document).on('click','.btnaction', function(this:any) {
        $(this).closest('.delete-modal').hide();
    });

    $(document).on('click','.btnaction1', function(this:any) {
      $(this).closest('.delete-modal1').hide();
  });




    $(document).on('click','.btnselectlist', function(this:any) {
        $(this).closest('.selectdiv').find('.selectlistdiv').toggle('slow');
    });
    $(document).on('click','.selectlistitems li', function(this:any) {
        $(this).closest('.selectdiv').find('.selectlistdiv').hide();
        $(this).closest('.selectdiv').find('.selectlistname').html($(this).html());
    });



    this.inviteTC = this.fb.group({
      company_name: ['', Validators.required],
      contact_name: ['', Validators.required],
      contact_email: ['', Validators.required],
      // contact_number: [''],

    });

    this.addContact = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: [''],
      role: [''],
    });

    this.editContact = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: [''],
      role: [''],
    });


    this.addTC = this.fb.group({
      company_name: ['', Validators.required],
      is_default: [''],
      street: [''],
      city: [''],
      province: [''],
      postal_code: [''],
      hour_rate: [''],
      contact_name: ['', Validators.required],
      contact_phone: ['', Validators.required],
      contact_email: [''],
      role: [''],

    });

    this.editAddress = this.fb.group({
      street: [''],
      city: [''],
      country: ['', Validators.required],
      province: ['', Validators.required],
      postal_code: [''],
    });

    if (this.company_detail) {
      this.editAddress.patchValue({
        street: this.company_detail.street,
        city: this.company_detail.city,
        country: this.company_detail.country,
        province: this.company_detail.province,
        postal_code: this.company_detail.postal_code
      });
    }

    this.getData();


  }

  setContactRole(role:any =null){
    if(this.contact_detail.role && role){
      this.contact_detail.role =role;
      this.editContact.get('role')?.patchValue(role);
    }
  }

  setContact(contact:any){
    this.contact_detail=contact;
    this.editContact.get('name')?.patchValue(this.contact_detail?.name);
    this.editContact.get('contact_number')?.patchValue(this.contact_detail?.contact_number);
    this.editContact.get('email')?.patchValue(this.contact_detail?.email);
    this.editContact.get('role')?.patchValue(this.contact_detail?.role);
  }

  toggleEditAddress() {

    // this.show_edit_address = !this.show_edit_address;

  }
  getData(){
    var formData={
      freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
    }
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_trucking_company_list',
      filter: formData
    }

    this.is_loading='freelance_trucking_company_list';
    this.freelance_driver.getFreelancerDetail(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        this.trucking_companies= response.data;
        if(this.company_detail?.id!=''){
          this.trucking_companies.map((item:any)=>{
            if(item.id==this.company_detail?.id){

              this.company_detail= item;
              this.hour_rate=item?.hour_rate;
              this.is_default = item?.is_default;
              this.total_approved_ticket_count = this.company_detail?.total_approved_ticket_count;
            }
          })
        }
      }
    });
  }

  setDetail(detail:any){
    this.company_detail = detail;
    this.is_default = this.company_detail?.is_default;
    this.hour_rate = this.company_detail?.hour_rate;
    this.total_approved_ticket_count = this.company_detail?.total_approved_ticket_count;

  }

  closeChildModals() {
    this.show_add_contact = false;
    this.show_edit_address = false;
    this.show_edit_contact = false;

  }
  closeremoveModal() {
    this.show_edit_address = false;
  }



  onSaveInvite(){
    if(this.inviteTC.invalid){
      this.form_clicked=true;
      return;
    }
    this.is_loading='invite_tc';
    let formData:any=this.inviteTC.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'invite_freelance_trucking_company',
      data: formData
    }

    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Invitation sent.'
        );

        this.getData();
        this.form_clicked=false;
        this.inviteTC.reset()
      }
    });

  }

  changeNumberContact(event:any,type:any){
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    if(type=='edit-contact'){
      this.editContact.get('contact_number')?.patchValue(abc);
    }else if(type=='add-contact'){
      this.addContact.get('contact_number')?.patchValue(abc);
    }else if(type=='add-tc'){
      this.addTC.get('contact_phone')?.patchValue(abc);
    }

  }
  setAddTCRole(role:any){
    if(role && role !=null && role !==''){
      this.addTC.get('role')?.patchValue(role);
    }
  }

  setRoleAdd(role:any){
    if(role && role !=null && role !==''){
      this.addContact.get('role')?.patchValue(role);
    }
  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.inviteTC.get('contact_number')?.patchValue(abc);
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

  deleteCompany(id:any){
    this.is_loading='invite_tc';
    let formData:any={id:id};

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_trucking_company',
      filter: formData
    }
    this.is_loading='deleting_company';
    this.freelance_driver.deleteFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company deleted.'
        );
        this.company_detail=null;
        this.hour_rate='';
        this.is_default='';
        this.getData();
        $(".modal-backdrop").hide();
        $('#myModalEditCompany').modal('hide');
        setTimeout(() => {
          $(".modal-backdrop").remove();

        this.company_detail=null;
          $('#myModalEditCompany').modal('hide');
        }, 399);
      }
    });
  }

  changeIsDefault(event:any){
    if(event.target.checked == true){
      this.is_default=true;
    }else if(event.target.checked == false){
      this.is_default=false;
    }
  }

  setHourRate(event:any){

    if(event.target?.value && event.target?.value){
      this.hour_rate = event.target?.value;
    }
  }

  handleUpdateCompany(){
    this.is_loading='invite_tc';
    let formFilter:any={id:this.company_detail?.id};
    let formData:any={
      hour_rate: this.hour_rate,
      is_default: this.is_default
    };

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_trucking_company',
      filter: formFilter,
      data:formData
    }
    this.is_loading='updating_company';
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company updated.'
        );

        this.getData();
      }

      $(".modal-backdrop").remove();
      $("#myModalEditContact").modal('hide')

    });
  }

  onEditContact(){
    if(this.editContact.invalid){
      this.form_clicked= true;
      return;
    }
    let formData:any=this.editContact.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    formData.freelance_trucking_company_id = this.company_detail?.id;
    let formFilter:any={id:this.contact_detail?.id}
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'contact',
      data: formData,
      filter:formFilter
    }
    this.form_clicked= false;
    this.is_loading='editing_contact';
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status ){
        this.getData();
        $("#myModalEditContact").modal('hide')
      }
    });
    console.log(this.editContact.value)
  }

  setCountry(event: any) {
    if (event.target.value) {
      this.country = event.target.value;
    }

  }
  onEditAddress() {
    if (this.editAddress.valid) {
      const addressData = this.editAddress.value;

      // Use the selected company's id instead of the logged-in user's id
      const companyId = this.company_detail?.id;

      if (!companyId) {
        Swal.fire('Error', 'Company ID is missing', 'error');
        return;
      }

      this.freelance_driver.updateAddress(companyId, addressData).subscribe({
        next: (response) => {
          console.log('Response:', response);
          if (response.status) {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn bg-pink width-200'
              },
              buttonsStyling: false
            });

            swalWithBootstrapButtons.fire(
              'Success',
              'Address Updated.',
              'success'
            );
            this.company_detail = { ...this.company_detail, ...addressData };
            this.getData();
             // Close the modal

        $(".modal-backdrop").remove();
          $('#myModalEditAddress').css({display:'none'}); // Us
          setTimeout(() => {

            $("#myModalEditAddress").toggle()
            $("#myModalEditAddress").css({display:"none"})
          }, 200);


          }
        },
        error: (error) => {
          console.log('Error:', error);
          Swal.fire('Error', 'Failed to update address.', 'error');
        }
      });

      console.log('Address Data:', this.editAddress.value);
    }
  }


  onAddContact(){
    if(this.addContact.invalid){
      this.form_clicked= true;
      return;
    }

    let formData:any=this.addContact.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    formData.freelance_trucking_company_id = this.company_detail?.id;

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'contact',
      data: formData
    }
    this.form_clicked= false;
    this.is_loading='adding-contact';
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status ){
        this.addContact.reset()
        this.getData();
        $(".modal-backdrop").remove();
        $("#myModalAddContact").toggle('modal')
      }
    });
    console.log(this.addContact.value)
  }

  onAddTC(){
    if(this.addTC.invalid){
      this.form_clicked= true;
      return;
    }
    this.is_loading='adding_tc';
    this.form_clicked= false;

    console.log(this.addTC.value)
    let formData:any=this.addTC.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_trucking_company',
      data: formData
    }
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company added.'
        );
        this.contact_detail=null;
        this.company_detail=null;
        this.getData();
        $(".modal-backdrop").remove();
        $('#myModalAddCompany').modal('toggle');
      }
    });
  }

  deleteContact(id:any){
    let formData:any={id:id,freelance_trucking_company_id:this.company_detail?.id};

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'contact',
      filter: formData
    }
    this.is_loading='deleting_contact';
    this.freelance_driver.deleteFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Contact deleted.'
        );
        this.contact_detail=null;
        this.getData();
        $(".modal-backdrop").remove();
        $('#myModalEditContact').modal('toggle');
      }
    });
  }

  setContactData(event:any,record:any,index:any){
    if(record=='email'){
      if(this.company_detail?.contacts){
        this.company_detail.contacts[index].email = event.target?.value;
      }
    }else if(record=='send_invoices'){
        if(this.company_detail?.contacts){
          this.company_detail.contacts[index].send_invoices = event.target?.checked == true ? true: false;
        }
    }
    console.log(this.company_detail?.contacts[index])
  }

  updateContacts(){

    let formData:any={contacts:this.company_detail.contacts};
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    formData.freelance_trucking_company_id = this.company_detail?.id;
    let formFilter:any={id:this.company_detail?.id}
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'update_contacts',
      data: formData,
      filter:formFilter
    }
    this.form_clicked= false;
    this.is_loading='update_contacts';
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status ){

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Contacts updated'
        );
        $(".modal-backdrop").remove();
        $("#myModalEditCompany").modal('hide');

        this.getData();
      }
    });
  }

  closeModal() {
    let modal = document.getElementById('invitePeople');
    if (modal) {
      (modal as any).classList.remove("show"); // Remove Bootstrap "show" class
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";

      // Remove backdrop manually
      let backdrops = document.getElementsByClassName("modal-backdrop");
      for (let i = 0; i < backdrops.length; i++) {
        backdrops[i].parentNode?.removeChild(backdrops[i]);
      }

      document.body.classList.remove("modal-open"); // Remove scrolling lock
    }
  }
  closeModal1() {
    // Close modal on Cancel button click
    $(".modal-backdrop").remove();
    $('#myModalEditAddress').toggle(); // Using Bootstrap's jQuery method to hide the modal
  }



}
