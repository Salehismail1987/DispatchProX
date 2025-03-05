import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InvoiceService } from 'src/app/services/invoice.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-tc-invoice-list',
  templateUrl: './tc-invoice-list.component.html',
  styleUrls: ['./tc-invoice-list.component.css']
})
export class TcInvoiceListComponent implements OnInit {

  
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  
  invoiced_invoices:any;
  
  loggedinUser: any = {};
  ticketDetail:any = null;
  
  active_menu:any;
  companies_list:any;

  selected_company:any = 'all';
  start_date:any = null;
  todayDate: any;

  sendForm!:FormGroup;
  dispatcher:any  = null;
  toSendInvoice:any =null;
  is_downloading_invoice:string = '';
  is_resending_invoice:string = '';
  is_sending_loading:boolean=false;

  companyError:string = '';
  addressError:string = '';
  contactPersonError:string = '';
  emailError:string = '';

  gst:any=null;

  select_duration_type:string= '';
  selected_monthly:string = '';
  selected_semi_monthly_month:string = '';
  selected_semi_monthly_range:string = '';
  selected_year:any;
  selected_weekly_range:string = '';
  selected_custom_range:string = '';
  month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  constructor(
    private fb:FormBuilder,
    private router: Router,
    private aRouter:ActivatedRoute,
    private invoice_service: InvoiceService,
    private datePipe:DatePipe,
    private user_service:UserDataService
  ) {
    this.active_menu = {
      parent:'business',
      child:'invoices',
      count_badge: '',
    }
  }

  ngOnInit(): void {
    
    this.ticketDetail = null;

    let tz = environment.timeZone;
    var d = new Date(); 
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd')
    this.selected_year = d.getFullYear();
    this.select_duration_type ='Monthly';
    this.selected_monthly = this.month[d.getMonth()];
    $('.selmonthtype').val(this.selected_monthly );
    this.start_date = this.todayDate;

   


    this.active_menu = {
      parent:'business',
      child:'invoices',
      count_badge: '',
    }

    this.ticketDetail = null;

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    
    this.sendForm = this.fb.group({
      invoice_id: ['', Validators.required],
      company:['', Validators.required],
      address:['', Validators.required],
      contact_person:['', Validators.required],
      email:['', Validators.required],
    });
   

    localStorage.removeItem('InvoiceToDownloadTragget');
    var selecttype = '';
    var selectmonth = '';
    var selectsemimonth = '';
    var selectweek = '';
    var date = new Date();
    var year = date.getFullYear();

    $('.selmonthtype').on('click', function() {
      $('.selectcontroldiv').hide();
      $('.selecttype').show();
  });
  $('.selecttype ul li').on('click', function(this:any) {
      selecttype = $(this).html();
      $('.selmonthtype').html($(this).html());
      $('.selectcontroldiv').hide();
      $('.select_duration_type').val(selecttype);
      
      if (selecttype == 'Monthly' || selecttype == 'Semi-monthly') {
          $('.selectmonth').show();
      } else if (selecttype == 'Weekly') {
          $('.calenderweek').show();
      } else {
          $('.calenderrange').show();
          $('.daterange').trigger('click');
      }
  });
  $('.selectmonth ul li').on('click', function(this:any) {
      selectmonth = $(this).html();
      var month = $(this).data('month');
      $('.selectcontroldiv').hide();
      if (selecttype == 'Semi-monthly') {
          $('.selectsemimonth').show();
          var date = new Date(year, month - 1);
          var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          $('.nexthalf').html('15th to ' + lastDay.getDate() + 'th');
      } else {
          $('.selmonthtype').val(selectmonth);
      }
  });
  $('.selectsemimonth ul li').on('click', function(this:any) {
      selectsemimonth = $(this).html();
      $('.selectcontroldiv').hide();
      $('.selected_month').html(selectmonth);
      $('.selmonthtype').val(selectmonth + ' ' + selectsemimonth);
  });
    $('.week-picker').weekpicker();
        $('.daterange').daterangepicker({
            autoApply: true,
        });
        $('.daterange').on('apply.daterangepicker', function(ev:any, picker:any) {
            $('.selectcontroldiv').hide();
            $('.selmonthtype').val(selectmonth + ' ' + picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
            
            $('.daterange2').html(selectmonth + ' ' + picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
            $('.daterange2').trigger('click');
            $('.selmonthtype').trigger('change');
          });
        $('.drp-calendar.right').hide();
        $('.drp-calendar.left').addClass('single');

        $('.calendar-table').on('DOMSubtreeModified', function() {
            var el = $(".prev.available").parent().children().last();
            if (el.hasClass('next available')) {
                return;
            }
            el.addClass('next available');
            el.append('<span></span>');
        });
        $(document).click(function(e:any) {
            var container = $(".selectcontroldiv");
            var input = $(".selmonthtype");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                if (!input.is(e.target) && input.has(e.target).length === 0) {
                    container.hide();
                }
            }
        });

        this.aRouter.queryParams.subscribe(params => {
          if(params['qd'] && params['qd']!="" ){
            this.start_date = params['qd'];
          }
          if(params['qc'] && params['qc']!="" ){
            this.selected_company = params['qc'];
    
            let data:any = null
           
            if(sessionStorage.getItem('invoice_filters')){
               data = sessionStorage.getItem('invoice_filters');
             
              data = JSON.parse(data);
            }

            if(data.selected_year){
              this.selected_year = data.selected_year;
            }
            if(data.selected_monthly){
              this.selected_monthly = data.selected_monthly;
            }
            if(data.selected_semi_monthly_month){
              this.selected_semi_monthly_month = data.selected_semi_monthly_month;
            }
            if(data.selected_semi_monthly_range){
              this.selected_semi_monthly_range = data.selected_semi_monthly_range;
            }
            if(data.selected_custom_range){
              this.selected_custom_range = data.selected_custom_range;
            }
            if(data.selected_weekly_range){
              this.selected_weekly_range = data.selected_weekly_range;
            }

            if(data.select_duration_type){
             
              this.select_duration_type = data.select_duration_type;
              console.log(data);
              switch ( this.select_duration_type) {
                case 'Monthly':
                  $('.selmonthtype').val(this.selected_monthly);
                  break;
               case 'Weekly':
                  $('.selmonthtype').val(this.selected_weekly_range);
                
                  break;
                case 'Semi-monthly':
                  $('.selmonthtype').val(this.selected_semi_monthly_range);
                  break;
                case 'Custom':
                  $('.selmonthtype').val(this.selected_weekly_range);
                  break;
              }
            }

          
          }
        });

        this.getCompanies();
    
        this.getInvoices();
        this.getMenuCounts();
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

  getMenuCounts(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};
    
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
        
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  
    
  }

  decYear(){
    var year = parseInt(this.selected_year);
    this.selected_year = year--;
  }

  incYear(){
    var year = parseInt(this.selected_year);
    this.selected_year = year++;
  }
    
  getCompanies(){

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);  
    this.invoice_service.getCompaniesForInvoices(formData).subscribe(response=>{
      if(response.status && response.data){
        this.companies_list = response.data?.companies;
      }else{  
        
      }
    })
  }

  handleFilterByCompany(event:any){
    this.selected_company = event.target.value;
    this.getInvoices();
  }

  getInvoices(){
    
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);  
    formData.append('status', "Invoiced");   
    formData.append('filter_by_id', this.selected_company);      
    formData.append('start_date', this.start_date);  
  
    formData.append('selected_year', this.selected_year);  

    formData.append('select_duration_type', this.select_duration_type);  
    formData.append('selected_monthly', this.selected_monthly);  
    formData.append('selected_semi_monthly_month', this.selected_semi_monthly_month);  
    formData.append('selected_semi_monthly_range', this.selected_semi_monthly_range);  
    formData.append('selected_weekly_range', this.selected_weekly_range);  
    formData.append('selected_custom_range', this.selected_custom_range);  
    this.invoice_service.getInvoices(formData).subscribe(response=>{
      if(response.status && response.data){
        this.invoiced_invoices = response.data?.all_invoices;
      }else{  
        
      }
    })
  }

  setDetail(ticket:any){
    this.ticketDetail = ticket;
  }

  handleDateChange(event:any){
    this.start_date = event.target.value;
    this.getInvoices();
  }
  
  toLocation(link:any){
    let data:any = {
      select_duration_type: this.select_duration_type,
      selected_year: this.selected_year,
      selected_monthly: this.selected_monthly,
      selected_semi_monthly_month: this.selected_semi_monthly_month,
      selected_semi_monthly_range: this.selected_semi_monthly_range,
      selected_weekly_range: this.selected_weekly_range,
      selected_custom_range: this.selected_custom_range
    };
    
    sessionStorage.setItem('invoice_filters',JSON.stringify(data));
    this.router.navigate(
      [link],
      { queryParams: { qd: this.start_date,  qc:this.selected_company } }
    );
  }

  toDownload(invoice:any){
    localStorage.setItem('InvoiceToDownloadTragget', JSON.stringify(invoice));
    this.router.navigate(['/invoice-pdf-download']);
  }

  downloadPDF(invoice:any){
    
    
    this.dispatcher = invoice.projects[0]?.project_detail?.invoice_for;
    const formData = new FormData();
    formData.append('user_id',  this.dispatcher.id);  
    this.user_service.getUserTax(formData).subscribe(response=>{
      if(response.status && response.gst){
        this.gst = response?.gst;
        let gst = this.gst?.tax ? parseFloat(this.gst?.tax) : 12;
        invoice.inv_gst_value = (invoice.inv_subtotal * gst) / 100;
        invoice.total_with_gst = invoice.inv_gst_value  + invoice.inv_subtotal;
        this.toSendInvoice = invoice;
    
        
        let data = {
          email :  (this.dispatcher && this.dispatcher.email ? this.dispatcher.email :''),
          address :  (this.dispatcher && this.dispatcher.customer.address ? this.dispatcher.customer.address : ''),
          contact_person :  (this.dispatcher && this.dispatcher.first_name+ this.dispatcher.last_name ? this.dispatcher.first_name+ (this.dispatcher.last_name !='' && this.dispatcher.last_name !=null ? ' '+this.dispatcher.last_name :''): ''),
          company :  (this.dispatcher && this.dispatcher.company_name ? this.dispatcher.company_name  : ''),
          invoice_id :  (this.toSendInvoice && this.toSendInvoice.id ? this.toSendInvoice.id : ''),
          user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
          invoice: this.toSendInvoice,
          dispatcher: this.dispatcher,
          start_date: this.start_date
        }
        this.is_downloading_invoice =this.toSendInvoice.id;
        this.invoice_service.downloadInvoice(data).subscribe(response=>{
           
          this.is_downloading_invoice = '';
          this.toSendInvoice = null;
          if (response && !response.status ) {
            if(response.message !=""){
              Swal.fire(
              
              {
                confirmButtonColor:'#17A1FA',
                title:   
                `Error`,
                text:  
                response.message
              })
              
            }
          }else{
            const link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.setAttribute('href', environment.apiInvoiceURL+response.file_name);
            link.setAttribute('download', response.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
        });
      }else{  
        
      }
    })
  
  }

  setSendInvoice(invoice:any){
   
    this.dispatcher = invoice.projects[0]?.project_detail?.invoice_for;

    const formData = new FormData();
    formData.append('user_id',  this.dispatcher?.id);  
    this.user_service.getUserTax(formData).subscribe(response=>{
      if(response.status && response.gst){
        this.gst = response?.gst;
        let gst = this.gst?.tax ? parseFloat(this.gst?.tax) : 12;
        invoice.inv_gst_value = (invoice.inv_subtotal * gst) / 100;
        invoice.total_with_gst = invoice.inv_gst_value  + invoice.inv_subtotal;
        this.toSendInvoice = invoice;
      }else{  
        
      }
    })
    
  }

  onSendInv(){

    this.companyError = '';
    this.addressError = '';
    this.contactPersonError = '';
    this.emailError = '';

    
    if (this.sendForm.get('company')?.value == '') {
      this.companyError = 'Company is required';
    }  
    if (this.sendForm.get('address')?.value == '') {
      this.addressError = 'Address is required';
    }  
    if (this.sendForm.get('contact_person')?.value == '') {
      this.contactPersonError = 'Contact Person is required';
    } 
    if (this.sendForm.get('email')?.value == '') {
      this.emailError = 'Email is required';
    } 

     if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.sendForm.get('email')?.value) ){
      this.emailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }
    
   
    if (this.sendForm.invalid) {
      return;
    }


    let data = {
      email :  this.sendForm.get('email')?.value,
      address :  this.sendForm.get('address')?.value,
      contact_person :  this.sendForm.get('contact_person')?.value,
      company :  this.sendForm.get('company')?.value,
      invoice_id :  this.sendForm.get('invoice_id')?.value,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      invoice: this.toSendInvoice,
      dispatcher: this.dispatcher,
      start_date: this.start_date
    }
 
    this.is_sending_loading =true;
    this.invoice_service.reSendInvoice(data).subscribe(response=>{
        console.log(data) 
    this.is_sending_loading =false;
      if (response && !response.status ) {
        if(response.message !=""){
          Swal.fire(
           
            {
              confirmButtonColor:'#17A1FA',
              title:   
              `Error`,
              text:  
              response.message
            }
            ).then(() => { 
                
            });
        }else{
          this.companyError = response.data.company ? response.data.company : '';    
          this.addressError = response.data.address ? response.data.address : '';    
          this.contactPersonError = response.data.contact_person ? response.data.contact_person : '';    
          this.emailError = response.data.email ? response.data.email : ''; 
          
        }
         this.is_sending_loading =false; 
        return;
      }else{
        this.sendForm.reset();
         this.is_sending_loading =false;
        Swal.fire(
        
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success`,
            text:  
            `Invoice Send Successfully!`
          }
          ).then(() => { 
            this.toSendInvoice = null;
            this.getInvoices();
             
          });
      }
    });


  }

  setDuration(duration:any){
    if(duration){
      this.select_duration_type = duration;
      
    }
  }

  setMonth(month:any){
    if(this.select_duration_type == 'Monthly'){
      this.selected_monthly = month;
    }else if(this.select_duration_type =='Semi-monthly'){
      this.selected_semi_monthly_month = month;
    }
    console.log(this.select_duration_type,this.selected_monthly);
    console.log(this.select_duration_type, this.selected_semi_monthly_month)

    this.getInvoices()
  }

  setSemiMonthly(range:any){
    if(this.select_duration_type == 'Semi-monthly'){
      this.selected_semi_monthly_range= range;
    }
    console.log(this.selected_semi_monthly_range)
  }

  setSemi(id:any){
   
   let elem:any =  document.getElementById(id);
    this.selected_semi_monthly_range = elem?.innerText;
    console.log(this.selected_semi_monthly_range)
    this.getInvoices()
  }

  setWeekDates(event:any){
  let parser = new DOMParser();
  const doc = parser.parseFromString(event, 'text/html');
  let tt = $('.calenderweek > .weekrange').html();
  
  if(tt && tt!==undefined && tt !=''){
    this.selected_weekly_range= tt;
 
  }
  
  this.getInvoices();
  }

  setRange(event:any){
    if(event.target.value){
      console.log(event)
    }
  }

  setDateRange(){
   
    let tt = $('.calenderrange > .daterange2').html();
  
    if(tt && tt!==undefined && tt !=''){
      this.selected_custom_range = tt;   
    }

    this.getInvoices();
  }
}
