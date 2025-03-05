import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlansService } from 'src/app/services/plans.service';
import { environment } from 'src/environments/environment';
import { UserDataService } from 'src/app/services/user-data.service';

import { chargebeeConfig } from 'src/chargebee-slabs-config';
import { TicketService } from 'src/app/services/ticket.service';
declare var $:any;
declare var Chargebee:any;
@Component({
  selector: 'app-cust-tragget-plans',
  templateUrl: './cust-tragget-plans.component.html',
  styleUrls: ['./cust-tragget-plans.component.css']
})
export class CustTraggetPlansComponent implements OnInit {

  active_menu:any;
  loggedInUser:any;
  customer:any;

  slabs:any = chargebeeConfig.slabs;

  max_end:any = chargebeeConfig.max_end;
  
  is_subscribed:any='NO';
  trial_days:any = environment.trial_period_days;
  active_plan:any;

  active_tab:any ='10-pack';
  subscriptionForm!: FormGroup;  
  tenPackForm!: FormGroup;

  tenPackError = '';
  subscriptionError = '';
  last_30_days_closed_tickets:any=null;

  ten_pack_plan:any;
  subscription_plan:any;

  ten_pack_qty:number=0;
  subs_plan_qty:number=0;
  free_trial_loading:boolean=false;
  free_trial:any=null;

  is_expired:any='NO';
  constructor(
    private router: Router,
    private aRouter:ActivatedRoute,
    private fb: FormBuilder,
    private user_service:UserDataService,
    private plan_service: PlansService,
    private ticket_service: TicketService
  ) { 
    this.active_menu = {
      parent:'tragget-ticket',
      child:'tragget-ticket',
      count_badge: '',
    }

  }


  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
       } else {
      this.router.navigate(['/home']);
    }

    
    var tt:any= sessionStorage.getItem('TraggetUserSub');
     
    if(tt && tt!==null){
        
      let userSubs = this.user_service.decryptData(tt);
      this.is_subscribed = userSubs;
    }
      let data = { user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id, account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type : userDone?.account_type };

      this.user_service.getSubStatus(data).subscribe(response=>{
        if(response.status ){

          if(response.is_valid == true){
            this.is_subscribed = 'YES';
            let datas:any= this.user_service.encryptData(this.is_subscribed);
            sessionStorage.setItem('TraggetUserSub',(datas));
          }else{

          }
        }
      });
    
    let formData:any = {user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id}
    
    this.plan_service.checkFreeTrial(formData).subscribe((response:any)=>{
      if(response && response.data){
        this.free_trial = response.data.is_free_trial;
        this.is_expired = response.data.is_expired;
      }else{
        this.free_trial = 'NO';
        this.is_expired = response?.data?.is_expired ? response?.data?.is_expired:'NO';
      }
    });
    this.aRouter.queryParams.subscribe(params => {
      if(params['plan'] && params['plan'] !=""){
        if(params['state'] && params['state'] === 'succeeded'){
          const formData = new FormData();
  
          formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);
          formData.append('plan', params['plan']);
          formData.append('sub_id', params['sub_id']);
          formData.append('id', params['id']);
          formData.append('invoice_id', params['invoice_id']);
          
          
          this.plan_service.saveUserPlan(formData).subscribe(response => {
            if(response.status && response.message){
               const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success',response.message).then(()=>{
                this.router.navigate(['/dashboard'])
              });
              
              
            }else{
               const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Warning','Problem in Processing Payments. Contact support.').then(()=>{
                this.router.navigate(['/dashboard'])
              });
            }
          });
        }
       
      }
    });
    this.getPlans();
      this.getUserPlan();
   
      this.ticket_service.get30DaysClsoedTickets(formData).subscribe((response:any)=>{
              
        if (response && response.status && response.data ) {
  
          this.last_30_days_closed_tickets = response.data?.last_30_days_closed_tickets;
        }
      });
      $(document).on('click','.subs-plan-click',function(){

     
        const cbInstance = Chargebee.init({
        site: "tragget-test",
        isItemsModel: true, // Product catalog 2.0
        });
        const data = JSON.parse($("#user").html());
        var cart = cbInstance.getCart();
        var customer:any = {first_name: data.full_name, last_name: '',email:data.email, billing_address:{first_name: data.full_name, last_name: '', company: data.company, phone: data.phone, line1: "", line2: ""}};
        // Setting custom fields
        customer["cf_custom_field1"] = "Custom field 1"
        cart.setCustomer(customer);
        var shippingAddress = {first_name: data.full_name, last_name: '', company: data.company, phone:data.phone, line1: "", line2: ""};
        cart.setShippingAddress(shippingAddress);
        var link = document.querySelectorAll("[data-cb-item-0=Monthly-Subscription-in-CAD-CAD-Monthly]")[0];
  
        link.setAttribute('data-cb-item-0-quantity','2');
        var link = document.querySelectorAll("[data-cb-item-0=Monthly-Subscription-in-CAD-CAD-Monthly]")[0];
      
        var product = cbInstance.getProduct(link);
        console.log(product);
        if(product && product !== undefined){
           
            product.setPlanQuantity($(".subs-plan-click-quantity").val())
  
            product.items[0]['quantity'] = $(".subs-plan-click-quantity").val()
            console.log(product)
            cart.replaceProduct(product);
            cart.proceedToCheckout();
        }
  
  
    });
  
      $(document).on('click','.10-pack-click',function(){
  
  
          const cbInstance = Chargebee.init({
          site: "tragget-test",
          isItemsModel: true, // Product catalog 2.0
          });
          const data = JSON.parse($("#user").html());
  
          var cart = cbInstance.getCart();
          var customer:any = {first_name: data.full_name, last_name: '',email:data.email, billing_address:{first_name: data.full_name, last_name: '', company: data.company, phone: data.phone, line1: "", line2: ""}};
          // Setting custom fields
          customer["cf_custom_field1"] = "Custom field 1"
          cart.setCustomer(customer);
          var shippingAddress = {first_name: data.full_name, last_name: '', company: data.company, phone:data.phone, line1: "", line2: ""};
          cart.setShippingAddress(shippingAddress);
          var link = document.querySelectorAll("[data-cb-item-0='10-tickets-package-CAD']")[0];
  
          link.setAttribute('data-cb-item-0-quantity','2');
          var link = document.querySelectorAll("[data-cb-item-0='10-tickets-package-CAD']")[0];
  
          var product = cbInstance.getProduct(link);
          if(product && product !== undefined){
              product.setPlanQuantity($(".10-pack-click-quantity").val())
  
              product.items[0]['quantity'] = $(".10-pack-click-quantity").val()
              console.log(product)
              cart.replaceProduct(product);
              cart.proceedToCheckout();
          }
  
  
      // const cart = cbInstance.getCart();
      //   const data = JSON.parse($("#user").html());
      //   const customer = data;
      //     cart.setCustomer(customer);
      // const product = cbInstance.initializeProduct("Pack---of---ten-USD-Monthly");
      // console.log(product);
      // product.setPlanQuantity(2);
      // console.log("After updating.");
      // console.log(product)
      // cart.replaceProduct(product);
      // console.log(cart);
      // cart.proceedToCheckout();
      })
  
  
    }
    ngAfterViewInit(): void {
      Chargebee.registerAgain();
    }

  
  startFreeTrial(){
    let formData:any = {user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id, trial_days:this.trial_days}
    this.free_trial_loading = true;
    this.plan_service.startFreeTrial(formData).subscribe((response:any)=>{
      this.free_trial_loading = false;
      if (response && response.status && response.user ) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success',   'Free Trial Started.').then(()=>{
          localStorage.setItem('TraggetUser', JSON.stringify(response.user));
          this.router.navigate(['/cust-tragget-trial'])
        });
       
        
      }else{

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(`Warning!`,  response.message).then(()=>{
        });
       
      }
    });
  }

  
  getUserPlan(){
    const formData = new FormData();
    formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);  
    this.plan_service.getUserPlan(formData).subscribe((response:any)=>{
              
      if (response && response.status && response.data ) {

        if(response.data && response.data?.tragget_plan){

          this.active_plan = response.data;
        }else{
          this.active_plan =null;``
        }
      }
    });
  }

  getPlans(){
    this.plan_service.getTraggetPlans({}).subscribe((response:any)=>{
              
      if (response && response.status && response.data ) {

       this.subscription_plan = response.data.subscription_plan;
       this.ten_pack_plan = response.data.ten_pack_plan;
       this.ten_pack_qty = 1;
       this.subs_plan_qty = 1 * 25;
        let qty = 1;
        this.subscriptionForm = this.fb.group({
          plan: [response.data.subscription_plan.plan_name, Validators.required],
          quantity: [(1*25), Validators.required],
          priceItem: [response.data.subscription_plan.unit_price, Validators.required],
          totalPrice: [(response.data.subscription_plan.unit_price * qty), Validators.required],
        });
    
        this.tenPackForm = this.fb.group({
          plan: [response.data.ten_pack_plan.plan_name, Validators.required],
          quantity: [1, Validators.required],
          tickets:[10],
          priceItem: [response.data.ten_pack_plan.unit_price, Validators.required],
          totalPrice: [response.data.ten_pack_plan.unit_price, Validators.required],
        });
      }else{
        
      }
    });
  }

  handleTenPackChange(event:any){
    
    let total = this.ten_pack_plan.unit_price * event.target.value;
    this.tenPackForm.get('totalPrice')?.patchValue(total) 
    
   this.ten_pack_qty =event.target.value
    this.tenPackForm.get('tickets')?.patchValue(event.target.value * 10) 
  }

  
  handleSubsChange(event:any){
    let qty = event.target.value / 25;
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
    
    this.subs_plan_qty = event.target.value 
    this.subscriptionForm.get('totalPrice')?.patchValue(total_price.toFixed(2)) ;
  }

  handleTenPack(){

  }

  handleSubscription(){

  }

  setTab(tab:any){
    this.active_tab = tab;
  }

  
  alreadySubscribed(){
   
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire('Warning','You already have an active subscription.').then(()=>{
      
      });
         
  }
}
