import { Component, Directive, ElementRef, Input, OnInit, ViewRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CountupTimerComponent, countUpTimerConfigModel } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { environment } from 'src/environments/environment';
import { map, timer } from 'rxjs';
import { Subject, interval } from 'rxjs';
import { ProjectService } from 'src/app/services/project.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from 'src/app/services/ticket.service';

declare var $: any;
export interface Entry {
  created: Date;
  id: string;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}



@Component({
  selector: 'app-tc-inprogress-job-detail',
  templateUrl: './tc-inprogress-job-detail.component.html',
  styleUrls: ['./tc-inprogress-job-detail.component.css']
})
export class TcInprogressJobDetailComponent implements OnInit {

  @Input('dt_id') dt_id: any = null;
  @Input('from_list') from_list: boolean = false;
  loading_send_approval: boolean = false;

  detail_round: any = null;
  hours: any = null;
  ticket_detail: any = null;
  screen: string = 'mobile';
  loggedinUser: any;
  driver_ticket_id: any;
  round_to_start: any = null;
  round_in_progress: any = null;

  edited_hours: any = null;
  edited_mints: any;

  edit_haulback: any = null;
  active_tab: string = 'rounds-detail';

  private destroyed$ = new Subject();


  roundTime: any;
  jobTime: any;

  all_rounds_done: boolean = false;

  ticket_to_decline: any = null;
  show_reason: boolean = false;

  reason_decline: string = '';
  reason_error: string = '';

  loading_reject: boolean = false;
  notes_for_approval: any;

  loading_details: boolean = true;

  more_tickets: any = null;
  more_more_tickets: any = null;
  date_today: any;

  dump_sites: any = null;
  show_add_droplocation: any = false;
  show_edit_address_dl: any = false;
  // Round Updates
  new_dum_site: string = '';
  current_site: string = '';
  new_material_taken_out: string = '';
  driver_round_notes: string = '';
  show_round_update_popup: string = '';
  update_round_id: any = null;

  new_material_error: string = '';
  round_notes_error: string = '';
  new_dumpsite_error: string = '';

  job_notes_error: string = '';
  pickup_site_error: string = '';
  detail_round_id: any = null;
  loading_update: boolean = false;

  show_notes_popup: boolean = false;
  show_time_edit_popup: boolean = false;
  notification_id: any = null;
  notification_type: any = null;
  pickup_site: any = null;

  show_add_dumpsite: boolean = false;
  addDumpsite!: FormGroup;
  editDL!: FormGroup;
  loading_add: boolean = false;
  isFormClicked: boolean = false;

  hide_modal_paper_ticket: boolean = false;
  new_paper_ticket_id: any = null;
  paper_ticket_id_error: any = '';
  hide_modal_paper_ticket_photo: boolean = false;
  loading_paper_ticket: boolean = false;
  new_paper_ticket_photo: any = null;
  paper_ticket_photo_error: any = '';

  show_edit_address_ds: any = false;
  edited_address_ds: any = null;
  street_error: any = null;
  canada_provinces: any = null;
  usa_provinces: any = null;
  city_error: any = null;
  set_country: any = 'Canada';
  show_add_backhaul: boolean = false;
  haulback_id: any = null;
  edited_address_dl: any = null;
  end_round_disable: any = false;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private fb: FormBuilder,
    private responsiveService: ResponsiveService,
    private project_service: ProjectService,
    private driver_service: DriverService,
    private user_service: UserDataService,
    private ticket_service: TicketService,
    private changeDetector: ChangeDetectorRef,

    private notification_service: NotificationService,
  ) {
    this.responsiveService.checkWidth();
    this.onResize();

    this.canada_provinces = [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "NewFoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon"
    ];

    this.usa_provinces = [
      "Alaska AK",
      " Alabama	AL",
      "Arizona AZ",
      "Arkansas AR",
      "California CA",
      "Colorado CO",
      "Connecticut CT",
      "Delaware DE",
      "Florida FL",
      "Georgia GA",
      "Hawaii HI",
      "Idaho iD",
      "Illinois IL",
      "Indiana IN",
      "Iowa IA",
      "Kansas KS",
      "Kentucky KY",
      "Louisiana LA",
      "Maine ME",
      "Maryland MD",
      "Massachusetts MA",
      "Michigan MI",
      "Minnesota MN",
      "Montana	MT",
      "Nebraska NE",
      "Nevada NV",
      "New Hampshire NH",
      "New Jersey NJ",
      "New Mexico NM",
      "New York NY",
      "North Carolina NC",
      "North Dakota ND",
      "Ohio OH",
      "Oklahoma OK",
      "Oregon OR",
      "Pennsylvania[D] PA",
      "Rhode Island RI",
      "South Carolina SC",
      "South Dakota SD",
      "Tennessee TN",
      "Texas TX",
      "Utah UT",
      "Vermont VT",
      "Virginia[D] VA",
      "Washington WA",
      "West Virginia WV",
      "Wisconsin WI",
      "Wyoming WY",
    ];
  }

  ngOnInit(): void {

    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });

    this.responsiveService.checkWidth();
    this.onResize();

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if (!userDone || userDone.full_name == undefined) {
      this.router.navigate(['/home']);
    }

    this.driver_ticket_id = this.actRouter.snapshot.params['id'] ? this.actRouter.snapshot.params['id'] : '';

    if (this.dt_id && this.dt_id != null && this.from_list) {
      this.driver_ticket_id = this.dt_id;
    }

    if (this.driver_ticket_id) {
      this.getTicketDetail()
    }

    this.actRouter.queryParams.subscribe(params => {
      if (params['notid']) {

        if (params['type']) {
          this.notification_type = params['type'];
          this.notification_id = params['notid'];

          if (this.notification_type != 'New Driver Job') {
            let data: any = { notification_id: params['notid'] };
            this.notification_service.markNotificationViewed(data).subscribe(response => {
              this.loading_details = false;
              if (response.status) {

              }
            })
          }

        } else {

          this.notification_id = params['notid'];
          let data: any = { notification_id: params['notid'] };
          this.notification_service.markNotificationViewed(data).subscribe(response => {
            this.loading_details = false;
            if (response.status) {

            }
          })
        }

      }
    });


    this.addDumpsite = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.editDL = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  getRoundToStart() {

    if (this.ticket_detail && this.ticket_detail?.ticket) {

      if (this.ticket_detail?.ticket?.ticket_truck_type_rounds && this.ticket_detail?.ticket?.ticket_truck_type_rounds) {
        let rounds = [];

        rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {


          if (rounds[i] && rounds[i].id && (rounds[i].driver_start_time == '' || rounds[i].driver_start_time == null)) {

            this.round_to_start = rounds[i];
            break;
          }

        }
      }
    }
  }

  setPickupSite(event: any) {
    if (event.target.value) {
      this.pickup_site = event.target.value

    }
  }
  getRoundInProgress() {
    if (this.ticket_detail && this.ticket_detail?.ticket) {

      if (this.ticket_detail?.ticket?.ticket_truck_type_rounds && this.ticket_detail?.ticket?.ticket_truck_type_rounds) {
        let rounds = [];
        rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds;
        for (var i = 0; i < rounds.length; i++) {
          if (rounds[i] && rounds[i].id && rounds[i].driver_start_time != null && !rounds[i].end_time) {
            this.round_in_progress = rounds[i];
            if (this.round_in_progress && this.round_in_progress?.driver_start_time) {
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }
            break;
          }
        }
      }

    }
  }

  setHidePaperTicketModal() {
    this.new_paper_ticket_id = this.ticket_detail?.ticket?.paper_ticket_id;
    this.hide_modal_paper_ticket = !this.hide_modal_paper_ticket;
  }

  setHidePaperTicketPhotoModal() {
    this.hide_modal_paper_ticket_photo = !this.hide_modal_paper_ticket_photo;
  }
  onFileSelected(event: any) {
    this.new_paper_ticket_photo = event.target.files[0];

    this.handlePaperTicketPhoto();
  }

  handlePaperTicketPhoto() {
    this.paper_ticket_photo_error = '';
    if (!this.new_paper_ticket_photo) {
      this.paper_ticket_photo_error = 'Paper ticket photo is required!';
      return;
    }

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.user_data_request_id ? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);
    formData.append('ticket_id', this.ticket_detail.ticket_id);

    formData.append('is_tc_ticket', 'YES');
    formData.append('paper_ticket_photo', this.new_paper_ticket_photo);
    this.loading_paper_ticket = true;
    this.driver_service.updatePaperTicketPhoto(formData).subscribe(response => {
      this.loading_paper_ticket = false;
      if (response.status) {
        // alert(this.edited_hours)
        this.new_paper_ticket_photo = null;
        this.paper_ticket_photo_error = '';
        this.hide_modal_paper_ticket_photo = false;
        this.getTicketDetail(false);





      } else {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to update paper ticket photo!'
        );
      }
    });
  }


  setNewTicketId(event: any) {
    if (event.target.value) {
      this.new_paper_ticket_id = event.target.value;
    }
  }


  handlePaperTicketId() {

    if (!this.new_paper_ticket_id) {
      this.paper_ticket_id_error = 'Paper ticket id is required!';
      return;
    }

    let data = {
      is_tc_ticket: 'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      paper_ticket_id: this.new_paper_ticket_id
    }

    this.driver_service.updatePaperTicketId(data).subscribe(response => {

      if (response.status) {
        // alert(this.edited_hours)
        this.new_paper_ticket_id = null;
        this.hide_modal_paper_ticket = false;

        this.getTicketDetail(false);


      } else {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Unable to update paper ticket id!'
        );
      }
    });
  }


  getTicketDetail(shouldUpdateDriverTime = true) {
    this.loading_details = true;
    let data = { is_tc_ticket: 'YES', date: this.date_today, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, driver_ticket_id: this.driver_ticket_id };
    this.driver_service.getDriverTicketDetail(data).subscribe(response => {
      this.loading_details = false;
      if (response.status) {
        this.ticket_detail = response.data.ticket;
        this.more_more_tickets = response?.data?.more_more_tickets;
        this.more_tickets = response?.data?.more_tickets;
        if (response.data?.all_done) {
          this.all_rounds_done = true;
        }

        this.hours = [];
        var total = parseInt(this.ticket_detail?.driver_hours);
        total = total > 0 ? total + 50 : 1 + 50;
        for (var i = 0; i < total; i++) {
          this.hours.push(i);
        }

        if (shouldUpdateDriverTime) {
          this.edited_hours = this.ticket_detail?.driver_hours;
          this.edited_mints = this.ticket_detail?.driver_minutes;
        }
        this.getRoundToStart();
        this.getRoundInProgress();

        this.projectDetails(this.ticket_detail?.ticket?.project_id)
        this.starttime();

        if (this.ticket_detail && this.ticket_detail?.started_at && this.ticket_detail?.started_at != '') {

          this.jobTime = new Date(this.ticket_detail?.started_at);
        }


        this.changeDetector.detectChanges();

      } else {
        let data: any = { notification_id: this.notification_id };
        this.notification_service.markNotificationViewed(data).subscribe(response => {
          this.loading_details = false;
          if (response.status) {

          }
        })
      }
    })
  }


  projectDetails(project_id: any, is_tc_project: any = 'NO') {

    this.project_service.projectDetails(project_id, is_tc_project).subscribe(response => {

      if (response.status && response.data) {

        this.dump_sites = response.data?.dump_sites;

      }
    })
  }


  handleAddRound() {
    let data = {
      is_tc_ticket: 'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.addRound(data).subscribe(response => {
      if (response.status) {
        if (response.data) {
          if (response.data.all_done) {
            this.all_rounds_done = true;
          } else {
            this.all_rounds_done = false;
            this.ticket_detail = response.data.driver_ticket;
            if (this.ticket_detail?.started_at && this.ticket_detail.started_at != '') {
              this.jobTime = new Date(this.ticket_detail.started_at);
            }
            this.round_in_progress = response.data.started_round;
            if (this.round_in_progress && this.round_in_progress?.driver_start_time) {
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }

            this.getRoundInProgress();
            this.getTicketDetail();

            if ((this.ticket_detail?.is_without_rounds == '1' || this.ticket_detail?.is_without_rounds == 1) && this.ticket_detail?.ticket?.ticket_truck_type_rounds.length == 1) {
              window.location.href = '/tc-inprogress-job-detail/' + this.ticket_detail?.id;
            }
          }
        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    })
  }

  handleSendApproval() {
    if (this.ticket_detail?.ticket?.required_paper_ticket_id == 'YES' && (!this.ticket_detail?.ticket?.paper_ticket_id || !this.ticket_detail?.ticket?.paper_ticket_photo)) {

      if (!this.ticket_detail?.ticket?.paper_ticket_id && !this.ticket_detail?.ticket?.paper_ticket_photo) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Paper ticket ID and Picture of the paper ticket required by the dispatcher'
        );
      }

      if (!this.ticket_detail?.ticket?.paper_ticket_id && this.ticket_detail?.ticket?.paper_ticket_photo) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Paper ticket ID required by the dispatcher'
        );
      }

      if (!this.ticket_detail?.ticket?.paper_ticket_photo && this.ticket_detail?.ticket?.paper_ticket_id) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Notification',
          'Picture of the paper ticket required by the dispatcher'
        );
      }
      return;
    }
    let data = {
      is_tc_ticket: 'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id,
      notes_for_approver: this.notes_for_approval,
      edited_hours: this.edited_hours,
      edited_mints: this.edited_mints
    }
    this.loading_send_approval = true;
    this.driver_service.sendForApprovel(data).subscribe(response => {
      this.loading_send_approval = false;
      if (response.status) {
        this.ticket_detail = response.data.driver_ticket;
        this.round_in_progress = null;
        this.round_to_start = null;
        if (this.ticket_detail?.ticket && !this.ticket_detail?.ticket?.approver && !this.ticket_detail?.ticket?.tc_approver) {

          this.router.navigateByUrl('/tc-approved-job-detail/' + this.ticket_detail.id);
        } else {

          this.router.navigateByUrl('/tc-completed-job-detail/' + this.ticket_detail.id);
        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    });
  }

  handleEndJob() {

    this.all_rounds_done = true;
    this.round_in_progress = null;
    this.round_to_start = null;
    this.getTicketCompleteData();
  }

  getZoneTime(time: any) {
    let tz = environment.timeZone;
    var d = new Date(time);
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    return new Date(samp_date);
  }

  starttime() {
    interval(1000).subscribe(() => {
      if (!(this.changeDetector as ViewRef).destroyed) {
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getElapsedTime(entry: any): TimeSpan {
    let date_now = new Date();
    var samp_date = date_now.toLocaleString('en-US', { timeZone: environment.timeZone });
    let time1 = new Date(samp_date);

    let totalSeconds = Math.floor((time1.getTime() - entry.getTime()) / 1000);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (totalSeconds >= 3600) {
      hours = Math.floor(totalSeconds / 3600);
      totalSeconds -= 3600 * hours;
    }

    if (totalSeconds >= 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }

    seconds = totalSeconds;
    console.log(minutes)
    if (minutes < 10) {
      minutes = 0 + minutes;
    }
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;

      if (this.screen == 'desktop' || this.screen == 'tablet') {
        this.router.navigate(['/driver-dashboard-scheduler']);
      }
    });
  }

  setActiveTab(tab: string) {
    this.active_tab = tab;
  }

  handleEndRound(round: any) {
    let data = {
      is_tc_ticket: 'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      round_id: round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.endRound(data).subscribe(response => {
      if (response.status) {
        if (response.data.all_done) {
          this.all_rounds_done = true;
          this.round_in_progress = null;
          this.round_to_start = null;

          this.ticket_detail = response.data.driver_ticket;
          // this.getTicketCompleteData();
        } else {
          this.ticket_detail = response.data.driver_ticket;
          this.round_in_progress = null;
          this.getRoundToStart();
        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    });
  }

  getTicketCompleteData(skip_time: boolean = false) {
    let data = {
      is_tc_ticket: 'YES',
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }
    this.loading_send_approval = true;
    this.driver_service.getTicketCompleteData(data).subscribe(response => {
      this.loading_send_approval = false;
      if (response.status) {
        this.ticket_detail = response.data.driver_ticket;
        if (!skip_time) {
          this.edited_hours = this.ticket_detail?.driver_hours;
          this.edited_mints = this.ticket_detail?.driver_minutes;
        }
      }
    });
  }

  handleStartRound(round: any) {

    if ((this.ticket_detail?.is_without_rounds == '1' || this.ticket_detail?.is_without_rounds == 1) && !round.dump_site || !round.material_taken_out) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        title: "Warning",
        text: 'Material taken out, pickup site and dumpsite are required',
        confirmButtonColor: "#FDD7E4",

      })
      return;
    }
    let data = {
      is_tc_ticket: "YES",
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      ticket_id: this.ticket_detail.ticket_id,
      driver_ticket_id: this.ticket_detail.id,
      round_id: round.id,
      ticket_truck_type_id: this.ticket_detail?.ticket?.ticket_truck_type_id
    }

    this.driver_service.startRound(data).subscribe(response => {
      if (response.status) {
        if (response.data) {
          this.getTicketDetail();
          this.starttime();
          if (response.data.all_done) {
            this.all_rounds_done = true;
          } else {
            this.ticket_detail = response.data.driver_ticket;
            if (this.ticket_detail?.started_at && this.ticket_detail.started_at != '') {
              this.jobTime = new Date(this.ticket_detail.started_at);
            }
            this.round_in_progress = response.data.started_round;
            if (this.round_in_progress && this.round_in_progress?.driver_start_time) {
              this.roundTime = new Date(this.round_in_progress?.driver_start_time);
            }
          }

        }
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          response.message
        );
      }
    })
  }

  setRoundPopup(event: any, type: any, round_id: any, current_site: string = '', notes: string = '', material: string = '') {
    let height = (event.target.closest('.round-container').getBoundingClientRect().top + window.scrollY).toString() + 'px';

    $(".absolute-popup").css({ 'top': height })
    if (type !== "") {
      this.show_round_update_popup = type;
    }
    if (round_id != '') {
      this.update_round_id = round_id;
    }

    if (current_site != "") {
      if (type == 'pickupsite-popup') {
        this.pickup_site = current_site;
      } else {
        this.new_dum_site = current_site;
        this.new_dum_site = current_site;
      }

    }

    if (notes != '') {
      this.driver_round_notes = notes;
    }

    if (material != "") {
      this.new_material_taken_out = material;
    }

    this.end_round_disable = true;

  }

  closeRoundPopup() {
    this.update_round_id = null;
    this.show_round_update_popup = '';
    this.new_material_taken_out = '';
    this.new_dum_site = '';
    this.driver_round_notes = '';
    this.loading_update = false;
    this.end_round_disable = false;

  }

  setNewDumpSite(dumpsite: any) {
    if (dumpsite != "") {
      this.new_dum_site = dumpsite;
    }
  }

  setNewMaterial(event: any) {

    if (event.target.value != "") {

      this.new_material_taken_out = event.target.value;
    }
  }

  setNewNotes(event: any) {

    this.driver_round_notes = event.target.value;

  }

  handleSiteChange() {

    this.new_dumpsite_error = '';
    if (this.new_dum_site == "") {
      this.new_dumpsite_error = " Please select a dumpsite.";
      return;
    }

    let data = { is_tc_ticket: "YES", round_id: this.update_round_id, dump_site: this.new_dum_site };
    this.loading_update = true;
    this.driver_service.changeDumpSite(data).subscribe(response => {
      this.loading_update = false;
      if (response.status) {





        this.closeRoundPopup();
        this.getTicketDetail();
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });


  }

  handleUpdatePickupSite() {

    this.pickup_site_error = '';
    if (this.pickup_site == "") {
      this.pickup_site_error = " Please enter pickup site.";
      return;
    }

    let data = { is_tc_ticket: "YES", round_id: this.update_round_id, pickup_site: this.pickup_site };
    this.loading_update = true;
    this.driver_service.changePickupSite(data).subscribe(response => {
      this.loading_update = false;
      if (response.status) {
        // const swalWithBootstrapButtons = Swal.mixin({
        //   customClass: {
        //     confirmButton: 'btn bg-pink width-200'
        //   },
        //   buttonsStyling: false
        // })
        // swalWithBootstrapButtons.fire(
        //   `Success`,
        //   response.message).then(() => {
        //   })
        this.closeRoundPopup();
        this.getTicketDetail();
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });


  }

  handleNewMaterial() {
    this.new_material_error = '';
    if (this.new_material_taken_out == "") {
      this.new_material_error = " Please enter new material.";
      return;
    }

    let data = { is_tc_ticket: 'YES', round_id: this.update_round_id, material_taken_out: this.new_material_taken_out };
    this.loading_update = true;
    this.driver_service.updateMaterial(data).subscribe(response => {

      this.loading_update = false;
      if (response.status) {


        this.closeRoundPopup();
        this.getTicketDetail();
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });
  }

  handleNewNotes() {

    this.round_notes_error = '';


    let data = { is_tc_ticket: 'YES', round_id: this.update_round_id, driver_notes: this.driver_round_notes };
    this.loading_update = true;
    this.driver_service.updateDriverRoundNotes(data).subscribe(response => {

      this.loading_update = false;
      if (response.status) {

        this.closeRoundPopup();
        this.loading_details = true;
        let data = { is_tc_ticket: 'YES', date: this.date_today, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, driver_ticket_id: this.driver_ticket_id };
        this.driver_service.getDriverTicketDetail(data).subscribe(response => {
          this.loading_details = false;
          if (response.status) {
            this.ticket_detail = response.data.ticket;
            this.more_more_tickets = response?.data?.more_more_tickets;
            this.more_tickets = response?.data?.more_tickets;
            if (response.data?.all_done) {
              this.all_rounds_done = true;
            }

            this.hours = [];
            var total = parseInt(this.ticket_detail?.driver_hours);
            total = total > 0 ? total + 50 : 1 + 50;
            for (var i = 0; i < total; i++) {
              this.hours.push(i);
            }



            this.getRoundToStart();
            this.getRoundInProgress();

            var proj_id = this.ticket_detail?.ticket?.project ? this.ticket_detail?.ticket?.project_id : this.ticket_detail?.ticket?.tc_project_id;
            var is_tc_project = this.ticket_detail?.ticket?.project ? 'NO' : "YES";
            this.projectDetails(proj_id, is_tc_project)
            this.starttime();

            if (this.ticket_detail && this.ticket_detail?.started_at && this.ticket_detail?.started_at != '') {

              this.jobTime = new Date(this.ticket_detail?.started_at);
            }


            this.changeDetector.detectChanges();

          } else {
            let data: any = { notification_id: this.notification_id };
            this.notification_service.markNotificationViewed(data).subscribe(response => {
              this.loading_details = false;
              if (response.status) {

              }
            })
          }
        })
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });
  }

  updateJobNotes() {
    this.job_notes_error = '';
    if (this.notes_for_approval == "") {
      this.job_notes_error = " Please enter notes.";
      return;
    }

    let data = { is_tc_ticket: 'YES', driver_ticket_id: this.ticket_detail.id, notes_for_approval: this.notes_for_approval };
    this.loading_update = true;
    this.driver_service.updateJobNotes(data).subscribe(response => {

      this.loading_update = false;
      if (response.status) {

        this.show_notes_popup = false;
        this.loading_details = true;
        let data = { is_tc_ticket: 'YES', date: this.date_today, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, driver_ticket_id: this.driver_ticket_id };
        this.driver_service.getDriverTicketDetail(data).subscribe(response => {
          this.loading_details = false;
          if (response.status) {
            this.ticket_detail = response.data.ticket;
            this.more_more_tickets = response?.data?.more_more_tickets;
            this.more_tickets = response?.data?.more_tickets;
            if (response.data?.all_done) {
              this.all_rounds_done = true;
            }

            this.hours = [];
            var total = parseInt(this.ticket_detail?.driver_hours);
            total = total > 0 ? total + 50 : 1 + 50;
            for (var i = 0; i < total; i++) {
              this.hours.push(i);
            }


            this.getRoundToStart();
            this.getRoundInProgress();
            var proj_id = this.ticket_detail?.ticket?.project ? this.ticket_detail?.ticket?.project_id : this.ticket_detail?.ticket?.tc_project_id;
            var is_tc_project = this.ticket_detail?.ticket?.project ? 'NO' : "YES";
            this.projectDetails(proj_id, is_tc_project)
            this.starttime();

            if (this.ticket_detail && this.ticket_detail?.started_at && this.ticket_detail?.started_at != '') {

              this.jobTime = new Date(this.ticket_detail?.started_at);
            }


            this.changeDetector.detectChanges();

          }
        })

      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });
  }

  toggleDetail(id: any) {

    if (this.detail_round_id != null) {
      this.detail_round_id = null;
    } else {
      this.detail_round_id = id;
    }
  }

  showNotesPopup() {
    this.show_notes_popup = !this.show_notes_popup;
    // alert(this.show_notes_popup)
  }

  showEditTimePopup() {
    this.show_time_edit_popup = !this.show_time_edit_popup;
    // alert(this.show_time_edit_popup)
    // setTimeout(() => {
    //   console.log($('.time-hours').length)
    //   $('.time-hours').animate({
    //     scrollTop: $(".time-hours > li.active").offset().top},
    //     'slow');
    // }, 10000);

    setTimeout(() => {
      let elmnt: any = document.getElementById("hour-active"); // let if use typescript

      if (elmnt !== undefined) {
        elmnt.scrollIntoView({ block: "center" }); // this will scroll elem to the top
        // window.scrollTo(0, 0);

      }

    }, 300);
    setTimeout(() => {
      let elmnt: any = document.getElementById("hour-active"); // let if use typescript

      if (elmnt !== undefined) {
        elmnt.scrollIntoView({ block: "center" }); // this will scroll elem to the top
        // window.scrollTo(0, 0);

      }

    }, 400);


  }

  get_mints(mints: any) {
    let mint: any = parseInt(mints.toString());
    let minutes = 0;
  }

  setHours(hours: any) {
    this.edited_hours = hours;
  }

  setMinutes(mints: any) {
    this.edited_mints = mints;
  }

  moveToStatus(status: any, dt_id: any) {
    if (status == 'Accepted') {

      this.router.navigate(["/tc-accepted-job-detail", dt_id]);
    } else if (status == 'Completed') {
      this.router.navigate(["/tc-completed-job-detail", dt_id]);
    } else if (status == 'Driving') {
      this.router.navigate(["/tc-inprogress-job-detail", dt_id]);
    } else if (status == 'Approved') {
      this.router.navigate(["/tc-approved-job-detail", dt_id]);
    } else {

      window.location.href = "/tc-request-job-detail/" + dt_id;
    }
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

    return Math.round(hours) + ' hr ' + Math.round(mints) + ' min'
  }

  showAddDumpSite() {
    this.isFormClicked = false;
    this.show_add_dumpsite = true;
  }

  hideAddDumpSite() {
    this.isFormClicked = false;
    this.show_add_dumpsite = false;
  }

  handleAddDumpsite() {

    this.isFormClicked = true;
    if (this.addDumpsite.invalid) {
      return;
    }
    this.loading_add = true;
    let data: any = this.addDumpsite.value;
    var proj_id = this.ticket_detail?.ticket?.project ? this.ticket_detail?.ticket?.project_id : this.ticket_detail?.ticket?.tc_project_id;
    var is_tc_project = this.ticket_detail?.ticket?.project ? 'NO' : "YES";

    data.project_id = proj_id;
    data.is_tc_project = is_tc_project;

    console.log(data.project_id);
    this.project_service.addDumpSite(data).subscribe(response => {
      this.loading_add = false;
      if (response.status && response.message) {
        this.addDumpsite.reset();
        this.show_add_dumpsite = false;
        this.isFormClicked = false;
        proj_id = this.ticket_detail?.ticket?.project ? this.ticket_detail?.ticket?.project_id : this.ticket_detail?.ticket?.tc_project_id;
        is_tc_project = this.ticket_detail?.ticket?.project ? 'NO' : "YES";
        this.projectDetails(proj_id, is_tc_project)
      } else {

        this.isFormClicked = false
      }
    })
  }

  getHoursMin(t: any) {
    let d: any = t;
    if (t.toString()) {
      let r = t.toString().split(':');
      let hrs = r[0] ? r[0] : '0';
      let m = r[1] ? r[1] : '0';
      d = hrs + ' hr' + ' ' + m + 'min';
    }
    return d;
  }

  setPPModal(e: any) {

    let height = (e.target.closest('.ppt-container').getBoundingClientRect().top + window.scrollY).toString() + 'px';
    console.log(e.target.closest('.ppt-container').getBoundingClientRect().top, window.scrollY, height)
    $(".absolute-popup").css({ 'top': height })
  }

  setDLocation(location: any) {
    if (location) {
      this.edit_haulback.drop_location_name = location;
      this.closeRoundPopup();
    }
  }

  handleDropLocation() {
    this.isFormClicked = true;
    if (this.editDL.invalid) {
      return;
    }
    let data: any = this.editDL.value;
    this.edit_haulback.drop_location_name = data?.name;
    this.edit_haulback.drop_location_address = data?.location;
    this.show_add_droplocation = false;

    let data2: any = {
      round_id: this.update_round_id,
      haulback_id: this.edit_haulback.id,
      drop_location_name: data?.name,
      drop_location_address: data?.location
    }
    this.driver_service.updateHaulback(data2).subscribe(response => {

      if (response.status && response.message) {
        this.closeRoundPopup();
        this.getTicketDetail();
      } else {

        this.isFormClicked = false
      }
    })
  }

  showEditAddressDL() {
    this.show_edit_address_dl = true;
  }

  hideAddAddressDL() {
    this.show_edit_address_dl = false;
  }

  setCountry(event: any) {
    this.set_country = event.target.value;
  }
  showEditAddressDS() {
    this.show_edit_address_ds = true;
  }

  hideAddAddressSite() {
    this.show_edit_address_ds = false;
  }

  setEditDSAddress() {
    this.street_error = null;
    this.city_error = null;
    let d: any = false;
    if (!$("#ds_street").val()) {
      this.street_error = 'Street required';
      d = true;
    }

    if (!$("#ds_city").val()) {
      this.city_error = 'City required';
      d = true;
    }

    if (d) {
      return;
    }

    let address: any = '';
    if ($("#ds_street").val()) {
      address = $("#ds_street").val();
    }

    if ($("#ds_city").val()) {
      address += address != '' ? ',' : '';
      address += $("#ds_city").val();
    }


    if ($("#ds_province").val()) {
      address += address != '' ? ' ' : '';
      address += $("#ds_province").val();
    }
    if ($("#ds_postal_code").val()) {
      address += address != '' ? ' ' : '';
      address += $("#ds_postal_code").val();
    }


    if ($("#ds_country").val()) {
      address += address != '' ? ', ' : '';
      address += $("#ds_country").val();
    }

    this.edited_address_ds = address;
    this.addDumpsite.get('location')?.patchValue(address);

    this.show_edit_address_ds = false;
  }
  setEditDLAddress() {
    this.street_error = null;
    this.city_error = null;
    let d: any = false;
    if (!$("#dl_street").val()) {
      this.street_error = 'Street required';
      d = true;
    }

    if (!$("#dl_city").val()) {
      this.city_error = 'City required';
      d = true;
    }

    if (d) {
      return;
    }

    let address: any = '';
    if ($("#dl_street").val()) {
      address = $("#dl_street").val();
    }

    if ($("#dl_city").val()) {
      address += address != '' ? ',' : '';
      address += $("#dl_city").val();
    }


    if ($("#dl_province").val()) {
      address += address != '' ? ' ' : '';
      address += $("#dl_province").val();
    }
    if ($("#dl_postal_code").val()) {
      address += address != '' ? ' ' : '';
      address += $("#dl_postal_code").val();
    }


    if ($("#dl_country").val()) {
      address += address != '' ? ', ' : '';
      address += $("#dl_country").val();
    }

    this.edited_address_dl = address;
    this.editDL.get('location')?.patchValue(address);

    this.show_edit_address_dl = false;
  }

  setNewMaterialIn(e: any) {
    if (e.target.value) {
      this.edit_haulback.material_in = e.target.value;
    }
  }

  handleNewMaterialin() {
    this.new_material_error = '';
    if (this.edit_haulback?.material_in == "") {
      this.new_material_error = " Enter material in.";
      return;
    }

    let data: any = {
      round_id: this.update_round_id,
      haulback_id: this.edit_haulback.id,
      material_in: this.edit_haulback.material_in,
    }
    this.driver_service.updateHaulback(data).subscribe(response => {

      if (response.status && response.message) {
        this.closeRoundPopup();
        this.getTicketDetail();
      } else {

        this.isFormClicked = false
      }
    })
  }
  hideAddDropLocation() {

    this.show_add_droplocation = false;
  }
  handleDLChange() {

  }
  showAddDropLocation() {
    this.show_add_droplocation = true;
    if (this.edit_haulback) {
      this.editDL.get('name')?.patchValue(this.edit_haulback?.drop_location_name)
      this.editDL.get('location')?.patchValue(this.edit_haulback?.drop_location_address)
    }
  }


  setRound(round_id: any) {
    if (round_id) {
      this.detail_round = round_id;
    }
  }

  unsetRound() {
    this.detail_round = null;
  }

  parseRoundTime(t: any) {
    let d: any = null;
    if (t) {
      d = t.toString().replace('h', ' hrs');
      if (d) {
        d = d + 'm';
      }
    }
    return d;
  }


  hideAddBackhaul() {
    this.show_add_backhaul = false;
    this.end_round_disable = false;
    this.getTicketDetail();
  }

  showAddBackhaul() {
    this.show_add_backhaul = true;
    this.end_round_disable = true;
  }


  setHaulbackRoundPopup(event: any, type: any, round_id: any, haulback_id: any, data: any) {
    let height = (event.target.closest('.round-container').getBoundingClientRect().top + window.scrollY).toString() + 'px';

    $(".absolute-popup").css({ 'top': height })
    if (type !== "") {
      this.show_round_update_popup = type;
    }
    if (round_id != '') {
      this.update_round_id = round_id;
    }

    if (haulback_id != '') {
      this.haulback_id = haulback_id;
    }

    if (data) {
      this.edit_haulback = data;
    }
  }

}


