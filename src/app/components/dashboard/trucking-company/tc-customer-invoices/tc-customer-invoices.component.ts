import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from 'src/app/services/invoice.service';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ContactService } from 'src/app/services/contact.service';
import { UserDataService } from 'src/app/services/user-data.service';

declare var $: any;
@Component({
  selector: 'app-tc-customer-invoices',
  templateUrl: './tc-customer-invoices.component.html',
  styleUrls: ['./tc-customer-invoices.component.css']
})
export class TcCustomerInvoicesComponent implements OnInit {
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  removing_contact_loading:boolean=false;
  editContactForm!:FormGroup;
  addContactForm!:FormGroup;

  customer_invoices:any;
  start_date:any;
  todayDate:any;
  selected_status = 'Invoiced';
  loggedinUser: any = {};

  active_menu:any;
  companies_list:any;

  selected_company:any='all';
  selected_comp_name:any =null;
  is_loading:boolean=false;

  show_drop:boolean=false;


  customerInvoice:any =null;
  customerContacts:any = null;

  editContact:any= null;
  user_id:any = null;
  
  errorName :string = '';  
  errorEmail :string = '';

  company_id:any = null;

  is_loading_add_contact:boolean=false;
  is_loading_edit_contact:boolean=false;
  
  toEnableContacts:any = [];
  toDisable:any =[];

  constructor(
    private fb:FormBuilder,
    private invoice_service: InvoiceService,
    private contact_service: ContactService,
    private router: Router,    
    private aRouter:ActivatedRoute,
    private datePipe:DatePipe,
    private user_service:UserDataService
  ) { 
    this.active_menu = {
      parent:'business',
      child:'invoices',
      count_badge: '',
    }
  }


  setToEnable(id:any,event:any){
console.log(id,event)
    if(event.target.checked){
      
      this.toEnableContacts[this.toEnableContacts.length] = id;
      this.toDisable.filter(function(item:any) {
          return item !== id
      })
    }else{
     
     this.toEnableContacts =  this.toEnableContacts.filter(function(item:any) {
        return item !== id
    })

    this.toDisable[this.toDisable.length] = id;
    
    }

    console.log(this.toEnableContacts)
  }
  setCompanyVal(event:any){
    if(event && event =='all'){
      this.selected_comp_name = 'All';
      this.selected_company = 'all';
    }else if(event){
      this.selected_company = event.id;
      this.selected_comp_name = event.company_name;
    }
   
    this.show_drop = false;
    this.getInvoices();
  }

  searchComp(event:any){
    if(event.target.value){
     
      this.getCompanies(event.target.value)
    }
    
  }

  ngOnInit(): void {

    this.backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;

    let tz = environment.timeZone;
    var d = new Date(); 
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd');
    this.start_date = this.todayDate;

    this.aRouter.queryParams.subscribe(params => {
      if(params['qd'] && params['qd']!="" ){
        this.start_date = params['qd'];
      }
      if(params['qc'] && params['qc']!="" ){
        this.selected_company = params['qc'];
      }
    });
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    this.user_id =  this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
   
    this.getCompanies();
    this.getInvoices();
    $(document).click(function(e:any) {
      
      var container = $(".background-customer");
      var input = $(".selectcustomerfield");
   
      if (!container.is(e.target) && container.has(e.target).length === 0) {
          if (!input.is(e.target) && input.has(e.target).length === 0) {

              container.hide();
          }
      }
    });

     
    this.addContactForm = this.fb.group({
      name: ['', Validators.required],
      email:['', Validators.required],
      phone:[''],
      is_invoice_send:[''],
      role:[''],
      contact_type:[''],
      user_id:[''],
      company_id:[''],
    });

    this.editContactForm = this.fb.group({
      name: ['', Validators.required],
      email:['', Validators.required],
      phone:[''],
      is_invoice_send:[''],
      role:[''],
      contact_type:[''],
      user_id:[''],
      company_id:[''],
      update_id:[''],
    });
   
    this.getMenuCounts();
  }

  showCustList(){
    this.show_drop = !this.show_drop;
  }

  getMenuCounts(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};
    
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
        
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  
    
  }

setStatus(event:any){
  if(event.target.value){
    this.selected_status = event.target.value;
  }
  this.getInvoices();
}

setCompany(event:any){
  if(event.target.value){
    this.selected_company = event.target.value;
  }
  this.getInvoices();
}

  getInvoices(){
    
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);  
    formData.append('status', this.selected_status);   
    formData.append('filter_by_id', this.selected_company); 
    formData.append('start_date', this.start_date);  
   
    this.invoice_service.getcustInvoices(formData).subscribe(response=>{
      if(response.status && response.data){
        this.customer_invoices = response.data?.all_invoices;
      }else{  
        this.customer_invoices = null;
      }
    })
  }

  getCompanies(param:any = ''){

    const formData = new FormData();
    formData.append('param',param);
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);  
    this.invoice_service.getCompaniesForInvoices(formData).subscribe(response=>{
      if(response.status && response.data){
        this.companies_list = response.data?.companies;
      }else{  
        
      }
    })
  }
  toLocation(link:any,tc_id:any=null){
   
    if(link=='/draft-tc-invoices'){
      this.router.navigate(
        [link],
        { queryParams: {tb: 'draft', qd: this.start_date, qc:tc_id !=null? tc_id:this.selected_company   } }
      );
    }else if(link=='/invoiced-tc-invoices'){
      this.router.navigate(
        [link],
        { queryParams: { tb: 'invoiced',qd: this.start_date, qc:tc_id !=null? tc_id:this.selected_company } }
      );
    }else{
      this.router.navigate(
        [link],
        { queryParams: { qd: this.start_date, qc:tc_id !=null? tc_id:this.selected_company } }
      );
    }
    
  }


  setCustomerInvoice(invoice:any){
    this.customerInvoice =invoice;
    this.company_id = invoice?.customer?.id

    this.addContactForm.get('company_id')?.patchValue(invoice?.customer?.id);
    this.getCustomerContacts(invoice?.customer);
  }

  getCustomerContacts(customer:any){
  
    const formData = new FormData();
    formData.append('company_id',customer.id);
    formData.append('user_id', this.loggedinUser.user_data_request_id && this.loggedinUser.user_data_request_id !== undefined? this.loggedinUser.user_data_request_id : this.loggedinUser?.id);  
    this.contact_service.getContacts(formData).subscribe(response=>{
      if(response.status && response.contacts){
        this.customerContacts = response.contacts;
      }else{  
        
      }
    })
  }

  setEditContact(contact:any){
    this.editContact = contact;
    this.editContactForm.patchValue({
      name:contact?.name,
      phone:contact?.phone,
      email:contact?.email,
      contact_type:contact?.contact_type,
      role:contact?.role,
      update_id:contact?.id,
      is_invoice_send: contact?.is_invoice_send
    })
   
  }

  handleEditContact(){

    this.errorEmail ='';
    this.errorName = '';
    if(this.editContactForm.get('name')?.value ==''){
      this.errorName = 'Name is required';
    }

    if(this.editContactForm.get('email')?.value ==''){
      this.errorEmail = 'Email is reqiured';
    }

    if(this.editContactForm.invalid){
      return;
    }


    this.is_loading_edit_contact =true;
    this.contact_service.updateContacts(this.editContactForm.value).subscribe(response=>{
              
    this.is_loading_edit_contact =false;
      if (response && !response.status ) {
        this.errorEmail = response.data.email ? response.data.email : '';    
        this.errorName = response.data.name ? response.data.name : '';     
       
        return;
      }else{
        this.editContactForm.reset();
         this.is_loading_edit_contact =false;
        Swal.fire(
      
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `success`,
            text:  
            `Contact Updated Successfully!`
          }
          ).then(() => { 
            this.getCustomerContacts(this.customerInvoice.customer)
          });
      }
    });
  }

  handleAddContact(){
    this.errorEmail ='';
    this.errorName = '';
    if(this.addContactForm.get('name')?.value ==''){
      this.errorName = 'Name is required';
    }

    if(this.addContactForm.get('email')?.value ==''){
      this.errorEmail = 'Email is reqiured';
    }

    if(this.addContactForm.invalid){
      return;
    }


    this.is_loading_add_contact =true;
    this.contact_service.addContacts(this.addContactForm.value).subscribe(response=>{
              
    this.is_loading_add_contact =false;
      if (response && !response.status ) {
        this.errorEmail = response.data.email ? response.data.email : '';    
        this.errorName = response.data.name ? response.data.name : '';     
       
        return;
      }else{
        this.addContactForm.reset();
         this.is_loading_add_contact =false;
        Swal.fire(
       
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `success`,
            text:  
            `Contact Added Successfully!`
          }
          ).then(() => { 
            this.getCustomerContacts(this.customerInvoice.customer)
          });
      }
    });

  }

  

  handleRemoveContact(id:any){
    this.removing_contact_loading = true;
    Swal.fire({
      title: 'Do you want to delete this user?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('delete_id', id);  
        this.contact_service.removeContacts(formData).subscribe((response:any)=>{
          this.removing_contact_loading = false;
          if (response && response.status && response.message ) {
      
            
              Swal.fire({
                title: response.message,
                showCancelButton: false,
                confirmButtonText: 'Ok',
                denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
              });
              this.getCustomerContacts(this.customerInvoice.customer)
           
          }else{
            Swal.fire(
            
          {
            confirmButtonColor:'#17A1FA',
            title:   
            'Error!',
            text:  
            'Unable to delete!'
          }
            )

          }
        });
       
      } 
    })
  }

  handleDone(){
    this.editContact = null;
    let data={user_id: this.user_id,contacts:this.toEnableContacts,disable:this.toDisable};
    this.contact_service.invoicingStatus(data).subscribe((response:any)=>{
      this.removing_contact_loading = false;
      if (response && response.status && response.message ) {
  
        
          Swal.fire({
            title: response.message,
            showCancelButton: false,
            confirmButtonText: 'Ok',
            denyButtonText: `Cancel`, confirmButtonColor: '#17A1FA',
          });
          this.getCustomerContacts(this.customerInvoice.customer)
          this.toEnableContacts = [];
          this.toDisable=[]
      }else{
        Swal.fire( {
          confirmButtonColor:'#17A1FA',
          title:   
          'Error!',
          text:  
          'Unable to delete!'
        })
      }
    });
  }
}


