import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import { CustomerTicketPopupComponent } from 'src/app/components/dashboard/customer/customer-ticket-popup/customer-ticket-popup.component';

import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-customer-billing-list',
  templateUrl: './customer-billing-list.component.html',
  styleUrls: ['./customer-billing-list.component.css']
})
export class CustomerBillingListComponent implements OnInit {

  active_menu: any;
  @ViewChild(CustomerTicketPopupComponent) opUpObj: CustomerTicketPopupComponent | undefined;

  backendAPIURL = environment.apiBackendUrl + environment.apiFilesDir;

  billings: any;

  loggedinUser: any = {};

  companies_list: any;
  selected_project: any = null;

  selected_company: any = null;
  selected_company_name: any = null;
  start_date: any = null;
  all_companies_list: any = null;

  todayDate: any;
  ticketDetail: any;

  unbilled_tickets: any = null;
  unbilled_tickets_data: any = null;
  loading: string = '';
  loading_bills: string = '';
  is_loading: string = '';
  user_id: any = null;
  is_downloading: boolean = false;
  total_rounds: any = 0;
  current_tab: any = 'billed';

  filter_date: any = '';
  gst: any = null;
  billings_data: any = null;
  search_term_billed: string = '';
  search_term_unbilled: string = '';
  selected_monthly: string = '';
  selected_year: any;
  month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


  edited_invoice: any = null;
  constructor(
    private freelance_driver: FreelanceDriverServiceService,
    private invoice_service: InvoiceService,
    private customer_service: CustomerService,
    private router: Router,
    private ticket_service: TicketService,
    private aRouter: ActivatedRoute,
    private datePipe: DatePipe,
    private user_service: UserDataService
  ) {
    this.active_menu = {
      parent: 'business',
      child: 'billing-list',
      count_badge: '',
    }
    this.selected_project = null;
    if (this.aRouter.snapshot.queryParams['project_id'] && this.aRouter.snapshot.queryParams['project_id'] != '') {
      this.selected_project = this.aRouter.snapshot.queryParams['project_id'];
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
      child: 'billing-list',
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
    this.getMenuCounts();
    this.getCompanies();

    this.getBillings();
    this.getAllCompanies();
    this.getUnbillTickets();
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
      var value = $(this).id();
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



    $(document).on('click', '.getinputfield', function (this: any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });

    $(document).on('click', '.getinputfield2', function (this: any) {
      $('.input-popup-div2').hide();
      $(this).find('.input-popup-div2').show();
    });

    // // Prevent event propagation if clicking inside the .input-popup-div3
    $(document).on('click', '.input-popup-div', function (e: any) {
      e.stopPropagation();
    });
    $(document).on('click', '.input-popup-div2', function (e: any) {
      e.stopPropagation();
    });




    $(window).click(function (e: any) {
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
        $('.input-popup-div').hide();

      }

      if (!($(e.target).hasClass('getinputfield2') || $(e.target).closest('.getinputfield2').length)) {
        $('.input-popup-div2').hide();
      }


    });





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
      this.getBillings();
      this.getUnbillTickets();
    }
  }

  handleSearchByBill(event: any) {

    this.search_term_billed = event.target.value;
    this.getBillings();

  }

  handleMonth(event: any) {
    console.log(event.target.value)
  }

  handleSearchByUnBill(event: any) {

    this.search_term_unbilled = event.target.value;
    this.getUnbillTickets()

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

  getUnbillTickets() {
    const formData = new FormData();
    if (this.search_term_unbilled == '') {
      this.loading = 'unbilled_tickets';
    }
    if (this.selected_monthly != '' && this.selected_year != '') {
      formData.append('filter_date', this.selected_monthly + ' ' + this.selected_year);
    }
    formData.append('user_id', this.user_id);
    formData.append('search_term', this.search_term_unbilled);
    formData.append('trucking_company_id', this.selected_company ? this.selected_company : '');
    this.invoice_service.getUnbilledTickets(formData).subscribe(response => {

      this.loading = '';
      if (response.status && response.data) {
        console.log("un bill data -->", response.data.tickets, response.data.ticket_data)
        this.unbilled_tickets = response.data.tickets && response.data.tickets.length > 0 ? response.data.tickets : null;
        this.unbilled_tickets_data = response.data.ticket_data ? response.data.ticket_data : null;
      } else {
        this.unbilled_tickets = null;
      }
    })
  }

  getBillings() {
    const formData = new FormData();
    if (this.search_term_billed == '') {
      this.loading_bills = 'billed_tickets';
    }
    if (this.selected_monthly != '' && this.selected_year != '') {
      formData.append('filter_date', this.selected_monthly + ' ' + this.selected_year);
    }
    formData.append('user_id', this.user_id);
    formData.append('search_term', this.search_term_billed);
    formData.append('trucking_company_id', this.selected_company ? this.selected_company : '');
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
    let data = { orginal_user_id: this.loggedinUser.id, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })

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


  handleFilterByCompany(event: any, name: any) {

    if (event && event != '') {

      this.selected_company = event;
      this.selected_company_name = name;

    } else {

      this.selected_company = '';
      this.selected_company_name = '';

    }

    $('.input-popup-div').hide();

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


  driverHour(start: any, end: any) {
    var start_time: any = new Date(start);

    var end_time: any = new Date(end);
    // console.log(start_time, end_time)
    var diffMs = (end_time - start_time); // milliseconds between now & Christmas
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    // console.log(diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes until Christmas =)");

    var hours = diffDays * 24 + diffHrs + diffMins / 60;
    var minutes = diffMins % 60;
    var to_add_min = minutes / 60;
    return hours + to_add_min > 0 ? (hours + to_add_min).toFixed(1) + 'hr' : '';

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

  parseJobTime(rounds: any) {
    var time: any = '';
    var hours = 0;
    var mints = 0;
    if (rounds && rounds.length > 0) {
      rounds.map((item: any) => {

        var rr = [];
        if (item?.round_time) {
          rr = item.round_time.split(' ');
        }

        if (rr && rr[0]) {
          var h = rr[0];
          h = h.replace('h', '');

          hours += parseFloat(h);
        } else {
          hours = hours;
        }

        if (rr && rr[1]) {

          mints += parseFloat(rr[1]);
        } else {
          mints = mints;
        }
        if (mints > 60) {
          var toadd_h = mints / 60;
          hours += Math.round(toadd_h);
          mints = mints % 60;


        }
      })
    }
    mints = mints / 60;
    if (mints > 0 && mints < 15) {
      mints = 0.25;
    } else if (mints > 15 && mints < 30) {
      mints = 0.5;
    } else if (mints > 30 && mints < 45) {
      mints = 0.75;
    } else if (mints > 45 && mints < 60) {
      mints = 0;
      hours = hours + 1;
    } else if (!mints || mints <= 0) {
      mints = 0;
    }
    return (parseFloat(hours.toString()) + parseFloat(mints.toString())).toFixed(2) + ' hr'
  }


  parseHour(item: any) {
    var hours = 0;
    var mints = 0;
    var rr = item.split(' ');
    if (rr && rr[0]) {
      var h = rr[0];
      h = h.replace('h', '');

      hours += parseFloat(h);
    } else {
      hours = hours;
    }

    if (rr && rr[1]) {

      mints += parseFloat(rr[1]);
    } else {
      mints = mints;
    }
    if (mints > 60) {
      var toadd_h = mints / 60;
      hours += toadd_h;
      mints = mints % 60;
    }
    var total = hours + (mints / 60);
    return total.toFixed(2) + ' hr';
  }

  handlePDFDownload(ticket: any) {
    let approver_time = '';
    if (ticket) {
      if (this.ticketDetail?.status == 'Approved' && this.ticketDetail?.driver_ticket?.approver_time != '') {
        approver_time = this.ticketDetail?.driver_ticket?.approver_time ? this.ticketDetail?.driver_ticket?.approver_time : '';

      }
      if (this.ticketDetail?.status == 'Approved' && (this.ticketDetail?.driver_ticket?.approver_time == '' || this.ticketDetail?.driver_ticket?.approver_time == 'null' || this.ticketDetail?.driver_ticket?.approver_time == null)) {
        approver_time = this.ticketDetail?.driver_ticket?.driver_hours + ' hr ' + this.ticketDetail?.driver_ticket?.driver_minutes + "min";
      }

      let data = {
        job_total: this.parseJobTime(this.ticketDetail?.ticket_truck_type_rounds),
        approver_time: approver_time,
        driver_total: this.ticketDetail?.driver_ticket?.driver_hours + ' hr ' + this.ticketDetail?.driver_ticket?.driver_minutes + "min",
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        ticket_id: this.ticketDetail.id

      }

      this.is_downloading = true;
      this.ticket_service.downloadClosedTicketPDF(data).subscribe(response => {

        this.is_downloading = false;
        if (response && !response.status) {
          if (response.message != "") {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire('Error', response.message)

          }
        } else {

          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', environment.apiClosedPDFURL + response.file_name);
          link.setAttribute('download', response.file_name);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
    }
  }

  parseJobTotal(item: any) {
    var hours = 0;
    var mints = 0;
    var rr = item?.split(':');
    if (rr && rr[0]) {
      var h = rr[0];
      hours += parseFloat(h);
    } else {
      hours = hours;
    }

    if (rr && rr[1]) {

      mints += parseFloat(rr[1]);
    } else {
      mints = mints;
    }
    if (mints > 60) {
      var toadd_h = mints / 60;
      hours += toadd_h;
      mints = mints % 60;
    }
    var total = hours + (mints / 60);
    return hours + ' hr ' + mints + "m";
  }

  parseJobTotal2(item: any) {
    var hours = 0;
    var mints = 0;
    var rr = item?.split(':');
    if (rr && rr[0]) {
      var h = rr[0];
      hours += parseFloat(h);
    } else {
      hours = hours;
    }

    if (rr && rr[1]) {

      mints += parseFloat(rr[1]);
    } else {
      mints = mints;
    }
    if (mints > 60) {
      var toadd_h = mints / 60;
      hours += toadd_h;
      mints = mints % 60;
    }
    var total = parseFloat(hours.toString()) + (parseFloat(mints.toString()) / 60);
    return total.toFixed(2) + ' hr';
  }


  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Accepted':
        return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2";
        break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }
}
