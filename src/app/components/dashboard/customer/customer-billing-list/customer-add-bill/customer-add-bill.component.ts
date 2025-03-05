import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AnyForUntypedForms } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-customer-add-bill',
  templateUrl: './customer-add-bill.component.html',
  styleUrls: ['./customer-add-bill.component.css']
})
export class CustomerAddBillComponent implements OnInit {

  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;
  loggedinUser: any = {};

  @Output() listing = new EventEmitter<string>();
  @Output() getBillings = new EventEmitter<string>();
  @Input('all_companies') all_companies: any;
  todayDate: any;
  loading: string = '';
  gst: any = null;
  isFormClicked: boolean = false;
  user_id: any = null;
  set_company: any = null;
  current_modal: string = '';
  addInvoiceForm!: FormGroup;
  constructor(
    private invoice_service: InvoiceService,
    private freelance_driver: FreelanceDriverServiceService,
    private router: Router,
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private datePipe: DatePipe,
    private user_service: UserDataService
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
      invoice_period_type: ['Monthly'],
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
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message)
        this.getBillings.emit()
        $("#modal-addbill").modal('hide')
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Error', response.message)
      }
    })
  }

  handleInvoiceDate(event: any) {
    if (event.target.value) {
      var s_date = new Date(event.target.value);
      let tz = environment.timeZone;
      var e_date = new Date(new Date().setDate(s_date.getDate() + 30));
      var start_date = s_date.toLocaleString('en-US', { timeZone: tz });
      let end_date = e_date.toLocaleString('en-US', { timeZone: tz });

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


  showModal(modal: any) {

    this.current_modal = modal;
    $("#modal-addbill").toggle('modal');
  }

  setActive(type: any) {


    this.listing.emit();
    // this.getDataListing()
  }

}
