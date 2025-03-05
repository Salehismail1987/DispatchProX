import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { TruckingDispatchService } from 'src/app/services/trucking-dispatch.service';
import { UserDataService } from 'src/app/services/user-data.service';

import { environment } from 'src/environments/environment';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
declare var $: any;

@Component({
  selector: 'app-tc-ticket-listing',
  templateUrl: './tc-ticket-listing.component.html',
  styleUrls: ['./tc-ticket-listing.component.css']
})
export class TcTicketListingComponent implements OnInit {

  is_subscribed: boolean = false;
  is_downloading: boolean = false;
  loggedinUser: any = {};
  message: any;
  is_loading: boolean = false;
  requestDetail: any;
  project_list: any;
  truck_type_list: any;
  pending_dispatches: number = 0;

  // Listing Contanier
  ticket_list: any;
  ticket_pagination: any;
  sort_by: any = 'recently created';
  quantity_to_show: any = '';

  is_loading_approve: boolean = false;
  show_edit_hours: boolean = false;
  cc_id: any = null;
  cc_name: any = null;
  search_cc_tc: any = null;
  search_cc_tc_email: any = null;
  trucking_companies_list: any = null;
  project_id: any = null;

  sort_type: any = 'ASC';
  perPage: number = 25;
  page: number = 0;
  search_by: any = '';
  search_date: string = '';
  search_project: any = '';
  search_project_name: any = '';

  approvers: any = null;
  new_approver: any = null;
  is_new_tc_approver: any = 'NO';
  error_approver: any = '';
  search_project_tc: any = null;
  search_truck_type: any = '';
  search_status: any = '';
  active_menu: any;
  detail_truck_name: any = '';
  total_rounds: any = 0;
  user_id: any;
  is_free_trial: any = '';
  Unknown: number = 0;
  last_round: any = null;
  show_buttons: boolean = false;
  all_checked: boolean = false;
  checked_tickets: any = {};
  selected_ticket_list: any;

  paperImageURL: any = environment.paperTicketImageUrl;

  cc_list: any = null;

  valid_hours: boolean = true;
  edited_hours: any;
  approver_notes: string = '';
  showPopover: boolean = false;
  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private customer_service: CustomerService,
    private trucking_service: TruckingCompanyService,
    private actRouter: ActivatedRoute,
    private tc_dispatch_service: TruckingDispatchService,
    private user_service: UserDataService
  ) {



    this.active_menu = {
      parent: 'tickets',
      child: 'dispatched-tickets',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.sort_by = 'dispatch_date';
    this.search_by = '';
    this.search_status = '';

    if (this.actRouter.snapshot.queryParams['status'] && this.actRouter.snapshot.queryParams['status'] != '') {
      this.search_status = this.actRouter.snapshot.queryParams['status'];
    }

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
    this.getProjects();
    this.getTruckTypes();
    this.getTicketListing();
    this.getMenuCounts();
    this.getTCCustomers();

    $(document).on('click', '.getinputfield', function (this: any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
      // console.log("showinggg1")
    });

    $(document).on('click', '.input-popup-div', function (e: any) {
      e.stopPropagation();  // Correctly stop event propagation
    });
    $(document).on('click', '.getinputfield1', function (this: any) {
      $('.input-popup-div1').hide();
      $(this).find('.input-popup-div1').show();
      // console.log("showinggg1")
    });

    $(document).on('click', '.input-popup-div1', function (e: any) {
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
      }


    });


  }


  getTCCustomers() {
    const formData = new FormData();
    formData.append('user_id', this.user_id);
    this.trucking_service.getTCCustomers(formData).subscribe(response => {

      if (response.status && response.data) {
        this.cc_list = response.data;
      } else {

      }
    })
  }


  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    if (requestDetail?.ticket?.ticket_date && this.requestDetail?.ticket_truck_type?.ticket_truck_type_rounds[0]?.start_time) {
      const userTimeZone = this.loggedinUser?.timezone || '';
      let ticketTime;

      if (round == 1) {
        ticketTime = this.requestDetail?.ticket_truck_type?.ticket_truck_type_rounds[0]?.start_time;
      }
      else if (round == 2) {
        ticketTime = this.requestDetail?.ticket?.ticket_time;
      }
      else if (round == 3) {
        const ticket_datetime: string = this.requestDetail?.ticket?.driver_ticket?.started_at; // Example input

        const [ticketDateee, timePart] = ticket_datetime.split(' ');

        const [hour, minute] = timePart.split(':');

        let hour12 = parseInt(hour, 10);
        const amPm = hour12 >= 12 ? 'pm' : 'am';

        hour12 = hour12 % 12;
        hour12 = hour12 ? hour12 : 12;

        ticketTime = `${hour12}:${minute}${amPm}`;
      }
      const ticketDate = requestDetail?.ticket?.ticket_date;

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion(data);
      // console.log('data ** :', data);
      // console.log('Converted Date ** :', conversionResult.convertedDate);
      // console.log('Converted Time ** :', conversionResult.convertedTime);

      return conversionResult;
    } else {
      return {};
    }
  }

  getApprovers() {
    let data = { user_id: this.user_id, action: 'all_tc_approvers' }
    this.tc_dispatch_service.getAllData(data).subscribe(response => {

      if (response.status && response.data) {
        this.approvers = response.data;
        setTimeout(() => {

        }, 400);
      }
    });
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

  getTicketListing() {
    this.is_loading = true;
    const formData = new FormData();
    this.selected_ticket_list = null;
    this.show_buttons = false;
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('search_project_tc', this.search_project_tc);
    formData.append('search_cc_tc', this.search_cc_tc);
    formData.append('search_cc_tc_email', this.search_cc_tc_email);

    formData.append('customer_id', this.cc_id);
    formData.append('search_date', this.search_date);
    formData.append('search_truck_type', this.search_truck_type);
    formData.append('search_status', this.search_status);

    formData.append('sort_type', this.sort_type);

    this.ticket_service.getAllTCTickets(formData).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.all_tickets?.data;
        this.ticket_pagination = response.data?.all_tickets;
        this.pending_dispatches = response.data.pending_dispatches;
        console.log(this.ticket_list);
        if (response.data?.Unknown) {
          this.Unknown = response.data?.Unknown;
          if (!isNaN(this.Unknown)) {
            let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');
            // Add or update Unknown_disp
            storedMenuCounts.Unknown_disp = this.Unknown;
            // Update the local storage with the new value
            localStorage.setItem('Unknown_disp', JSON.stringify(storedMenuCounts));
          }
        }
        else {
          this.Unknown = 0;
          let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');
          storedMenuCounts.Unknown_disp = this.Unknown;
          localStorage.setItem('Unknown_disp', JSON.stringify(storedMenuCounts));
        }
        this.is_free_trial = response.data?.is_trial;
        // console.log('Unknown TC : ', response.data?.Unknown );

      } else {
        this.message = response.message;
      }
    }
    );
  }



  toggleEditHours() {
    this.show_edit_hours = !this.show_edit_hours;
  }


  // The master checkbox will check/ uncheck all items
  checkUncheckAll(evt: any) {

    this.ticket_list.forEach((c: any) => {
      if (c.ticket?.trucking_company_id == this.user_id && c.tc_ticket == 'YES' && (c.ticket?.status == 'Accepted' || c.ticket?.status == 'Pending')) {
        c.is_selected = evt.target.checked

      }
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
    this.ticket_list[index].is_selected = evt.target.checked
    this.all_checked = this.ticket_list.every(function (item: any) {
      return item.is_selected == true;
    })

    this.getCheckedItemList();
    console.log(this.ticket_list[index].ticket, this.selected_ticket_list)
  }

  selectRow(index: any) {

    if (index || index == 0) {

      if (this.ticket_list[index].is_selected == true) {

        this.ticket_list[index].is_selected = false
        $("#checkbox" + index).attr('checked', false);
      } else {

        this.ticket_list[index].is_selected = true
        $("#checkbox" + index).attr('checked', true);
      }

      this.all_checked = this.ticket_list.every(function (item: any) {
        return item.is_selected == true;
      })
      this.getCheckedItemList();
      console.log(this.ticket_list)

    }

  }

  // Get List of Checked Items
  getCheckedItemList() {
    this.selected_ticket_list = [];
    for (var i = 0; i < this.ticket_list.length; i++) {
      if (this.ticket_list[i].is_selected) {
        this.selected_ticket_list.push(this.ticket_list[i]);
      }
    }
    this.selected_ticket_list = this.selected_ticket_list;
    // console.log(this.selected_ticket_list)
    this.show_buttons = this.selected_ticket_list.length > 0 ? true : false;
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


  updateApprover() {

    if (this.new_approver == "") {
      this.error_approver = 'Selection of approver required.';
      return;
    }
    const formData = new FormData();

    formData.append('ticket_id', this.requestDetail?.ticket.id);
    let is_tc_ticket = this.requestDetail?.ticket?.tc_ticket && this.requestDetail?.ticket?.tc_ticket == 'YES' ? 'YES' : 'NO';
    formData.append('is_tc_ticket', is_tc_ticket);
    formData.append('is_tc_approver', this.is_new_tc_approver);
    formData.append('approver_id', this.new_approver ? this.new_approver : this.requestDetail?.ticket.approver_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.ticket_service.changeApprover(formData).subscribe(response => {

      if (response.status && response.ticket) {
        if (this.is_new_tc_approver == 'YES') {

          this.requestDetail.ticket.tc_approver_id = this.new_approver;
        } else {

          this.requestDetail.ticket.approver_id = this.new_approver;
        }
        this.requestDetail.ticket = response.ticket;
        this.new_approver = '';
        this.is_new_tc_approver = 'NO';
        this.getMenuCounts();
        this.getTicketListing();

        // Swal.fire(
        //   {
        //    confirmButtonColor:'#17A1FA',
        //    title:
        //    `Success!`,
        //    text:
        //    response.message

        //  })
        this.togglePopover();
      } else {

        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title:
              `Error!`,
            text:
              response.message

          })
      }
    })
  }


  getRoundInProgress(ticket: any) {
    let round_in_progress: any = null;
    if (ticket) {

      if (ticket?.ticket_truck_type_rounds && ticket?.ticket_truck_type_rounds) {
        let rounds = [];
        rounds = ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {
          if (rounds[i] && rounds[i].id && rounds[i].driver_start_time != null && !rounds[i].end_time) {
            round_in_progress = rounds[i];
            // if (this.round_in_progress && this.round_in_progress?.driver_start_time) {
            //   this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            // }
            break;
          }
        }
      }

    }
    return round_in_progress;
  }

  getAllRoundDone(ticket: any) {
    let all_done: any = true;
    if (ticket) {
      ticket?.ticket_truck_type_rounds?.map((item: any) => {
        if (!item?.end_time) {
          all_done = false;
        }
      })
    }
    return all_done;
  }

  getLastRound(tickt: any, modal: any = null) {

    this.last_round = null;
    if (tickt?.ticket_truck_type_rounds?.length > 0) {
      let isFound: boolean = false;
      tickt?.ticket_truck_type_rounds?.map((round: any) => {
        if (round?.driver_start_time == null && !isFound)
          this.last_round = round;
        isFound = true;
      })
      if (!this.last_round) {
        tickt?.ticket_truck_type_rounds?.map((round: any) => {
          this.last_round = round;
        })
      }


    }
  }

  getRoundToStart(ticket: any) {

    let round_to_start = null;
    if (ticket && ticket) {

      if (ticket?.ticket_truck_type_rounds && ticket?.ticket_truck_type_rounds) {
        let rounds = [];

        rounds = ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {


          if (rounds[i] && rounds[i].id && (rounds[i].driver_start_time == '' || rounds[i].driver_start_time == null)) {

            round_to_start = rounds[i];
            break;
          }

        }
      }
    }
    return round_to_start;
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

    this.sort_by = value;
    this.page = 1;
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

  handleFilterByProject(event: any) {
    if (event && event != '') {
      var proj = null;
      this.project_list.forEach((element: any) => {
        if (element.id.toString() + element.project_name == event.toString()) {
          proj = element;
          console.log(" this si project ::: ", proj)
          this.search_project = proj.id;
          this.search_project_name = proj.project_name;
          if (proj.trucking_company_id) {
            this.search_project_tc = 'YES';
          } else {
            this.search_project_tc = 'NO';
          }
        }
      });

      $('.input-popup-div').hide();

    } else {
      this.search_project = '';
      this.search_project_name = '';
      this.search_project_tc = 'NO';
      $('.input-popup-div').hide();

    }
    this.page = 1;

    this.getTicketListing()
  }

  handleType(event: any) {
    this.page = 1;
    this.search_truck_type = event.target.value;
    this.getTicketListing()
  }

  changePage(page: any) {
    this.page = page;
    this.getTicketListing();
  }

  parsePage(page: any) {
    return parseInt(page.toString());
  }

  handleApproveTicket(ticket: any) {

    var new_hours = $("#edited_hours").val();
    if (new_hours && parseInt(new_hours) < 0) {

      Swal.fire(
        {
          confirmButtonColor: '#17A1FA',
          title:
            `Error!`,
          text:
            "Negative hours not allowed"

        })
      return;
    }
    let data = {
      is_tc_ticket: this.requestDetail?.ticket?.tc_ticket && this.requestDetail?.ticket?.tc_ticket == 'YES' ? 'YES' : "NO",
      user_id: this.loggedinUser.id, ticket_id: ticket?.ticket?.id, edited_hours: new_hours, approver_notes: this.approver_notes
    };
    this.is_loading_approve = true;

    this.ticket_service.approverTicket(data).subscribe(response => {
      this.is_loading_approve = false;
      if (response.status) {
        // Swal.fire(
        //   {
        //    confirmButtonColor:'#17A1FA',
        //    title:
        //    `Success`,
        //    text:
        //   response.message

        //  }).then(() => {


        // });
        if (response.is_trial_started) {
          window.location.href = "/tc-ticket-listing";
        }
        this.getMenuCounts();
        this.getTicketListing();

        this.edited_hours = '';
        this.quantity_to_show = '';
        this.approver_notes = '';
        this.show_edit_hours = false;

      } else {
        Swal.fire(
          {
            confirmButtonColor: '#17A1FA',
            title:
              `Error!`,
            text:
              response.message

          }).then(() => {

          });
      }
    });
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
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white no-shadow";
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
      case 'Unknown':
        return "mybtn bg-Unknown width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white no-shadow";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue no-shadow";
  }

  setDetailTicket(ticket: any) {


    this.detail_truck_name = '';

    this.requestDetail = ticket;

    setTimeout(() => {
      if (this.requestDetail?.ticket?.status === 'Completed' && this.loggedinUser?.id === this.requestDetail?.ticket?.approver?.id) {
        $('#nav-tab a[href="#round-detail"]').tab('show');
        this.approver_notes ='';

      } else {
        $('#nav-tab a[href="#ticket-detail"]').tab('show');

      }
    }, 300);
    this.edited_hours = this.parseDriverTime(this.requestDetail?.ticket?.driver_ticket?.driver_hours,
      this.requestDetail?.ticket?.driver_ticket?.driver_minutes);
    this.total_rounds = 0;
    if (ticket?.ticket?.status == 'Approved' || ticket?.ticket?.status == 'Completed') {
      if (ticket?.ticket?.driver_ticket?.approver_rounds != null) {
        this.total_rounds = ticket?.ticket?.driver_ticket?.approver_rounds;
      } else {
        ticket?.ticket?.ticket_truck_type_rounds.map((item: any) => {
          if (item.round_time && item.driver_start_time) {
            this.total_rounds++;

          }
        });
      }
    } else {
      console.log(ticket.ticket?.ticket_truck_type_rounds.length)
      this.total_rounds = ticket?.ticket?.ticket_truck_type_rounds?.length;
    }
    setTimeout(() => {
      if (this.requestDetail?.ticket?.status === 'Completed' && this.loggedinUser?.id === this.requestDetail?.ticket?.approver?.id) {
        $('#nav-tab a[href="#round-detail"]').tab('show');
        this.approver_notes = '';
      }
      if (this.loggedinUser?.open_paper_ticket_photo == 'YES' && (ticket?.ticket?.status == 'Approved' || ticket?.ticket?.status == 'Completed') && ticket?.ticket?.required_paper_ticket_id == 'YES') {
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width() + "px");
        }, 300);

      }
    }, 300);

  }

  getDriverTotalRounds() {
    let total_rounds = 0;
    if (this.requestDetail?.ticket?.status == 'Approved' || this.requestDetail?.ticket?.status == 'Completed') {
      if (this.requestDetail?.ticket?.driver_ticket?.approver_rounds != null) {
        total_rounds = this.requestDetail?.ticket?.driver_ticket?.approver_rounds;
      } else {
        this.requestDetail?.ticket?.ticket_truck_type_rounds.map((item: any) => {
          if (item.round_time && item.driver_start_time) {
            total_rounds++;
          }
        });
      }
    } else {
      total_rounds = this.requestDetail?.ticket?.ticket_truck_type_rounds?.length;
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

    return total_time ? (total_time.toFixed(2)) + ' hr' : '';
  }

  parseJobTime(rounds: any) {
    var time: any = '';
    var hours = 0;
    var mints = 0;
    if (rounds && rounds.length > 0) {
      rounds.map((item: any) => {
        if (item.round_time) {
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

  getMenuCounts() {
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


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


  handlePDFDownload(ticket: any) {
    let approver_time = '';
    if (ticket) {
      if (this.requestDetail?.ticket?.status == 'Approved' && this.requestDetail?.ticket?.driver_ticket?.approver_time != '') {
        approver_time = this.requestDetail?.ticket?.driver_ticket?.approver_time ? this.requestDetail?.ticket?.driver_ticket?.approver_time : '';

      }
      if (this.requestDetail?.ticket?.status == 'Approved' && (this.requestDetail?.ticket?.driver_ticket?.approver_time == '' || this.requestDetail?.ticket?.driver_ticket?.approver_time == 'null' || this.requestDetail?.ticket?.driver_ticket?.approver_time == null)) {
        approver_time = this.requestDetail?.ticket?.driver_ticket?.driver_hours + ' hr ' + this.requestDetail?.ticket?.driver_ticket?.driver_minutes + "min";
      }

      let data = {
        job_total: this.parseJobTime(this.requestDetail?.ticket?.ticket_truck_type_rounds),
        approver_time: approver_time,
        driver_total: this.requestDetail?.ticket?.driver_ticket?.driver_hours + ' hr ' + this.requestDetail?.ticket?.driver_ticket?.driver_minutes + "min",
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
        ticket_id: this.requestDetail?.ticket.id,
        is_tc_ticket: this.requestDetail?.tc_ticket && this.requestDetail?.tc_ticket != '' ? "YES" : "NO"
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
                  `Error!`,
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

  setUpdatedApprover(appr: any) {
    if (appr.target.value) {
      let approver = null;
      this.approvers.map((item: any) => {
        if (item.id == appr.target.value) {
          approver = item;
          this.is_new_tc_approver = approver?.trucking_company_id ? 'YES' : 'NO';
        }
      })

      this.new_approver = appr.target.value;

    }
  }

  // setCC(event:any){
  //   if(event && event.target.value &&  event.target.value !=''){
  //     var cc = null;
  //     console.log("cc list ",this.cc_list )
  //     this.cc_list.forEach((element:any) => {
  //       if(element.id.toString()+element.company_name == event.target.value){
  //         cc = element;
  //         this.cc_id=cc.id;
  //         if(cc.trucking_company_id){
  //           this.search_cc_tc_email = cc.email;
  //           this.search_cc_tc = 'YES';
  //         }else{
  //           this.search_cc_tc = 'NO';
  //         }
  //       }
  //     });


  //     this.getTicketListing();
  //     return;
  //   }

  //   this.search_cc_tc_email = null;
  //   this.search_cc_tc = 'NO';
  //     this.cc_id= null;
  //     this.getTicketListing();

  // }


  setCC(event: any) {
    if (event && event != '') {
      var cc = null;
      this.cc_list.forEach((element: any) => {

        if (element.id.toString() + element.company_name == event.toString()) {
          cc = element;
          this.cc_id = cc.id;
          this.cc_name = cc.company_name;
          if (cc.trucking_company_id) {
            this.search_cc_tc_email = cc.email;
            this.search_cc_tc = 'YES';
          } else {
            this.search_cc_tc = 'NO';
          }
        }
      });

      $('.input-popup-div1').hide();

      this.getTicketListing();
      return;
    }
    $('.input-popup-div1').hide();

    this.search_cc_tc_email = null;
    this.search_cc_tc = 'NO';
    this.cc_id = null;
    this.cc_name = null;
    this.getTicketListing();

  }



  getLastRoundId(tickt: any) {

    let last_round: any = null;
    if (tickt?.ticket?.ticket_truck_type_rounds?.length > 0) {
      let isFound: boolean = false;
      tickt?.ticket_truck_type_rounds?.map((round: any) => {
        if (round?.driver_start_time == null && !isFound)
          last_round = round;
        isFound = true;
      })
      if (!last_round) {
        tickt?.ticket_truck_type_rounds?.map((round: any) => {
          last_round = round;
        })
      }

    }
    return last_round?.id;
  }

  setProject(event: any) {
    if (event && event.target.value && event.target.value != '') {

      this.project_id = event.target.value;
      this.getTicketListing();
      return;
    }
    this.project_id = null;
    this.getTicketListing();

  }


  getLastDoneRound(rounds: any) {
    let last_done_round: any = null;
    if (rounds) {
      rounds?.map((round: any) => {
        if (round?.driver_start_time != null && round?.end_time != null) {
          last_done_round = round;
        }
      });

    }
    return last_done_round;
  }

  closeModal2() {
    $('#myModalGetCamera').modal('hide')
  }

}
