import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { PlansService } from 'src/app/services/plans.service';
import { chargebeeConfig } from 'src/chargebee-slabs-config';

declare var $: any;

@Component({
  selector: 'app-customer-company-tragget-ticket',
  templateUrl: './customer-company-tragget-ticket.component.html',
  styleUrls: ['./customer-company-tragget-ticket.component.css']
})
export class CustomerCompanyTraggetTicketComponent implements OnInit {

  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  is_loading:boolean= false;
  loggedinUser:any ={};
  active_menu:any;
  slabs:any = chargebeeConfig.slabs;

  pages: number[] = [];
  subscriptions: any[] = [];
  currentPage = 1;
  pageSize = 8;

  pages2: number[] = [];
  subscriptions2: any[] = [];
  currentPage2 = 1;
  pageSize2 = 8;

  is_loading_download:boolean=false;
  downloading_invoice_id:any=null;
  max_end:any = chargebeeConfig.max_end;
  profile_tragget_data:any=null;
  
  is_loading_cancel:boolean=false;
  constructor(
    private router: Router,
    private plan_service: PlansService
  ) {
    this.active_menu = {
      parent:'settings',
      child:'company-settings',
      count_badge: '',
    }
    
   }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
     
    }else{
      this.router.navigate(['/home']);
    }

    this.getTraggetProfileData();
  
  }
  
  
  preparePages() {
    const totalPages = this.totalPages();
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.loadPageItems();
  }

  loadPageItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.subscriptions = this.profile_tragget_data?.subscriptions_data.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      this.loadPageItems();
    }
  }

  totalPages() {
    return Math.ceil(this.profile_tragget_data?.subscriptions_data.length / this.pageSize);
  }

  showMore() {
    setTimeout(() => {
      $('.modal-backdrop').toggle('slow');
    }, 100);
}

closeMore() {
    setTimeout(() => {
      $('.modal-backdrop').hide(); 
    }, 100);
}

  showMore2() {
    setTimeout(() => {
      $('.modal-backdrop2').toggle('slow'); 
    }, 100);
}

closeMore2() {
    setTimeout(() => {
      $('.modal-backdrop2').hide(); 
    }, 100);
}


  preparePages2() {
    const totalPages = this.totalPages2();
    this.pages2 = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.loadPageItems2();
  }

  loadPageItems2() {
    const start = (this.currentPage2 - 1) * this.pageSize2;
    const end = start + this.pageSize2;
    console.log(" this is the listt before :: ",this.subscriptions2 )
    this.subscriptions2 = this.profile_tragget_data?.single_tickets_data.slice(start, end);
    console.log(" this is the listt after ** :: ",this.subscriptions2 )
  }

  changePage2(page: number) {
    if (page >= 1 && page <= this.totalPages2()) {
      this.currentPage2 = page;
      this.loadPageItems2();
    }
  }

  totalPages2() {
    return Math.ceil(this.profile_tragget_data?.single_tickets_data.length / this.pageSize2);
  }



  getTraggetProfileData(){
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.plan_service.getProfileTraggetData(data).subscribe(response=>{
      if(response.data && response.status){
        this.profile_tragget_data = response.data;

        let cost:any = 0;
        cost = this.getCost(this.profile_tragget_data?.tickets_per_month);
        if(this.profile_tragget_data?.renewal_invoice_data && this.profile_tragget_data?.renewal_invoice_data?.invoice){

          this.profile_tragget_data.cost_per_month = this.profile_tragget_data?.renewal_invoice_data?.invoice?.sub_total ? this.profile_tragget_data?.renewal_invoice_data?.invoice?.sub_total/100:cost;
        }else{
          this.profile_tragget_data.cost_per_month = cost;

        }
        this.preparePages();
        this.preparePages2();

      }

    });
  }

  getCost(quantity:any){
    let qty = quantity / 25;
    var total_price = 0;
    for(var i=1;i<=qty;i++){
      let qty_check = i * 25;
      var slab_price = null;
      var slabb= null;
      this.slabs.map((slab:any)=>{
        if(qty_check >= slab.start && qty_check <=slab.end){
          slab_price = 25*slab.price;
          slabb = slab;
        }
      });
      if(!slab_price){
        slab_price = this.max_end;
      }
      total_price +=slab_price;
      console.log(slabb,slab_price,total_price);
    }
    return total_price.toFixed(0);
  }




  showOptions(){
    setTimeout(() => {
      $('.modal-div').find('.option-modal').toggle('slow');
    }, 300);
  }
  handleCancel(){
    setTimeout(() => {
      $(".option-modal").hide()
    }, 300);
    let formData:any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    this.is_loading_cancel = true;
    this.plan_service.cancelSubscription(formData).subscribe((response:any)=>{
      this.is_loading_cancel = false;
      if (response && response.status  ) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success!`,
            text:  
            response.message
          
          }).then(()=>{
            this.getTraggetProfileData();
          });
        
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Warning!`,
            text:  
            response.message
          
          }).then(()=>{
            
          });
      }
    });
  }
  closeCancelOption(){
    setTimeout(() => {
      $(".option-modal").hide()
    }, 300);
  }

  downloadInvoicePDF(invoice_id:any){

    this.downloading_invoice_id= invoice_id;
    this.is_loading_download = true;
    let data:any  = {invoice_id: invoice_id}
    this.plan_service.downloadInvoicePDF(data).subscribe((response:any)=>{
      this.is_loading_download = false;
      this.downloading_invoice_id= null;
      if (response && response.status  ) {
      
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', response.download_url);
        link.setAttribute('download', response.download_url);
        document.body.appendChild(link);
        link.click();
        link.remove();
  
      }else{
     
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
              `Warning`,
              response.message).then(() => { 
              });
      }
    });
  }
}
