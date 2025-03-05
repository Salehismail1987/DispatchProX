import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-tc-approved-popup',
  templateUrl: './tc-approved-popup.component.html',
  styleUrls: ['./tc-approved-popup.component.css']
})
export class TcApprovedPopupComponent implements OnInit {

  paperImageURL: any = environment.paperTicketImageUrl;

  loggedinUser: any = {};
  is_loading_approve: boolean = false;
  is_loading_decline: boolean = false;
  is_downloading: boolean = false;
  is_approver: boolean = false;

  show_redispatch: boolean = false;
  edited_hours: any;
  approver_notes: string = '';
  change_approver_ticket: string = '';
  error_approver: string = '';
  total_rounds: any = 0;
  redispatch_company: string = '';
  @Input('ticketDetail') ticketDetail: any;

  show_popup: boolean = true;
  detail_truck_name: any = '';
  show_edit_hours: boolean = false;

  new_approver: any = null;
  approvers: any = null;
  valid_hours: boolean = true;

  trucking_companies: any = null;
  is_dispatching: boolean = false;

  user_id: any = null;
  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private user_service: UserDataService,
    private project_service: ProjectService,
    private customer_service: CustomerService
  ) {
    if (this.ticketDetail) {

    }
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

  getSingleTicketRounds() {
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

  getApprovedTicketRounds() {
    let total_rounds = 0;
    if ((this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed') && this.ticketDetail?.driver_ticket?.approver_rounds == null) {

      this.ticketDetail?.ticket_truck_type_rounds.map((item: any) => {
        if (item.round_time && item.driver_start_time) {
          total_rounds++;

        }
      })
    } else {
      total_rounds = this.ticketDetail?.driver_ticket?.approver_rounds;
    }
    return total_rounds;
  }

  ngOnInit(): void {

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
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;


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
    // console.log(" conversionResult ", conversionResult)

    return conversionResult;
  }

  showPaperTicket() {
    setTimeout(() => {
      if (this.loggedinUser?.open_paper_ticket_photo == 'YES' && this.ticketDetail?.id && this.ticketDetail?.required_paper_ticket_id == 'YES' && (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed')) {

        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 1000);
      }
    }, 300);
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
        is_tc_ticket: !this.ticketDetail?.tc_ticket ? 'NO' : "YES",
        job_total: this.parseJobTime(this.ticketDetail?.ticket_truck_type_rounds),
        approver_time: approver_time,
        driver_total: this.ticketDetail?.driver_ticket?.driver_hours + ' hr ' + this.ticketDetail?.driver_ticket?.driver_minutes + "min",
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        ticket_id: this.ticketDetail?.id

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


  showTicketImage() {
    setTimeout(() => {
      if (this.ticketDetail && (this.ticketDetail?.status == 'Approved' || this.ticketDetail?.status == 'Completed') && this.ticketDetail?.paper_ticket_photo) {
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

}
