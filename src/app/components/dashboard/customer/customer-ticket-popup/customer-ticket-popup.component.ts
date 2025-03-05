import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { UserDataService } from 'src/app/services/user-data.service';
import { CustomerService } from 'src/app/services/customer.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-customer-ticket-popup',
  templateUrl: './customer-ticket-popup.component.html',
  styleUrls: ['./customer-ticket-popup.component.css']
})
export class CustomerTicketPopupComponent implements OnInit {
  showPopover = false;
  loggedinUser: any = {};
  is_loading_approve: boolean = false;
  is_loading_decline: boolean = false;
  is_downloading: boolean = false;
  is_approver: boolean = false;
  new_ticket_rate: any = null;
  quantity_to_show: any = '';

  show_redispatch: boolean = false;
  edited_hours: any;
  edited_rounds: any;
  approver_notes: string = '';
  change_approver_ticket: string = '';
  error_approver: string = '';
  total_rounds: any = 0;
  redispatch_company: string = '';
  @Input('ticketDetail') ticketDetail: any;
  @Input('roundId') roundId: number = 0;
  @Input('approver') approver: any;
  @Input('from_calendar') from_calendar: any = false;


  @Output() listing = new EventEmitter();

  show_popup: boolean = true;
  detail_truck_name: any = '';
  show_edit_hours: boolean = false;
  show_edit_round: boolean = false;

  new_approver: any = null;
  approvers: any = null;
  valid_hours: boolean = true;
  valid_rounds: boolean = true;

  trucking_companies: any = null;
  is_dispatching: boolean = false;


  paperImageURL: any = environment.paperTicketImageUrl;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private user_service: UserDataService,
    private project_service: ProjectService,
    private customer_service: CustomerService
  ) {
    if (this.ticketDetail  &&
      this.ticketDetail?.trucking_company_requests &&
      this.ticketDetail?.trucking_company_requests[0]?.rate_type == 'round') {
        this.setEditRounds()
    }
  }

  setRounds() {
    this.total_rounds = 0;
    if (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed') {

      this.ticketDetail?.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          this.total_rounds++;

        }
      })
    } else {
      this.total_rounds = this.ticketDetail?.ticket_truck_type_rounds?.length;
    }
  }

  getDriverDoneRounds() {
    let total_rounds = 0;
    if (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed') {

      this.ticketDetail?.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          total_rounds++;

        }
      })
    } else {
      total_rounds = this.ticketDetail?.ticket_truck_type_rounds?.length;
    }
    return total_rounds;
  }

  checkRateTypeRound() {
    if (this.ticketDetail?.trucking_company_requests && this.ticketDetail?.trucking_company_requests[0]?.rate_type == 'round'
    ) {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit(): void {

    document.addEventListener('click', (event) => {
      this.onDocumentClick(event);
    });

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

    if (this.loggedinUser && this.loggedinUser?.account_type && this.loggedinUser?.account_type == 'User' && this.loggedinUser.role?.role_name == 'Approver') {
      this.is_approver = true;
    }

    this.getTruckingCompanies();
    this.getApprovers();


  }

  time_conversion_common(timedate: any): { convertedDate?: string, convertedTime?: string } {
    if (!timedate) return {};
    let ticketTime;

    const userTimeZone = this.loggedinUser?.timezone || '';

    const [ticketDate, timePart] = timedate?.split(' ');

    const [hour, minute] = timePart?.split(':');

    let hour12 = parseInt(hour, 10);
    const amPm = hour12 >= 12 ? 'pm' : 'am';

    hour12 = hour12 % 12;
    hour12 = hour12 ? hour12 : 12;

    ticketTime = `${hour12}:${minute}${amPm}`;
    let data = { ticketTime, ticketDate, userTimeZone };
    let conversionResult = this.ticket_service.timeConversion(data);
    console.log(data, conversionResult, timedate)
    return conversionResult;
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

      const ticket_datetime: string = requestDetail; // Example input

      const [ticketDateee, timePart] = ticket_datetime.split(' ');

      ticketDate = ticketDateee;

      const [hour, minute] = timePart.split(':');

      let hour12 = parseInt(hour, 10);
      const amPm = hour12 >= 12 ? 'pm' : 'am';

      hour12 = hour12 % 12;
      hour12 = hour12 ? hour12 : 12;

      ticketTime = `${hour12}:${minute}${amPm}`;
    }
    else {
      return {};
    }
    let data = { ticketTime, ticketDate, userTimeZone };
    const conversionResult = this.ticket_service.timeConversion(data);
    console.log(" data ", data)
    console.log(" conversionResult ", conversionResult)

    return conversionResult;
  }


  showPaperTicket() {
    setTimeout(() => {

      if (this.ticketDetail && this.ticketDetail?.status === 'Completed' && this.loggedinUser?.id === this.ticketDetail?.approver?.id) {
        $('#nav-tab a[href="#round-detail"]').tab('show');
      }
      if (this.loggedinUser?.open_paper_ticket_photo == 'YES' && this.ticketDetail?.id && this.ticketDetail?.required_paper_ticket_id == 'YES' && (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed')) {

        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 1000);
      }
      this.show_popup = true;
      this.quantity_to_show = '';
      $(".approver_notes_textarea").val();
      this.approver_notes = '';

    }, 300);

  }

  changeHours(event: any) {
    if (event.target.value) {

      this.quantity_to_show = event.target.value;
    }
  }
  setEditHours() {
    if (this.ticketDetail?.status == 'Completed') {
      this.edited_hours = this.parseDriverTime(this.ticketDetail?.driver_ticket?.driver_hours, this.ticketDetail?.driver_ticket?.driver_minutes);
    }
  }
  setEditRounds() {
    if (this.ticketDetail?.status == 'Completed') {
      this.edited_rounds = this.getDriverDoneRounds();
    }
  }

  getTruckingCompanies() {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.customer_service.getCustomerCompanies(formData).subscribe(response => {

      if (response.status && response.data) {
        this.trucking_companies = response.data;
        if (this.trucking_companies && this.trucking_companies.length > 0 && this.trucking_companies[0] && this.trucking_companies[0].id) {

        }
      } else {

      }
    })
  }

  changeApprover() {
    this.change_approver_ticket = 'show';
  }

  setUpdatedApprover(appr: any) {
    if (appr.target.value) {
      this.new_approver = appr.target.value;

    }
  }

  getApprovers() {
    const formData = new FormData();

    formData.append('type', 'Approver');
    formData.append('project_id', this.ticketDetail?.project_id ? this.ticketDetail?.project_id : null);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.approvers = response.data;

      } else {

      }
    })
  }

  updateApprover() {

    if (this.new_approver == "") {
      this.error_approver = 'Selection of approver required.';
      return;
    }
    const formData = new FormData();

    formData.append('ticket_id', this.ticketDetail.id);
    let is_tc_ticket = this.ticketDetail?.tc_ticket && this.ticketDetail?.tc_ticket == 'YES' ? 'YES' : 'NO';
    formData.append('is_tc_ticket', is_tc_ticket);
    formData.append('approver_id', this.new_approver ? this.new_approver : this.ticketDetail.approver_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.ticket_service.changeApprover(formData).subscribe(response => {

      if (response.status && response.ticket) {
        this.ticketDetail.approver_id = this.new_approver;
        this.ticketDetail = response.ticket;
        this.new_approver = '';
        this.change_approver_ticket = '';
        this.getMenuCounts();
        this.listing.emit();
        // const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire('Success',response.message)
        this.togglePopover();
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

  is_only_approver(roles: any) {

    let is_approver: boolean = false;
    if (roles && roles?.length > 0) {
      roles.map((item: any) => {
        is_approver = item?.role?.role_name == "Approver" ? true : false;
      });


      if (roles.length == 1 && is_approver) {
        is_approver = true;
      } else {
        is_approver = false;
      }
    }


    return is_approver;
  }

  getMenuCounts() {
    let data = { orginal_user_id: this.loggedinUser.id, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    if (this.is_only_approver(this.loggedinUser?.user_roles) || this.loggedinUser?.account_type == 'Customer') {
      data = { orginal_user_id: null, user_id: this.loggedinUser.id, account_type: this.loggedinUser?.account_type };

    }
    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }

  closeApproverModal() {
    this.new_approver = '';
    this.change_approver_ticket = '';
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2 no-shadow";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white  no-shadow";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white  no-shadow";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white  no-shadow";
        break;
      case 'Accepted':
        return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2 no-shadow";
        break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white  no-shadow";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white  no-shadow";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue  no-shadow";
  }
  increamentRound() {
    return this.roundId++;
  }

  changeSet(event: any) {
    console.log(event.target.value);

    this.quantity_to_show = event.target.value;
    if (event.target.value && parseInt(event.target.value) < 0) {
      this.edited_hours = '';

      this.valid_hours = false;
      return;
    } else {
      this.edited_hours = event.target.value;
      this.valid_hours = true;
    }

    // alert(this.edited_hours);
  }

  changeRoundSet(event: any) {
    console.log(event.target.value);

    this.quantity_to_show = event.target.value;
    if (event.target.value && parseInt(event.target.value) < 0) {
      this.edited_rounds = '';

      this.valid_rounds = false;
      return;
    } else {
      this.edited_rounds = event.target.value;
      this.valid_rounds = true;
    }

    // alert(this.edited_hours);
  }

  handleRejectTicket(ticket: any) {

    let userid = this.loggedinUser.id;
    if (this.is_approver) {
      userid = this.loggedinUser.id;
    }
    let data = { user_id: userid, ticket_id: ticket.id };
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure that you want to decline the Ticket ID  ' + ticket.ticket_no + '?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      cancelButtonText: 'No'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.ticket_service.approverRejectTicket(data).subscribe(response => {

          if (response.status) {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire(
              `Success`,
              response.message).then(() => {
                this.getMenuCounts();
                this.listing.emit();
                if (this.is_approver) {

                  this.router.navigate(['/approver-tickets']);
                } else {

                  this.router.navigate(['/customer-ticket-listing']);
                }
              });
          } else {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire(
              `Error`,
              response.message).then(() => {

              });
          }
        });
      }
    });

  }

  handleApproveTicket(ticket: any) {
    let new_hours = "";

    if (this.checkRateTypeRound()) {
      this.show_edit_round =true;
      new_hours = $("#edited_rounds").val();

      if(!new_hours){
        this.setEditRounds();
        new_hours = this.edited_rounds;
      }
      // this.show_edit_round =false;
    } else {
      new_hours = $("#edited_hours").val();
      if(!new_hours){
        this.setEditHours();
        new_hours = this.edited_hours;
      }
    }

    if (new_hours && parseInt(new_hours) < 0) {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        `Error`,
        `Negative ${this.checkRateTypeRound() ? 'rounds' : 'hours'} not allowed`).then(() => {
          return;
        });
      return;
    }
    let data = {
      is_tc_ticket: this.ticketDetail?.tc_ticket && this.ticketDetail?.tc_ticket == 'YES' ? 'YES' : "NO",
      user_id: this.loggedinUser.id, ticket_id: ticket.id, edited_hours: new_hours, approver_notes: this.approver_notes, is_edited_hours: this.checkRateTypeRound()
    };
    console.log('payload -->', data);
    this.is_loading_approve = true;

    this.ticket_service.approverTicket(data).subscribe(response => {
      this.is_loading_approve = false;
      if (response.status) {
        // const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire( `Success`, response.message)
        //   .then(() => {

        //   });


        if (this.router.url.includes('project-profile')) {

        } else {
          if (response.is_trial_started) {
            window.location.href = '/customer-ticket-listing';
          }

          if (this.approver) {
            this.router.navigate(['/tc-approver-tickets']);
          } else {
            this.router.navigate(['/customer-ticket-listing']);
          }
        }



        this.edited_hours = '';
        this.edited_rounds = '';
        this.quantity_to_show = '';
        this.approver_notes = '';
        this.show_edit_hours = false;
        this.show_edit_round = false;
        this.getMenuCounts();
        this.listing.emit();


      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    });
  }

  hourData(hour: any, mint: any) {
    var mint_per = mint / 60;
    if (mint_per > 0 && mint_per < 0.25) {
      mint_per = 0.25;
    }
    if (mint_per > 0.25 && mint_per < 0.50) {
      mint_per = 0.50;
    }
    if (mint_per > 0.50 && mint_per < 0.75) {
      mint_per = 0.75;
    }
    if (mint_per > 0.75 && mint_per < 1) {
      hour = hour + 1;
      mint_per = 0;
    }
    return parseFloat(hour) + parseFloat(mint_per.toString());
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

    return hours + (mints / 60) + ' hr';
  }

  closeModal() {
    this.ticketDetail = null;
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

  toggleEditHours() {
    this.show_edit_hours = !this.show_edit_hours;
  }

  toggleEditRounds() {
    this.show_edit_round = !this.show_edit_round;
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
        is_tc_ticket: this.ticketDetail?.tc_ticket && this.ticketDetail?.tc_ticket == 'YES' ? "YES" : "NO",
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

  showRedispatchModal() {
    this.new_ticket_rate = this.ticketDetail?.ticket_truck_type?.rate_per_hour;
    this.show_redispatch = true;
    this.is_dispatching = false;
  }

  setRedispatchCompany(event: any) {
    if (event.target.value) {
      // alert(event.target.value)
      this.redispatch_company = event.target.value;
    }
  }

  hideRedispatchModal() {
    this.show_redispatch = false;
  }

  getTicketDetail() {
    let data: any = {
      id: this.ticketDetail?.id
    };
    this.ticket_service.getTicketDetail(data).subscribe(response => {
      if (response && response.status) {
        this.ticketDetail = response.data;
      }
    });

  }

  handleRedispatch() {

    if (this.redispatch_company != '') {

      this.is_dispatching = true;
      let data: any = {
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        ticket_id: this.ticketDetail?.id,
        trucking_company_id: this.redispatch_company,
        ticket_truck_type_id: this.ticketDetail?.ticket_truck_type_id,
        rate_per_hour: this.new_ticket_rate
      }
      this.ticket_service.redispatchTicket(data).subscribe(response => {

        this.is_dispatching = false;
        if (response && response.status) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Success', response.message).then(() => {
            this.getMenuCounts();
            this.listing.emit();
            this.show_redispatch = false;
            this.redispatch_company = '';
            this.getTicketDetail();
            if (this.approver) {
              this.router.navigate(['/approver-approved-tickets']);
            } else {
              this.router.navigate(['/customer-ticket-listing']);
            }
          })

        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Error', response.message)

        }
      });
    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire('Warning', 'Select a trucking company to re-dispatch')
    }
  }

  onDocumentClick(event: MouseEvent) {
    const popoverContainer = document.querySelector('.popover-container');
    const button = document.querySelector('.btn-approver-change');
    if (popoverContainer && button && !button.contains(event.target as Node) && !popoverContainer.contains(event.target as Node)) {
      this.showPopover = false;
    }
  }

  togglePopover() {
    this.showPopover = !this.showPopover;
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
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

  moveToDeclined(ticket_id: any) {
    let data = {
      user_id: this.loggedinUser.id,
      ticket_id: ticket_id,
      account_type: 'Customer'
    }

    this.ticket_service.moveTicketToDeclined(data).subscribe(response => {
      if (response.status && response.message) {
        // this.hideRedispatchModal();
        setTimeout(() => {
          $(".modal-backdrop").remove();

          $('body').removeClass('modal-open');
          $("body").attr("style", "");

          $('.come-from-modal').hide();
          $('.come-from-modal').modal('hide');
          $('.come-from-modal').removeClass('show');
          $(".come-from-modal").attr("style", "display:none;");
          $(".come-from-modal").removeAttr('role aria-modal');
          $(".come-from-modal").attr('aria-hidden', 'true');
        }, 300);
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success', response.message).then(() => {

          this.listing.emit();
          // $("#myModal").modal('hide');
          // this.router.navigate(['/customer-ticket-listing']);
          window.location.href = '/customer-ticket-listing';

        });
      }
    });
  }

  set_rate(event: any) {
    this.new_ticket_rate = event.target.value;
  }

  getTicket(tickets: any) {
    if (tickets && tickets?.length) {

      var total = tickets.length;
      if (total > 1) {
        var ticket = tickets[0]?.ticket?.ticket_no + '-' + tickets[total - 1]?.ticket?.state_wise_no;
        return ticket + ' [' + tickets.length + ']';
      } else {
        return tickets[0]?.ticket?.ticket_no;
      }
    }

  }

  closeModal2() {
    $('#myModalGetCamera').modal('hide')
  }
}
