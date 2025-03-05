import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-tc-cancelled-tickets',
  templateUrl: './tc-cancelled-tickets.component.html',
  styleUrls: ['./tc-cancelled-tickets.component.css']
})
export class TcCancelledTicketsComponent implements OnInit {

  loggedinUser: any = {};
  active_menu:any;

  user_id:any;
  project_list:any=null;
  companies_list:any=null;
  Projects_list:any=null;
  Cus_companies_list:any=[];
  Cus_Project_list:any=[];
  ticket_date_temp:any=null;

  search_project_tc:any='';
  selectedCompany: any = null;

  paperImageURL:any=environment.paperTicketImageUrl;
  selected_project:any='';
  selected_project_comp:any='';

  selected_company:any='';
  search_company:any='';
  requestDetail:any=null;
  search_list_project:any='';
  selected_list_project:any='';
  selected_list_project_comp:any='';

  selected_list_company:any='';
  selected_list_company_comp:any='';
  Cus_selected_list_company:any='';
  is_TC_Cus_company:any='';
  is_TC_Cus_Project:any='';
  search_list_company:any='';
  detail_truck_name:any='';


  calendar_data:any = null;
  ratio:any=null;
  ticket_date:any=null;
  cancelled_date:any=null;
  cancelled_tickets_list:any=null;
  total_rounds:any=0;
  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private actRouter: ActivatedRoute,
    private user_service: UserDataService
  ) {

    this.active_menu = {
      parent:'tickets',
      child:'tc-closed-tickets',
      count_badge: '',
    }
   }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      if(!this.loggedinUser?.open_paper_ticket_photo ){

        this.loggedinUser.open_paper_ticket_photo = 'NO';
        localStorage.setItem('TraggetUser',JSON.stringify(this.loggedinUser));
      }
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    this.getProjects();
    this.getCompanies();
    this.getCalendarCancelledData();




    $(document).on('click','.getinputfield' ,function(this:any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });

    $(document).on('click','.getinputfield2' ,function(this:any) {
      $('.input-popup-div2').hide();
      $(this).find('.input-popup-div2').show();
    });
    $(document).on('click','.getinputfield3' ,function(this:any) {
      $('.input-popup-div3').hide();
      $(this).find('.input-popup-div3').show();
      console.log("showinggg3")

    });
    // Prevent event propagation if clicking inside the .input-popup-div3
    $(document).on('click', '.input-popup-div3', function(e:any) {
      e.stopPropagation();  // Correctly stop event propagation
    });


    $(document).on('click','.getinputfield4' ,function(this:any) {
      $('.input-popup-div4').hide();
      $(this).find('.input-popup-div4').show();
      // console.log("showinggg4")
    });
    $(document).on('click', '.input-popup-div4', function(e:any) {
      e.stopPropagation();  // Correctly stop event propagation
    });

    $(window).click(function(e:any) {
      if (!($(e.target).hasClass('getinputfield3') || $(e.target).closest('.getinputfield3').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div3').hide();
          console.log("closinggg3")
      }
      if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length )) {
          $('.input-popup-div').hide();
          // $('.input-popup-div2').hide();
          // console.log("closinggg")
      }
      if (!($(e.target).hasClass('getinputfield2') || $(e.target).closest('.getinputfield2').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div2').hide();
          // console.log("closinggg2")
      }
      if (!($(e.target).hasClass('getinputfield4') || $(e.target).closest('.getinputfield4').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div4').hide();
          // console.log("closingg4")
      }

    });





  }

  getDispatchToCompanyName(ticket: any): string {
    const requests = ticket?.ticket?.trucking_company_requests;
    if (!requests || requests.length === 0) {
      return '';
    }

    if (requests.length === 1) {
      return requests[0].dispatch_to.company_name  ;
    }

    for (const request of requests) {
      if (request.dispatch_by.id === this.loggedinUser?.id &&
          request.dispatch_to.id !== this.loggedinUser?.id) {
        return request.dispatch_to.company_name;
      }
    }

    return '';
  }



  changeDate(event:any){

      if(event.target.value){
        let daaat = event.target.value
         // this.companies_list.map((itm:any)=>{
        //   if(itm && itm?.id.toString()+itm?.full_name.toString() == event.target.value){
        //     this.search_list_company = itm.id;
        //     this.selected_list_company = itm;
        //   }
        // })
        this.ticket_date_temp = this.ticket_date;
        this.ticket_date = daaat;
      }else{
        if(this.ticket_date_temp != '' ){
          this.ticket_date = this.ticket_date_temp;

        }else{
          this.ticket_date = '';
        }
      }
      this.gets_cancelled_tickets(2);

    // this.search_date = event.target.value;
    // this.page=1;
    // this.getTicketListing();
  }

  getCompanies(){

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.ticket_service.getTruckingCompanies(formData).subscribe(response=>{
      if(response.status && response.data){
        this.companies_list = response.data;
        // console.log("companies_list : ", this.companies_list);

      }else{

      }
    })
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

  handleFilterByProject(event:any, name:any){
    if(event ){
      $('.input-popup-div').hide();

      let projj = event ;
      let [id, tc_comp] = projj.split(',');
      if(id){

        this.selected_project = id;
        this.selected_project_comp = name;

        this.selected_list_project_comp = name;
        this.selected_list_project = id;


        if(tc_comp && tc_comp != null ){
          this.search_project_tc = 'YES';
          this.is_TC_Cus_Project = 'YES';

        }
        else{
          this.search_project_tc = 'NO';
          this.is_TC_Cus_Project = 'NO';

        }

      }

    }else{
      $('.input-popup-div').hide();

      this.search_project_tc = '';
      this.selected_project = null;
      this.selected_project_comp = null;


      this.selected_list_project = '';
      this.selected_list_project_comp = '';
      this.is_TC_Cus_Project = '';

    }

    this.getCalendarCancelledData(2);
  }





  handleFilterByCompany(event:any){
    if(event ){
      $('.input-popup-div2').hide();
      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_company = itm.id;
          this.selected_company = itm;


          this.selected_list_company = itm.id;
          this.selected_list_company_comp = itm;
        }
      })
    }else{

      this.selected_list_company = '';
      this.selected_list_company_comp = '';
      this.is_TC_Cus_company = '';


      $('.input-popup-div2').hide();
      this.search_company = '';
      this.selected_company = null;
    }
    this.getCalendarCancelledData(2);
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

  getCalendarCancelledData(flag:any = 1){

    let formData:any = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      account_type:this.loggedinUser.account_type,
      company_type: this.selected_company?.account_type,
      company_id:this.selected_company?.id,
      project_id:this.selected_project,
      is_tc_project:this.search_project_tc
    }

    this.ticket_service.getCancelledTickets(formData).subscribe(response=>{
      if(response.status && response.data ){
        this.calendar_data = response.data.calendar_data.original.calendar_data;
        if(flag == 1){
          this.Projects_list = response.data.calendar_data.original.projects;

        }
        // console.log(" this is tickets list ::: \n", response.data.calendar_data.original.tickets );


        $('#pnlEventCalendar').calendarDeclined({
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          showdetail: true,
          onSelect: function(event:any) {
              $('#lblEventCalendar').text(event.label);
          }
      });
        this.ratio = response.data.ratio;
      }else{

      }
    })

  }

  getVal(){

    if($("#pnlEventCalendar  table tr td div.selected job-status").length>0){
      $("#pnlEventCalendar  table tr td div.selected job-status").remove();
    }
    let date = $("#pnlEventCalendar  table tr td div.selected").text();
    if($("#pnlEventCalendar  table tr td div.selected").length>0 && date !=null && date !==''){

      let month_year = $("#pnlEventCalendar  .header-month-title").text();

      let monthyear=[];
      monthyear= month_year.toString().split(' ');
      let month:any = this.get_month_number(monthyear[0])
     let year = monthyear[1];
     var d = date.split(" ");
     if(d && d.length>0 && date.includes('Cancelled')){
      date = d[0];
      this.ticket_date = date+'-'+month+'-'+year;
      this.ticket_date_temp = null;

      this.gets_cancelled_tickets(2);
     }
    }

  }

  get_month_number(month_name:any){
    let month=null;
    switch (month_name) {
      case 'Jan':
        month = '01';
        break;
      case 'Feb':
        month = '02';
        break;
      case 'Mar':
        month = '03';
        break;
      case 'Apr':
        month = '04';
        break;
      case 'May':
        month = '05';
        break;
      case 'Jun':
        month = '06';
        break;
      case 'Jul':
        month = '07';
        break;
      case 'Aug':
        month = '08';
        break;
      case 'Sep':
        month = '09';
        break;
      case 'Oct':
        month = '10';
        break;
      case 'Nov':
        month = '11';
        break;
      case 'Dec':
        month = '12';
        break;
    }
    return month;
  }

  onCompanyChange(event: any) {
    const value = event ;
    let idd = null;

    if (value) {
      // Assuming the value is a comma-separated string
      const [id, company_name] = value.split(',');



      // Creating a selectedCompany object
      const selectedCompany = {
        id: id ? id : null,
        company_name: company_name !== 'null' ? company_name : null,
      };


      for (const comp of this.companies_list) {
         if (comp.id == selectedCompany.id && comp.company_name  == selectedCompany.company_name) {
          idd = comp;
         }
      }


      $('.input-popup-div3').hide();

       this.handleFilterCompanyList(idd);
    }
    else {
      $('.input-popup-div3').hide();

      this.handleFilterCompanyList(null);
    }
  }
  onprojectChange(event: any, name:any) {
    const value = event;

    if (value) {
      // Assuming the value is a comma-separated string
      const [id, truckingCompanyId] = value.split(',');

      // Creating a selectedCompany object
      const selectedproject = {
        id: id ? id : null,
         trucking_company_id: truckingCompanyId ? truckingCompanyId : null
      };
      $('.input-popup-div4').hide();

       this.handleFilterProjectList(selectedproject, name);
    }
    else {
      $('.input-popup-div4').hide();

      this.handleFilterProjectList(null, null);
    }
  }


  handleFilterCompanyList(selectedCompany: any){
    if (!selectedCompany) {

       // Handle logic for "All" option
      this.selected_list_company = '';
      this.selected_list_company_comp = '';
      this.is_TC_Cus_company = '';
    }

    else {


      this.selected_list_company = selectedCompany.id;
      this.selected_list_company_comp = selectedCompany;
      // Handle logic for selected company
      // if ((!selectedCompany.email || selectedCompany.email == 'null'|| selectedCompany.email == null ) && selectedCompany.trucking_company_id) {
      //   this.is_TC_Cus_company = 'Yes';
      //   console.log("is_TC_Cus_company Yes");
      // }
      // else if (selectedCompany.email && (!selectedCompany.trucking_company_id || selectedCompany.trucking_company_id == "null")) {
      //   this.is_TC_Cus_company = 'No';
      //   console.log("is_TC_Cus_company No");
      // }

    }

     this.gets_cancelled_tickets(2);
  }

 empty_Checks(){
      this.selected_list_project = '';
      this.is_TC_Cus_Project = '';
      this.selected_list_company = '';
      this.is_TC_Cus_company = '';
    }
  handleFilterProjectList(selectedproject: any, name:any ){
    if (!selectedproject) {

       // Handle logic for "All" option
      this.selected_list_project = '';
      this.selected_list_project_comp = '';
      this.is_TC_Cus_Project = '';
    }
    else {

      this.selected_list_project_comp = name;
      this.selected_list_project = selectedproject.id;

      // Handle logic for selected company
      if ( selectedproject.trucking_company_id) {
        this.is_TC_Cus_Project = 'YES';
       }
      else if ( !selectedproject.trucking_company_id || selectedproject.trucking_company_id == "null")  {
        this.is_TC_Cus_Project = 'NO';
       }
    }

    this.gets_cancelled_tickets(2);
  }


  gets_cancelled_tickets(flag:any = 1){

    let formData:any = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      account_type:this.loggedinUser.account_type,
      company_type: this.selected_list_company?.account_type,
      company_id: flag == 1? '' : this.selected_list_company,
      // is_tc_company: flag == 1? '' : this.is_TC_Cus_company,
      ticket_date:this.ticket_date,

      project_id: flag == 1? '' : this.selected_list_project,
      is_tc_project: flag == 1? '' : this.is_TC_Cus_Project

    }
    if(flag == 1){
      this.getCus_companies_list(this.cancelled_tickets_list);
    }

    this.ticket_service.getCancelledTicketsList(formData).subscribe(response=>{
      if(response.status && response.data ){
        this.cancelled_tickets_list = response.data.tickets;

        if(flag == 1){
          console.log(" im emmmmm")
          this.getCus_companies_list(this.cancelled_tickets_list);
          this.empty_Checks();
        }

        this.cancelled_date= response.data.date;
      }
    });
  }

  getCus_companies_list(data:any){
    // console.log(" dataa ::: ", data);
    this.Cus_companies_list = [];
    const uniqueCompanyIds = new Set();


    if (data) {
      data.forEach((itm: any) => {
        let company = null;
        if (itm && itm.ticket && itm.ticket.tc_customer && itm.ticket.tc_customer.id) {
          company = itm.ticket.tc_customer;
        } else if (itm && itm.ticket && itm.ticket.customer && itm.ticket.customer.id) {
          company = itm.ticket.customer;
        }
        if (company && !uniqueCompanyIds.has(company.id)) {
          uniqueCompanyIds.add(company.id);
          this.Cus_companies_list.push(company);
        }

      });
     }



     this.getCus_Project_list(data);
  }
  getCus_Project_list(data:any){
  //   {{ticket?.tc_ticket=='YES'? (
  //     ticket?.tc_project? ticket?.tc_project?.project_name:ticket?.project?.project_name
  // ):(
  //     ticket?.ticket?.project?.project_name
  // )}}

     this.Cus_Project_list = [];
    if(data){
      data.map((itm:any)=>{
        // console.log(" itm 2 ::: ",  itm );
        if (itm && itm?.tc_ticket == 'YES') {
          if(itm?.tc_project){
            this.Cus_Project_list.push(itm?.tc_project);
          }
          else if (itm && itm?.project) {
            this.Cus_Project_list.push(itm.project);
          }
        } else if (itm && itm?.ticket && itm?.ticket?.project) {
          this.Cus_Project_list.push(itm.ticket.project);
        }
      })
     }


  }







  setDetail(ticket:any){
    this.detail_truck_name = '';

    this.requestDetail = ticket;
    this.total_rounds=0;
    if(ticket?.ticket?.status=='Approved' || ticket?.ticket?.status=='Completed'){

      ticket?.ticket?.ticket_truck_type_rounds.map((item:any)=>{
        if( item.round_time && item.driver_start_time){
          this.total_rounds++;

        }
      })
    }else{
      console.log(ticket.ticket?.ticket_truck_type_rounds.length)
      this.total_rounds = ticket?.ticket?.ticket_truck_type_rounds?.length;
    }
    setTimeout(() => {
      if( this.loggedinUser?.open_paper_ticket_photo=='YES' && (ticket?.ticket?.status=='Approved' || ticket?.ticket?.status=='Completed')  && ticket?.ticket?.required_paper_ticket_id =='YES'){
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width()+"px");
        }, 300);

      }
    },300);
  }




  parseJobTotal2(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item?.split(':');
    if(rr[0]){
      var h = rr[0];
      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = parseFloat(hours.toString())+(parseFloat(mints.toString())/60);
    return total.toFixed(2)+' hr';
  }


  parseHour(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item.split(' ');
    if(rr[0]){
      var h = rr[0];
      h = h.replace('h','');

      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }

    return hours+(mints/60)+' hr';
  }


  parseJobTotal(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item?.split(':');
    if(rr[0]){
      var h = rr[0];
      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = hours+(mints/60);
    return hours+' hr '+mints+"m";
  }

  parseDriverTime(hour:any,mints:any){

    var total_time = 0;
    let h =0 ;
    if(parseFloat(mints)){
      h+=parseFloat(mints)/60;
    }
     if(parseFloat(hour)){
      h += parseFloat(hour);
    }

    total_time = h;

    return total_time ? (total_time.toFixed(2))+' hr' :'' ;
  }


  checkOpenTicketPhoto(event:any){
    if(event ){
      var open_paper_ticket_photo='';
      open_paper_ticket_photo= event.target.checked ? 'YES':'NO';
      this.loggedinUser.open_paper_ticket_photo= open_paper_ticket_photo;
      localStorage.setItem('TraggetUser',JSON.stringify(this.loggedinUser));
      let data = {
        user_id:this.loggedinUser.id,
        open_paper_ticket_photo:open_paper_ticket_photo
      }
      this.user_service.upateOpenTicketPhoto(data).subscribe(response=>{
        if(response.status && response.data){

        }
      });
    }
  }


  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
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
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  showTicketImage(){
    setTimeout(() => {
      if(this.requestDetail?.ticket && (this.requestDetail?.ticket?.status=='Approved' || this.requestDetail?.ticket?.status=='Completed') && this.requestDetail?.ticket?.paper_ticket_photo){
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width()+"px");
        },300);
      }
    },300);
  }


}
