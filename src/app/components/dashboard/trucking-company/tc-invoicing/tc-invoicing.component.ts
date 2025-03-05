import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from 'src/app/services/invoice.service';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { UserDataService } from 'src/app/services/user-data.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { TicketService } from 'src/app/services/ticket.service';
import { TcApprovedPopupComponent } from '../tc-approved-popup/tc-approved-popup.component';
declare var $: any;

@Component({
  selector: 'app-tc-invoicing',
  templateUrl: './tc-invoicing.component.html',
  styleUrls: ['./tc-invoicing.component.css']
})
export class TcInvoicingComponent implements OnInit {
  @ViewChild(TcApprovedPopupComponent) opUpObj: TcApprovedPopupComponent | undefined;

  loggedinUser: any = null;
  date_today: any = null;
  active_menu: any;
  is_loading: any = '';
  is_shown_download: boolean = false;
  date: any = null;
  requestDetail: any = null;
  is_default: any = false;
  is_downloading: boolean = false;

  form_clicked: boolean = false;

  drafs_pagination: any = null;
  page: any = 1;
  perPage: any = 15;

  gst: any = null;


  ticket_detail: any = null;
  selected_company: any = null;
  invoices: any = null;

  send_notes: any = '';
  calender_index: any = null;
  invoice_no: any = '';
  current_tab: any = 'draft';
  trucking_companies: any = null;
  invoiced_invoices: any = null;
  total_ticket_count: any = 0;
  total_hours: any = 0;
  total_inv_rounds: any = 0;
  total_subtotal: any = 0;
  edited_invoice: any = null;

  is_freelance_driver_company: boolean = false;

  select_duration_type: string = '';
  default_duration_type: string = '';
  default_project: any = '';
  all_checked: boolean = false;
  checked_tickets: any = {};
  selected_monthly: string = '';
  selected_semi_monthly_month: string = '';
  selected_semi_monthly_range: string = '';
  selected_year: any;
  selected_weekly_range: string = '';
  selected_custom_range: string = '';
  default_company_code: any = '';
  select_company_code: any = '';
  selected_month: string = '';
  month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  to_send_invoice_data: any = null;
  invoice_date: any = null;
  total_rounds: any = 0;
  due_date: any = null;
  default_company: any = null;
  loading_invoiced: boolean = false;
  user_id: any = null;

  selected_project: any = null;
  project_list: any = null;
  selected_ticket_list: any = null;
  constructor(
    private fb: FormBuilder,
    private invoice_service: InvoiceService,
    private user_service: UserDataService,
    private router: Router,
    private aRouter: ActivatedRoute,
    private ticket_service: TicketService,
    private freelance_driver: FreelanceDriverServiceService,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit(): void {

    this.active_menu = {
      parent: 'business',
      child: 'invoices',
      count_badge: '',
    }

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;

    // $(document).on('click', '.openOptionModal',function(this:any) {
    //     $(this).closest('.modal-div').find('.option-modal').toggle('slow');
    // });
    // $(document).on('click','.btnaction', function(this:any) {
    //     $(this).closest('.option-modal').hide();
    // });
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

    $(document).on('click', '.openCalendar', function (this: any) {
      $('.popupCalendar').hide();
      $(this).find('.popupCalendar').show();
    });
    $("body").click(function (e: any) {
      if (!($(e.target).parents(".openCalendar").length || ($(e.target).hasClass("popupCalendar") || $(e.target).parents(".popupCalendar").length))) {

        $('.popupCalendar').hide();
      }
    });

    $('#pnlEventCalendar2').calendar({
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

      showdetail: false,
      smalldivs: true
    });
    this.default_duration_type = this.loggedinUser.driver_duration;
    this.select_duration_type = this.loggedinUser.driver_duration;

    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });
    let cDay = d.getDate();
    let cMonth = d.getMonth() + 1;
    let cYear = d.getFullYear();

    this.date = cDay + "-" + cMonth + "-" + cYear;
    this.invoice_date = this.date;

    var today = new Date(cMonth + "-" + cDay + "-" + cYear);
    this.due_date = new Date(d.setDate(d.getDate() + 30));
    this.due_date = this.due_date.toLocaleString('en-US', { timeZone: tz });

    if (sessionStorage.getItem('freelanceInvoiceTab')) {
      var t: any = sessionStorage.getItem('freelanceInvoiceTab');
      this.current_tab = t;
    } else {
      this.current_tab = 'draft'
    }

    this.getCompanies();

    this.getProjects()
    // this.getInvoices();

  }


  toggleDownload() {
    this.is_shown_download = !this.is_shown_download;
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


  getCompanies() {
    let is_tc_project = this.selected_project?.trucking_company_id ? "YES" : "NO";

    const formData = new FormData();
    let data: any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      project_id: this.selected_project?.id ? this.selected_project?.id : null,
      is_tc_project: is_tc_project
    }
    this.invoice_service.getCompaniesInvoices(data).subscribe(response => {
      if (response.status && response.data) {

        this.default_company = null;
        this.trucking_companies = response.data?.companies;
        this.trucking_companies.length > 0 && this.trucking_companies.map((item: any) => {
          console.log(item.id, '=', this.loggedinUser.driver_invoice_company_id)

          if (item.id == this.loggedinUser.driver_invoice_company_id) {
            this.default_company = item;
            this.selected_company = item;
          }
          this.aRouter.queryParams.subscribe(params => {
            if (params['tb'] && params['tb'] != "") {
              this.current_tab = params['tb'];
            }
            if (params['qc'] && params['qc'] != "All" && params['qc'] != "") {

              this.selectCompany(params['qc']);
            }
          });
          this.getDrafts('YES');
        });
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

  setCompany() {
    this.trucking_companies.length > 0 && this.trucking_companies.map((item: any) => {

      if (item.id == this.loggedinUser.driver_invoice_company_id) {
        this.default_company = item;
        this.selected_company = item;
      }
    });
  }

  selectCompany(id: any) {
    this.trucking_companies.length > 0 && this.trucking_companies.map((item: any) => {

      if (item.id == id) {

        this.selected_company = item;

      }
    });
  }

  getData(boolean: any) {
    if (boolean) {

      this.getDrafts('YES');
    }
  }

  getReq(reqs: any) {
    let reqt: any = null;
    reqs.map((req: any) => {
      if (this.selected_company?.id == req.dispatch_by_id && this.loggedinUser.id == req.dispatch_to_id) {
        reqt = req;
      }
    })
    return reqt?.dispatch_by?.company_name;
  }
  getDrafts(get: any) {
    console.log(this.selected_company, this.selected_project);
    if (get == 'YES') {
      var formData = {
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        trucking_company_id: this.selected_company?.id ? this.selected_company?.id : '',
        project_id: this.selected_project?.id ? this.selected_project?.id : '',
        selected_tickets: this.selected_ticket_list,
        tc_project: this.selected_project?.trucking_company_id ? 'YES' : 'NO',
        tc_company: this.selected_company?.open_paper_ticket_photo ? 'NO' : 'YES',
        select_duration_type: this.select_duration_type,
        page: this.page
      }

      let data = {
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        record_name: 'invoice_drafts',
        filter: formData
      }

      this.is_loading = 'invoice_drafts';
      this.freelance_driver.getFreelancerDetail(data).subscribe(response => {
        this.is_loading = '';
        if (response.status) {
          console.log("data -->", data, response?.data);
          if (response.data?.invoices?.data) {
            this.drafs_pagination = response?.data?.invoices;
            this.invoices = response.data?.invoices?.data;
          } else {

            this.invoices = response.data?.invoices;
          }
          this.invoice_no = response.data.invoice_no;

        }
      });
    }


    var formData2 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      trucking_company_id: this.selected_company?.id,
      project_id: this.selected_project?.id ? this.selected_project?.id : '',
      tc_project: this.selected_project?.trucking_company_id ? 'YES' : 'NO',
      selected_month: this.selected_month,
    }
    let data21 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      record_name: 'saved_invoices',
      filter: formData2
    }
    this.total_ticket_count = 0;
    this.total_hours = 0;
    this.total_inv_rounds = 0;
    this.total_subtotal = 0;
    this.is_loading = 'saved_invoices';
    this.freelance_driver.getFreelancerDetail(data21).subscribe(response => {
      this.is_loading = '';
      this.total_ticket_count = 0;
      this.total_hours = 0;
      this.total_inv_rounds = 0;
      this.total_subtotal = 0;
      if (response.status) {
        this.invoiced_invoices = response.data?.invoices;
        response.data?.invoices?.map((item: any) => {
          if (item?.tickets?.length) {
            this.total_ticket_count += parseInt(item.tickets?.length);
          }
          if (item?.hours) {
            this.total_hours += parseFloat(item?.hours?.toString());
          }
          if (item?.rounds) {
            this.total_inv_rounds += parseFloat(item?.rounds?.toString());
          }
          if (item?.total) {
            this.total_subtotal += parseFloat(item?.total?.toString());
          }
        });

      }
    });
  }

  handleFilterByProjectAll() {

    this.selected_project = null;


    this.page = 1;
    this.getData(true);

    setTimeout(() => {
      $(".project_list").hide()
    }, 300);
  }

  changePage(page: any) {
    if (page) {

      this.page = page;
      this.getData(true);
    }
  }

  setRequestDetail(ticket: any) {
    if (ticket && ticket?.ticket_no) {
      this.requestDetail = ticket;
      this.opUpObj?.showPaperTicket();
    }
  }

  parsePage(page: any) {
    return parseInt(page.toString());
  }

  showCalendarDate() {
    $('.calendar-2').show();
    setTimeout(() => {
      $(".header-month-title").css('background-color', '#17A1FA !important')
      $(".header-month-title").css('color', 'white !important')

    }, 100);
  }

  showCalendar(event: any, invoice: any, index: any) {

    $(".calenderweek2 .ui-datepicker-calendar tr:has(.ui-state-active)").css('background', '#FDD7E4');
    let themeLink = document.getElementById(
      'adoptive-theme1'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = 'assets/calendar/jquery.calendar-highlighted-tc.css';
    } else {
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('link');
      style.id = 'adoptive-theme1';
      style.rel = 'stylesheet';
      style.type = "text/css";
      style.href = `${'assets/calendar/jquery.calendar-highlighted-tc.css'}`;
      head.appendChild(style);
    }

    var i = 0;
    if (this.invoices?.length > 0) {
      $('.calendarHighLighted').each(function (this: any) {

        var startDate = $("#start-" + i).val();
        var endDate = $("#end-" + i).val();
        $(this).calendarHighLighted({
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          startHighLightDate: startDate,
          endtHighLightDate: endDate,
          // onSelect: function(event) {
          //     $('#lblEventCalendar').text(event.label);
          // },
          showdetail: true,
          smalldivs: false
        });
        i++;
      });
      $(".calendarHighLighted .highLightDate").css('background', '#17A1FA')
    }

    // // $('.calendarHighLighted').each(function(this:any) {
    //     var startDate = invoice?.data?.start_date;
    //     var endDate = invoice?.data?.end_date;
    //     $("#cal-"+index).calendarHighLighted({
    //         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //         days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    //         startHighLightDate: startDate,
    //         endtHighLightDate: endDate,
    //         // onSelect: function(event) {
    //         //     $('#lblEventCalendar').text(event.label);
    //         // },
    //         showdetail: true,
    //         smalldivs: false
    //     });
    // // });
  }

  notSkip(value: string) {
    if (value.indexOf('Next') >= 0 || value.indexOf('Previous') >= 0) {
      return false;
    } else {
      return true;
    }
    return false;
  }

  toLocation(link: any) {
    let data: any = {
      // select_duration_type: this.select_duration_type,
      // selected_year: this.selected_year,
      // selected_monthly: this.selected_monthly,
      // selected_semi_monthly_month: this.selected_semi_monthly_month,
      // selected_semi_monthly_range: this.selected_semi_monthly_range,
      // selected_weekly_range: this.selected_weekly_range,
      // selected_custom_range: this.selected_custom_range
    };

    sessionStorage.setItem('invoice_filters', JSON.stringify(data));
    this.router.navigate(
      [link],
      {
        queryParams: {
          // qd: this.start_date, qc:this.selected_company
        }
      }
    );
  }

  setInvoice(invoice: any) {
    this.send_notes = '';
    $(".notes-textarea").text('');
    $(".notes-textarea").val('');
    this.edited_invoice = invoice;
    if (invoice && invoice?.invoice_by_id) {

      this.getUserGST(invoice?.invoice_by_id);
    }

  }

  setSendData(data: any) {
    this.send_notes = '';
    $(".notes-textarea").text('');
    $(".notes-textarea").val('');
    this.to_send_invoice_data = data;

    console.log(data?.invoices[0]?.trucking_company?.contacts)
    if (data?.invoices[0]?.trucking_company?.contacts) {
      var contacts = JSON.parse(data?.invoices[0]?.trucking_company?.contacts);
      contacts.map((item: any) => {
        if (item.is_default == true) {
          this.to_send_invoice_data.trucking_company_contact = item;
        }
      })
    }

    if (this.user_id) {

      this.getUserGST(this.user_id);
    }
    console.log(this.to_send_invoice_data)

    setTimeout(() => {

      $('#pnlEventCalendar2').calendar({
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

        showdetail: false,
        smalldivs: true
      });

      $('.input-popup-div').hide();
    }, 1500);

  }

  setTab(tab: any) {

    sessionStorage.setItem('freelanceInvoiceTab', tab.toString())
    this.page = 1;
    this.drafs_pagination = null;
    if (this.current_tab != tab) {

      this.current_tab = tab;
      this.getData(true);
    } else {
      this.current_tab = tab;
    }
  }
  handleFilterByProject(project: any) {
    if (project && project != null && project && project !== 'All') {

      this.selected_project = project;

    } else {
      this.selected_project = null;
    }

    this.page = 1;
    this.getCompanies();
    this.getData(true);

    setTimeout(() => {
      $(".project_list").hide()
    }, 300);
  }

  handleFilterByCompany(company: any) {
    if (company && company != null && company && company !== 'All') {

      this.selected_company = company;

    } else {
      this.selected_company = null;
    }

    this.page = 1;
    this.getProjects();
    this.getData(true);
    setTimeout(() => {
      $(".companies_list").hide()
    }, 300);
  }

  setDetail(ticket: any) {

  }

  handleFilterByDuration(type: any) {
    if (type && type != '') {
      this.select_duration_type = type;

    } else {
      this.select_duration_type = '';
    }
    this.page = 1;
    this.getData(true);
    setTimeout(() => {
      $(".duration_list").hide()
    }, 300);
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
      this.is_loading = '';
      if (response.status) {
        this.select_duration_type = duration;
        this.default_duration_type = duration;
        this.loggedinUser.driver_duration = duration;
        localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));

        this.getData(true)
      }
    });
  }


  markDefault(event: any, table: any, id: any, company: any = null) {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('record_name', 'default_driver_invoice_company');

    formData.append('is_self_dispatched', 'NO');
    formData.append('id', id);

    if (event.target.checked == true) {
      formData.append('status', '1');
    } else {
      formData.append('status', '0');
    }


    this.freelance_driver.markDefault(formData).subscribe(response => {

      if (response.status && response.data) {

        this.selected_company = company;

        this.page = 1;
        if (event.target.checked == true) {
          this.loggedinUser.driver_invoice_company_id = id;
          this.loggedinUser.driver_invoice_company_is_self_dispatched = false;

          localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
          this.getCompanies();
          this.getProjects();
        } else {
          this.loggedinUser.driver_invoice_company_id = null;
          this.loggedinUser.driver_invoice_company_is_self_dispatched = false;

          localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
          this.getCompanies();
          this.getProjects();
        }
        this.getData(true);
      }

    });

  }

  setInvMonth(mon: any) {
    if (mon.target.value) {

      this.selected_month = mon.target.value;
      this.getData(true);
    }

  }

  get_month_number(month_name: any) {
    let month = null;
    switch (month_name) {
      case 'Jan':
        month = '01';
        break;
      case 'Feb':
        month = '02';
        break;
      case 'Mar':
        month = '03';
        break;
      case 'Apr':
        month = '04';
        break;
      case 'May':
        month = '05';
        break;
      case 'Jun':
        month = '06';
        break;
      case 'Jul':
        month = '07';
        break;
      case 'Aug':
        month = '08';
        break;
      case 'Sep':
        month = '09';
        break;
      case 'Oct':
        month = '10';
        break;
      case 'Nov':
        month = '11';
        break;
      case 'Dec':
        month = '12';
        break;
    }
    return month;
  }

  getVal2() {
    this.invoice_date = this.date.toString();
    if ($("#pnlEventCalendar2  table tr td div.selected job-status").length > 0) {
      $("#pnlEventCalendar2  table tr td div.selected job-status").remove();
    }
    let date = $("#pnlEventCalendar2  table tr td div.selected").text();
    if ($("#pnlEventCalendar2  table tr td div.selected").length > 0 && date != null && date !== '') {

      let month_year = $("#pnlEventCalendar2  .header-month-title").text();

      let monthyear = [];
      monthyear = month_year.toString().split(' ');
      let month: any = this.get_month_number(monthyear[0])
      let year = monthyear[1];
      this.invoice_date = date + '-' + month + '-' + year;
      var today = new Date(month + '-' + date + '-' + year);
      this.due_date = new Date(today.setDate(today.getDate() + 30));

      let tz = environment.timeZone;
      this.due_date = this.due_date.toLocaleString('en-US', { timeZone: tz });

      $('.input-popup-div').hide();
    }
  }

  downloadInvoice(to_download_only: boolean = false) {

    let invoice_data: any = this.to_send_invoice_data;
    invoice_data.notes = this.send_notes;
    invoice_data.to_download_only = to_download_only;
    invoice_data.invoice_period_type = this.select_duration_type;
    invoice_data.invoice_date = this.invoice_date;
    invoice_data.invoice_no = this.invoice_no;

    invoice_data.project_id = this.selected_project?.id;
    invoice_data.tc_project = this.selected_project?.trucking_company_id ? 'YES' : 'NO';

    this.is_shown_download = false;
    let data2 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      action: 'save_invoice',
      invoice_data: invoice_data
    }

    if (!to_download_only) {
      this.is_loading = 'download';
    } else {
      this.is_loading = 'download';
    }
    this.freelance_driver.invoiceAction(data2).subscribe(response => {
      this.is_loading = '';
      if (response.status) {

        var smg = '';
        if (!to_download_only) {
          $(".modal-backdrop").remove();
          $("#myModalDetail").toggle("modal");
          $(".modal-backdrop").hide();
          $('.modal-backdrop').removeClass('show');

          $('body').removeClass('modal-open');

          $('.modal-backdrop').addClass('hide');
          if (response.file_name) {
            const link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.setAttribute('href', environment.apiInvoiceURL + response.file_name);
            link.setAttribute('download', response.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
          Swal.fire(

            {
              confirmButtonColor: '#17A1FA',
              title:
                `Success`,
              text:
                'Invoice sent'
            }
          ).then(() => {
            this.current_tab = 'invoiced';
            this.getData(true);
            this.send_notes = '';

          });

        } else {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', environment.apiInvoiceURL + response.file_name);
          link.setAttribute('download', response.file_name);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

      }
    });
  }

  downloadEditedInvoice() {
    let data2 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      action: 'invoice_pdf_download',
      invoice_id: this.edited_invoice?.id
    }

    this.is_loading = 'download'
    this.freelance_driver.invoiceAction(data2).subscribe(response => {
      this.is_loading = '';
      if (response.status) {
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', environment.apiInvoiceURL + response.file_name);
        link.setAttribute('download', response.file_name);
        document.body.appendChild(link);
        link.click();
        link.remove();

      }
    });
  }

  resendInvoice() {
    let data2 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      action: 'resend_invoice',
      invoice_id: this.edited_invoice?.id
    }

    this.is_loading = 'resend'
    this.freelance_driver.invoiceAction(data2).subscribe(response => {
      this.is_loading = '';
      if (response.status) {

        var smg = '';

        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text:
              'Invoice resent'
          }
        ).then(() => {
          this.current_tab = 'invoiced';
          this.getData(true);
          this.send_notes = '';
        });

      }
    });
  }

  hanldeSendInvoice(to_download_only: boolean = false) {
    let invoice_data: any = this.to_send_invoice_data;
    invoice_data.notes = this.send_notes;
    invoice_data.to_download_only = to_download_only;
    invoice_data.invoice_date = this.invoice_date;
    invoice_data.invoice_period_type = this.select_duration_type;
    invoice_data.invoice_no = this.invoice_no;
    invoice_data.project_id = this.selected_project?.id;
    invoice_data.tc_project = this.selected_project?.trucking_company_id ? 'YES' : 'NO';
    let data2 = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      action: 'send_invoice',
      invoice_data: invoice_data
    }

    this.is_loading = 'save_invoice';
    this.freelance_driver.invoiceAction(data2).subscribe(response => {
      this.is_loading = '';
      if (response.status) {

        var smg = '';

        Swal.fire(

          {
            confirmButtonColor: '#17A1FA',
            title:
              `Success`,
            text:
              'Invoice sent'
          }
        ).then(() => {
        });
        this.current_tab = 'invoiced';
        this.getData(true);
        this.send_notes = '';
        $("#myModalDetail").toggle('modal')
        $(".modal-backdrop").hide();
        $('.modal-backdrop').removeClass('show');

        $('body').removeClass('modal-open');

        $('.modal-backdrop').addClass('hide');
      }
    });
  }

  setNotes(event: any) {
    if (event?.target.value) {
      this.send_notes = event.target?.value;
    }
  }

  startOver() {
    this.select_duration_type = '';
    this.selected_company = null;
    this.page = 1;
    this.getData(true);
  }

  getTotal(rate: string) {
    let rt = null;
    if (rate !== '') {
      rt = parseFloat(rate)?.toFixed(2)
    }
    return rt;
  }

  getContact(contacts: any, type: any = '') {
    if (contacts && contacts?.length > 0) {
      console.log(contacts)
      var cont = null;
      contacts?.map((item: any) => {
        console.log(item, item.is_default)
        if ((item.is_default == true || item.is_default == 'true') && type == 'name') {
          cont = item?.name;
        }
        if ((item.is_default == true || item.is_default == 'true') && type == 'email') {
          cont = item?.name;
        }
        if ((item.is_default == true || item.is_default == 'true') && type == 'street') {
          cont = item?.street;
        }
        if ((item.is_default == true || item.is_default == 'true') && type == 'city') {
          cont = item?.city;
        }
        if ((item.is_default == true || item.is_default == 'true') && type == 'province') {
          cont = item?.province;
        }
        if ((item.is_default == true || item.is_default == 'true') && type == 'postal_code') {
          cont = item?.postal_code;
        }
      })


      if (!cont || cont == null || cont == 'null') {
        if (contacts && contacts?.length > 0) {
          var item = contacts[0];
          console.log(item, 'osso')
          if (type == 'name') {
            console.log(item['name'], item?.name)
            cont = item?.name;
          }
          if (type == 'email') {
            console.log(item['email'], item?.email)
            cont = item?.name;
          }
          if (type == 'street') {
            cont = item?.street;
          }
          if (type == 'city') {
            cont = item?.city;
          }
          if (type == 'province') {
            cont = item?.province;
          }
          if (type == 'postal_code') {
            cont = item?.postal_code;
          }
        }

        console.log(cont);
      }
    }


    return cont;
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

  parseJobTotal(item: any) {
    var hours = 0;
    var mints = 0;
    if (!item) {
      return;
    }
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
    if (!item) {
      return;
    }
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

  showTicketImage() {
    setTimeout(() => {
      if (this.requestDetail?.ticket && (this.requestDetail?.ticket?.status == 'Approved' || this.requestDetail?.ticket?.status == 'Completed')) {
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 300);
      }
    }, 300);
  }

  getSubtotal(hour_rate: any, hours: any) {
    let subtotal: any = 0;
    if (hour_rate && hours) {
      hours = hours.replace('hr', '');
      subtotal = parseFloat(hours.toString()) * parseFloat(hour_rate.toString());
    }
    return subtotal?.toFixed(2);
  }

  getRoundsSubtotal(is_approver_round: any, total_rounds: any, rate: any) {
    let subtotal: any = 0;
    if (total_rounds && rate) {
      if (is_approver_round) {
        subtotal = parseFloat(total_rounds?.toString()) * parseFloat(rate.toString());
      } else {
        let isRoundCompleted = total_rounds?.filter((item: any) => item?.round_time != null && item?.round_time != '');
        subtotal = parseFloat(isRoundCompleted?.length) * parseFloat(rate.toString());
      }
    }
    return subtotal?.toFixed(2);
  }

  getCompletedRounds(rounds: any) {

    let isRoundCompleted = rounds?.filter((item: any) => item?.round_time != null && item?.round_time != '');

    return isRoundCompleted?.length;

  }


  // The master checkbox will check/ uncheck all items
  checkUncheckAll(evt: any) {

    this.invoices.forEach((c: any) => {

      c.is_selected = evt.target.checked

    })
    if (evt.target.checked) {
      this.all_checked = evt.target.checked;
    } else {
      this.all_checked = false;
    }
    this.getCheckedItemList();
  }

  // Check All Checkbox Checked
  isAllSelected(evt: any, index: any) {
    this.invoices[index].is_selected = evt.target.checked
    this.all_checked = this.invoices.every(function (item: any) {
      return item.is_selected == true;
    })

    this.getCheckedItemList();
    console.log(this.invoices[index], this.selected_ticket_list)
  }

  selectRow(index: any) {

    if (index || index == 0) {

      if (this.invoices[index].is_selected == true) {

        this.invoices[index].is_selected = false
        $("#checkbox" + index).attr('checked', false);
      } else {

        this.invoices[index].is_selected = true
        $("#checkbox" + index).attr('checked', true);
      }

      this.all_checked = this.invoices.every(function (item: any) {
        return item.is_selected == true;
      })
      this.getCheckedItemList();
      console.log(this.invoices)

    }

  }

  // Get List of Checked Items
  getCheckedItemList() {
    this.selected_ticket_list = [];
    for (var i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].is_selected) {
        this.selected_ticket_list.push(this.invoices[i]);
      }
    }
    this.selected_ticket_list = this.selected_ticket_list;
    // console.log(this.selected_ticket_list)
  }


}
