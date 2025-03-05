import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AnyForUntypedForms } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { TicketService } from 'src/app/services/ticket.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-tc-add-bill',
  templateUrl: './tc-add-bill.component.html',
  styleUrls: ['./tc-add-bill.component.css']
})
export class TcAddBillComponent implements OnInit {

  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;
  loggedinUser: any = {};
  addInvoiceForm!: FormGroup;
  inviteTCForm!: FormGroup;
  inviteTCfull_nameError: string = '';
  inviteTCEmailError: string = '';

  @Output() listing = new EventEmitter<string>();
  @Output() getBillings = new EventEmitter<string>();
  @Input('all_companies') all_companies: any;
  todayDate: any;
  loading: string = '';
  gst: any = null;
  user_id: any = null;
  is_tc_loading: boolean = false;
  set_company: any = null;
  isFormClicked: boolean = false;
  select_duration_type: any = 'Monthly';
  default_duration_type: any = 'Monthly';
  maxDate: any = null;
  minDate: any = null;
  constructor(
    private invoice_service: InvoiceService,
    private customer_service: CustomerService,
    private trucking_service: TruckingCompanyService,
    private router: Router,
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private datePipe: DatePipe,
    private user_service: UserDataService,
    private freelance_driver: FreelanceDriverServiceService
  ) { }

  ngOnInit(): void {

    this.backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;

    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;
    this.inviteTCForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
    });
    this.default_duration_type = this.loggedinUser?.driver_duration;
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
    this.select_duration_type = this.loggedinUser?.driver_duration;
    this.addInvoiceForm = this.fb.group({
      invoice_number: ['', Validators.required],
      invoice_date: ['', Validators.required],
      due_date: [''],
      invoice_by_id: ['', Validators.required],
      invoice_by_email: [''],
      invoice_by_address: [''],
      invoice_by_bussiness_no: ['', Validators.required],
      invoice_by_wsno: ['', Validators.required],
      hours: [''],
      rounds: [''],
      subtotal: [''],
      tax: [''],
      invoice_start_date: [''],
      invoice_end_date: [''],
      invoice_period_type: [''],
      total: ['', Validators.required],
      notes: [''],
    });

    this.getUserGST(this.user_id);
  }

  handleAddBill() {
    this.isFormClicked = true;
    if (this.addInvoiceForm.invalid) {
      return;
    }
    this.loading = 'add';
    let formData: any = this.addInvoiceForm.value;
    formData.invoice_for_id = this.user_id;
    formData.user_id = this.user_id;
    formData.tax_percentage = this.gst.tax;
    this.invoice_service.addCustomBill(formData).subscribe(response => {
      this.loading = '';
      this.isFormClicked = false;
      if (response.status && response.message) {
        this.addInvoiceForm.reset();

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
        $("#modal-addbill").toggle('hide')
        $(".modal-backdrop").hide();
        $('.modal-backdrop').removeClass('show');

        $('body').removeClass('modal-open');

        $('.modal-backdrop').addClass('hide');

        this.getBillings.emit()
      } else {

        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Error`,
            text:
              response.message
          }
        ).then(() => {

        });
      }
    })
  }

  handleInvoiceDate(event: any) {
    if (event.target.value) {
      var s_date = new Date(event.target.value);
      let tz = environment.timeZone;
      let days = 30;
      if (this.select_duration_type == 'Weekly') {
        days = 7;

      } if (this.select_duration_type == 'Semi-Monthly') {
        days = 14;

      }
      var e_date = new Date(new Date().setDate(s_date.getDate() + days));
      var start_date = s_date.toLocaleString('en-US', { timeZone: tz });
      let end_date = e_date.toLocaleString('en-US', { timeZone: tz });
      this.maxDate = end_date;
      this.minDate = start_date;
      this.addInvoiceForm.get('invoice_start_date')?.patchValue(start_date);
      this.addInvoiceForm.get('invoice_end_date')?.patchValue(end_date);
      console.log(start_date, end_date)
    }
  }


  setCompany(comp: any) {
    this.set_company = comp;
    if (comp?.id) {
      this.addInvoiceForm.get('invoice_by_id')?.patchValue(comp?.id);
      this.addInvoiceForm.get('invoice_by_email')?.patchValue(comp?.email);
      this.addInvoiceForm.get('invoice_by_address')?.patchValue(comp?.address);
    }
    $(".selectlist-options-tc").hide();
    this.getUserGST(comp?.id);
  }

  getUserGST(user_id: any) {
    const formData = new FormData();
    formData.append('user_id', user_id);
    this.user_service.getUserTax(formData).subscribe(response => {
      if (response.status && response.gst) {
        this.gst = response?.gst;
      } else {

      }
    })
  }

  changeSubtotal(event: any) {
    if (event.target.value) {
      let subtotal = event.target.value;
      let tax: any = '';
      if (parseFloat(subtotal) > 0) {
        tax = (parseFloat(this.gst.tax) * parseFloat(subtotal)) / 100;
      }
      console.log(this.gst.tax, subtotal)

      this.addInvoiceForm.get('tax')?.patchValue(parseFloat(tax.toString()).toFixed(2));
      this.reCalculate(event)
    }
  }

  reCalculate(event: any) {
    let subtotal = this.addInvoiceForm.get('subtotal')?.value;

    let tax = this.addInvoiceForm.get('tax')?.value;
    if (subtotal || tax) {
      var total = parseFloat(tax) + parseFloat(subtotal);

      this.addInvoiceForm.get('total')?.patchValue(total.toFixed(2));
    }
  }


  getAllCompanies() {

    const formData = new FormData();
    formData.append('user_id', this.user_id);
    this.customer_service.getCustomerCompanies(formData).subscribe(response => {

      if (response.status && response.data) {
        this.all_companies = response.data ? response.data : null;
        console.log(this.all_companies)
      } else {
      }
    })
  }


  onInviteTC() {
    this.inviteTCfull_nameError = '';
    this.inviteTCEmailError = '';

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
          this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
          this.is_tc_loading = false;
        }

        return;
      } else {

        this.inviteTCForm.reset();
        this.getAllCompanies();
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

          });
        $(".modal-backdrop").remove();
        $('#newInvTC').modal('toggle');
      }
    });

  }

  handleFilterByDuration(d: any) {
    if (d) {
      this.select_duration_type = d;
      var s_date = new Date(this.minDate);
      console.log(s_date)
      let tz = environment.timeZone;
      let days = 30;
      if (this.select_duration_type == 'Weekly') {
        days = 7;

      } if (this.select_duration_type == 'Semi-monthly') {
        days = 14;

      }
      var e_date = new Date(new Date().setDate(s_date.getDate() + days));
      var start_date = s_date.toLocaleString('en-US', { timeZone: tz });
      let end_date = e_date.toLocaleString('en-US', { timeZone: tz });
      this.maxDate = e_date;
      this.minDate = s_date;
      this.addInvoiceForm.get('invoice_start_date')?.patchValue(start_date);
      this.addInvoiceForm.get('invoice_end_date')?.patchValue(end_date);
    }
  }
  getMenuCounts() {
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  markDefaultDuration(event: any, duration: any) {
    if (event.target.checked) {
      duration = duration;
    } else {
      duration = '';
    }
    var filter = {
      id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
    }
    let data = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      record_name: 'update_driver_duration',
      filter: filter,
      data: {
        driver_duration: duration
      }
    }

    this.freelance_driver.updateFreelancerData(data).subscribe(response => {

      if (response.status) {
        this.select_duration_type = duration;
        this.loggedinUser.driver_duration = duration;
        localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));

      }
    });
  }
  parseMaxDate(d: any) {
    let tz = environment.timeZone;
    var dd = new Date(d);
    var samp_date = dd.toLocaleString('en-US', { timeZone: tz });
    this.maxDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
  }

  parseMinDate(d: any) {
    let tz = environment.timeZone;
    var dd = new Date(d);
    var samp_date = dd.toLocaleString('en-US', { timeZone: tz });
    this.minDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
  }
}
