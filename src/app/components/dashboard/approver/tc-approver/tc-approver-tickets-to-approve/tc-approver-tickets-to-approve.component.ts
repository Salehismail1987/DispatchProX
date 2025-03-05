import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { CustomerTicketPopupComponent} from 'src/app/components/dashboard/customer/customer-ticket-popup/customer-ticket-popup.component';

@Component({
  selector: 'app-tc-approver-tickets-to-approve',
  templateUrl: './tc-approver-tickets-to-approve.component.html',
  styleUrls: ['./tc-approver-tickets-to-approve.component.css']
})
export class TcApproverTicketsToApproveComponent implements OnInit {

  @ViewChild(CustomerTicketPopupComponent) opUpObj :CustomerTicketPopupComponent | undefined;
  loggedinUser: any = {};
  message: any;

  ticketDetail:any;

  // Listing Contanier
  ticket_list: any;
  ticket_pagination: any;
  sort_by: any = 'recently created';
  perPage: number = 25;
  page: number = 1;
  sort_type:any='ASC';
  search_by: any = '';
  search_date:string = '';
  search_status: any = '';
  is_loading:boolean =false;
  project_id:any = '';
      
  active_menu:any;

  constructor(
    private router: Router,
    private ticket_service: TicketService,    
    private user_service: UserDataService,
    private actRouter: ActivatedRoute
  ) { 
    this.active_menu = {
      parent:'tickets',
      child:'tc_approver_tickets',
      count_badge: '',
    }
  }

  is_only_approver(roles:any){

    let is_approver:boolean=false;
    if(roles && roles?.length>0){
      roles.map((item:any)=>{
        is_approver = item?.role?.role_name == "Approver" ? true : false;
      });

      
      if(roles.length== 1 && is_approver){
        is_approver = true;
      }else{
        is_approver = false;
      }
    }
   

    return is_approver;
  }
  getMenuCounts(){
    let data = {is_tc_approver:'YES',orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type:this.loggedinUser?.user_data_request_account_type ?this.loggedinUser?.user_data_request_account_type : this.loggedinUser?.account_type};
   
    if(this.is_only_approver(this.loggedinUser?.user_roles) || this.loggedinUser?.account_type=='Customer'){
       data = {is_tc_approver:'YES',orginal_user_id:null,user_id:this.loggedinUser.id ,account_type: this.loggedinUser?.account_type};
     
    }
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
        
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  
    
  }

  ngOnInit(): void {

    this.sort_by = 'id';
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

    this.getMenuCounts();
    this.getTicketListing();
  }


  getTicketListing() {
    this.is_loading = true;
    const formData = new FormData();

    formData.append('is_tc_ticket', 'YES');
    formData.append('approver_id', this.loggedinUser.id );
    formData.append('search_by', this.search_by);
    formData.append('sort_by', this.sort_by);
    formData.append('perPage', this.perPage.toString());
    formData.append('page', this.page.toString());
    formData.append('search_status', 'Completed');
    formData.append('search_date', this.search_date);
    formData.append('project_id', this.project_id);
    
    formData.append('sort_type', this.sort_type);

    this.ticket_service.getAllTickets(formData).subscribe(response => {
      
      this.is_loading = false;
      if (response.status && response.data) {
        this.ticket_list = response.data?.data;
        this.ticket_pagination = response.data;
        console.log(this.ticket_list);
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

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white";
        break;
        case 'Accepted':
          return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2";
          break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  setDetailTicket(ticket:any){
    this.ticketDetail = ticket;
    this.opUpObj?.showPaperTicket();
    
  }


}