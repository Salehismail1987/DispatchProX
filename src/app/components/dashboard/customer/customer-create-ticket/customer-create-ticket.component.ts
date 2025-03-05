import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';

import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-customer-create-ticket',
  templateUrl: './customer-create-ticket.component.html',
  styleUrls: ['./customer-create-ticket.component.css']
})
export class CustomerCreateTicketComponent implements OnInit {

  //Compoent Data
  dateRange: any = "";
  is_loading: boolean = false;
  selected_project: any = null;
  current_modal: string = '';
  minDateDispatch: Date = new Date();
  project: any;
  self_id: any;
  projects_list: any;
  trucking_company: any;

  trucking_company_id: any = null;
  project_id: any = null;
  trucking_companies_list: any;
  approver_id: any;
  approver: any = null;
  approver_list: any;
  default_rounds: number = 1;
  is_repeat: boolean = false;
  dump_sites: any;
  require_paper_ticket: any = null;

  trucks_list: any;
  trailers_list: any;
  combinations_list: any;

  loggedinUser: any = {};

  todayDate: any;

  //Form Obj
  ticketForm!: FormGroup;
  form_clicked: boolean = false;
  is_saving: boolean = false;
  is_project_loading = true;
  projectError: string = '';
  approverError: string = '';
  companyError: string = '';
  ticketDateError: string = '';
  repeatError: string = '';
  descriptionError: string = '';

  schedule_date_from: string = '';
  schedule_date_to: string = '';

  active_menu: any;


  number_of_tickets: number = 0;
  to_dispatch_total: number = 0;

  repeat_dispatch: boolean = false;
  repeat_dispatch_ticket: any;

  dispatch_data: any = null;

  rate_choice: string = '';
  default_per_hour_rate: number = 0;


  constructor(
    private router: Router,
    private user_service: UserDataService,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private customer_service: CustomerService,
    private actRouter: ActivatedRoute,
    private datePipe: DatePipe,
    private fb: FormBuilder,
  ) {
    this.active_menu = {
      parent: 'tickets',
      child: 'create-dispatch',
      count_badge: '',
    }
  }


  ngOnInit(): void {

    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd')
    this.minDateDispatch = new Date(samp_date);

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      this.approver = this.loggedinUser;
      this.self_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;
    } else {
      this.router.navigate(['/home']);
    }


    if (this.actRouter.snapshot.queryParams['project_id'] && this.actRouter.snapshot.queryParams['project_id'] != '') {
      this.project_id = this.actRouter.snapshot.queryParams['project_id'];
    }

    this.ticketForm = this.fb.group({
      user_id: [''],
      approver_id: ['', Validators.required],
      trucking_company_id: ['', Validators.required],
      project_id: ['', Validators.required],
      ticket_date: ['', Validators.required],
      description: ['', Validators.required],
      scheduled_date: [''],
      is_repeating: [''],
      range_start: [''],
      range_end: [''],
      required_paper_ticket_id: [''],
      ticket_truck_types: this.fb.array([]),
    });
    this.form_clicked = false;

    this.newTruckType();


    this.getProjects();
    this.getTruckingCompanies();

    if (this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '') {
      this.getSingleDispatch(this.actRouter.snapshot.queryParams['id']);
    }
    this.is_project_loading = false;

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
  }

  onRefreshParent() {
    this.getProjects();
  }

  changeCheck(event: any) {
    if (event && event.target.checked) {
      this.is_repeat = true;
    } else {

      this.is_repeat = false;
    }
  }

  rateChoiceBtnHandler(type: string, index: any) {
    if (this.rate_choice == '') {
      this.ticket_truck_types()?.at(index)?.get("rate_type")?.setValue(type);
      this.ticket_truck_types()?.at(index)?.get("rate_per_hour")?.setValue(this.default_per_hour_rate);
    } else {
      this.ticket_truck_types()?.at(index)?.get("rate_type")?.setValue(type);
      this.ticket_truck_types()?.at(index)?.get("rate_per_hour")?.setValue('');
    }
    this.rate_choice = type;

  }


  getSingleDispatch(dispatchId: any) {

    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser.user_data_request_id);
    formData.append('dispatch_id', dispatchId ? dispatchId : null);

    this.ticket_service.getSinglePastDispatches(formData).subscribe(response => {

      this.is_loading = false;
      if (response.status && response.data) {
        this.dispatch_data = response?.data[0];
        let dispatchData = response?.data[0];
        this.projectDetails(dispatchData?.project_id);
        this.repeat_dispatch_ticket = dispatchData;
        this.selected_project = dispatchData?.project;
        this.trucking_company = dispatchData?.trucking_company;
        this.approver = dispatchData?.approver;
        this.repeat_dispatch = true;
        // scheduled data 

        const today = new Date();
        let startDate: Date = new Date(today);
        let endDate: Date = new Date(today);

        if (dispatchData?.ticket_truck_type?.tickets.length == 1) {
          // For a single ticket, set the range starting from tomorrow
          startDate = new Date(today);
          startDate.setDate(today.getDate() + 1);
          endDate = new Date(startDate); // Single day range
        } else if (dispatchData?.ticket_truck_type?.tickets.length > 1) {
          const firstTicketDate = new Date(dispatchData?.ticket_truck_type?.tickets[0]?.ticket_date);
          const lastTicketDate = new Date(dispatchData?.ticket_truck_type?.tickets[dispatchData?.ticket_truck_type?.tickets.length - 1]?.ticket_date);

          // Start date for the range: today + 1 day
          startDate = new Date(today);
          startDate.setDate(today.getDate() + 1);

          // Calculate the number of days between the first and last ticket date
          const daysDifference = Math.ceil((lastTicketDate.getTime() - firstTicketDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include the end date

          // Set the end date based on the range calculated from today
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + daysDifference - 1); // Subtract 1 to match the total days correctly

        }

        this.schedule_date_from = this.formatDateToInputDate2(startDate);
        this.schedule_date_to = this.formatDateToInputDate2(endDate);

        this.require_paper_ticket = dispatchData?.required_paper_ticket_id;
        this.is_repeat = dispatchData?.is_repeating;
        if (this.ticket_truck_types()?.length > 0) {
          this.ticket_truck_types()?.clear();
        }

        if (this.ticket_truck_types()) {
          const newTruckGroup = this.fb.group({
            ticket_truck_types_rounds: this.fb.array(dispatchData?.ticket_truck_type_rounds?.map((item: any) => this.fb.group({
              material_taken_out: item?.material_taken_out ? item?.material_taken_out : '',
              dump_site: item?.dump_site ? item?.dump_site : ''
            }))),
            number_of_trucks: dispatchData?.ticket_truck_type?.number_of_trucks ? dispatchData?.ticket_truck_type?.number_of_trucks : '',
            project_truck_id: "",
            project_trailer_id: "none",
            combination_id: dispatchData?.ticket_truck_type?.combination_id ? dispatchData?.ticket_truck_type?.combination_id : '',
            first_truck_start_at: dispatchData?.ticket_truck_type?.ticket_truck_type_rounds?.length > 0 ? this.convertTo24Hour(dispatchData?.ticket_truck_type?.ticket_truck_type_rounds[0]?.first_truck_start_at) : '',
            rate_per_hour: dispatchData?.ticket_truck_type?.rate_per_hour ? dispatchData?.ticket_truck_type?.rate_per_hour : '',
            rate_type: dispatchData?.ticket_truck_type?.rate_type ? dispatchData?.ticket_truck_type?.rate_type : '',
            interval_between_truck: dispatchData?.ticket_truck_type?.ticket_truck_type_rounds?.length > 0 ? dispatchData?.ticket_truck_type?.ticket_truck_type_rounds[0]?.interval_between_truck.split(' ')[0] : '',
            hidden: ''
          });
          this.ticket_truck_types().push(newTruckGroup);
        }

        if (dispatchData?.ticket_truck_type?.rate_type == 'hour') {
          this.rate_choice = 'hour';
        } else if (dispatchData?.ticket_truck_type?.rate_type == 'round') {
          this.rate_choice = 'round';
        } else {
          this.rate_choice = '';
        }

        if (this.ticket_truck_types_rounds(0)) {
          this.ticket_truck_types_rounds(0).push(this.fb.array(dispatchData?.ticket_truck_type_rounds?.map((item: any) => this.fb.group({
            material_taken_out: item?.material_taken_out ? item?.material_taken_out : '',
            dump_site: item?.dump_site ? item?.dump_site : ''
          }))));
          this.removeRound(dispatchData?.ticket_truck_type_rounds?.length, 0);
        }


        // Add one day to the date
        const ticketDate = new Date(today);
        const nextDayDate = new Date(ticketDate);
        nextDayDate.setDate(ticketDate.getDate() + 1);

        let formValues = {
          approver_id: dispatchData?.approver?.id,
          trucking_company_id: dispatchData?.trucking_company?.id,
          project_id: dispatchData?.project_id,
          ticket_date: this.formatDateToInputDate(nextDayDate),
          description: dispatchData?.description,
          scheduled_date: [
            new
              Date
              (
                this.schedule_date_from
              ),
            new
              Date
              (
                this.schedule_date_to
              )],
          range_start:
            this.schedule_date_from
          ,
          range_end:
            this.schedule_date_to,
        }

        this.dateRange = [
          new
            Date
            (
              this.schedule_date_from
            ),
          new
            Date
            (
              this.schedule_date_to
            )];
        this.ticketForm.patchValue(formValues);
        this.number_of_tickets = dispatchData?.ticket_truck_type?.number_of_trucks;
        this.calculateTotal();

      } else {

      }

    });
  }

  convertTo24Hour(time12h: any) {
    // Match time and period (AM/PM)
    const [time, period] = time12h?.split(/(am|pm)/i);

    // Split time into hours and minutes
    let [hours, minutes] = time?.split(':').map(Number);

    // Convert hours based on AM/PM period
    if (period?.toLowerCase() === 'pm' && hours < 12) {
      hours += 12; // Convert PM hours to 24-hour format
    } else if (period?.toLowerCase() === 'am' && hours === 12) {
      hours = 0; // Midnight case
    }

    // Format hours and minutes to ensure two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  formatDateToInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateToInputDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ticket_truck_types(): FormArray {
    return this.ticketForm.get("ticket_truck_types") as FormArray
  }



  addTruckTypeField() {

    return this.fb.group({
      ticket_truck_types_rounds: this.fb.array([this.addRoundField()]),
      number_of_trucks: ['', [Validators.required, Validators.min(0)]],
      project_truck_id: ['', Validators.required],
      project_trailer_id: ['none'],
      combination_id: [''],
      first_truck_start_at: ['', Validators.required],
      rate_per_hour: ['', [Validators.required, Validators.min(0), Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
      interval_between_truck: [''],
      rate_type: ['', Validators.required],
      hidden: [''],
    })
  }

  addRoundField(): FormGroup {
    return this.fb.group({
      material_taken_out: [''],
      dump_site: ['']
    });
  }

  newRound(empIndex: number) {
    // for(var i=0; i< this.default_rounds;i++){
    this.ticket_truck_types_rounds(empIndex).push(this.addRoundField());
    // }
  }


  newTruckType() {
    this.ticket_truck_types().push(this.addTruckTypeField());
  }

  ticket_truck_types_rounds(empIndex: number): FormArray {
    if (this.ticket_truck_types() && this.ticket_truck_types()?.length > 0) {
      return this.ticket_truck_types().at(empIndex).get("ticket_truck_types_rounds") as FormArray;
    }
    return this.fb.array([]);
  }

  changeNumber(event: any, index: any) {
    if (this.ticket_truck_types()?.length > 0) {
      if (event.target.value < 2) {
        this.ticket_truck_types().at(index).get('interval_between_truck')?.clearValidators()
      } else if (event.target.value > 1) {
        this.ticket_truck_types().at(index).get('interval_between_truck')?.setValidators([Validators.required])
      }

      this.ticket_truck_types().at(index).get('interval_between_truck')?.updateValueAndValidity();
    }
  }

  onSaveTicket() {

    this.form_clicked = true;
    this.projectError = '';
    this.approverError = '';
    this.companyError = '';
    this.ticketDateError = '';
    this.repeatError = '';
    this.descriptionError = '';
    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    console.log(this.ticketForm.value)

    if (this.ticketForm.get('project_id')?.value == '') {
      this.projectError = "Please select Project.";
    }
    if (this.ticketForm.get('approver_id')?.value == '') {
      this.approverError = "Please select Approver.";
    }
    if (this.ticketForm.get('trucking_company_id')?.value == '') {

      this.companyError = "Please select Truking Company.";
    }
    if (this.ticketForm.get('ticket_date')?.value == '') {
      this.ticketDateError = "Please select Ticket Date.";
    }

    if (this.ticketForm.get('description')?.value == '') {
      this.descriptionError = "Please enter Description text.";
    }

    if (new Date(this.ticketForm.get('ticket_date')?.value).getTime() < new Date(this.todayDate).getTime()) {
      this.ticketDateError = "Past Date is not allowed, min Date:" + this.todayDate;
      return;
    }



    if (this.ticketForm.invalid) {
      return;
    }

    // if(data?.required_paper_ticket_id){
    //   data.required_paper_ticket_id = 'YES';
    // }else{
    //   data.required_paper_ticket_id = 'NO';
    // }
    this.is_saving = true;
    let data: any = this.ticketForm.value;
    console.log("payload -->", data);
    this.ticket_service.saveTicket(data).subscribe(response => {

      this.is_saving = false;
      if (response && !response.status) {
        if (response.message) {
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
          return;
        }

        this.projectError = response.data?.project_id ? response.data?.project_id : '';
        this.approverError = response.data?.approver_id ? response.data?.approver_id : '';
        this.ticketDateError = response.data?.ticket_date ? response.data?.ticket_date : '';
        this.companyError = response.data?.trucking_company_id ? response.data?.trucking_company_id : '';
        this.descriptionError = response.data?.description ? response.data?.description : '';

        return;
      } else {
        this.is_loading = false;
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          `Ticket Dispatched!`).then(() => {

            this.ticketForm.reset();
            this.router.navigate(['/customer-ticket-listing']);
          });
        this.getMenuCounts();
      }
    });

  }

  getMenuCounts() {
    let data = { orginal_user_id: this.loggedinUser.id, user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {

        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })


  }
  changePT(event: any) {
    if (event?.target && event?.target?.checked) {

      this.require_paper_ticket = 'YES'
    } else if (event?.target && !event?.target?.checked) {
      this.require_paper_ticket = 'NO'
    }
  }
  projectDetails(project_id: any) {
    this.is_loading = true;
    this.project_service.projectDetails(project_id).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {
        this.project = response.data;
        this.require_paper_ticket = this.project?.require_paper_ticket;
        this.trailers_list = response.data?.project_trailers;
        this.trucks_list = response.data?.project_trucks;
        this.default_rounds = response.data?.default_rounds;
        if (this.default_rounds && parseInt(this.default_rounds.toString()) > 0) {

        } else {
          this.default_rounds = 1;
        }
        this.combinations_list = response.data?.project_combinations;
        this.dump_sites = response.data?.dump_sites;

        if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
          if (this.ticket_truck_types_rounds(0)?.length > 0) {
            this.ticket_truck_types_rounds(0)?.clear();
          }
        }

        if (this.default_rounds && parseInt(this.default_rounds.toString()) > 0) {
          for (var i = 0; i < parseInt(this.default_rounds.toString()); i++) {
            if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
              this.ticket_truck_types_rounds(0)?.push(this.addRoundField());

            }
          }
        }
        if (this.dispatch_data) {
          let trailer_id: any = 'none';
          let isTrailerFound = this.trailers_list?.find((item: any) => item?.id == this.dispatch_data?.ticket_truck_type?.project_trailer_id);
          if (isTrailerFound) {
            trailer_id = Number(this.dispatch_data?.ticket_truck_type?.project_trailer_id);
          }

          if (this.ticket_truck_types && this.ticket_truck_types().length > 0) {
            this.ticket_truck_types()?.at(0)?.get("project_trailer_id")?.setValue(trailer_id);
          }
          let truck_id: any = ""
          let isTruckFound = this.trucks_list?.find((item: any) => item?.id == this.dispatch_data?.ticket_truck_type?.project_truck_id);
          console.log('truck found -->', isTruckFound);

          if (isTruckFound) {
            truck_id = Number(this.dispatch_data?.ticket_truck_type?.project_truck_id);
          }
          if (this.ticket_truck_types && this.ticket_truck_types().length > 0) {
            this.ticket_truck_types()?.at(0)?.get("project_truck_id")?.setValue(truck_id);
          }
        }

      }
    })
  }


  getApprovers() {
    const formData = new FormData();

    formData.append('type', 'Approver');
    formData.append('project_id', this.project_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.is_loading = true;
    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.approver_list = response.data;
        this.approver = this.loggedinUser;
      } else {

      }
    })
  }

  getProjects() {
    const formData = new FormData();
    if (this.projects_list?.length > 0) {
      this.is_project_loading = true;
    } else {
      this.is_project_loading = false;
    }
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    formData.append('ignore_removed', 'NO');
    this.project_service.projectListing(formData).subscribe(response => {

      if (response.status && response.data) {
        this.projects_list = response.data;

        this.is_project_loading = true;
        if (!this.project_id) {
          this.project_id = response.data[0]?.id;

          this.selected_project = response?.data[0];
          if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
            if (this.ticket_truck_types_rounds(0)?.length > 0) {
              this.ticket_truck_types_rounds(0)?.clear();
            }
          }
          for (var i = 0; i < response.data[0]?.default_rounds; i++) {
            if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
              this.ticket_truck_types_rounds(0)?.push(this.addRoundField());
            }
          }
        } else {
          response.data?.map((project: any) => {
            if (project?.id == this.project_id) {
              this.selected_project = project;
              if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
                if (this.ticket_truck_types_rounds(0)?.length > 0) {
                  this.ticket_truck_types_rounds(0)?.clear();
                }
              }
              for (var i = 0; i < project?.default_rounds; i++) {
                if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
                  this.ticket_truck_types_rounds(0)?.push(this.addRoundField());
                }
              }
            }
          });
        }

        if (!(this.actRouter.snapshot.queryParams['id'] && this.actRouter.snapshot.queryParams['id'] != '')) {
          this.projectDetails(this.project_id);
        }


        this.getApprovers();
      } else {

      }
    })
  }

  getTruckingCompanies() {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    this.is_loading = true;
    this.customer_service.getCustomerCompanies(formData).subscribe(response => {

      if (response.status && response.data) {
        this.trucking_companies_list = response.data;
        if (this.trucking_companies_list && this.trucking_companies_list.length > 0 && this.trucking_companies_list[0] && this.trucking_companies_list[0].id) {
          this.trucking_company = this.trucking_companies_list[0];
          this.trucking_company_id = this.trucking_company?.id;
          this.ticketForm.get('trucking_company_id')?.patchValue(this.trucking_companies_list[0].id);
        }
      } else {

      }
    })
  }

  showModal(modal: any) {
    this.current_modal = modal;
  }

  setActive(type: any) {

  }

  onProjectChange(project_id: any) {
    this.project_id = project_id;
    this.projectDetails(this.project_id)
  }

  onTruckChange(event: any, index: any) {
    if (this.ticket_truck_types()?.length > 0) {
      let value: string = this.ticket_truck_types().at(index).get("project_truck_id")?.value;

      if (value.toString().indexOf('c') >= 0) {
        value = value.replace('c', '');
        this.ticket_truck_types().at(index).get("combination_id")?.setValue(value);
        this.ticket_truck_types().at(index).get("project_trailer_id")?.disable();
      } else {
        this.ticket_truck_types().at(index).get("project_trailer_id")?.enable();
      }
      this.updateRate(index);
    }
  }

  onTrailerChange(index: any) {
    this.updateRate(index);
    if (this.ticket_truck_types()?.length > 0) {
      this.ticket_truck_types().at(index).get("combination_id")?.setValue(null);
    }

  }

  updateRate(index: any) {
    if (this.ticket_truck_types()?.length > 0) {
      let trailer_id = this.ticket_truck_types().at(index).get("project_trailer_id")?.value;
      let truck_id = this.ticket_truck_types().at(index).get("project_truck_id")?.value;
      let cost = 0;

      if (truck_id.toString().indexOf('c') >= 0) {
        truck_id = truck_id.replace('c', '');
        cost = this.getCombinationCost(truck_id);
        this.default_per_hour_rate = cost;
        // this.ticket_truck_types().at(index).get("rate_per_hour")?.setValue(cost);
      } else {
        cost = this.getTruckPrice(trailer_id) + this.getTruckPrice(truck_id);
        this.default_per_hour_rate = cost;
        // this.ticket_truck_types().at(index).get("rate_per_hour")?.setValue(cost);
      }
    }
  }

  getCombinationCost(truckId: any) {
    let tprice = 0;
    this.combinations_list.map((item: any) => {
      if (item.id == truckId) {
        tprice = parseFloat(item.cost.toString());
      }
    })
    return tprice;
  }

  getTruckPrice(truckId: any) {
    let tprice = 0;
    this.trucks_list.map((item: any) => {
      if (item.id == truckId) {
        tprice = parseFloat(item.rate.toString());
      }
    })
    this.trailers_list.map((item: any) => {
      if (item.id == truckId) {
        tprice = parseFloat(item.rate.toString());
      }
    })
    return tprice;
  }

  dateRangeCreated(event: any) {
    console.log(event)
    if (event) {
      var m = event[0]?.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      var d = event[0]?.getDate();
      d = d < 10 ? "0" + d : d;
      this.schedule_date_from = event[0]?.getFullYear() + "-" + m + "-" + d;

      var m = event[1]?.getMonth() + 1;
      m = m < 10 ? "0" + m : m;

      var d = event[1]?.getDate();
      d = d < 10 ? "0" + d : d;
      this.schedule_date_to = event[1]?.getFullYear() + "-" + m + "-" + d;

      if (!this.schedule_date_from?.includes('undefined') || !this.schedule_date_to?.includes('undefined')) {
        console.log("data range value change", this.schedule_date_from, this.schedule_date_to);
        this.ticketForm.get('range_start')?.patchValue(this.schedule_date_from);
        this.ticketForm.get('range_end')?.patchValue(this.schedule_date_to);
      }
    }
    this.calculateTotal();
  }

  ngAfterViewInit(): void {

    this.checkChanges();

  }

  checkChanges(): void {

    this.ticketForm.get('ticket_truck_types')?.valueChanges.subscribe(data => {
      console.log(data)
      let total: any = 0;
      data && data.map((type: any) => {

        total += parseInt(type.number_of_trucks) > 0 ? parseInt(type.number_of_trucks) : 0;

      })
      this.number_of_tickets = total;

      this.calculateTotal()
    })
  }

  getDaysBetween() {

    let ticket_date = this.ticketForm?.get('ticket_date')?.value;
    let date_1 = new Date(this.schedule_date_to);
    let date_2 = new Date(this.schedule_date_from);

    let difference = date_1.getTime() - date_2.getTime();
    let total_days = (difference / (1000 * 3600 * 24));
    // console.log(total_days, this.schedule_date_from, this.schedule_date_to)
    if (ticket_date && ticket_date !== undefined && ticket_date != null) {
      let date_check = new Date(ticket_date);

      if (date_check.getTime() <= date_1.getTime() && date_check.getTime() >= date_2.getTime()) {
        total_days = total_days + 1;

      } else {
        total_days = total_days + 2;

      }
    } else {
      total_days = total_days + 1;
    }

    return total_days;
  }

  dateChange(event: any) {

    this.calculateTotal();
  }

  calculateTotal() {
    let totalDays = this.getDaysBetween();

    if (totalDays > 1) {

      this.to_dispatch_total = (totalDays) * this.number_of_tickets;
    } else {
      this.to_dispatch_total = 1 * this.number_of_tickets;
    }
  }

  goToNickname() {
    if (this.project_id && this.project_id !== undefined && this.project_id != null) {

      this.router.navigateByUrl('/set-truck-rates/' + (this.project_id));
    }
  }

  copyRound(roundIdx: any, idx: any) {
    if (roundIdx > 0) {

      // console.log(this.ticket_truck_types_rounds(idx).at(roundIdx-1).value)
      let material_taken_out = this.ticket_truck_types_rounds(idx).at(roundIdx - 1).get('material_taken_out')?.value;
      let dump_site = this.ticket_truck_types_rounds(idx).at(roundIdx - 1).get('dump_site')?.value;

      this.ticket_truck_types_rounds(idx).at(roundIdx).get('material_taken_out')?.patchValue(material_taken_out);
      this.ticket_truck_types_rounds(idx).at(roundIdx).get('dump_site')?.patchValue(dump_site);


    }
  }

  removeRound(roundIdx: any, idx: any) {
    if (roundIdx >= 0) {
      this.ticket_truck_types_rounds(idx).removeAt(roundIdx);
    }
  }

  copyNextRound(roundIdx: any, idx: any) {
    if (roundIdx >= 0) {

      let material_taken_out = this.ticket_truck_types_rounds(idx).at(roundIdx).get('material_taken_out')?.value;
      let dump_site = this.ticket_truck_types_rounds(idx).at(roundIdx).get('dump_site')?.value;
      console.log(roundIdx, idx, material_taken_out)
      this.ticket_truck_types_rounds(idx).push(this.addRoundField());


      this.ticket_truck_types_rounds(idx).at(roundIdx + 1).get('material_taken_out')?.patchValue(material_taken_out);
      this.ticket_truck_types_rounds(idx).at(roundIdx + 1).get('dump_site')?.patchValue(dump_site);
    }
  }

  setProject(proj: any) {
    if (proj) {
      this.selected_project = proj;
      this.project_id = proj?.id;
      this.projectDetails(this.project_id);
      setTimeout(() => {
        $(".input-popup-div").hide()
      }, 300);
    }
  }

  setTC(tc: any) {
    if (tc) {
      this.trucking_company = tc;
      this.trucking_company_id = tc?.id;

      this.ticketForm.get('trucking_company_id')?.patchValue(tc?.id);
      setTimeout(() => {
        $(".input-popup-div").hide()
      }, 300);
    }
  }

  setAppr(apr: any) {
    if (apr) {
      this.approver = apr;
      this.approver_id = apr?.id;
      setTimeout(() => {
        $(".input-popup-div").hide()
      }, 300);
    }
  }
}
