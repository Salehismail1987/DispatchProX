import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { CompanyDispatchTruckingPopupComponent } from '../company-dispatch-trucking-popup/company-dispatch-trucking-popup.component';
declare var $: any;
interface DispatchInfo {
  id: string; // Assuming `id` is a string; adjust if it's another type
  company_name: string;
  // Include other company attributes here
}
@Component({
  selector: 'app-tickets-to-dispatch-list',
  templateUrl: './tickets-to-dispatch-list.component.html',
  styleUrls: ['./tickets-to-dispatch-list.component.css']
})
export class TicketsToDispatchListComponent implements OnInit {

  @ViewChild(CompanyDispatchTruckingPopupComponent) opUpObj: CompanyDispatchTruckingPopupComponent | undefined;

  loggedinUser: any = {};
  message: any;
  is_loading: boolean = false;
  ticketDetail: any;
  project_list: any;
  truck_type_list: any;
  all_checked: boolean = false;
  show_buttons: boolean = false;
  is_tc_disp: any = 'NO';
  rates: any = [];
  rates2: any = [];
  rates2Type: any = [];
  search_project_tc: any = '';

  checked_tickets: any = {}

  companies_list: DispatchInfo[];

  // Listing Contanier
  ticket_list: any;
  selected_ticket_list: any;
  selected_Proj_name: any;
  all_ticket_list: any;
  search_project_name: any = '';

  ticket_pagination: any;
  sort_by: any = 'recently created';
  perPage: number = 25;
  page: number = 0;
  search_by: any = '';
  search_date: string = '';
  search_project: any = '';
  search_companies: any = '';
  search_company_name: any = '';

  search_comp_tc: any = '';
  search_truck_type: any = '';
  menu_counts: any;

  sort_type: any = 'ASC';
  dispatches: any = [];

  updateProjForm!: FormGroup;
  active_menu: any;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private fb: FormBuilder,
    private user_service: UserDataService
  ) {
    this.companies_list = [];
    this.active_menu = {
      parent: 'tickets',
      child: 'requests',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.updateProjForm = this.fb.group({
      selected_tickets: this.fb.array([])
    });

    this.sort_by = 'ticket_date';
    this.search_by = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.getProjects();
    this.getCompanies();
    this.getTicketListing();
    // this.getMenuCounts();

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
        // console.log("closinggg")
      }


    });
  }

  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    if (requestDetail?.ticket_date && requestDetail?.ticket_time) {
      const userTimeZone = this.loggedinUser?.time_zone || '';
      const ticketTime = requestDetail.ticket_time;
      const ticketDate = requestDetail.ticket_date;

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

  getRate(data: any, id: any) {
    if (data && data.length) {
      data.map((item: any) => {

        if (this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id == item.dispatch_to_id) {
          if (item.rate_per_hour) {
            this.rates[id] = item.rate_per_hour;
          }
          if (item.dispatch_by) {
            this.dispatches[id] = item.dispatch_by;
          }
        }
      })
    }

  }

  getRate2(data: any, id: any) {
    if (data && data.length) {
      data.map((item: any) => {
        const isMatch = this.loggedinUser?.id === item.dispatch_to_id || this.loggedinUser?.user_data_request_id === item.dispatch_to_id;

        if (isMatch && item.rate_per_hour) {
          this.rates2[id] = item.rate_per_hour;
        }
      });
    }
  }
  getRateType2(data: any, id: any) {
    if (data && data.length) {
      data.map((item: any) => {
        const isMatch = this.loggedinUser?.id === item.dispatch_to_id || this.loggedinUser?.user_data_request_id === item.dispatch_to_id;

        if (isMatch && item.rate_per_hour) {
          this.rates2Type[id] = item.rate_type;
        }
      });
    }
  }


  getMenuCounts() {
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id, account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type };

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {
        this.menu_counts = response.data;
        // console.log(' this is his.menu_counts of response::: ', this.menu_counts);
        $(".sa_request").text("[" + this.menu_counts?.requests + "]");
        $(".sa_dispatch").text("[" + this.menu_counts?.dispatched_tickets + "]");
        $(".sa_pending").text('[' + (response.data?.pending_dispatches ? response.data?.pending_dispatches : 0) + ']');
        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(response.data));
      }
    })
  }
  onCheckboxChange(e: any) {
    const checkArray: FormArray = this.updateProjForm.get('selected_tickets') as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
      if (checkArray.length > 0) {
        this.show_buttons = true;
      }
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
      if (checkArray.length < 1) {
        this.show_buttons = false;
      }
    }

  }



  getTicketListing() {
    this.all_checked = false;
    this.show_buttons = false;
    this.updateProjForm.get('selected_tickets')?.reset();
    this.ticket_list = null;

    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('search_project_tc', this.search_project_tc);
    formData.append('search_date', this.search_date);
    formData.append('search_truck_type', this.search_truck_type);
    if (!this.search_companies) {
      this.search_comp_tc == '';
      formData.append('search_comp_tc', '');
    }
    else {
      formData.append('search_comp_tc', this.search_comp_tc);
    }
    formData.append('search_companies', this.search_companies);


    formData.append('sort_type', this.sort_type);
    this.ticket_service.getCompanyTicketToDispatch(formData).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.data;
        console.log(" this is ticket List ::: ", this.ticket_list);
        this.ticket_pagination = response.data;

        if (this.ticket_list && this.ticket_list.length > 0) {
          var arr: any = [];

          this.ticket_list.map((item: any) => {
            let it = item;
            it.is_selected = false;
            this.getRate(item.trucking_company_requests, item.id);
            this.getRate2(item.trucking_company_requests, item.id);
            this.getRateType2(item.trucking_company_requests, item.id);

            arr.push(it);

          })
          this.ticket_list = arr;

          // console.log(this.all_ticket_list)
        }
      } else {
        this.message = response.message;
      }
    }
    );
    this.getMenuCounts();
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(evt: any) {

    this.ticket_list.forEach((c: any) => c.is_selected = evt.target.checked)
    this.getCheckedItemList();
  }

  // Check All Checkbox Checked
  isAllSelected(evt: any, index: any) {
    this.ticket_list[index].is_selected = evt.target.checked
    this.all_checked = this.ticket_list.every(function (item: any) {
      return item.is_selected == true;
    })

    this.getCheckedItemList();
    // console.log(this.ticket_list)
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
      // console.log(this.ticket_list)

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

  getCompanies() {
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('search_project_tc', this.search_project_tc);
    formData.append('search_date', this.search_date);
    formData.append('search_truck_type', this.search_truck_type);

    formData.append('sort_type', this.sort_type);
    this.ticket_service.getCompanyTicketToDispatch(formData).subscribe(response => {
      // this.is_loading = false;
      if (response.status && response.data) {

        let uniqueCompanies = new Map<string, DispatchInfo>();

        for (const ticket of response.data?.data) {

          if (ticket.tc_ticket == 'YES') {
            const company = ticket?.customer ? (ticket?.customer) : (ticket?.tc_customer);
            if (company && !uniqueCompanies.has(company.id)) {
              uniqueCompanies.set(company.id, company);
            }
          }
          else {

            const company = ticket?.user;
            if (company && !uniqueCompanies.has(company.id)) {
              uniqueCompanies.set(company.id, company);
            }

          }


          const company = ticket?.user;
          if (company && !uniqueCompanies.has(company.id)) {
            uniqueCompanies.set(company.id, company);
          }
        }
        this.companies_list = Array.from(uniqueCompanies.values());
        // console.log("company_objects : ", this.companies_list);

      } else {
      }
    }
    );
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
    this.getTicketListing();

  }
  handleSortByList(event: any) {
    this.sortBy(event.target.value)
  }

  searchBy(value: any) {

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
    // this.search_companies='';

    if (event == '') {
      this.search_project = '';
      this.search_project_name = '';
      this.search_project_tc = '';
    }

    var proj = null;
    this.project_list.forEach((element: any) => {
      if (element.id.toString() + element.project_name == event.toString()) {
        proj = element;

        this.search_project = proj.id;
        this.search_project_name = proj.project_name;
        if (proj.trucking_company_id) {
          this.search_project_tc = 'YES';
        } else {
          this.search_project_tc = 'NO';
        }

        // this.ticket_list.forEach((element:any) => {
        //   if(element?.project?.id.toString()+element?.project?.project_name == event.target.value && element?.tc_ticket == 'YES' ){
        //     this.search_project_tc = 'YES';
        //   }
        // });


      }
    });
    $('.input-popup-div').hide();

    this.getTicketListing()
  }

  handleCompany(event: any, name: any) {
    // this.search_project='';
    // this.search_project_tc =='';
    this.search_comp_tc == '';

    if (event == '') {
      this.search_companies = '';
      this.search_company_name = '';
      this.search_comp_tc == '';
    }
    var comp = null;
    this.companies_list.forEach((element: any) => {
      if (element.id == event) {
        this.search_companies = event;
        this.search_company_name = name;

        if (element.trucking_company_id) {
          this.search_comp_tc = 'YES';
        } else {
          this.search_comp_tc = 'NO';
        }

      }



    });
    $('.input-popup-div1').hide();

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
    this.getTicketListing();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "mybtn mybtn-back-green width-fit-content btn-text-very-small text-color-green";
        break;
      case 'Approved':
        return "mybtn bg-yellow width-fit-content btn-text-very-small";
        break;
      case 'Accepted':
        return "mybtn mybtn-back-purple width-fit-content btn-text-very-small text-color-purple";
        break;
      case 'Completed':
        return "mybtn bg-pink width-fit-content btn-text-very-small";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  setDetailTicket(ticket: any, index: any) {
    this.ticketDetail = ticket;
    if (index || index == 0) {
      this.selectRow(index);
    }
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

  redirectToRequestListing() {
    this.router.navigate(['/trucking-requests'])
  }

  handleAllCheck(event: any) {

    if (event.target.checked) {
      this.all_checked = true;
      const checkArray: FormArray = this.updateProjForm.get('selected_tickets') as FormArray;
      this.show_buttons = true;

      this.ticket_list.map((item: any) => {
        checkArray.push(new FormControl(item.id));
      })
    } else {
      const checkArray: FormArray = this.updateProjForm.get('selected_tickets') as FormArray;
      checkArray.clear();
      this.all_checked = false;

      this.show_buttons = false;

    }
  }

  handleDispatchTrucking(disp: any) {
    // console.log(this.selected_ticket_list)
    this.is_tc_disp = disp;
    localStorage.setItem('is_tc_disp', disp.toString());
    this.opUpObj?.getData(this.selected_ticket_list);

    const selectedTicketList = this.selected_ticket_list;
    this.opUpObj?.setData(selectedTicketList);

  }

}
