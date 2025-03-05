import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment-timezone';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-tc-closed-tickets',
  templateUrl: './tc-closed-tickets.component.html',
  styleUrls: ['./tc-closed-tickets.component.css']
})
export class TcClosedTicketsComponent implements OnInit {

  paperImageURL: any = environment.paperTicketImageUrl;
  is_downloading: boolean = false;
  is_subscribed: boolean = false;
  is_free_trial: any = 'NO';
  loggedinUser: any = {};
  message: any;
  is_loading: boolean = false;
  requestDetail: any;
  project_list: any;
  truck_type_list: any;
  pending_dispatches: number = 0;
  cc_list: any = null;
  activeTab: string = 'ticket-detail';

  // Listing Contanier
  ticket_list: any;
  ticket_pagination: any;
  sort_by: any = 'recently created';
  sort_type: any = 'DESC';
  perPage: number = 25;
  page: number = 0;
  search_by: any = '';
  selected_project: any = null;
  search_date: string = '';
  search_project: any = '';
  search_Customer: any = '';
  search_Customer_selected: any = '';
  search_Customer_TC: any = null;
  search_status: any = '';
  active_menu: any;
  total_without_tragget_tickets: number = 0;
  detail_truck_name: any = '';
  total_rounds: any = 0;
  user_id: any;
  tragget_ticket_data: any = null;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private plan_service: PlansService,
    private project_service: ProjectService,
    private actRouter: ActivatedRoute,
    private trucking_service: TruckingCompanyService,
    private datePipe: DatePipe,
    private user_service: UserDataService
  ) {



    this.active_menu = {
      parent: 'tickets',
      child: 'tc-closed-tickets',
      count_badge: '',
    }
  }



  ngOnInit(): void {

    this.sort_by = 'dispatch_date';
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
    this.getProjects();
    this.getTruckTypes();
    this.getTicketListing();

    this.getTraggetTickets();
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;
    this.getMenuCounts();
    this.getTCCustomers();

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
      console.log("showinggg")
    });

    $(document).on('click', '.getinputfield1', function (this: any) {
      $('.input-popup-div1').hide();
      $(this).find('.input-popup-div1').show();
      // console.log("showinggg1")
    });

    $(document).on('click', '.input-popup-div1', function (e: any) {
      e.stopPropagation();  // Correctly stop event propagation
    });

    $(document).on('click', '.input-popup-div', function (e: any) {
      e.stopPropagation();  // Correctly stop event propagation
    });

    $(window).click(function (e: any) {
      if (!($(e.target).hasClass('getinputfield1') || $(e.target).closest('.getinputfield1').length)) {
        // $('.input-popup-div').hide();
        $('.input-popup-div1').hide();
        // console.log("closinggg1")
      }
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
        $('.input-popup-div').hide();
        // $('.input-popup-div2').hide();
        console.log("closinggg")
      }


    });


  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }


  Sub_Total_Cal(hours: any, T_C_Requests: any, tic: any) {
    if (!hours || hours == null) {
      return 0;
    }

    let numericHours = parseFloat(hours.toString().match(/[\d.]+/)[0]);
    // console.log("numericHours ", numericHours);

    // console.log("T_C_Requests ", T_C_Requests);
    // console.log("T_C_Requests length", T_C_Requests.length);
    let sub_total = 0;

    if (numericHours > 0 && T_C_Requests.length > 0) {
      let rates = 0;

      T_C_Requests.forEach((req: any) => {
        if (req.dispatch_to?.id === this.loggedinUser.id) {
          // console.log("if 2 ");
          rates = req.rate_per_hour;
        }
      });

      if (rates > 0) {
        // console.log("if * ");
        sub_total = numericHours * rates;
      }
    }

    return sub_total;
  }



  getTCCustomers() {
    const formData = new FormData();
    formData.append('user_id', this.user_id);
    this.trucking_service.getTCCustomers(formData).subscribe(response => {

      if (response.status && response.data) {
        this.cc_list = response.data;
        // console.log(" this is the cc list ", this.cc_list);
      } else {

      }
    })
  }


  formatDate(dateString: any): any {
    let date = new Date(dateString);
    return this.datePipe.transform(date, 'dd-MM-yyyy');
  }



  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    if (requestDetail?.ticket?.ticket_date && requestDetail?.ticket?.driver_ticket?.started_at) {
      const userTimeZone = this.loggedinUser?.time_zone || '';
      let ticketTime;
      if (round == 1) {
        ticketTime = requestDetail?.ticket?.driver_ticket?.started_at;
        if (ticketTime) {
          const time = new Date(ticketTime);
          ticketTime = time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      else if (round == 2) {
        ticketTime = this.requestDetail?.ticket?.ticket_time;
      }

      const ticketDate = requestDetail?.ticket?.ticket_date;

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion(data);
      //  let formattedDate = this.formatDate(conversionResult?.convertedDate);
      // console.log(" data ", data)
      // console.log(" conversionResult ", conversionResult)

      return conversionResult;
    } else {
      // console.log(" error ", requestDetail)
      return {};
    }
  }


  time_conversion2(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {

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
      ticketDate = dateTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      ticketTime = requestDetail;

      if (ticketTime) {
        const time = new Date(ticketTime);

        // Format the time to "12:28 am" style
        ticketTime = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
    else {
      return {};
    }
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
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  getTicketListing() {
    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('is_tc_project', this.selected_project?.trucking_company_id && this.selected_project?.trucking_company_id != '' ? 'YES' : "NO");
    formData.append('search_date', this.search_date);
    formData.append('search_Customer', this.search_Customer);
    formData.append('search_Customer_TC', this.search_Customer_TC);
    formData.append('search_status', this.search_status);

    formData.append('sort_type', this.sort_type);

    this.ticket_service.getAllTCClosedTickets(formData).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.all_tickets?.data;
        this.ticket_pagination = response.data?.all_tickets;
        this.pending_dispatches = response.data.pending_dispatches;
        this.total_without_tragget_tickets = response.data.total_without_tragget_tickets;
        console.log("closed tickets list ::: ", this.ticket_list);

      } else {
        this.message = response.message;
      }
    }
    );
  }

  getTruckTypes() {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.ticket_service.getTruckTypesForCompany(formData).subscribe(response => {
      if (response.status && response.data) {
        this.truck_type_list = response.data;

      } else {

      }
    })
  }

  getProjects() {

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.project_service.getTruckingProjects(formData).subscribe(response => {
      if (response.status && response.data) {
        this.project_list = response.data;
      } else {

      }
    })
  }

  handleChange(value: any) {
    this.page = 1;
    this.sort_by = value;
    this.getTicketListing();

  }
  handleSortByList(event: any) {
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

  handleFilterByProject(event: any) {
    this.page = 1;
    let proj_id = null;
    if (event) {
      $('.input-popup-div').hide();

      this.project_list.map((itm: any) => {
        if (itm && itm?.id.toString() + itm?.project_name.toString() == event) {
          this.search_project = itm.id;
          this.selected_project = itm;
        }
      })
    } else {
      $('.input-popup-div').hide();

      this.search_project = '';
      this.selected_project = null;
    }

    this.getTicketListing()
  }

  onSelectChange(company: any) {
    // console.log(" this is the onSelectChange ", company);
    // const selectElement = event.target as HTMLSelectElement;
    // const selectedIndex = selectElement.selectedIndex - 1; // Subtract 1 to account for the "All" option
    if (company && company != '') {
      const selectedCC = company;
      this.handleSearchCustomer(selectedCC);
      $('.input-popup-div1').hide();
    } else {
      $('.input-popup-div1').hide();
      // Handle the case when "All" is selected
      this.search_Customer = '';
      this.search_Customer_selected = null;
      this.search_Customer_TC = null
      this.handleSearchCustomer(null);
    }
  }



  handleSearchCustomer(company: any) {
    console.log(" this is the handleSearchCustomer ", company);


    this.page = 1;
    if (company != null) {
      this.search_Customer = company.id;
      this.search_Customer_selected = company;

    }
    if (company != null && company.email != null) {
      this.search_Customer_TC = null;
    }
    else if (company != null) {
      this.search_Customer_TC = 'YES';
    }
    console.log(" this is the handleSearchCustomer ", company);
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

  changeDate(event: any) {
    this.search_date = event.target.value;
    this.page = 1;
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
    this.detail_truck_name = '';

    this.requestDetail = ticket;

    this.total_rounds = 0;
    if (ticket?.ticket?.status == 'Approved' || ticket?.ticket?.status == 'Completed') {

      ticket?.ticket?.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          this.total_rounds++;

        }
      })
    } else {
      this.total_rounds = ticket?.ticket?.ticket_truck_type_rounds?.length;
    }
    setTimeout(() => {
      if (this.loggedinUser?.open_paper_ticket_photo == 'YES' && (ticket?.ticket?.status == 'Approved' || ticket?.ticket?.status == 'Completed') && ticket?.ticket?.required_paper_ticket_id == 'YES') {

        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 300);
      }
    }, 300);
  }

  getTotalTicketRounds(ticket: any) {
    let total_rounds = 0;
    if (ticket?.ticket?.status == 'Approved' || ticket?.ticket?.status == 'Completed') {

      ticket?.ticket?.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          total_rounds++;

        }
      })
    } else {
      total_rounds = ticket?.ticket?.ticket_truck_type_rounds?.length;
    }
    return total_rounds;
  }

  getTotalTrucks(ticket: any) {
    let total = 0;
    if (ticket.ticket_truck_types) {
      ticket.ticket_truck_types.map((item: any) => {
        total += parseFloat(item?.number_of_trucks.toString());
      })
    }
    return total;
  }

  getJobRate(ticket: any) {
    let total = 0;
    if (ticket.ticket_truck_types) {
      ticket.ticket_truck_types.map((item: any) => {
        total += parseFloat(item?.rate_per_hour.toString());
      })
    }
    return total;
  }

  redirecToDispatchList() {
    this.router.navigate(['/tickets-to-dispatch']);
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

    return total_time ? (total_time.toFixed(2)) : '';
  }

  parseJobTime(rounds: any) {
    var time: any = '';
    var hours = 0;
    var mints = 0;
    if (rounds && rounds.length > 0) {
      rounds.map((item: any) => {
        if (item && item.round_time) {
          var rr = item.round_time.split(' ');
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
    return total.toFixed(2);
  }

  isCombination(type: any) {
    var name = '';
    if (type && type.project_truck_id) {

      if (type.project_truck_id.toString().includes('c')) {
        var id = type.project_truck_id.toString().replace('c', '');

        this.project_service.getProjectCombination(id).subscribe(response => {
          if (response.status && response.data) {
            let comb = response.data
            if (comb?.truck) {

              name = comb?.truck?.name;
            }
          }
        })
      } else {
        name = '';
      }

    }
    return name;
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
    const userTimeZone = this.loggedinUser?.timezone || '';

    const difference = this.getTimeZoneDifferenceFormatted(sourceTimeZone, userTimeZone);

    let approver_time = '';
    if (ticket) {
      if (this.requestDetail?.ticket?.status == 'Approved' && this.requestDetail?.ticket?.driver_ticket?.approver_time != '') {
        approver_time = this.requestDetail?.ticket?.driver_ticket?.approver_time ? this.requestDetail?.ticket?.driver_ticket?.approver_time : '';

      }
      if (this.requestDetail?.ticket?.status == 'Approved' && (this.requestDetail?.ticket?.driver_ticket?.approver_time == '' || this.requestDetail?.ticket?.driver_ticket?.approver_time == 'null' || this.requestDetail?.ticket?.driver_ticket?.approver_time == null)) {
        approver_time = this.requestDetail?.ticket?.driver_ticket?.driver_hours + ' hr ' + this.requestDetail?.ticket?.driver_ticket?.driver_minutes + "min";
      }

      let data = {
        is_tc_ticket: this.requestDetail?.tc_ticket && this.requestDetail?.tc_ticket != '' ? "YES" : "NO",
        job_total: this.parseJobTime(this.requestDetail?.ticket?.ticket_truck_type_rounds),
        approver_time: approver_time,
        driver_total: this.requestDetail?.ticket?.driver_ticket?.driver_hours + ' hr ' + this.requestDetail?.ticket?.driver_ticket?.driver_minutes + "min",
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        ticket_id: this.requestDetail?.ticket.id,
        time_diff: difference
      }

      this.is_downloading = true;
      this.ticket_service.downloadClosedTicketPDF(data).subscribe(response => {

        this.is_downloading = false;
        if (response && !response.status) {
          if (response.message != "") {
            Swal.fire(
              {
                confirmButtonColor: '#17A1FA',
                title:
                  `Error`,
                text:
                  response.message
              })

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
      if (this.requestDetail?.ticket && (this.requestDetail?.ticket?.status == 'Approved' || this.requestDetail?.ticket?.status == 'Completed') && this.requestDetail?.ticket?.paper_ticket_photo) {
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 300);
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

  getCustomer(requests:any){
    let customer = null;
    requests?.map((reqDetail:any)=>{

      if( reqDetail.dispatch_by?.id !==
        this.user_id &&
      reqDetail.dispatch_by !== null &&
      reqDetail.dispatch_to_id == this.user_id){
        customer= reqDetail?.dispatch_by?.company_name;
      }
    })
    return customer;

  }
}
