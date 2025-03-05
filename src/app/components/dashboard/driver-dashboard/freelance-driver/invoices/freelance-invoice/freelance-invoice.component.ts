import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import { DOCUMENT } from '@angular/common';
import { UserDataService } from 'src/app/services/user-data.service';
declare var $: any;
@Component({
  selector: 'app-freelance-invoice',
  templateUrl: './freelance-invoice.component.html',
  styleUrls: ['./freelance-invoice.component.css']
})
export class FreelanceInvoiceComponent implements OnInit {

  loggedinUser:any=null;
  date_today:any=null;
  active_menu:any;
  is_loading:any='freelance_drafts';
  date:any=null;

  is_default:any=false;
  form_clicked:boolean=false;

  drafs_pagination:any = null;
  page:any=1;
  perPage:any=15;

  gst:any=null;


  ticket_detail:any=null;
  selected_company:any=null;
  invoices:any=null;

  send_notes:any= '';
  calender_index:any=null;
  invoice_no:any='';
  current_tab:any='draft';
  trucking_companies:any=null;
  invoiced_invoices:any=null;
  edited_invoice:any=null;

  is_freelance_driver_company:boolean=false;

  select_duration_type:string= '';
  default_duration_type:string= '';
  selected_monthly:string = '';
  selected_semi_monthly_month:string = '';
  selected_semi_monthly_range:string = '';
  selected_year:any;
  selected_weekly_range:string = '';
  selected_custom_range:string = '';
  default_company_code:any='';
  select_company_code:any='';
  selected_month:string='';
  month = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  to_send_invoice_data:any=null;
  invoice_date:any=null;
  total_rounds:any=0;
  due_date:any=null;
  default_company:any=null;

  constructor(
    private router: Router,
    private freelance_driver:FreelanceDriverServiceService,
    private driver_service:DriverService,
    private user_service: UserDataService,
    private fb : FormBuilder,
  ) {
    this.active_menu = {
      parent:'invoicing',
      child:'invoicing',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;

    if(!userDone ||  userDone.full_name == undefined){
      this.router.navigate(['/home']);
    }

    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });
    let cDay = d.getDate();
    let cMonth = d.getMonth() + 1;
    let cYear = d.getFullYear();

    this.date = cDay+ "-" + cMonth  + "-" + cYear ;
    this.invoice_date = this.date;

    var today = new Date(cMonth+ "-" + cDay  + "-" + cYear);
    this.due_date = new Date(d.setDate(d.getDate() + 30));
    this.due_date = this.due_date.toLocaleString('en-US', { timeZone: tz });
    this.getData();

    if(sessionStorage.getItem('freelanceInvoiceTab')){
      var t:any = sessionStorage.getItem('freelanceInvoiceTab');
      this.current_tab = t;
    }else{
      this.current_tab = 'draft'
    }

    this.default_duration_type = this.loggedinUser.driver_duration;
    this.select_duration_type  = this.loggedinUser.driver_duration;


    $(document).on('click', '.openOptionModal',function(this:any) {
        $(this).closest('.modal-div').find('.option-modal').toggle('slow');
    });
    $(document).on('click','.btnaction', function(this:any) {
        $(this).closest('.option-modal').hide();
    });
    $(document).on('click','.openCalendar', function() {
        $('.calenderweek').show();
    });

    $(document).on('click','.getinputfield' ,function(this:any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });
    $(document).on('click','.getinputfield2', function(this:any) {
        $('.input-popup-div2').hide();
        $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });
    $(window).click(function(e:any) {
        if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
            $('.input-popup-div').hide();
            $('.input-popup-div2').hide();
        }

    });

    $(document).on('click','.openCalendar', function(this:any) {
        $('.popupCalendar').hide();
        $(this).find('.popupCalendar').show();
    });
    $("body").click(function(e:any) {
        if (!($(e.target).parents(".openCalendar").length || ($(e.target).hasClass("popupCalendar") || $(e.target).parents(".popupCalendar").length))) {

            $('.popupCalendar').hide();
        }
    });



    $('#pnlEventCalendar2').calendar({
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

      showdetail: false,
      smalldivs: true
    });

    this.getUserGST();
  }


  getUserGST()
  {
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.user_service.getUserTax(formData).subscribe(response=>{
      if(response.status && response.gst){
        this.gst = response?.gst;
      }else{

      }
    })
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


  getVal2(){
    this.invoice_date = this.date.toString();
    if($("#pnlEventCalendar2  table tr td div.selected job-status").length>0){
      $("#pnlEventCalendar2  table tr td div.selected job-status").remove();
    }
    let date = $("#pnlEventCalendar2  table tr td div.selected").text();
    if($("#pnlEventCalendar2  table tr td div.selected").length>0 && date !=null && date !==''){

      let month_year = $("#pnlEventCalendar2  .header-month-title").text();

      let monthyear=[];
      monthyear= month_year.toString().split(' ');
      let month:any = this.get_month_number(monthyear[0])
     let year = monthyear[1];
      this.invoice_date = date+'-'+month+'-'+year;
      var today = new Date(month+'-'+date+'-'+year);
      this.due_date = new Date(today.setDate(today.getDate() + 30));

      let tz = environment.timeZone;
      this.due_date = this.due_date.toLocaleString('en-US', { timeZone: tz });

    $('.input-popup-div').hide();
    }
  }

  setInvMonth(mon:any){
    if(mon.target.value){

      this.selected_month = mon.target.value;
    }
    this.getData();
  }

  setSendData(data:any){
    this.to_send_invoice_data = data;
    console.log(data?.invoices[0]?.trucking_company?.contacts)
    if(data?.invoices[0]?.trucking_company?.contacts){
      var contacts = JSON.parse(data?.invoices[0]?.trucking_company?.contacts);
      contacts.map((item:any)=>{
        if(item.is_default == true){
          this.to_send_invoice_data.trucking_company_contact = item;
        }
      })
    }


    console.log(this.to_send_invoice_data)

    setTimeout(() => {

      $('#pnlEventCalendar2').calendar({
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

        showdetail: false,
        smalldivs: true
      });

    $('.input-popup-div').hide();
    }, 1500);

  }

  showCalendarDate(){
    $('.calendar-2').show();
  }

  markDefaultDuration(event:any,duration:any){
    if(event.target.checked){
      duration=duration;
    }else{
      duration='';
    }
    var filter={
      id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
    }
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'update_driver_duration',
      filter: filter,
      data:{
        driver_duration:duration
      }
    }

    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        this.select_duration_type = duration;
        this.default_duration_type = duration;
        this.loggedinUser.driver_duration = duration;
        localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));

        this.getData()
      }
    });
  }

  getData(){

    if(!this.trucking_companies || this.trucking_companies==null){
      let data2={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        action:'invoice_trucking_companies'
      }

      this.freelance_driver.freelanceInvoiceAction(data2).subscribe(response=>{
        this.is_loading='';
        if(response.status){
          this.trucking_companies= response.data;
          this.trucking_companies.map((item:any)=>{

            // Self Dispatched
            if(
              this.loggedinUser?.driver_invoice_company_id &&
              this.loggedinUser.driver_invoice_company_id !=null &&
              this.loggedinUser?.driver_invoice_company_is_self_dispatched==true &&
              item.freelance_driver_id !==null &&
              item.id == this.loggedinUser?.driver_invoice_company_id
              ){
               this.default_company = item;
               this.selected_company = item;
               this.is_freelance_driver_company = true;
               this.default_company_code = item.id+"_self";
               this.select_company_code = item.id+"_self";


            }else if(
              this.loggedinUser?.driver_invoice_company_id &&
              this.loggedinUser.driver_invoice_company_id !=null &&
              this.loggedinUser?.driver_invoice_company_is_self_dispatched==false &&
              (!item?.freelance_driver_id || item?.freelance_driver_id ==null) &&
              item.id == this.loggedinUser?.driver_invoice_company_id
            ){
              this.default_company = item;
              this.selected_company = item;
              this.is_freelance_driver_company = false;
              this.default_company_code = item.id+"_user";
              this.select_company_code = item.id+"_user";
            }

            this.getInvoicesData();
          })
        }
      });
    }else{
      this.trucking_companies.map((item:any)=>{

        // Self Dispatched
        if(
          this.loggedinUser?.driver_invoice_company_id &&
          this.loggedinUser.driver_invoice_company_id !=null &&
          this.loggedinUser?.driver_invoice_company_is_self_dispatched==true &&
          item.freelance_driver_id !=null && item.freelance_driver_id !='' &&
          item.id == this.loggedinUser?.driver_invoice_company_id
          ){
           this.default_company = item;
           this.default_company_code = item.id+"_self";
        }else if(
          this.loggedinUser?.driver_invoice_company_id &&
          this.loggedinUser.driver_invoice_company_id !=null &&
          this.loggedinUser?.driver_invoice_company_is_self_dispatched==false &&
          (item.first_name !='' && item.first_name !=null) &&
          item.id == this.loggedinUser?.driver_invoice_company_id
        ){
          this.default_company = item;
          this.default_company_code = item.id+"_user";
        }


      })
      this.getInvoicesData();
    }

  }

  getInvoicesData(){
    var formData={
      freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      trucking_company_id:this.selected_company?.id,
      select_duration_type: this.select_duration_type,
      is_freelance_driver_company: this.is_freelance_driver_company,
      page:this.page
    }

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_drafts',
      filter: formData
    }

    this.is_loading='freelance_drafts';
    this.freelance_driver.getFreelancerDetail(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
       if(response.data?.invoices?.data){
        this.drafs_pagination = response?.data?.invoices;
        this.invoices= response.data?.invoices?.data;
       }else{

        this.invoices= response.data?.invoices;
       }
        this.invoice_no = response.data.invoice_no;

      }
    });

    var formData2={
      freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      trucking_company_id:this.selected_company?.id,
      selected_month: this.selected_month,
      is_freelance_driver_company: this.is_freelance_driver_company,
    }
    let data21={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_invoices',
      filter: formData2
    }

    this.is_loading='freelance_invoices';
    this.freelance_driver.getFreelancerDetail(data21).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        this.invoiced_invoices= response.data?.invoices;

      }
    });
  }

  changePage(page: any) {
    this.page = page;
    this.getData();
  }


  handlePerPage(event: any) {
    if (event.target.value) {
      this.perPage = event.target.value;
      this.getData();
    }
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

  getContact(contacts:any,type:any=''){
    if(contacts && contacts?.length>0){
    console.log(contacts)
      var cont=null;
        contacts?.map((item:any)=>{
         console.log(item, item.is_default)
          if( (item.is_default ==true || item.is_default =='true') && type=='name'){
            cont = item?.name;
          }
          if((item.is_default ==true || item.is_default =='true') && type=='email'){
            cont = item?.name;
          }
          if((item.is_default ==true || item.is_default =='true') && type=='street'){
            cont = item?.street;
          }
          if((item.is_default ==true || item.is_default =='true') && type=='city'){
            cont = item?.city;
          }
          if((item.is_default ==true || item.is_default =='true') && type=='province'){
            cont = item?.province;
          }
          if((item.is_default ==true || item.is_default =='true') && type=='postal_code'){
            cont = item?.postal_code;
          }
        })


      if(!cont || cont==null || cont=='null'){
        if(contacts && contacts?.length>0){
          var item = contacts[0];
          console.log(item,'osso')
          if( type=='name'){
            console.log(item['name'],item?.name)
            cont = item?.name;
          }
          if(type=='email'){
            console.log(item['email'],item?.email)
            cont = item?.name;
          }
          if(type=='street'){
            cont = item?.street;
          }
          if(type=='city'){
            cont = item?.city;
          }
          if(type=='province'){
            cont = item?.province;
          }
          if(type=='postal_code'){
            cont = item?.postal_code;
          }
        }

      console.log(cont);
    }
      }


    return cont;
  }

  setInvoice(invoice:any){
    this.edited_invoice  = invoice;

  }

  setDetail(ticket:any,is_self_dispatched:boolean=false,is_tc_ticket:any='NO'){
      this.getTicketDetail(ticket,is_self_dispatched,is_tc_ticket);


    this.edited_invoice = null;
    this.send_notes = null;
  }

  setNotes(event:any){
    if(event?.target.value){
      this.send_notes = event.target?.value;
    }
  }
  getTotal(rate:string){
    let rt=null;
    if(rate !==''){
      rt= parseFloat(rate)?.toFixed(2)
    }
    return rt;
  }

  getWeekly(event:any,weekly:any){
    var dates = $(".selected-week-0").text()

    console.log(dates,1)
  }

  startOver(){
    this.selected_company=null;
    this.select_duration_type='';
    this.getData();
  }

  showCalendar(event:any,invoice:any,index:any){

    $(".calenderweek2 .ui-datepicker-calendar tr:has(.ui-state-active)").css('background','#FDD7E4');
    let themeLink = document.getElementById(
      'adoptive-theme1'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = 'assets/calendar/jquery.calendar-highlighted.css';
    } else {
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement('link');
      style.id = 'adoptive-theme1';
      style.rel = 'stylesheet';
      style.type="text/css";
      style.href = `${'assets/calendar/jquery.calendar-highlighted.css'}`;
      head.appendChild(style);
    }

      var i =0;
      if(this.invoices?.length >0){
        $('.calendarHighLighted').each(function(this:any) {

          var startDate = $("#start-"+i).val();
          var endDate =  $("#end-"+i).val();
          $(this).calendarHighLighted({
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              startHighLightDate: startDate,
              endtHighLightDate: endDate,
              // onSelect: function(event) {
              //     $('#lblEventCalendar').text(event.label);
              // },
              showdetail: true,
              smalldivs: false
          });
          i++;
      });
      $(".calendarHighLighted .highLightDate").css('background','#FDD7E4')
    }

    // // $('.calendarHighLighted').each(function(this:any) {
    //     var startDate = invoice?.data?.start_date;
    //     var endDate = invoice?.data?.end_date;
    //     $("#cal-"+index).calendarHighLighted({
    //         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //         days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    //         startHighLightDate: startDate,
    //         endtHighLightDate: endDate,
    //         // onSelect: function(event) {
    //         //     $('#lblEventCalendar').text(event.label);
    //         // },
    //         showdetail: true,
    //         smalldivs: false
    //     });
    // // });
  }

  downloadInvoice(to_download_only:boolean=false){

    let invoice_data:any = this.to_send_invoice_data;
    invoice_data.notes = this.send_notes;
    invoice_data.to_download_only = to_download_only;
    invoice_data.invoice_period_type = this.select_duration_type;
    invoice_data.invoice_date = this.invoice_date;
    invoice_data.invoice_no = this.invoice_no;

    let data2={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      action:'save_invoice',
      invoice_data:invoice_data
    }

    if(!to_download_only){
      this.is_loading='download';
    }else{
      this.is_loading='download';
    }
    this.freelance_driver.freelanceInvoiceAction(data2).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        var smg ='';
        if(!to_download_only){
          $(".modal-backdrop").remove();
          $("#myModalDetail").toggle("modal");
          swalWithBootstrapButtons.fire(
            `Success`,
            'Invoice sent').then(() => {
             this.current_tab = 'invoiced';
             this.getData();
             this.send_notes='';
          });

          if(response.file_name){
            const link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.setAttribute('href', environment.apiInvoiceFreelanceURL+response.file_name);
            link.setAttribute('download', response.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
        }else{
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', environment.apiInvoiceFreelanceURL+response.file_name);
          link.setAttribute('download', response.file_name);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

      }
    });
  }

  downloadEditedInvoice(){
    let data2={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      action:'invoice_pdf_download',
      invoice_id:this.edited_invoice?.id
    }

    this.is_loading='download'
    this.freelance_driver.freelanceInvoiceAction(data2).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', environment.apiInvoiceFreelanceURL+response.file_name);
        link.setAttribute('download', response.file_name);
        document.body.appendChild(link);
        link.click();
        link.remove();

      }
    });
  }

  resendInvoice(){
    let data2={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      action:'resend_invoice',
      invoice_id:this.edited_invoice?.id
    }

    this.is_loading='resend'
    this.freelance_driver.freelanceInvoiceAction(data2).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        var smg ='';

        swalWithBootstrapButtons.fire(
          `Success`,
          'Invoice resent').then(() => {
            this.current_tab = 'invoiced';
            this.getData();
            this.send_notes = '';
          });

      }
    });
  }

  hanldeSendInvoice(to_download_only:boolean=false){
    let invoice_data:any = this.to_send_invoice_data;
    invoice_data.notes = this.send_notes;
    invoice_data.to_download_only = to_download_only;
    invoice_data.invoice_date = this.invoice_date;
    invoice_data.invoice_period_type = this.select_duration_type;
    invoice_data.invoice_no = this.invoice_no;

    let data2={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      action:'send_invoice',
      invoice_data:invoice_data
    }

  this.is_loading= 'save_invoice';
    this.freelance_driver.freelanceInvoiceAction(data2).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        var smg ='';

        swalWithBootstrapButtons.fire(
          `Success`,
          'Invoice sent').then(() => {


          });
          this.current_tab = 'invoiced';
          this.getData();
          this.send_notes = '';
          $(".modal-backdrop").hide();
          $("#myModalDetail").toggle('modal')
      }
    });
  }

  setTab(tab:any){

    sessionStorage.setItem('freelanceInvoiceTab',tab.toString())
    this.page = 1;
    this.drafs_pagination = null;
    if(this.current_tab != tab){
      this.current_tab = tab;
      this.getData();
    }else{
      this.current_tab = tab;
    }
  }


  handleFilterByCompany(company:any){
    if(company && company !=null && company  && company !=='All'){
      if(company?.first_name && company?.first_name !=null && company?.first_name !=""){
        this.is_freelance_driver_company = false;
        this.select_company_code = company.id+"_user";
      }else{
        this.is_freelance_driver_company = true;
        this.select_company_code = company.id+"_self";
      }
      this.selected_company = company;

      this.page=1;
      this.getData();
    }else{
      this.is_freelance_driver_company = false;
      this.selected_company = null;
    }

  }


  handleFilterByDuration(type:any){
    if(type && type!=''){
      this.select_duration_type= type;

      this.page=1;
      this.getData();
    }else{
      this.select_duration_type='';
    }
  }

  getTicketDetail(id:any,is_self_dispatched:boolean=false,is_tc_ticket:any='NO'){

    let data = {
      is_tc_ticket:is_tc_ticket,
      date:this.date_today,
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      driver_ticket_id: id,
      is_self_dispatched:is_self_dispatched
    };
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{

      if(response.status ){
        this.ticket_detail = response.data.ticket;

        this.total_rounds=0;


        if(this.ticket_detail?.status=='Approved' || this.ticket_detail?.status=='Completed'){

          this.ticket_detail?.rounds.map((item:any)=>{

            if( item.round_time && item.driver_start_time !==null && item.driver_start_time && item.round_time !==null){
              this.total_rounds++;
            }
          })
        }else{
          this.total_rounds = this.ticket_detail?.rounds?.length;
        }

        $("#myModalAapproved").modal('show')

      }
    })
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
    var total = hours+(mints/60);
    return total.toFixed(2)+' hr';
  }

  parseJobTotal(item:any){
    var hours= 0;
    var mints = 0;
    if(!item){
      return;
    }
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

  parseJobTotal2(item:any){
    var hours= 0;
    var mints = 0;
    if(!item){
      return;
    }
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


  getSubTotal(hours:any,price:any ){
    hours= hours?.toString()?.replace(' hr','')
    var subt = 0;
    if(hours){
      subt = parseFloat(hours) * parseFloat(price?.toString());

    }
    return subt?.toFixed(2);
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

  markDefault(event:any,table:any,id:any,company:any=null){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('record_name','default_driver_invoice_company');
    var is_self_dispathced = table=='user'? 'NO':'YES';

    formData.append('is_self_dispatched',is_self_dispathced);
    formData.append('id',id);

    if(event.target.checked == true){
     formData.append('status','1');
    }else{
      formData.append('status','0');
    }


    this.freelance_driver.markDefault(formData).subscribe(response=>{

      if(response.status && response.data){
        if(is_self_dispathced=='YES'){
          this.is_freelance_driver_company = true;

        this.select_company_code = company.id+"_self";
        }else{
          this.is_freelance_driver_company = false;

        this.select_company_code = company.id+"_user";
        }
        this.selected_company = company;

        this.page=1;
        if(event.target.checked == true){
          this.loggedinUser.driver_invoice_company_id = id;
          this.loggedinUser.driver_invoice_company_is_self_dispatched = is_self_dispathced=='YES'? true : false;

          localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
        }else{
          this.loggedinUser.driver_invoice_company_id = null;
          this.loggedinUser.driver_invoice_company_is_self_dispatched =false;

          localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
        }
        this.getData();
      }

    });

  }
}
