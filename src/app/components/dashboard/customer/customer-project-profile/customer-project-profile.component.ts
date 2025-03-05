import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, ValidationErrors } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-customer-project-profile',
  templateUrl: './customer-project-profile.component.html',
  styleUrls: ['./customer-project-profile.component.css']
})
export class CustomerProjectProfileComponent implements OnInit {

  self_user: any = null;
  loggedinUser: any = {};
  message: any;
  projectUsersForm!: FormGroup;
  dump_list: any = [];
  idx_up: any;
  //Data Container
  project: any;
  project_id: any;
  selected_project_id: any;
  is_loading: boolean = false;
  project_approvers: any;
  project_external_approvers: any;

  users_list: any;
  project_users: any;
  approver_list: any;
  supridendents_list: any;
  dispatchers_list: any;

  updateProjForm!: FormGroup;

  updateProjJobNumberError: string = '';
  updateProjNameError: string = '';
  updateProjStartDateError: string = '';
  updateProjEndDateError: string = '';
  updateProjLocationError: string = '';
  updateProjApproverError: string = '';
  updateProjDumpSiteError: string = '';
  updateProjRoundError: string = '';
  active_menu: any;
  require_paper_ticket: any = null;

  remove_user_name: string = '';
  remove_user_type: string = '';
  remove_idx: any = null;

  show_list_app: boolean = false;
  show_list_app_id: any = null;
  show_list_disp: boolean = false;
  show_list_disp_id: any = null;
  show_list_sup: boolean = false;
  is_approver_selected: any = false;
  is_superintendent_selected: any = false;
  is_dispatcher_selected: any = false;
  approver_term_search: string = '';
  dispatcher_term_search: string = '';
  sup_term_search: string = '';

  project_supr_name: string = '';
  project_supr_email: string = '';
  project_supr_no: string = '';
  project_supr_id: string = '';
  activeTab: string = 'project_tracker';
  current_modal: string = '';
  loading_project_update: boolean = false;
  loading_project_remove: boolean = false;
  loading_project_add: boolean = false;
  loading_project_user: boolean = false;
  user_details_info: any = null;
  edit_mode_project: boolean = false;

  canada_provinces: any = [];
  usa_provinces: any = [];

  country: any = 'Canada';
  province: any = 'British Columbia';
  address: any = null;
  all_tickets_closed: boolean = false;
  constructor(
    private router: Router,
    private activeRouter: ActivatedRoute,
    private projectService: ProjectService,
    private user_service: UserDataService,
    private fb: FormBuilder,
  ) {
    this.active_menu = {
      parent: 'projects',
      child: 'projects',
      count_badge: '',
    }
  }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    this.project_id = this.activeRouter.snapshot.params['id'];
    if (this.project_id != "") {
      this.projectDetails(this.project_id);
    }

    this.getApprovers();
    // this.getDispatchers();
    // this.getSupridentents();
    this.getProjectUsers();
    this.getUsersToShow()
    this.updateProjForm = this.fb.group({
      job_number: ['', Validators.required],
      project_name: ['', Validators.required],
      project_location: ['', Validators.required],
      start_date: [''],
      project_description: [''],
      planned_enddate: [''],
      default_rounds: [''],
      require_paper_ticket: [''],
      project_id: [''],
      supridendent_id: [''],
      dump_sites: this.fb.array([]),
      approvers: this.fb.array([]),
      dispatchers: this.fb.array([]),
    });

    $(document).on("click", ".closepop", function (this: any) {

      $(this).closest('.mainpopupdiv').find('.inapp-popup').toggle();
    });

    $(document).on("click", ".my-modal-close", function (this: any) {
      $("#addDumpSiteModal").modal('hide');
    });
    $(document).on("click", ".my-modal-close2", function (this: any) {

      $(`updateDumpSiteModal${this.idx_up}`).modal('hide');
      this.idx_up = '';
    });

    $(document).on("click", ".openpop", function (this: any) {

      $(this).closest('.mainpopupdiv').find('.inapp-popup').toggle();
    });
    $(document).on("click", ".my-nav-tabs .nav-link", function (this: any) {
      if ($(this).attr('id') == 'project_profile-tab') {
        $('.profile_heading_div').show();
        $('.tracker_heading_div').hide();
      } else {

        $('.profile_heading_div').hide();
        $('.tracker_heading_div').show();
      }
    });
    $(document).click(function (e: any) {

      var container = $(".background-customer");
      var input = $(".selectcustomerfield");

      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if (!input.is(e.target) && input.has(e.target).length === 0) {

          container.hide();
        }
      }
    });

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

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  isActive(tabName: string): boolean {
    return this.activeTab === tabName;
  }

  addDumpSite(item: any) {
    this.dump_sites.push(
      this.fb.group({
        name: [item?.dump_site],
        location: [item?.location],
      })
    )
  }

  toggleEditMode(val: any) {
    this.edit_mode_project = val;
  }
  showNewDumpsitePopup() {

    $("#addDumpSiteModal").modal('show');
  }

  addDumpsiteNew() {
    if ($(".dumpsite_name").val() && $(".dumpsite_addresss").val()) {
      let name = $(".dumpsite_name").val();
      let location = $(".dumpsite_addresss").val();
      let data: any = {
        name: name,
        location: location,
        project_id: this.project.id
      }

      this.loading_project_add = true;
      this.projectService.addDumpSite(data).subscribe(response => {

        if (response && !response.status) {
          this.loading_project_update = false;
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
          return;
        } else {

          this.loading_project_update = false;
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Success`,
            response.message).then(() => {

            });

          if (this.project_id != "") {
            this.projectDetails(this.project_id);
          }
        }
      });

    }
    $("#addDumpSiteModal").modal('hide');
    $(".dumpsite_name").val('')
    $(".dumpsite_addresss").val('')
  }

  showUpdateDumpsitePopup(idx: any) {
    this.idx_up = idx;

    let modalId = `#updateDumpSiteModal${idx}`;
    $(modalId).modal('show');
  }
  closeDumpUpdate(idx: any) {
    this.idx_up = '';

    let modalId = `#updateDumpSiteModal${idx}`;
    $(modalId).modal('hide');
  }

  updateDumpsiteNew(dumpSiteNamee: string, dumpSiteAddresss: string, id: number, idx: number): void {
    if (dumpSiteNamee && dumpSiteAddresss) {
      let data: any = {
        name: dumpSiteNamee,
        location: dumpSiteAddresss,
        id: id
      }

      this.loading_project_update = true;
      this.projectService.updateDumpSite(data).subscribe(response => {

        if (response && !response.status) {
          this.loading_project_update = false;
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
          return;
        } else {

          this.loading_project_update = false;
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Success`,
            response.message).then(() => {

            });

          if (this.project_id != "") {
            this.projectDetails(this.project_id);
          }
        }
      });

    }

    this.idx_up = '';

    let modalId = `#updateDumpSiteModal${idx}`;
    $(modalId).modal('hide');
    // $("#updateDumpSiteModal").modal('hide');
  }

  removeDumpsiteNew(id: any, idx: number): void {
    if (id) {
      let data: any = {
        id: id
      }

      this.loading_project_remove = true;
      this.projectService.removeDumpSite(data).subscribe(response => {

        if (response && !response.status) {
          this.loading_project_remove = false;
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
          return;
        } else {

          this.loading_project_remove = false;
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Success`,
            response.message).then(() => {

            });

          if (this.project_id != "") {
            this.projectDetails(this.project_id);
          }
        }
      });

      this.idx_up = '';
      // $("#updateDumpSiteModal").modal('hide');
      let modalId = `#updateDumpSiteModal${idx}`;
      $(modalId).modal('hide');

    }

    $("#addDumpSiteModal").modal('hide');
  }
  addApprover(approver: any) {

    this.approvers.push(
      this.fb.group({
        approver_id: [approver?.id],
        email: [approver?.email],
        no: [approver?.contact_number],
        name: [approver?.full_name]
      })
    );
    $("#search-approver" + this.approvers.length).val('');
  }

  addDispatcher(dispatcher: any) {
    this.dispatchers.push(
      this.fb.group({
        dispatcher_id: [dispatcher.id],
        email: [dispatcher.email],
        no: [dispatcher.contact_number],
        name: [dispatcher.full_name]

      })
    );

    $("#search-dispatcher" + this.approvers.length).val('');
  }

  get dispatchers(): FormArray {
    return this.updateProjForm.controls["dispatchers"] as FormArray;
  }

  get approvers(): FormArray {
    return this.updateProjForm.controls["approvers"] as FormArray;
  }

  setUser(idx: any, type: any, name: any) {
    if (name === undefined) {
      return;
    }
    if (type == 'Approver') {
      this.remove_user_name = name;
      this.remove_user_type = 'Approver';
    } else if (type == 'Dispatcher') {
      this.remove_user_name = name;
      this.remove_user_type = 'Dispatcher';
    }
    this.remove_idx = idx;
  }

  removeUser(idx: any) {
    if (this.remove_user_type == 'Approver') {
      this.approvers.removeAt(this.remove_idx);
      this.remove_user_name = '';
      this.remove_user_type = '';
      this.remove_idx = '';
    } else if (this.remove_user_type == 'Dispatcher') {
      this.dispatchers.removeAt(this.remove_idx);
      this.remove_user_name = '';
      this.remove_user_type = '';
      this.remove_idx = '';
    }
  }

  cancelRemoveUser() {
    this.remove_user_name = '';
    this.remove_user_type = '';
    this.remove_idx = '';
  }

  isAlreadyAddedAs(email: any, role: any) {

  }
  projectDetails(project_id: any) {
    this.is_loading = true;
    this.projectService.projectDetails(project_id).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {

        let total: any = 0;
        if (response.data?.user_tickets_counts) {
          total = parseInt(response?.data?.user_tickets_counts?.accepted_count) + parseInt(response?.data?.user_tickets_counts?.inprogress_count) + parseInt(response?.data?.user_tickets_counts?.pending_count) + parseInt(response?.data?.user_tickets_counts?.completed_count)
          if (total < 1) {
            this.all_tickets_closed = true;
          }
        }

        this.getProjectUsers();
        this.updateProjForm = this.fb.group({
          job_number: ['', Validators.required],
          project_name: ['', Validators.required],
          project_location: ['', Validators.required],
          start_date: [''],
          project_description: [''],
          planned_enddate: [''],
          default_rounds: [''],
          require_paper_ticket: [''],
          project_id: [''],
          supridendent_id: [''],
          dump_sites: this.fb.array([]),
          approvers: this.fb.array([]),
          dispatchers: this.fb.array([]),
        });

        this.project = response.data;
        this.project_approvers = this.project.project_approvers;
        this.require_paper_ticket = this.project?.require_paper_ticket;

        this.updateProjForm.get('project_name')?.patchValue(this.project?.project_name)

        this.updateProjForm.get('job_number')?.patchValue(this.project?.job_number)
        this.updateProjForm.get('project_description')?.patchValue(this.project?.project_description)
        this.updateProjForm.get('project_location')?.patchValue(this.project?.project_location)
        this.updateProjForm.get('planned_enddate')?.patchValue(this.project?.planned_enddate)
        this.updateProjForm.get('start_date')?.patchValue(this.project?.start_date)

        let is_found: boolean = false;
        this.project.project_supridentent?.map((sup: any) => {
          if (sup?.id == this.loggedinUser.id && !is_found) {
            this.project_supr_name = sup && sup?.user && sup?.user?.full_name ? sup?.user?.full_name : '';

            this.project_supr_id = sup && sup?.user_id;

            this.project_supr_email = sup && sup?.user && sup?.user?.email ? sup?.user?.email : '';

            this.project_supr_no = sup && sup?.user && sup?.user?.contact_number ? sup?.user?.contact_number : '';
            is_found = true;
          }
        })

        let usr_id = this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id;

        this.self_user = this.loggedinUser.user_data_request_id ? this.loggedinUser?.parent_user : this.loggedinUser;
        this.project_approvers && this.project_approvers.length > 0 && this.project_approvers.map((item: any) => {

          if (item?.user?.id != usr_id) {
            this.addApprover(item.user);
          } else {
            this.self_user = item.user;
          }
        })


        this.project.project_dispatchers && this.project.project_dispatchers.length > 0 && this.project.project_dispatchers.map((item: any) => {
          this.addDispatcher(item.user);

        })

        this.project.dump_sites && this.project.dump_sites.length > 0 && this.project.dump_sites.map((item: any) => {
          this.addDumpSite(item);
        })

        this.projectService.projectDumpsiteList(project_id).subscribe(response => {
          if (response.status && response.data) {
            this.dump_list = response.data;
          }
          else {
          }
        })


        if (this.approvers.controls.length < 1) {
          this.addApprover([]);
        }

        if (this.dispatchers.controls.length < 1) {
          this.addDispatcher([]);
        }

      }
    })
  }

  setSupridentent(user: any) {

    this.project_supr_email = user?.email;
    this.project_supr_no = user?.contact_number;
    this.project_supr_name = user?.full_name;
    this.project_supr_id = user?.id;


  }
  setApprover(index: any, item: any) {

    this.approvers.at(index).get('approver_id')?.patchValue(item.id)
    this.approvers.at(index).get('email')?.patchValue(item.email)
    this.approvers.at(index).get('no')?.patchValue(item.contact_number)
    this.approvers.at(index).get('name')?.patchValue(item.full_name)

  }

  setDispatcher(index: any, item: any) {

    this.dispatchers.at(index).get('dispatcher_id')?.patchValue(item.id)
    this.dispatchers.at(index).get('email')?.patchValue(item.email)
    this.dispatchers.at(index).get('no')?.patchValue(item.contact_number)
    this.dispatchers.at(index).get('name')?.patchValue(item.full_name)

  }

  setDispatcherNew(dispatcher: any) {
    if (dispatcher && dispatcher?.id) {
      let data: any = {
        project_id: this.project_id,
        user_id: dispatcher.id,
        role: 'Dispatcher'
      }
      if (dispatcher?.invitation_code) {
        data.is_invited = 'YES';
      }

      this.projectService.addUserIntoProject(data).subscribe(response => {

        if (response && response.status) {
          if (this.project_id != "") {
            this.projectDetails(this.project_id);
            this.getApprovers();
            // this.getDispatchers();
            // this.getSupridentents();
            this.getProjectUsers();
            this.getUsersToShow();
          }
        }
      });
    }

  }
  setApproverNew(approver: any) {
    if (approver && approver?.id) {
      let data: any = {
        project_id: this.project_id,
        user_id: approver.id,
        role: 'Approver',
        is_external_approver: 'YES'
      }

      if (approver?.is_accepted == 0) {
        data = { ...data, is_invited: 'YES' }
      }

      this.projectService.addUserIntoProject(data).subscribe(response => {
        if (response && response.status) {
          if (this.project_id != "") {
            this.projectDetails(this.project_id);
            this.getApprovers();
            // this.getDispatchers();
            // this.getSupridentents();
            this.getProjectUsers();
            this.getUsersToShow();
          }
        }
      });
    }
  }

  getApprovers() {
    const formData = new FormData();

    formData.append('term', this.approver_term_search);
    formData.append('type', 'All');

    formData.append('project_id', this.project_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.approver_list = response.data;

      } else {

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

  getProjectUsers() {
    const formData = new FormData();

    formData.append('project_id', this.project_id);

    this.projectService.getProjectUsers(formData).subscribe(response => {

      if (response.status && response.data) {
        this.project_users = response.data?.users;
        this.project_external_approvers = response.data?.external_approvers;

      } else {

      }
    })
  }


  getUsersToShow() {
    const formData = new FormData();

    formData.append('term', this.approver_term_search);
    formData.append('type', 'Users to Add');

    formData.append('is_for_listing', 'YES');
    // formData.append('project_id', this.project_id);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.users_list = response.data;

      } else {

      }
    })
  }

  getSupridentents() {
    const formData = new FormData();

    formData.append('type', 'All');

    formData.append('term', this.sup_term_search);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.supridendents_list = response.data;

      } else {

      }
    })
  }

  getDispatchers() {
    const formData = new FormData();

    formData.append('type', 'All');
    formData.append('term', this.dispatcher_term_search);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);

    this.user_service.getUserList(formData).subscribe(response => {

      if (response.status && response.data) {
        this.dispatchers_list = response.data;

      } else {

      }
    })
  }


  get dump_sites(): FormArray {
    return this.updateProjForm.get('dump_sites') as FormArray;
  }


  onUpdateProject() {
    this.updateProjJobNumberError = '';
    this.updateProjNameError = '';
    this.updateProjStartDateError = '';
    this.updateProjEndDateError = '';
    this.updateProjLocationError = '';
    this.updateProjApproverError = '';
    this.updateProjDumpSiteError = '';
    this.updateProjRoundError = '';

    if (this.updateProjForm.get('job_number')?.value == '') {
      this.updateProjJobNumberError = "Job Number is required";
    }

    if (this.updateProjForm.get('project_name')?.value == '') {
      this.updateProjNameError = "Project Name is required";
    }

    if (this.updateProjForm.get('planned_enddate')?.value == '') {
      this.updateProjEndDateError = "Planned End Date is required";
    }

    if (this.updateProjForm.get('project_location')?.value == '') {
      this.updateProjLocationError = "Project Location is required";
    }


    // if(this.updateProjForm.get('default_rounds')?.value == ''){
    //   this.updateProjRoundError  = "Please enter Default Rounds.";
    // }

    // if(this.approvers.controls.length>0 ){

    // }else{
    //   this.updateProjApproverError = 'At least one approver is required.';
    //   return;
    // }

    if (this.updateProjForm.invalid) {
      // Object.keys(this.updateProjForm.controls).forEach((key:any) => {
      //   const controlErrors: any = this.updateProjForm.get(key)?.errors;
      //   if (controlErrors != null) {
      //     Object.keys(controlErrors).forEach(keyError => {
      //     });
      //   }
      // });
      return;
    }

    this.loading_project_update = true;
    let data: any = this.updateProjForm.value;
    data.require_paper_ticket = this.require_paper_ticket;
    this.projectService.updateProject(data).subscribe(response => {

      if (response && !response.status) {
        this.loading_project_update = false;
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

        this.updateProjApproverError = response.data.approver_id ? response.data.approver_id : '';
        this.updateProjEndDateError = response.data.planned_enddate ? response.data.planned_enddate : '';
        this.updateProjStartDateError = response.data.start_date ? response.data.start_date : '';
        this.updateProjJobNumberError = response.data.job_number ? response.data.job_number : '';
        this.updateProjNameError = response.data.project_name ? response.data.project_name : '';
        this.updateProjLocationError = response.data.project_location ? response.data.project_location : '';
        this.updateProjRoundError = response.data.default_rounds ? response.data.default_rounds : '';
        this.updateProjApproverError = response.data.default_rounds ? response.data.approver_id : '';

        return;
      } else {

        this.loading_project_update = false;
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          `Project Profile updated!`).then(() => {

          });

      }
    });


  }

  onSaveUsers() {

  }

  showAppList(idx: any) {
    this.show_list_app = !this.show_list_app;
    this.show_list_disp = false;
    this.show_list_app_id = idx;
    this.show_list_disp_id = '';
  }

  showDispList(idx: any) {
    this.show_list_disp = !this.show_list_disp;
    this.show_list_app = false;
    this.show_list_disp_id = idx;
    this.show_list_app_id = '';
  }

  showSupList() {
    this.show_list_sup = !this.show_list_sup;
    this.show_list_app = false;
    this.show_list_app_id = '';
    this.show_list_disp = false;
    this.show_list_disp_id = '';
  }
  searchAppComp(event: any) {
    if (event.target.value) {
      this.approver_term_search = event.target.value;
      this.getApprovers()
    } else {
      this.approver_term_search = '';
      this.getApprovers()
    }

  }

  searchDispComp(event: any) {
    if (event.target.value) {
      this.dispatcher_term_search = event.target.value;
      this.getDispatchers()
    } else {
      this.dispatcher_term_search = '';
      this.getDispatchers()
    }
  }

  searchSupComp(event: any) {
    if (event.target.value) {
      this.sup_term_search = event.target.value;
      this.getSupridentents()
    } else {
      this.sup_term_search = '';
      this.getSupridentents()
    }
  }

  showModalUser() {
    this.current_modal = 'add-users';
  }

  showModalUserRole() {
    this.current_modal = 'add-users';
    this.selected_project_id = this.project_id;
  }

  showModal(event: any) {
    this.current_modal = '';
  }

  setUserDetails2(userId: any) {
    this.project_users?.map((user: any) => {
      console.log(user?.user?.id, userId)
      if (user?.user?.id == userId) {
        if (user) {
          this.is_superintendent_selected = false;
          this.is_dispatcher_selected = false;
          this.is_approver_selected = false;
          this.user_details_info = user;
          this.user_details_info?.roles?.map((item: any) => {
            if (item == 'Approver') {
              this.is_approver_selected = true;
            }
            if (item == 'Dispatcher') {
              this.is_dispatcher_selected = true;
            }
            if (item == 'Superintendent') {
              this.is_superintendent_selected = true;
            }
          })

          $("#userInfoModal").modal('show');
        }
        return;
      }
    })
  }

  setUserDetails(user: any) {
    $("#userInfoModal").modal('hide');
    if (user) {
      this.is_superintendent_selected = false;
      this.is_dispatcher_selected = false;
      this.is_approver_selected = false;
      this.user_details_info = user;
      this.user_details_info?.roles?.map((item: any) => {
        if (item == 'Approver') {
          this.is_approver_selected = true;
        }
        if (item == 'Dispatcher') {
          this.is_dispatcher_selected = true;
        }
        if (item == 'Superintendent') {
          this.is_superintendent_selected = true;
        }
      })

      $("#userInfoModal").modal('show');
    }
  }

  setActive(event: any) {
    this.current_modal = '';
    this.getApprovers();
    // this.getDispatchers();
    // this.getSupridentents();
    this.getProjectUsers();
    this.getUsersToShow();
  }

  updateProjectUser(user: any) {

    if (user) {
      if (!$("#user_update_email").val() || !$("#user_update_phone").val()) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Warning`,
          'Email and contact number are required.').then(() => {

          });
        return;
      }
      let roles: any = [];
      if (this.is_approver_selected) {
        roles.push('Approver');
      }
      if (this.is_dispatcher_selected) {
        roles.push('Dispatcher');
      }
      if (this.is_superintendent_selected) {
        roles.push('Superintendent');
      }
      let data: any = {
        project_id: this.project_id,
        user_id: (user?.user && user?.user?.id ? user?.user?.id :
          user?.invitation_id ? user?.invitation_id : user?.id
        ),
        email: $("#user_update_email").val(),
        phone: $("#user_update_phone").val(),
        roles: roles
      }
      if (user?.invitation_id) {
        data.is_invited = 'YES';
      }
      this.loading_project_user = true;
      this.projectService.updateProjectUser(data).subscribe(response => {

        if (response && !response.status) {
          this.loading_project_user = false;
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

          return;
        } else {
          this.is_superintendent_selected = false;
          this.is_dispatcher_selected = false;
          this.is_approver_selected = false;

          this.user_details_info = null;
          $("#userInfoModal").modal('hide');
          $("#user_update_email").val('');
          $("#user_update_phone").val('');
          this.projectDetails(this.project_id);
          this.loading_project_user = false;
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Success`,
            response.message).then(() => {

            });

        }
      });
    }

  }

  removeProjectUser(user: any) {

    if (user) {
      let data: any = {
        project_id: this.project_id,
        user_id: (user?.user && user?.user?.id ? user?.user?.id :
          user?.invitation_id ? user?.invitation_id : user?.id
        )
      }
      if (user?.invitation_id) {
        data.is_invited = 'YES';
      }

      this.projectService.removeUserFromProject(data).subscribe(response => {

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

          return;
        } else {

          this.is_superintendent_selected = false;
          this.is_dispatcher_selected = false;
          this.is_approver_selected = false;

          this.user_details_info = null;
          $("#userInfoModal").modal('hide');
          $("#user_update_email").val('');
          $("#user_update_phone").val('');
          this.projectDetails(this.project_id);
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            `Success`,
            response.message).then(() => {

            });

        }
      });
    }

  }

  roleChecked(event: any) {
    if (this.user_details_info) {
      if (event.target.checked == true) {
        switch (event.target.value) {
          case 'Approver':
            this.is_approver_selected = true;
            break;
          case 'Dispatcher':
            this.is_dispatcher_selected = true;
            break;
          case 'Superintendent':
            this.is_superintendent_selected = true;
            break;
        }
      } else if (event.target.checked == false) {
        switch (event.target.value) {
          case 'Approver':
            this.is_approver_selected = false;
            break;
          case 'Dispatcher':
            this.is_dispatcher_selected = false;
            break;
          case 'Superintendent':
            this.is_superintendent_selected = false;
            break;
        }
      }
    }
  }

  changeNumber(event: any) {

    let p: string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc = this.formatPhoneNumber(p);
    // console.log(abc)
    $("#user_update_phone").val(abc);
  }

  formatPhoneNumber(input: any) {

    if (input.charAt(0) == '+') {
      // alert(input)
      input = input.substring(3, input.length);

    }
    input = input.replace(/\D/g, '');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0, 10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if (size == 0) {
      input = input;
    } else if (size < 4) {
      input = '+1 (' + input;
    } else if (size < 7) {
      input = '+1 (' + input.substring(0, 3) + ') ' + input.substring(3, 6);
    } else {
      input = '+1 (' + input.substring(0, 3) + ') ' + input.substring(3, 6) + ' ' + input.substring(6, 10);
    }
    return input;
  }

  checkUserRole(role: any, user: any) {

  }

  movetoCreate() {
    if (this.project?.id) {
      this.router.navigate(['/customer-create-ticket'], { queryParams: { 'project_id': this.project?.id } });
    } else {
      this.router.navigate(['/customer-create-ticket']);
    }
  }

  setCountry(event: any) {
    if (event?.target?.value) {
      this.country = event?.target?.value;
    }
  }

  saveAddress() {
    let address: any = '';
    if ($("#street").val()) {
      address += $("#street").val();
    }

    if ($("#city").val()) {
      address += (address != '' ? ', ' : '') + $("#city").val();
    }

    if ($("#province_state").val()) {
      address += (address != '' ? ', ' : '') + $("#province_state").val();
    }

    if ($("#postal_code").val()) {
      address += (address != '' ? ' ' : '') + $("#postal_code").val();
    }


    if ($("#country").val()) {
      address += (address != '' ? ' ' : '') + $("#country").val();
    }
    this.updateProjForm.get('project_location')?.patchValue(address);

  }

  deleteProjectShow() {

    if (this.all_tickets_closed) {
      $(".confirmProjectDelete").show();

    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        `Warning`,
        'Cannot remove project! There are still some OPEN tickets for this project.').then(() => {

        });
    }
  }

  closeConfirm() {
    $(".confirmProjectDelete").hide();
  }

  handleDeleteProject() {
    let data: any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id,
      project_id: this.project?.id
    }
    this.projectService.removeProject(data).subscribe(response => {

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

        return;
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          'Project removed.').then(() => {
            this.router.navigate(['/project-listing'])
          });
      }
    });
  }

  checkAvailable(appr: any) {
    let isAvailable = this.project_external_approvers?.find((item: any) => item?.invitation_id == appr?.id || item?.user_id == appr?.id);
    if (isAvailable) {
      return false;
    } else {
      return true;
    }
  }
}
