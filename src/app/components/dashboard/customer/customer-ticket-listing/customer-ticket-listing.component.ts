import { Component, OnInit ,ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { CustomerTicketPopupComponent} from 'src/app/components/dashboard/customer/customer-ticket-popup/customer-ticket-popup.component';
import { CustomerService } from 'src/app/services/customer.service';
import { ProjectService } from 'src/app/services/project.service';

declare var $: any;
@Component({
  selector: 'app-customer-ticket-listing',
  templateUrl: './customer-ticket-listing.component.html',
  styleUrls: ['./customer-ticket-listing.component.css']
})
export class CustomerTicketListingComponent implements OnInit {

  loggedinUser: any = {};
  message: any;
  @ViewChild(CustomerTicketPopupComponent) opUpObj :CustomerTicketPopupComponent | undefined;
 
  ticketDetail:any;

  // Listing Contanier
  ticket_list: any;
  ticket_pagination: any;
  sort_by: any = 'recently created';
  sort_type:any='ASC';
  perPage: number = 25;
  
  trucking_companies_list: any;
  projects_list:any;
  
  trucking_company_id:any=null;
  selected_company_name:any=null;
  selected_proj_name:any=null;
  project_id:any=null;

  last_round:any=null;
  page: number = 1;
  Unknown: number = 0;
  search_by: any = '';
  search_date:string = '';
  search_status: any = '';
  is_loading:boolean =false;
  is_free_trial:any=''; 
  active_menu:any;  
  all_checked:boolean = false;
  show_buttons:boolean= false;
  checked_tickets:any ={};
  selected_ticket_list:any;
  constructor(
    private router: Router,
    private ticket_service: TicketService,    
    private project_service: ProjectService,
    private customer_service: CustomerService,
    private actRouter: ActivatedRoute
  ) { 
    this.active_menu = {
      parent:'tickets',
      child:'dispatched-tickets',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.sort_by = 'ticket_date';
    this.search_by = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    if(this.actRouter.snapshot.queryParams['status'] && this.actRouter.snapshot.queryParams['status'] !=''){
      this.search_status = this.actRouter.snapshot.queryParams['status'];
    }
    
    if(this.actRouter.snapshot.queryParams['project_id'] && this.actRouter.snapshot.queryParams['project_id'] !=''){
      this.project_id = this.actRouter.snapshot.queryParams['project_id'];
    }
    this.getTicketListing();
    this.getTruckingCompanies();
    this.getProjects();

    $(document).on('click','.getinputfield' ,function(this:any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });

    $(document).on('click','.getinputfield2' ,function(this:any) {
      $('.input-popup-div2').hide();
      $(this).find('.input-popup-div2').show();
    });
    
    // // Prevent event propagation if clicking inside the .input-popup-div3
    $(document).on('click', '.input-popup-div', function(e:any) {
      e.stopPropagation();
    }); 
    $(document).on('click', '.input-popup-div2', function(e:any) {
      e.stopPropagation();
    }); 
    
    
    

    $(window).click(function(e:any) {
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length )) {
          $('.input-popup-div').hide();
          
      }
      
      if (!($(e.target).hasClass('getinputfield2') || $(e.target).closest('.getinputfield2').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div2').hide();
          // console.log("closinggg2")
      }
      

    });

  }

  getProjects(){
    const formData = new FormData();
   
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    
    this.project_service.projectListing(formData).subscribe(response=>{
      
      if(response.status && response.data){
        this.projects_list = response.data;
        // this.project_id= response.data[0]?.id;
      
      }else{  
        
      }
    })
  }

  getTruckingCompanies(){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.is_loading = true;
    this.customer_service.getCustomerCompanies(formData).subscribe(response=>{

      if(response.status && response.data){
        this.trucking_companies_list = response.data;
        if(this.trucking_companies_list && this.trucking_companies_list.length>0 &&  this.trucking_companies_list[0] && this.trucking_companies_list[0].id){
          // this.trucking_company_id = this.trucking_companies_list[0]?.id;
        }
      }else{  
        
      }
    })
  }

  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    const userTimeZone = this.loggedinUser?.timezone || '';
    let ticketTime;
    let ticketDate;
    if (round == 1 && requestDetail?.ticket_date && requestDetail?.ticket_time) {
      ticketDate = requestDetail?.ticket_date;
      ticketTime = requestDetail?.ticket_time;
    }
    else if( round == 2 && requestDetail?.ticket_date && requestDetail?.driver_ticket?.started_at){
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
    else if( round == 3 && requestDetail){
      const dateTime = new Date(requestDetail);
      ticketDate = dateTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
      });
      
      ticketTime = requestDetail;
      // console.log(" ticketTime ", ticketTime)
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
    else{ return{}; }
   
    let data = { ticketTime, ticketDate, userTimeZone };
    const conversionResult = this.ticket_service.timeConversion(data);
    // console.log(" data ", data)
    // console.log(" conversionResult ", conversionResult)

    return conversionResult;
}


  // The master checkbox will check/ uncheck all items
  checkUncheckAll(evt:any) {

    this.ticket_list.forEach((c:any) =>{
      if(c.status=='Accepted' || c.status =='Pending'){
        c.is_selected = evt.target.checked
      } 
    })
    if(evt.target.checked){
      this.all_checked =evt.target.checked;
    }else{
      this.all_checked = false;
    }
    this.getCheckedItemList();
  }

  // Check All Checkbox Checked
  isAllSelected(evt:any, index:any) {
    this.ticket_list[index].is_selected = evt.target.checked
    this.all_checked = this.ticket_list.every(function(item:any) {
        return item.is_selected == true;
      })
    
    this.getCheckedItemList();
    console.log(this.ticket_list)
  }

  selectRow(index:any){

    if(index || index==0){

      if(this.ticket_list[index].is_selected == true){

        this.ticket_list[index].is_selected = false
        $("#checkbox"+index).attr('checked',false);
      }else{

        this.ticket_list[index].is_selected = true
        $("#checkbox"+index).attr('checked',true);
      }
      
      this.all_checked = this.ticket_list.every(function(item:any) {
        return item.is_selected == true;
      })
      this.getCheckedItemList();
      console.log(this.ticket_list)

    }

  }

  // Get List of Checked Items
  getCheckedItemList(){
    this.selected_ticket_list = [];
    for (var i = 0; i < this.ticket_list.length; i++) {
      if(this.ticket_list[i].is_selected){
        this.selected_ticket_list.push(this.ticket_list[i]);
      }
    }
    this.selected_ticket_list = this.selected_ticket_list;
    // console.log(this.selected_ticket_list)
    this.show_buttons = this.selected_ticket_list.length>0 ? true : false;
  }

  getTicketListing() {

    this.selected_ticket_list = null;
    
    $("#myModal2").modal('hide');
    this.is_loading = true;
    this.all_checked = false;
    this.selected_ticket_list = null;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id : this.loggedinUser.user_data_request_id );
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_status', this.search_status);
    formData.append('search_date', this.search_date);
    formData.append('project_id', this.project_id);
    formData.append('trucking_company_id', this.trucking_company_id);
    
    formData.append('sort_type', this.sort_type);

    this.ticket_service.getAllTickets(formData).subscribe(response => {
      
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.data;

        this.is_free_trial = response?.is_trial;

        this.ticket_pagination = response.data;
        console.log(this.ticket_list);
        if (response?.Unknown) {
          this.Unknown = response?.Unknown;
      
          let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');
      
          // Add or update Unknown_disp
          storedMenuCounts.Unknown_disp = this.Unknown;
      
          // Update the local storage with the new value
          localStorage.setItem('Unknown_disp', JSON.stringify(storedMenuCounts));
      }
      else{
        this.Unknown = 0;
            let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');
            storedMenuCounts.Unknown_disp = this.Unknown;
            localStorage.setItem('Unknown_disp', JSON.stringify(storedMenuCounts));
      }
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
      if(this.sort_by == value){      
        this.sort_type= this.sort_type=='DESC'? 'ASC':'DESC';
      }else{
        this.sort_type='ASC';
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

  changeDate(event:any){
    this.search_date = event.target.value;
    this.getTicketListing();
  }

  getLastRound(tickt:any,modal:any=null){

    this.last_round= null;
    if(tickt?.ticket_truck_type_rounds?.length>0){
      let isFound:boolean=false;
      tickt?.ticket_truck_type_rounds?.map((round:any)=>{
        if(round?.driver_start_time ==null && !isFound)
        this.last_round=round;
        isFound=true;
      })
      if(!this.last_round){
        tickt?.ticket_truck_type_rounds?.map((round:any)=>{
          this.last_round=round;
        })
      }

     
    }
  }

  getRoundInProgress(ticket:any) {
    let round_in_progress:any = null;
    if (ticket ) {

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
  
  getAllRoundDone(ticket:any){
    let all_done:any=true;
    if(ticket){
      ticket?.ticket_truck_type_rounds?.map((item:any)=>{
        if(!item?.end_time){
          all_done=false;
        }
      })
    }
    return all_done;
  }
  getRoundToStart(ticket:any) {

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

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn status-btn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return "mybtn status-btn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "mybtn status-btn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Approved':
        return "mybtn status-btn bg-medium-blue width-fit-content btn-text-very-small2 text-white";
        break;
        case 'Accepted':
          return "mybtn status-btn mybtn-back-yellow width-fit-content btn-text-very-small2";
          break;
      case 'Completed':
        return "mybtn status-btn bg-green width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Unknown':
        return "mybtn status-btn bg-Unknown width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Cancelled':
        return "mybtn status-btn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
  

    }
    return "mybtn status-btn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  setDetailTicket(ticket:any){
    this.ticketDetail = ticket;
    
    this.opUpObj?.showPaperTicket();
  }

  
  setTC(event:any, name:any){
    if(event && event != ''){
      this.trucking_company_id = event;
      this.selected_company_name = name;
      $('.input-popup-div').hide();
      this.getTicketListing();

      return;
    } 
      this.trucking_company_id= null;
      this.selected_company_name= null;
      $('.input-popup-div').hide();
      
      this.getTicketListing();
      
    }
    
    setProject(event:any, name:any){
      if(event && event !=''){
      this.selected_proj_name = name;
      this.project_id = event;
      $('.input-popup-div2').hide();

      this.getTicketListing();
      return;
    }
    this.selected_proj_name= null;
    this.project_id= null;
    $('.input-popup-div2').hide();

    this.getTicketListing();
    
  }
  
  getLastRoundId(tickt:any){

    let last_round:any= null;
    if(tickt?.ticket_truck_type_rounds?.length>0){
      let isFound:boolean=false;
      tickt?.ticket_truck_type_rounds?.map((round:any)=>{
        if(round?.driver_start_time ==null && !isFound)
        last_round=round;
        isFound=true;
      })
      if(!last_round){
        tickt?.ticket_truck_type_rounds?.map((round:any)=>{
          last_round=round;
        })
      }

    }
    return last_round?.id;
  }

  getLastDoneRound(rounds:any){
    let last_done_round:any = null;
    if(rounds){
      rounds?.map((round:any)=>{
        if(round?.driver_start_time !=null && round?.end_time!=null){
          last_done_round = round;
        }
      });
     
    }
    return last_done_round;
  }

}
