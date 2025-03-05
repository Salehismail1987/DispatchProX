import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-tc-declined-tickets',
  templateUrl: './tc-declined-tickets.component.html',
  styleUrls: ['./tc-declined-tickets.component.css']
})
export class TcDeclinedTicketsComponent implements OnInit {
  
  loggedinUser: any = {};
  active_menu:any;
  declined_date:any=null;
  declined_tickets_list:any=null;
  user_id:any;
  search_date:string = '';
  ticket_date_temp:any=null;

  project_list:any=null;
  companies_list:any=null;
  
  search_project:any='';
  selected_project:any='';

  selected_company:any='';
  selected_driver:any='';
  search_company:any='';

  selected_list_company:any='';
  selected_list_driver:any='';
  search_list_company:any='';
  calendar_data:any = null;
  requestDetail:any=null;
  ratio:any=null;
  ticket_date:any=null;
  qty:any=null;
  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private actRouter: ActivatedRoute,
    private user_service: UserDataService,
    private ref: ChangeDetectorRef
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
    this.getCalendarDeclinedData();

   
    $(document).on("click", ".showhidelegends", function() {
        $('.legends-div').toggle('slow');
    });

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
      
    });
    // Prevent event propagation if clicking inside the .input-popup-div3
    $(document).on('click', '.input-popup-div3', function(this:any) {
      $(this).stopPropagation();
    }); 
    
    
    $(document).on('click','.getinputfield4' ,function(this:any) {
      $('.input-popup-div4').hide();
      $(this).find('.input-popup-div4').show();
      // console.log("showinggg4")
    });
    $(document).on('click', '.input-popup-div4', function(this:any) {
      $(this).stopPropagation();
    }); 

    $(window).click(function(e:any) {
      if (!($(e.target).hasClass('getinputfield3') || $(e.target).closest('.getinputfield3').length )) {
          // $('.input-popup-div').hide();
          $('.input-popup-div3').hide();
          // console.log("closinggg3")
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

    this.gets_declined_tickets();
    // this.search_date = event.target.value;
    // this.page=1;
    // this.gets_declined_tickets();
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

  getCompanies(){

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);  
    this.ticket_service.getTruckingCompanies(formData).subscribe(response=>{
      if(response.status && response.data){
        this.companies_list = response.data;
      }else{  
        
      }
    })
  }
  
 


  handleFilterByCompanyAll(){
    $('.input-popup-div').hide();
     this.selected_company = null;

    // this.getBillings();
    // this.getUnbillTickets();
    setTimeout(() => {
      $(".companies_list").hide()
    }, 300);
  }

  handleFilterByDriver(event:any){
    if(event ){
      $('.input-popup-div2').hide();

      this.companies_list.map((itm:any)=>{
        // company?.id && ((this.loggedinUser.id == company?.id && company?.role_id==6) || company?.account_type=='Driver')

        if(itm && itm?.id   && ((this.loggedinUser.id == itm?.id && itm?.role_id==6) || itm?.account_type=='Driver')    ){
           if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
              this.selected_driver = itm;
           }
        }
      })


      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_list_company = itm.id;
          this.selected_list_driver = itm;
          $('#sas_dr').text(this.selected_list_driver.full_name);

        }
      })



    }else{
      $('.input-popup-div2').hide();

       this.selected_driver = null;
       this.search_list_company = null;
       this.selected_list_driver = null;
       $('#sas_dr').text('Select');

    }
    this.getCalendarDeclinedData();
    
  }

  
  handleFilterByCompany(event:any){
    if(event){
      $('.input-popup-div').hide();
      console.log(" event ", event)

      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_company = itm.id;
          this.selected_company = itm;
        }
      });


      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_list_company = itm.id;
          this.selected_list_company = itm;

          $('#sas').text(itm.company_name);

        }
      })


    }else{
      this.search_company = '';
      this.selected_company = null;


      this.search_list_company = null;
      this.selected_list_company = null;
      $('#sas').text('Select');


    }
    this.getCalendarDeclinedData();
     // Trigger change detection manually
  //    setTimeout(() => {
  //     this.ref.detectChanges();
  // });

  }

  getCalendarDeclinedData(){
    
    let formData:any = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      account_type:this.loggedinUser.account_type,
      // company_account: this.selected_company?.account_type,
      company_id:this.selected_company?.id,
      driver_id:this.selected_driver?.id,
      project_id:this.selected_project?.id,
      is_tc_project:this.selected_project?.trucking_company_id ? 'YES':'NO'
    }
    this.ticket_service.getDeclinedTickets(formData).subscribe(response=>{
      if(response.status && response.data ){
        // this.calendar_data = response.data.calendar_data;
        this.calendar_data = response.data.calendar_data.calendar_data;

        $('#pnlEventCalendar').calendarDeclined({
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            showdetail: true,
            forCust:false,
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
     if(d && d.length>0 && date.includes('declined')){
      date = d[0];      
      this.ticket_date = date+'-'+month+'-'+year;
      this.ticket_date_temp = null;

      this.gets_declined_tickets();
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

  gets_declined_tickets(){
         
    let formData:any = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      account_type:this.loggedinUser.account_type,
      company_type: this.selected_company?.account_type,
      company_id:this.selected_list_company?.id,
      driver_id:this.selected_list_driver?.id,
      project_id:null,
      // formData.append('search_date', this.search_date);

      ticket_date:this.ticket_date,
      is_tc_project:'NO'
    }
    
    
    this.ticket_service.getDeclinedTicketsList(formData).subscribe(response=>{
      if(response.status && response.data ){
       this.declined_tickets_list = response.data?.tickets;
       this.declined_date = response.data?.date;
       this.qty = response.data?.quantity;
      }
    });
  }

  setDetail(ticket:any){
    this.requestDetail = ticket;
  }

  
  handleFilterCompanyList(event:any){
    if(event ){
      $('.input-popup-div3').hide();

      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_list_company = itm.id;
          this.selected_list_company = itm;
        }
      })
    }else{
      $('.input-popup-div3').hide();

       this.search_list_company = null;
      this.selected_list_company = null;
    }
    this.gets_declined_tickets();

  }
  handleFilterDriverList(event:any){
    if(event ){
      $('.input-popup-div4').hide();

      this.companies_list.map((itm:any)=>{
        if(itm && itm?.id.toString()+itm?.full_name.toString() == event ){
          this.search_list_company = itm.id;
          this.selected_list_driver = itm;
        }
      })
    }else{
      $('.input-popup-div4').hide();

       this.search_list_company = null;
      this.selected_list_driver = null;
    }
    this.gets_declined_tickets();
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


  get_tickets(){
    this.getCalendarDeclinedData();
    this.gets_declined_tickets();
  }
}
