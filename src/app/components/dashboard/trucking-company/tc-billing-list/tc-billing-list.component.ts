import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import { TcApprovedPopupComponent } from '../tc-approved-popup/tc-approved-popup.component';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-tc-billing-list',
  templateUrl: './tc-billing-list.component.html',
  styleUrls: ['./tc-billing-list.component.css']
})
export class TcBillingListComponent implements OnInit {
  @ViewChild(TcApprovedPopupComponent) opUpObj: TcApprovedPopupComponent | undefined;

  active_menu: any;

  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;


  loggedinUser: any = {};

  billings: any = null;
  companies_list: any;

  selected_company: any = null;
  start_date: any = null;

  todayDate: any;
  ticketDetail: any;
  all_companies_list: any = null;

  unbilled_tickets: any = null;
  unbilled_tickets_data: any = null;
  loading: string = '';
  loading_bills: string = '';
  is_loading: string = '';
  user_id: any = null;
  is_downloading: boolean = false;
  total_rounds: any = 0;
  current_tab: any = 'billed';

  gst: any = null;
  billings_data: any = null;
  search_term_billed: string = '';
  search_term_unbilled: string = '';

  selected_monthly: string = '';
  selected_year: any;
  month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  selected_project: any = null;
  project_list: any = null;

  edited_invoice: any = null;

  constructor(
    private invoice_service: InvoiceService,
    private customer_service: CustomerService,
    private freelance_driver: FreelanceDriverServiceService,
    private router: Router,
    private aRouter: ActivatedRoute,
    private datePipe: DatePipe,
    private user_service: UserDataService
  ) {
    this.active_menu = {
      parent: 'business',
      child: 'billing-list',
      count_badge: '',
    }
  }

  ngOnInit(): void {
    this.backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;

    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
    this.start_date = this.todayDate;
    this.selected_year = d.getFullYear();
    this.ticketDetail = null;

    this.active_menu = {
      parent: 'business',
      child: 'tc-billing-list',
      count_badge: '',
    }

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id
    let t = sessionStorage.getItem('currentTCBillTab');
    this.current_tab = t ? t : 'billed';

    this.selected_company = '';

    this.getCompanies();

    this.getBillings();
    this.getMenuCounts();
    this.getUnbillTickets();

    this.getProjects()
    this.getAllCompanies();
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
    $('.btnselectlist').on('click', function (this: any) {
      $(this).closest('.selectdiv').find('.selectlistdiv').toggle('slow');
    });
    $('.selectlistitems li').on('click', function (this: any) {
      $(this).closest('.selectdiv').find('.selectlistdiv').hide();
      $(this).closest('.selectdiv').find('.selectlistname').html($(this).html());
    });
    $('.selectlist-input').on('click', function (this: any) {
      $(this).closest('.selectlist').find('.selectlist-options').toggle();
    });
    $('.selectlist-options .selectlist-option').on('click', function (this: any) {
      var value = $(this).data('value');
      $(this).closest('.selectlist-options').hide();
      $(this).closest('.selectlist').find('.selectlist-input-val').html(value);
    });

    $('.selectcontroldiv2').hide();
    var selectmonth = '';
    $('#select-month').on('click', function (this: any) {
      $('.selectcontroldiv2').show();
    });
    $('#select-month2').on('click', function (this: any) {
      $('.selectcontroldiv2').show();
    });
    $('.selectmonth ul li').on('click', function (this: any) {
      selectmonth = $(this).html();
      var month = $(this).data('month');
      $('.selectcontroldiv2').hide();

      $('.filter_date').val(selectmonth);

    });
    $(document).click(function (e: any) {
      var container = $(".selectcontroldiv2");
      var input = $(".selmonthtype");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if (!input.is(e.target) && input.has(e.target).length === 0) {
          container.hide();
        }
      }
    });
    $('.selectcontroldiv2 ul li').on('click', function (this: any) {
      $('.selectcontroldiv2').hide();
    });
  }

  getAllCompanies() {

    const formData = new FormData();
    formData.append('user_id', this.user_id);
    this.customer_service.getCustomerCompanies(formData).subscribe(response => {

      if (response.status && response.data) {
        this.all_companies_list = response.data ? response.data : null;
        console.log(this.all_companies_list)
      } else {
      }
    })
  }

  getProjects() {

    let is_tc_customer = this.selected_company?.trucking_company_id ? "YES" : "NO";

    let data: any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      customer_id: this.selected_company?.id ? this.selected_company?.id : null,
      is_tc_customer: is_tc_customer
    }
    this.invoice_service.getProjectsInvoices(data).subscribe(response => {
      if (response.status && response.data) {

        this.project_list = response.data?.projects;

      } else {

      }
    })
  }

  changeTab(tab: any) {
    if (tab) {
      this.current_tab = tab;
    }
  }

  setMonth(month: any) {

    $('.selectcontroldiv2').hide();
    this.selected_monthly = month;

    this.getBillings()

    this.getUnbillTickets()
  }

  decYear(year: any) {
    year = parseInt(year);
    year = --year;
    this.selected_year = year;
    $(".calendareyear").text(year)
  }

  incYear(year: any) {
    year = parseInt(year);
    year = ++year;
    this.selected_year = year;
    $(".calendareyear").text(year)

  }
  setCurrentTab(tab: any) {
    if (tab) {
      this.current_tab = tab;
      sessionStorage.setItem('currentTCBillTab', tab);
    }
  }

  handleSearchByBill(event: any) {

    this.search_term_billed = event.target.value;
    this.getBillings();

  }

  handleSearchByUnBill(event: any) {

    this.search_term_unbilled = event.target.value;
    this.getUnbillTickets()

  }

  getUnbillTickets() {

    if (this.search_term_unbilled == '') {
      this.loading = 'unbilled_tickets';
    }
    let formdata: any = {
      user_id: this.user_id,
      search_term: this.search_term_unbilled,
      project_id: this.selected_project?.id ? this.selected_project?.id : null,

      tc_project: this.selected_project?.trucking_company_id ? 'YES' : 'NO',
      trucking_company_id: this.selected_company ? this.selected_company?.id : null
    }

    if (this.selected_monthly != '' && this.selected_year != '') {
      formdata.filter_date = this.selected_monthly + ' ' + this.selected_year;
    }
    this.invoice_service.getUnbilledTickets(formdata).subscribe(response => {

      this.loading = '';
      if (response.status && response.data) {
        console.log("unbilled data -->", response.data.tickets, response.data.ticket_data)
        this.unbilled_tickets = response.data.tickets && response.data.tickets.length > 0 ? response.data.tickets : null;
        this.unbilled_tickets_data = response.data.ticket_data ? response.data.ticket_data : null;
      } else {
        this.unbilled_tickets = null;
      }
    })
  }

  getBillings() {

    if (this.search_term_billed == '') {
      this.loading_bills = 'billed_tickets';
    }
    var formData: any = {
      user_id: this.user_id,
      trucking_company_id: this.selected_company?.id ? this.selected_company?.id : null,
      project_id: this.selected_project?.id ? this.selected_project?.id : null,

      tc_project: this.selected_project?.trucking_company_id ? 'YES' : 'NO',
      tc_company: 'NO',
      search_term: this.search_term_billed
    }
    if (this.selected_monthly != '' && this.selected_year != '') {
      formData.filter_date = this.selected_monthly + ' ' + this.selected_year;
    }



    this.invoice_service.getBillings(formData).subscribe(response => {
      this.loading_bills = '';
      if (response.status && response.data) {
        this.billings = response.data && response.data.billings.length > 0 ? response.data.billings : null;
        this.billings_data = response.data.billings_data ? response.data.billings_data : null;
      } else {
        this.billings = null;
        this.billings_data = null;
      }
    })
  }


  getMenuCounts() {
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  parseDriverTime(hour: any, mints: any) {
    var total_time = 0;
    let h = 0;
    if (parseFloat(mints)) {
      h += parseFloat(mints) / 60;
    }
    if (parseFloat(hour)) {
      h += parseFloat(hour);
    }

    total_time = h;

    return total_time ? (total_time.toFixed(2)) + ' hr' : '';
  }

  getCompanies() {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.invoice_service.getCompaniesForBilling(formData).subscribe(response => {
      if (response.status && response.data) {
        this.companies_list = response.data?.companies;
      } else {

      }
    })
  }


  handleDateChange(event: any) {
    this.start_date = event.target.value;
    this.getBillings();
  }


  handleFilterByCompany(company: any) {
    if (company && company != null && company && company !== 'All') {

      this.selected_company = company;

    } else {
      this.selected_company = null;
    }
    this.getProjects();
    this.getBillings();
    this.getUnbillTickets();
  }

  setDetail(ticket: any) {
    this.ticketDetail = ticket;

    this.total_rounds = 0;
    if (ticket.status == 'Approved' || ticket.status == 'Completed') {

      ticket.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          this.total_rounds++;

        }
      })
    } else {
      this.total_rounds = ticket.ticket_truck_type_rounds?.length;
    }
    this.opUpObj?.showPaperTicket();
  }

  setInvoice(invoice: any) {
    this.edited_invoice = invoice;
    if (invoice && invoice?.invoice_by_id) {

      this.getUserGST(invoice?.invoice_by_id);
    }

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

  handleFilterByProjectAll() {

    this.selected_project = null;


    this.getBillings();
    this.getUnbillTickets();
    setTimeout(() => {
      $(".project_list").hide()
    }, 300);
  }

  handleFilterByCompanyAll() {

    this.selected_company = null;

    this.getBillings();
    this.getUnbillTickets();
    setTimeout(() => {
      $(".companies_list").hide()
    }, 300);
  }

  handleFilterByProject(project: any) {
    if (project && project != null && project && project !== 'All') {

      this.selected_project = project;

    } else {
      this.selected_project = null;
    }

    this.getBillings();
    this.getUnbillTickets();

    setTimeout(() => {
      $(".project_list").hide()
    }, 300);
  }

}
