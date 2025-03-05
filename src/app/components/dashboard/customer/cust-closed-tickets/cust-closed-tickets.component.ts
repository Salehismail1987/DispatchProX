import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { PlansService } from 'src/app/services/plans.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as moment from 'moment-timezone';

declare var $: any;

@Component({
  selector: 'app-cust-closed-tickets',
  templateUrl: './cust-closed-tickets.component.html',
  styleUrls: ['./cust-closed-tickets.component.css']
})
export class CustClosedTicketsComponent implements OnInit {

  loggedinUser: any = {};
  user_id: any;
  message: any;

  ticketDetail: any;
  is_downloading: boolean = false;

  is_subscribed: boolean = false;
  is_free_trial: any = 'NO';
  // Listing Contanier
  ticket_list: any;
  ticket_pagination: any;
  sort_by: any = 'recently created';
  perPage: number = 25;
  page: number = 1;
  search_by: any = '';
  sort_type: any = 'DESC';
  search_date: string = '';
  search_status: any = '';
  is_loading: boolean = false;
  project_id: any = '';
  search_trucking_company_id: any = '';
  search_trucking_company_name: any = '';
  project_name: any = '';
  total_without_tragget_tickets: number = 0;
  active_menu: any;
  tc_lists: any;
  project_list: any = null;
  total_rounds: any = 0;
  activeTab: string = 'ticket-detail';


  paperImageURL: any = environment.paperTicketImageUrl;
  tragget_ticket_data: any = null;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private customer_service: CustomerService,
    private actRouter: ActivatedRoute,
    private project_service: ProjectService,
    private user_service: UserDataService,
    private plan_service: PlansService
  ) {
    this.active_menu = {
      parent: 'tickets',
      child: 'closed-tickets',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.sort_by = 'ticket_date';
    this.search_by = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      if (!this.loggedinUser?.open_paper_ticket_photo) {

        this.loggedinUser.open_paper_ticket_photo = 'NO';
        localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
      }
    } else {
      this.router.navigate(['/home']);
    }

    if (this.actRouter.snapshot.queryParams['status'] && this.actRouter.snapshot.queryParams['status'] != '') {
      this.search_status = this.actRouter.snapshot.queryParams['status'];
    }

    if (this.actRouter.snapshot.queryParams['project_id'] && this.actRouter.snapshot.queryParams['project_id'] != '') {
      this.project_id = this.actRouter.snapshot.queryParams['project_id'];
    }

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;

    this.getMenuCounts();
    this.getTruckingCompanies();
    this.getProjects();
    this.getTicketListing();
    this.getTraggetTickets();

    var dd: any = sessionStorage.getItem('TraggetUserTrial');

    if (dd && dd !== null) {

      let istrial = this.user_service.decryptData(dd);
      this.is_free_trial = (istrial)

    }
    let formData: any = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id }

    this.plan_service.checkFreeTrial(formData).subscribe((response: any) => {
      if (response && response.data) {
        this.is_free_trial = response.data.is_free_trial;
      } else {
        this.is_free_trial = 'NO';
      }
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

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }
  Sub_Total_Cal(hours: any, T_C_Requests: any) {
    if (!hours || hours == null) {
      return 0;
    }

    let numericHours = parseFloat(hours.toString().match(/[\d.]+/)[0]);

    let sub_total = 0;

    if (numericHours > 0 && T_C_Requests.length > 0) {
      let rates = 0;

      T_C_Requests.forEach((req: any) => {
        if (req.dispatch_by?.id === this.loggedinUser.id) {
          rates = req.rate_per_hour;
        }
      });

      if (rates > 0) {
        sub_total = numericHours * rates;
      }
    }

    return sub_total;
  }

  getRoundsSubtotal(is_approver_round: any, total_rounds: any, T_C_Requests: any) {
    let subtotal: any = 0;
    let rate = 0;
    if (T_C_Requests.length > 0) {

      T_C_Requests.forEach((req: any) => {
        if (req.dispatch_by?.id === this.loggedinUser.id) {
          rate = req.rate_per_hour;
        }
      });
    }
    if (total_rounds && rate) {
      if (is_approver_round) {
        subtotal = parseFloat(is_approver_round?.toString()) * parseFloat(rate.toString());
      } else {
        let isRoundCompleted = total_rounds?.filter((item: any) => item?.round_time != null && item?.round_time != '');
        subtotal = parseFloat(isRoundCompleted?.length) * parseFloat(rate.toString());
      }
    }
    return subtotal?.toFixed(2);
  }

  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    const userTimeZone = this.loggedinUser?.timezone || '';
    let ticketTime;
    let ticketDate;
    if (round == 1 && requestDetail?.ticket_date && requestDetail?.ticket_time) {
      ticketDate = requestDetail?.ticket_date;
      ticketTime = requestDetail?.ticket_time;
    }
    else if (round == 2 && requestDetail?.ticket_date && requestDetail?.driver_ticket?.started_at) {
      ticketDate = requestDetail?.ticket_date;
      ticketTime = requestDetail?.driver_ticket?.started_at;
      if (ticketTime) {
        const time = new Date(ticketTime);

        ticketTime = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
    else if (round == 3 && requestDetail) {
      const dateTime = new Date(requestDetail);
      const year = dateTime.getFullYear();
      const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
      const day = dateTime.getDate().toString().padStart(2, '0');
      ticketDate = `${year}-${month}-${day}`;
      ticketTime = requestDetail;
      if (ticketTime) {
        const time = new Date(ticketTime);
        ticketTime = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
    else { return {}; }

    let data = { ticketTime, ticketDate, userTimeZone };
    const conversionResult = this.ticket_service.timeConversion(data);
    return conversionResult;
  }

  getTraggetTickets() {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.plan_service.getTraggetTickets(formData).subscribe(response => {
      if (response.status && response.data) {
        this.tragget_ticket_data = response.data;

      } else {

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

  getTruckingCompanies() {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.is_loading = true;
    this.customer_service.getCustomerCompanies(formData).subscribe(response => {

      if (response.status && response.data) {
        this.tc_lists = response.data;

      } else {

      }
    })
  }

  getProjects() {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.is_loading = true;
    this.project_service.projectListing(formData).subscribe(response => {

      if (response.status && response.data) {
        this.project_list = response.data;

      } else {

      }
    })
  }

  handleTruckingComp(val: any, name: any) {
    if (val && val != '') {

      this.search_trucking_company_id = val;
      this.search_trucking_company_name = name;
    }
    else {
      this.search_trucking_company_id = '';
      this.search_trucking_company_name = '';

    }
    $('.input-popup-div').hide();

    this.page = 1;
    this.getTicketListing();
  }
  getTicketListing() {
    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_status', this.search_status);
    formData.append('search_date', this.search_date);
    formData.append('project_id', this.project_id);
    formData.append('trucking_company_id', this.search_trucking_company_id);

    formData.append('sort_type', this.sort_type);

    this.ticket_service.getAllClosedTickets(formData).subscribe(response => {

      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.data;
        this.ticket_pagination = response.data;
        this.total_without_tragget_tickets = response.total_without_tragget_tickets;
        console.log(this.ticket_list);
      } else {
        this.message = response.message;
      }
    }
    );
  }

  handleChange(value: any) {
    this.page = 1;
    this.sort_by = value;
    this.getTicketListing();

  }
  handleSortByList(event: any) {
    this.page = 1;
    this.sortBy(event.target.value)
  }

  searchBy(value: any) {
    this.page = 1;
    this.search_by = value;
    this.getTicketListing();

  }

  handlePerPage(event: any) {
    if (event.target.value) {
      this.perPage = event.target.value;
      this.getTicketListing();
    }
  }

  handlePage(page: any) {
    if (page) {
      this.page = page;
      this.getTicketListing();
    }
  }

  sortBy(value: any) {
    if (value && value != '') {
      this.page = 1;
      this.sort_by = value;
      if (this.sort_by == value) {
        this.sort_type = this.sort_type == 'DESC' ? 'ASC' : 'DESC';
      } else {
        this.sort_type = 'ASC';
      }
      this.getTicketListing();
    }
  }

  handleStatus(event: any) {
    this.page = 1;
    this.search_status = event.target.value;
    this.getTicketListing()
  }

  changePage(page: any) {
    this.page = page;
    this.getTicketListing();
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


  handleFilterByProject(event: any, name: any) {
    if (event && event != '') {

      this.project_id = event;
      this.project_name = name;
    }
    else {
      this.project_id = '';
      this.project_name = '';

    }
    $('.input-popup-div2').hide();

    this.page = 1;
    this.getTicketListing()
  }

  changeDate(event: any) {
    this.page = 1;
    this.search_date = event.target.value;
    this.getTicketListing();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2 no-shadow";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white no-shadow";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Accepted':
        return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2 no-shadow";
        break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white no-shadow";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue no-shadow";
  }

  setDetailTicket(ticket: any) {
    this.ticketDetail = ticket;
    this.is_downloading = false;
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
    setTimeout(() => {
      if (this.loggedinUser?.open_paper_ticket_photo == 'YES' && this.ticketDetail?.required_paper_ticket_id == 'YES' && (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed')) {

        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 1000);
      }
    }, 300);

  }

  getTotalTicketRounds(ticket: any) {
    let total_rounds = 0;
    if (ticket?.status == 'Approved' || ticket?.status == 'Completed') {

      if (ticket?.trucking_company_requests && ticket?.trucking_company_requests[0]?.rate_type == 'round' && ticket?.driver_ticket?.approver_rounds) {
        return Number(ticket?.driver_ticket?.approver_rounds);
      } else {
        ticket?.ticket_truck_type_rounds.map((item: any) => {
          if (item.round_time && item.driver_start_time) {
            total_rounds++;
          }
        });
      }
    } else {
      total_rounds = ticket?.ticket_truck_type_rounds?.length;
    }
    return total_rounds;
  }

  getApprovedTicketRounds() {
    let total_rounds = 0;
    if (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed') {

      if (this.ticketDetail?.trucking_company_requests && this.ticketDetail?.trucking_company_requests[0]?.rate_type == 'round' && this.ticketDetail?.driver_ticket?.approver_rounds) {
        return Number(this.ticketDetail?.driver_ticket?.approver_rounds);
      }
    }
    return total_rounds;
  }

  checkTicketApprovedRounds() {
    if (this.ticketDetail?.trucking_company_requests && this.ticketDetail?.trucking_company_requests[0]?.rate_type == 'round' && this.ticketDetail?.driver_ticket?.approver_rounds) {
      return Number(this.ticketDetail?.driver_ticket?.approver_rounds);
    }
    return 0;
  }

  checkTicketRateType() {
    if (this.ticketDetail?.trucking_company_requests && this.ticketDetail?.trucking_company_requests[0]?.rate_type == 'round') {
      return true
    }
    return false;
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

  getTimeZoneDifferenceFormatted(tz1: any, tz2: any, date = new Date()) {
    const mDate1 = moment(date).tz(tz1);
    const mDate2 = moment(date).tz(tz2);

    // Calculate the total difference in minutes
    const totalMinutesDifference = mDate2?.utcOffset() - mDate1?.utcOffset();
    const hours = Math.floor(totalMinutesDifference / 60);
    const minutes = Math.abs(totalMinutesDifference % 60);

    const sign = totalMinutesDifference < 0 ? '-' : '+';

    // Format hours and minutes to strings
    const hoursStr = `${Math.abs(hours)}`.padStart(2, '0');
    const minutesStr = `${minutes}`.padStart(2, '0');

    return `${sign}${hoursStr}:${minutesStr}`;
  }



  handlePDFDownload(ticket: any) {
    const sourceTimeZone = 'America/Vancouver';

    // loggedinUser timezone is "America/Anchorage"
    const userTimeZone = this.loggedinUser?.timezone || '';

    const difference = this.getTimeZoneDifferenceFormatted(sourceTimeZone, userTimeZone);

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
        ticket_id: this.ticketDetail.id,
        time_diff: difference

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

  showTicketImage() {
    setTimeout(() => {
      if (this.ticketDetail && (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed')) {
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 1000);
      }
    }, 300);
  }

  checkOpenTicketPhoto(event: any) {
    if (event) {
      var open_paper_ticket_photo = '';
      open_paper_ticket_photo = event.target.checked ? 'YES' : 'NO';
      this.loggedinUser.open_paper_ticket_photo = open_paper_ticket_photo;
      localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
      let data = {
        user_id: this.loggedinUser.id,
        open_paper_ticket_photo: open_paper_ticket_photo
      }
      this.user_service.upateOpenTicketPhoto(data).subscribe(response => {
        if (response.status && response.data) {

        }
      });
    }
  }

  closeModal2() {
    $('#myModalGetCamera').modal('hide')
  }

  time_conversion_common(timedate: any) {
    let ticketTime;
    let conversionResult;
    if (timedate) {
      const userTimeZone = this.loggedinUser?.timezone || '';

      const [ticketDate, timePart] = timedate.split(' ');

      const [hour, minute] = timePart.split(':');

      let hour12 = parseInt(hour, 10);
      const amPm = hour12 >= 12 ? 'pm' : 'am';

      hour12 = hour12 % 12;
      hour12 = hour12 ? hour12 : 12;

      ticketTime = `${hour12}:${minute}${amPm}`;
      let data = { ticketTime, ticketDate, userTimeZone };
      conversionResult = this.ticket_service.timeConversion(data);
    }

    return conversionResult;
  }

}
