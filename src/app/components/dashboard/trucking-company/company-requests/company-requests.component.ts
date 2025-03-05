import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { TraggetUserMenuCountsService } from 'src/app/services/local-storage.service';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';

declare var $: any;

interface DispatchInfo {
  id: string; // Assuming `id` is a string; adjust if it's another type
  company_name: string;
  // Include other company attributes here
}
@Component({
  selector: 'app-company-requests',
  templateUrl: './company-requests.component.html',
  styleUrls: ['./company-requests.component.css']
})
export class CompanyRequestsComponent implements OnInit {

  temporaryClassApplied: boolean = false;

  loggedinUser: any = {};
  traggetUserMenuCounts: any = {};
  message: any;
  search_project_tc:any='';
  search_comp_tc:any='';
  is_loading:boolean = false;
  requestDetail:any;
  project_list:any;
  user_id:any=null;
  truck_type_list:any;
  pending_dispatches:any = '';

  // Listing Contanier
  ticket_list: any;
  companies_list: DispatchInfo[];
  ticket_pagination: any;
  sort_by: any = 'recently created';
  perPage: number = 25;
  page: number = 0;
  sort_type:any='ASC';
  search_by: any = '';
  search_date:string = '';
  search_project: any = '';
  search_project_name: any = '';
  search_companies: any = '';
  search_companies_name: any = '';
  active_menu:any;
  menu_counts:any;

  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private user_service:UserDataService,
    private traggetUserMenuCountsService: TraggetUserMenuCountsService
  ) {
    this.companies_list = [];
    this.active_menu = {
      parent:'tickets',
      child:'requests',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.active_menu = {
      parent:'tickets',
      child:'requests',
      count_badge: '',
    }

    this.sort_by = 'dispatch_date';
    this.search_by = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    this.getProjects();
    this.getCompanies();
    this.getTicketListing();
    this.getMenuCounts();


    $(document).on('click','.getinputfield' ,function(this:any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
      // console.log("showinggg1")
    });
    
    $(document).on('click', '.input-popup-div', function(e:any) {
    e.stopPropagation();  // Correctly stop event propagation
    });
    $(document).on('click','.getinputfield1' ,function(this:any) {
      $('.input-popup-div1').hide();
      $(this).find('.input-popup-div1').show();
      // console.log("showinggg1")
    });
    
    $(document).on('click', '.input-popup-div1', function(e:any) {
    e.stopPropagation();  // Correctly stop event propagation
    });

    $(window).click(function(e:any) {
      if (!($(e.target).hasClass('getinputfield1') || $(e.target).closest('.getinputfield1').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div1').hide();
          // console.log("closinggg1")
      }
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length )) {
          $('.input-popup-div').hide();
          // $('.input-popup-div2').hide();
          console.log("closinggg")
      }
      

    });


  }


  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    if (requestDetail?.ticket?.ticket_date && requestDetail?.ticket?.ticket_time) {
      const userTimeZone = this.loggedinUser?.time_zone || ''; // Fallback to an empty string if timezone is not set
      const ticketTime = requestDetail.ticket.ticket_time; // Ticket time
      const ticketDate = requestDetail.ticket.ticket_date; // Ticket date
  
      let data = { ticketTime, ticketDate, userTimeZone };
  
      // Call the service method to perform the conversion
      const conversionResult = this.ticket_service.timeConversion(data);
      
      // console.log("data : ", data);
      // console.log("conversionResult : ", conversionResult);
      // Return the conversion result to be used in the template
      return conversionResult;
    } else {
      // Return an empty object if required details are missing
      return {};
    }
  }

  
  handleListingEvent(): void {
    this.temporaryClassApplied = true;
    setTimeout(() => {
      this.temporaryClassApplied = false;
    }, 3000);
  }

  getMenuCounts(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};

      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
          this.menu_counts =response.data;
          this.traggetUserMenuCountsService.setTraggetUserMenuCounts(response.data);
        }
      })


  }

  getTicket(tickets:any){
    if(tickets && tickets?.length){

      var total = tickets.length;
      if(total>1){
        var ticket = tickets[0]?.ticket?.ticket_no+'-'+tickets[total-1]?.ticket?.state_wise_no;
        return ticket+' ['+tickets.length+']';
      }else{
        return tickets[0]?.ticket?.ticket_no;
      }
    }

  }


  getTicketListing() {
    this.is_loading = true;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('search_project_tc', this.search_project_tc);
    formData.append('search_date', this.search_date);
    formData.append('search_companies', this.search_companies);
    formData.append('search_comp_tc', this.search_comp_tc);

    formData.append('sort_type', this.sort_type);
    this.ticket_service.getAllRequests(formData).subscribe(response => {
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.all_tickets?.data;
        this.ticket_pagination = response.data?.all_tickets;
        this.pending_dispatches = response.data.pending_dispatches;
          console.log("ticket_list : ", this.ticket_list);

        this.active_menu.count_badge = response?.data?.all_tickets?.total;
      } else {
        this.message = response.message;
      }
    }
    );
  }

  getCompanies(){
    
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_project', this.search_project);
    formData.append('search_project_tc', this.search_project_tc);
    formData.append('search_date', this.search_date);
    formData.append('search_companies', this.search_companies);

    formData.append('sort_type', this.sort_type);
    this.ticket_service.getAllRequests(formData).subscribe(response => {
      // this.is_loading = false;
      if (response.status && response.data) {
        
        let uniqueCompanies = new Map<string, DispatchInfo>();
        
        for (const ticket of response.data?.all_tickets?.data) {
          if (ticket.tc_ticket == 'YES' ) {
            const company = ticket?.ticket?.customer  ? (ticket?.ticket?.customer) : (ticket?.ticket?.tc_customer);
            if(company && !uniqueCompanies.has(company.id)) {
              uniqueCompanies.set(company.id, company);
            }
          }
          else{

            const company = ticket?.project?.user;
            if(company && !uniqueCompanies.has(company.id)) {
              uniqueCompanies.set(company.id, company);
            }

          }
        }
        this.companies_list = Array.from(uniqueCompanies.values());
        // console.log("company_objects : ", this.companies_list);
      } else {
      }
    }
    );
  }

  getProjects(){

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.project_service.getTruckingProjects(formData).subscribe(response=>{
      if(response.status && response.data){
        this.project_list = response.data;
      }else{

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
      if(this.sort_by == value){
        this.sort_type= this.sort_type=='DESC'? 'ASC':'DESC';
      }else{
        this.sort_type='ASC';
      }
      this.getTicketListing();
    }
  }

  handleFilterByProject(event:any){
    // this.search_companies='';

   if(event == ''){
     this.search_project='';
     this.search_project_name='';

   }
    var proj = null;
    this.project_list.forEach((element:any) => {
      console.log("event : ",event.toString() );
      console.log("element : ",element.id.toString()+element.project_name );
      if(element.id.toString()+element.project_name == event.toString()){
        proj = element;
        
        this.search_project=proj.id;
        this.search_project_name=proj.project_name;
        if(proj.trucking_company_id){
          this.search_project_tc = 'YES';
        }
        else{
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

  handleCompany(event: any, name:any) {
    // this.search_project='';
    // this.search_project_tc =='';

    if(event == ''){
      this.search_companies='';
      this.search_companies_name='';
    }
     var comp = null;
     this.companies_list.forEach((element:any) => {
       if(element.id == event){
         this.search_companies = event;
         this.search_companies_name = name;
         
         if(element.trucking_company_id){
          this.search_comp_tc = 'YES';
        }else{
          this.search_comp_tc = 'NO';
        }
       }
     });

     $('.input-popup-div1').hide();

     this.getTicketListing();

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

  changeDate(event:any){
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

  setDetailTicket(ticket:any){
    this.requestDetail = ticket;
  }

  getTotalTrucks(ticket:any){
    let total = 0;
    if(ticket.ticket_truck_types){
      ticket.ticket_truck_types.map((item:any)=>{
        total+=parseFloat(item?.number_of_trucks.toString());
      })
    }
    return total;
  }

  getJobRate(ticket:any){
    let total = 0;
    if(ticket.ticket_truck_types){
      ticket.ticket_truck_types.map((item:any)=>{
        total+=parseFloat(item?.rate_per_hour.toString());
      })
    }
    return total;
  }

  redirecToDispatchList(){
    this.router.navigate(['/tickets-to-dispatch']);
  }

}
