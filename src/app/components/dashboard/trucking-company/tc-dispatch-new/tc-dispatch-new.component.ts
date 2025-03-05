import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { TruckingDispatchService } from 'src/app/services/trucking-dispatch.service';
import { environment } from 'src/environments/environment.prod';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-tc-dispatch-new',
  templateUrl: './tc-dispatch-new.component.html',
  styleUrls: ['./tc-dispatch-new.component.css']
})
export class TcDispatchNewComponent implements OnInit {

  loggedinUser: any = {};
  user_id:any;
  active_menu:any;
  truck_trailer_cust_rate:any= 0; 
  driver_availability:any = [];
  truck_availability:any = [];
  trailer_availability:any = [];

  minDateDispatch: Date= new Date();
  todayDate:any;

  project_id:any=null;
  selected_project:any=null;
  is_tc_project:any=null;
  cc_lists:any=null;

  trucks_list:any=null;
  trailers_list:any=null;
  trailer_types:any=null;
  truck_types:any=null;
  dump_sites:any=null;
  vendors_list:any=null;
  drivers_list:any=null;
  approvers_list:any=null;

  selected_truck:any=null;
  selected_driver:any=null;
  default_driver:any=null;
  selected_approver:any=null;

  selected_vendor:any=null;
  selected_vendor_id:any=null;
  selected_cc:any=null;
  selected_cc_id:any=null;
  selected_truck_type:any=null;
  selected_trailer_type:any=null;

  form_clicked:boolean=false;
  form_clicked_driver:boolean=false;
  is_loading_driver:boolean=false;
  is_driver_form_error:boolean=false;
  is_driver_form_error2:boolean=false;

  

  is_loading_add:string='';
  driver_message:string='';

  projectError:string = '';
  approverError:string = '';
  companyError:string = '';
  ticketDateError:string = '';
  repeatError:string = '';
  descriptionError:string = '';

  number_of_tickets:number=0;
  to_dispatch_total:number=0;
  
  error:any = [];
  driver_dispatch_total:number=0;

  schedule_date_from:string = '';
  schedule_date_to:string = '';

  is_loading_inv:boolean = false;
  inviteTCForm!: FormGroup;
  inviteTCfull_nameError: string  ='';
  inviteTCEmailError: string = '';

  ticketForm!: FormGroup;
  addCompany!: FormGroup;  
  dispatchDriverForm!: FormGroup;
  
  is_saving:boolean=false;

  tc_dispatch_setting:any=null;
  tc_ticket_no_data:any=null;
  tc_total_trucks:any=0;

  constructor(
    private aRouter:ActivatedRoute,
    private router:Router,
    private fb: FormBuilder,
    private datePipe:DatePipe,
    private trucking_service: TruckingCompanyService,
    private tc_dispatch_service:TruckingDispatchService
  ) { 
    this.active_menu = {
      parent:'company-projects',
      child:'company-projects',
      count_badge: '',
    } 
  }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    let tz = environment.timeZone;
    var d = new Date(); 
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd')
    this.minDateDispatch = new Date(samp_date);

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    this.project_id = this.aRouter.snapshot.params['id'] ? this.aRouter.snapshot.params['id']:'';
    this.is_tc_project = this.aRouter.snapshot.params['tc_project'] ? this.aRouter.snapshot.params['tc_project']:'';
 

    this.getTCDrivers();

    this.inviteTCForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
    });
    

    $(document).ready(function() {

      $(document).on('click','.getinputfield3', function(this:any) {
        $('.input-popup-div3').hide();
        $(this).find('.input-popup-div3').show();
        
      });

     $(document).on('click','.getinputfield4', function(this:any) {
      // console.log(" im clickedddddddd \n\n");
        $('.input-popup-div4').hide();
        $(this).closest('.input-popup-div').find('.input-popup-div4').show();
      });


    
      $(document).on('click','.getinputfield', function(this:any) {
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
      $('.single-project').on('click', function(this:any) {
          $(this).closest('.project-main-div').find('.projects-list').toggle('slow');
          $(this).closest('.project-main-div').find('.edit-project-name').toggle();
          $(this).closest('.project-main-div').find('.project-name').toggle();

          if ($(this).closest('.project-main-div').find('.edit-project-name').css('display') != 'none') {
              $(this).closest('.project-main-div').find('.single-project').css('padding', '4px 51px 4px 9px');
          } else {
              $(this).closest('.project-main-div').find('.single-project').css('padding', '16px 51px 16px 16px');
          }
      });
       
      $(window).click(function(e:any) {
        if ( !($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length ) ) {
          $('.input-popup-div').hide();
            $('.input-popup-div3').hide();
            $('.input-popup-div4').hide();

           
        }

    });
    });

    this.addCompany = this.fb.group({
      company_name: ['',Validators.required],
      full_name: ['',Validators.required],
      address: [''],
      city: [''],
      province: [''],
      contact_number: [''],
      post_code: [''],
      email: ['']
    });

    
    this.ticketForm = this.fb.group({
      customer_id:[''],
      approver_id: [''],
      project_id: ['', Validators.required],
      ticket_date: ['', Validators.required],
      description: ['', Validators.required],
      scheduled_date: [''],
      is_repeating: [''],
      range_start:[''],
      interval_between_truck:['',[Validators.min(0),Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
      number_of_trucks:['',[Validators.required,Validators.min(0)]],
      range_end:[''],
      rate_per_hour_to_tc:['',[Validators.required,Validators.min(0),Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
      ticket_truck_type:['',Validators.required],
      ticket_trailer_type:[''],
      first_truck_start_at:['',Validators.required],
      required_paper_ticket_id:[''],
      dispatches: this.fb.array([]),
      rounds: this.fb.array([]),
    });
    
    this.dispatchDriverForm = this.fb.group({
      trucking_company_id: [''],
      user_id:[''],
      driver_tickets: this.fb.array([]),
    });

    this.getVendorDispatchSettings();
  }


  onInviteTC(){
    this.inviteTCfull_nameError = '';
    this.inviteTCEmailError = '';

    if(this.inviteTCForm.get('full_name')?.value == ''){
      this.inviteTCfull_nameError  = "Full Name is required";
    }

    if(this.inviteTCForm.get('email')?.value == ''){
      this.inviteTCEmailError  = "Email is required";
    }

    if(!/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/.test(this.inviteTCForm.get('email')?.value) ){
      this.inviteTCEmailError = 'Enter a valid email i.e exampl@gmail.com';
      return;
    }



    if (this.inviteTCForm.invalid) {
      return;
    }
    this.is_loading_inv = true;

    const formData = new FormData();

    formData.append('full_name', this.inviteTCForm.get('full_name')?.value);
    formData.append('email', this.inviteTCForm.get('email')?.value);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
   
    this.trucking_service.inviteTruckingCompany(formData).subscribe(response=>{
      this.is_loading_inv= false;
      if (response && !response.status ) {
        if(response.message && response.message !=""){

          Swal.fire(

            {
              confirmButtonColor:'#17A1FA',
              title:
              `Error`,
              text:
              "Problem in inviting (Sending Email) Trucking Company."
            }
            ).then(() => {

            });
        }else{
          this.inviteTCEmailError = response.data.email ? response.data.email : '';
          this.inviteTCfull_nameError = response.data.full_name ? response.data.full_name : '';
          // this.is_loading_inv =false;
        }

        return;
      }else{

        this.inviteTCForm.reset();
        // this.getAllTCCompanies();
        // this.getMenuCounts();
        // this.is_loading_inv =false;
        Swal.fire(

          {
            confirmButtonColor:'#17A1FA',
            title:
            `Success`,
            text:
            `An invitation has been sent!`
          }).then(() => {
              $(".modal-backdrop").remove();
              $('#newInvTC').modal('toggle');
              $(this).closest('.input-popup-div').find('.input-popup-div4').hide();
          });

      }
    });

  }

  
  get driver_tickets(): FormArray {
    return this.dispatchDriverForm.controls["driver_tickets"] as FormArray;
  }

  parseInt(val:any){
    return parseInt(val.toString())
  }

  setDefault(event:any,type:any,record:any,idx:any=''){
    
    var val = record;
    if(event.target.chceked == false){
      val='';
    }
    switch (type) {
      case 'default_truck_type':
        if(!this.selected_truck_type ){
          this.ticketForm.get('ticket_truck_type')?.patchValue(record);
        }
        setTimeout(() => {
          $(".truck-type-div").hide()
        }, 300);
        break;
      case 'default_trailer_type':
        if(!this.selected_trailer_type){
          this.ticketForm.get('ticket_trailer_type')?.patchValue(record);
        }
        setTimeout(() => {
          $(".trailer-type-div").hide()
        }, 300);
        break;
      case 'default_vendor_id':
        if(this.dispatches.length<1 && !this.dispatches().at(idx).get('trucking_company_id')?.value){
          this.dispatches().at(idx).get('trucking_company_id')?.patchValue(record)
        }
        setTimeout(() => {
          $(".vendor-div").hide()
        }, 300);
        break;
      case 'default_cc_id':
        if(!this.selected_cc){
          this.ticketForm.get('customer')?.patchValue(record);
        }
        setTimeout(() => {
          $(".customer-div").hide()
        }, 300);
        break;
    }
    let data={user_id:this.user_id,action:'tc_dispatch_setting',value:val,type:type}
    // console.log(data)
    this.tc_dispatch_service.updateData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.tc_dispatch_setting = response.data;
        this.getOnlySettings();
      }
    }); 
  }

  getOnlySettings(){
    let data={user_id:this.user_id,action:'tc_dispatch_setting'}
    this.tc_dispatch_service.getSingleData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.tc_dispatch_setting = response.data;
      }
    });
  }
  getVendorDispatchSettings(){
    let data={user_id:this.user_id,action:'tc_dispatch_setting'}
    this.tc_dispatch_service.getSingleData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.tc_dispatch_setting = response.data;
        this.tc_ticket_no_data = response.ticket_no;
        this.getTCTrailers();
        this.getTCTrucks();
        this.getCCList();
        this.getVendors();
        
        if(this.project_id){
          this.getProjectDetail();
          this.getApprovers();
        }
      
        this.newRound();
        this.newDispatch();
      }else{
        this.tc_dispatch_setting = response.data;
        this.tc_ticket_no_data = response.ticket_no;
        this.getTCTrailers();
        this.getTCTrucks();
        this.getCCList();
        this.getVendors();
        
        if(this.project_id){
          this.getProjectDetail();
        
          this.getApprovers();
        }
        this.newRound();
        this.newDispatch();
      }
    });    
  }

  getVendorName(id:any){
    var name=  '';
    if(this.vendors_list ){
      this.vendors_list.map((item:any)=>{
        if(item.id == id){
          name = item.company_name;
        }
      })
      if(name ==''){
        if(this.user_id==id){
          name=this.loggedinUser.company_name;
        }
      }
    }
  
    return name;
  }
 
  dispatches(): FormArray {
    return this.ticketForm.get("dispatches") as FormArray
  }

  rounds(): FormArray {

    return this.ticketForm.get("rounds") as FormArray
  }

  addDispatch() { 
  
    if(this.tc_dispatch_setting?.default_vendor_id == this.user_id){
      return this.fb.group({
        trucking_company_id:[this.tc_dispatch_setting?.default_vendor_id,Validators.required],
        number_of_trucks:['',[Validators.required,Validators.min(0)]],
        rate_per_hour: [''],
      })
    }
    return this.fb.group({
      trucking_company_id:[this.tc_dispatch_setting?.default_vendor_id,Validators.required],
      number_of_trucks:['',[Validators.required,Validators.min(0)]],
      rate_per_hour: ['',[Validators.required,Validators.min(0),Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
    })
  }

  setRate(event:any){
    if(event.target.value){
      var datas = this.ticketForm.get('dispatches')?.value;
      if(datas?.dispatches && datas?.dispatches.length>0){
        var i =0;
        datas?.dispatches.map((item:any)=>{
         
          if(item.trucking_company_id != this.loggedinUser.id){
            
            this.dispatches().at(i).get('rate_per_hour')?.setValidators([Validators.max(event.target.value)]);     
            this.dispatches().at(i).get('rate_per_hour')?.updateValueAndValidity();

          }else{
            
            this.dispatches().at(i).get('rate_per_hour')?.clearValidators();            
            this.dispatches().at(i).get('rate_per_hour')?.updateValueAndValidity();
          }     
          i++;
        })
      }

      if(this.driver_dispatch_total>0 && this.ticketForm.get('rate_per_hour_to_tc')?.value && this.ticketForm.get('number_of_trucks')?.value && event.target.value){
        $("#assignDrivers").toggle('modal');
        this.driver_availability = [];
        this.addDriverTickets();
      }

      this.adjustDispatch();
    }
  }

  addRoundField(): FormGroup {
    return    this.fb.group({
      material_taken_out:[''],
      dump_site: ['']
    });
  }

  newRound() {
    // for(var i=0; i< this.default_rounds;i++){
      this.rounds().push(this.addRoundField());
    // }
  }
  
  copyRound(roundIdx:any){
      // console.log(this.ticket_truck_types_rounds(idx).at(roundIdx-1).value)
      let material_taken_out =this.rounds().at(roundIdx).get('material_taken_out')?.value;
      let dump_site =this.rounds().at(roundIdx).get('dump_site')?.value;
    
      this.rounds().push( 
        this.fb.group({
          material_taken_out:[material_taken_out],
          dump_site: [dump_site]
        })
      );
  }

  newDispatch() {
    this.dispatches().push(this.addDispatch());
  }

  getCCList(){
    let data={user_id:this.user_id,action:'all_construction_companies'}
    this.tc_dispatch_service.getAllData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.cc_lists = response.data;
        
      }
    });
  }

  getProjectDetail(){
    let data:any={user_id:this.user_id,action:'project'}
    data.is_tc_project = this.is_tc_project;
    data.project_id = this.project_id;
    this.tc_dispatch_service.getSingleData(data).subscribe(response => {
 
      if (response.status && response.data) {
        
        this.selected_project = response.data;
        // this.approvers_list = response.data?.approvers;
        if(this.selected_project.user){
          this.selected_cc = this.selected_project.user;
          console.log(" >>>> *** >>> ",  this.selected_cc );

          this.selected_cc_id = this.selected_cc?.id;
        }else{
          this.selected_cc= this.selected_project.construction_company ? this.selected_project.construction_company : this.selected_project.tc_construction_company ? this.selected_project.tc_construction_company:null;
          this.selected_cc_id = this.selected_cc?.id;
        }
       
        this.ticketForm.get('customer_id')?.patchValue(this.selected_cc_id);
        this.ticketForm.get('project_id')?.patchValue(this.project_id);
        if(response.data.project_trucks){

          this.truck_types = response.data?.project_trucks;
        }else{
          this.truck_types = [
            {
              name:'Single',
              rate:100
            },{
              name:'Tandem',
              rate:110
            },{
              name:'Tridem',
              rate:120
            },{
              name:'Quad-Axle',
              rate:140
            },
          ]
        }
        if(response.data.project_trailers){
          
          this.trailer_types = response.data?.project_trailers;
        }else{
          this.trailer_types = [
            {
              name:'Pony',
              rate:100
            },{
              name:'Tri Pony',
              rate:110
            },{
              name:'Quad (wagon)',
              rate:120
            },{
              name:'Transfer',
              rate:120
            },
          ]
        }
        
        this.dump_sites = response.data?.dump_sites;
        this.approvers_list?.map((item:any)=>{
          if(item.is_default=='YES' && !this.ticketForm.get('approver_id')?.value){
            this.ticketForm.get('approver_id')?.patchValue(item.id);
            this.selected_approver  = item;
          }
        })
        if(!this.selected_approver){
          this.ticketForm.get('approver_id')?.patchValue(this.loggedinUser.id);
          this.selected_approver  = this.loggedinUser;
        }
        this.truck_types && this.truck_types.map((item:any)=>{
          if(item.name== this.tc_dispatch_setting?.default_truck_type){
            this.selected_truck_type = item;
            this.ticketForm.get('ticket_truck_type')?.patchValue(item.name)
          }
        })
        this.trailer_types && this.trailer_types.map((item:any)=>{
          if(item.name== this.tc_dispatch_setting?.default_trailer_type){
            this.selected_trailer_type = item;
            this.ticketForm.get('ticket_trailer_type')?.patchValue(item.name)
            
          }
        })
     
      }
    });
  }

  getVendors(){
    let data={user_id:this.user_id,action:'all_tc_vendors'}
    this.tc_dispatch_service.getAllData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.vendors_list = response.data;
        setTimeout(() => {
          
        }, 400);
      }
    });
  }

  
  getApprovers(){
    let data={user_id:this.user_id,action:'all_tc_approvers'}
    this.tc_dispatch_service.getAllData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.approvers_list = response.data;
        setTimeout(() => {
          
        }, 400);
      }
    });
  }

  getTCDrivers(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id); 
    formData.append('is_pagination', 'false'); 
    formData.append('for_dispatch', 'YES'); 
    this.trucking_service.getTCDrivers(formData).subscribe(response=>{
      if(response.status && response.data){
        this.drivers_list = response.data;
        this.selected_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0].id : '';
        this.default_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0] : [];
        
      }else{  
        
      }
    })
  }

  getTCTrucks(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');    
    formData.append('type', 'truck');
    formData.append('dispatch_for', 'YES');
      
    this.trucking_service.getTCTrucks(formData).subscribe(response=>{
      if(response.status && response.data){
        this.trucks_list = response.data;
        this.selected_truck = this.trucks_list && this.trucks_list[0] ? this.trucks_list[0].id : '';
        
      }else{  
        
      }
    })
  }

  getTCTrailers(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');
    
    formData.append('dispatch_for', 'YES');
    formData.append('type', 'trailer');
      
    this.trucking_service.getTCTrucks(formData).subscribe(response=>{
      if(response.status && response.data){
        this.trailers_list = response.data;
       
      }else{  
        
      }
    })
  }

  setTruckType(truck_type:any){
    // this.truck_trailer_cust_rate = null;

    this.selected_truck_type = truck_type;

 
    let matchedd_truck:any;
    let matchedd_tailer:any;

    console.log("trailer name ", this.selected_trailer_type?.name );
    console.log("selected truck ",truck_type );
    if(this.selected_cc?.company_truck_trailers?.length > 0){
      this.selected_cc.company_truck_trailers.map((trck:any)=>{
        console.log("selected_truck_type >> truck name ", this.selected_truck_type.name );
        console.log("selected_cc << trck  name ", trck.name );
        if(trck.name ==  this.selected_truck_type.name   ){
          console.log("truck matcheeeddd !!!!!! truck ", this.selected_truck_type );
          matchedd_truck = trck;
          
          
        }
        // console.log(" trck  name ", trck.name );
        if(this.selected_trailer_type    ){
          if( trck.name ==  this.selected_trailer_type?.name   ){
            console.log("truck  matchedd_tailer ", this.selected_trailer_type );
            matchedd_tailer = trck; 
          }
        }
      })
    }
    
    console.log(" matchedd_tailer ", matchedd_tailer );
    console.log(" matchedd_truck ", matchedd_truck );
     


    let rate_total = 0;

    if (matchedd_truck && matchedd_tailer) {
       rate_total = Number(matchedd_truck.rate) + Number(matchedd_tailer.rate);
    } else if (matchedd_truck == null && matchedd_tailer) {
       rate_total = Number(matchedd_tailer.rate);
    } else if (matchedd_tailer == null && matchedd_truck) {
        rate_total = Number(matchedd_truck.rate);
    }

    if(rate_total != 0){
      this.ticketForm.get('rate_per_hour_to_tc')?.patchValue(rate_total);
    }     

        this.ticketForm.get('ticket_truck_type')?.patchValue(truck_type.name);
    setTimeout(() => {
      
      $(".truck-type-div").hide()
    }, 400);
  }

  setTrailerType(trailer_type:any){    
    let old = this.ticketForm.get('ticket_trailer_type')?.value;
    if(trailer_type!=''){
     
      this.selected_trailer_type = trailer_type;
      this.ticketForm.get('ticket_trailer_type')?.patchValue(trailer_type.name);


    let matchedd_truck:any;
    let matchedd_tailer:any;

     if(this.selected_cc?.company_truck_trailers?.length > 0){
       this.selected_cc.company_truck_trailers.map((trck:any)=>{
         
         if(this.selected_trailer_type    ){
           if( trck.name ==  this.selected_trailer_type?.name   ){
              matchedd_tailer = trck; 
           }
         }

         if(this.selected_truck_type    ){
           if(trck.name ==  this.selected_truck_type.name   ){
             matchedd_truck = trck; 
          }
         }
      })
    }
    let rate_total = 0;

    if (matchedd_truck && matchedd_tailer) {
      rate_total = Number(matchedd_truck.rate) + Number(matchedd_tailer.rate);
    } else if (matchedd_truck == null && matchedd_tailer) {
      rate_total = Number(matchedd_tailer.rate);
    } else if (matchedd_tailer == null && matchedd_truck) {
      rate_total = Number(matchedd_truck.rate);
    }
    if(rate_total != 0){
      this.ticketForm.get('rate_per_hour_to_tc')?.patchValue(rate_total);
    }

      setTimeout(() => {
        
        $(".trailer-type-div").hide()
      }, 400);
      
      
      
    }else{
      this.selected_trailer_type = null;
      this.ticketForm.get('ticket_trailer_type')?.patchValue('');

      let matchedd_truck:any;
    let matchedd_tailer:any;

     if(this.selected_cc?.company_truck_trailers?.length > 0){
       this.selected_cc.company_truck_trailers.map((trck:any)=>{
         
         if(this.selected_trailer_type    ){
           if( trck.name ==  this.selected_trailer_type?.name   ){
              matchedd_tailer = trck; 
           }
         }

         if(this.selected_truck_type    ){
           if(trck.name ==  this.selected_truck_type.name   ){
             matchedd_truck = trck; 
          }
         }
      })
    }

     


    let rate_total = 0;

    if (matchedd_truck && matchedd_tailer) {
      rate_total = Number(matchedd_truck.rate) + Number(matchedd_tailer.rate);
    } else if (matchedd_truck == null && matchedd_tailer) {
      rate_total = Number(matchedd_tailer.rate);
    } else if (matchedd_tailer == null && matchedd_truck) {
      rate_total = Number(matchedd_truck.rate);
    }

    if(rate_total != 0){
      this.ticketForm.get('rate_per_hour_to_tc')?.patchValue(rate_total);
    }
    
    setTimeout(() => {
      
      $(".trailer-type-div").hide()
    }, 400);
    
  }
  
}

setCC(cc:any){
  if(cc){
    
    this.selected_trailer_type = null;
    this.selected_truck_type = null;
    this.ticketForm.get('rate_per_hour_to_tc')?.patchValue('');

      this.selected_cc = cc;
      console.log(" >>>> ** >>> ",  this.selected_cc );
      this.selected_cc_id = cc.id;
      this.ticketForm.get('customer_id')?.patchValue(this.selected_cc_id);
       setTimeout(() => {
      
        $(".customer-div").hide()
      }, 400);
    }
  }


  setApprover(event:any){
    if(event.target.value){
      var appr = null;
      this.approvers_list.map((item:any)=>{
        if(item.id == event.target.value){
          appr = item;
        }
      })
      this.selected_approver = appr;
    }
  }

  setVendor(vendor:any,idx:any){
    if(vendor){
      this.selected_vendor = vendor;
      this.selected_vendor_id = vendor.id;
      this.dispatches().at(idx).get('trucking_company_id')?.patchValue(vendor.id);
      if(vendor.id == this.loggedinUser.id){
         this.dispatches().at(idx).get('rate_per_hour')?.clearValidators()
      }else{
         this.dispatches().at(idx).get('rate_per_hour')?.setValidators([Validators.required])
      }
   
      this.dispatches().at(idx).get('rate_per_hour')?.updateValueAndValidity();
      if(this.driver_dispatch_total>0 && this.dispatches().at(idx).get('number_of_trucks')?.value && this.ticketForm.get('rate_per_hour_to_tc')?.value && this.dispatches().at(idx).get('trucking_company_id')?.value && this.dispatches().at(idx).get('trucking_company_id')?.value == this.loggedinUser.id){
        this.driver_availability = []
        $("#assignDrivers").toggle('modal');
        this.addDriverTickets();
     
      }
      
      this.adjustDispatch()
      setTimeout(() => {
       
        $(".vendor-div").hide()
      }, 400);
    }
    
  }

  handleAddCompany(){
    // console.log(this.addCompany.value)
    if(this.addCompany.invalid){
      this.form_clicked=true;  
        return;
      }
      let data:any=this.addCompany.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = this.selected_project?.id; 
      data.action = 'tc_customer';

      this.is_loading_add='add_company';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          
          this.getCCList();
          this.addCompany.reset();
          $("#addCustomer").modal('hide')
        }else{

        }
      });
  }

  
  dateChange(event:any){
    
    this.calculateTotal();
  }

  calculateTotal(){
    let totalDays=this.getDaysBetween();

    
    if(totalDays>1){
      
      this.to_dispatch_total = (totalDays) * this.number_of_tickets;
    }else{
      this.to_dispatch_total = 1 * this.number_of_tickets;
    }
  }

  getDaysBetween(){
   
    let ticket_date= this.ticketForm.get('ticket_date')?.value;
    let date_1 = new Date( this.schedule_date_to);
    let date_2 = new Date( this.schedule_date_from);

    let difference = date_1.getTime() - date_2.getTime();
    let total_days= (difference / (1000 * 3600 * 24));
    console.log(total_days, this.schedule_date_from, this.schedule_date_to)
    if(ticket_date && ticket_date !==undefined && ticket_date !=null){
      let date_check = new Date( ticket_date);

      if(date_check.getTime() <= date_1.getTime() &&   date_check.getTime() >= date_2.getTime()){
        total_days = total_days+1;
      
      }else{
        total_days = total_days+2;
      
      }
    }else{
      total_days = total_days+1;
    }
    
    return total_days;
  }
  changeNumber2(event:any){
    
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addCompany.get('contact_number')?.patchValue(abc);
  }

  changeNumber(event:any){
    if(event.target.value<2){
      this.ticketForm.get('interval_between_truck')?.clearValidators()
    }else if(event.target.value>1){
      this.ticketForm.get('interval_between_truck')?.setValidators([Validators.required])
    }
 
    this.ticketForm.get('interval_between_truck')?.updateValueAndValidity();
    if(this.driver_dispatch_total>0 && this.ticketForm.get('number_of_trucks')?.value && this.ticketForm.get('rate_per_hour_to_tc')?.value ){

      this.driver_availability = []
      $("#assignDrivers").show('modal');
      this.addDriverTickets();
    }
    this.adjustDispatch()
  }
  formatPhoneNumber(input:any) {
        
    if(input.charAt(0) == '+'){
      // alert(input)
       input = input.substring(3, input.length);
       
    }
    input = input.replace(/\D/g,'');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0,10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if(size == 0){
            input = input;
    }else if(size < 4){
            input = '+1 ('+input;
    }else if(size < 7){
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6);
    }else{
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input; 
  }

  
  dateRangeCreated(event:any) {  
    console.log(event)
    var m = event[0].getMonth()+1;
    m= m<10 ? "0"+m:m;
    var d = event[0].getDate();
    d= d<10 ? "0"+d:d;
     this.schedule_date_from = event[0].getFullYear()+"-"+m+"-"+d;  
 
       var m = event[1].getMonth()+1;
    m= m<10 ? "0"+m:m;
    
    var d = event[1].getDate();
    d= d<10 ? "0"+d:d;
     this.schedule_date_to = event[1].getFullYear()+"-"+m+"-"+d;
     this.calculateTotal()
   }

   onSaveTicket(){
    this.form_clicked = true;
    this.projectError = '';
    this.approverError = '';
    this.companyError = '';
    this.ticketDateError = '';
    this.repeatError = '';
    this.descriptionError = '';
    let tz = environment.timeZone;
    var d = new Date(); 
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
  
    console.log('TC Ticket',this.ticketForm.value)
    console.log('Driver Tickets',this.dispatchDriverForm.value)
 
    if(this.ticketForm.get('project_id')?.value == ''){
      this.projectError  = "Please select Project.";
    }
    
    if(this.ticketForm.get('ticket_date')?.value == ''){
      this.ticketDateError  = "Please select Ticket Date.";
    }

    if(this.ticketForm.get('description')?.value == ''){
      this.descriptionError  = "Please enter description.";
    }

   

    if(new Date(this.ticketForm.get('ticket_date')?.value).getTime() < new Date(this.todayDate).getTime()  ){
      this.ticketDateError  = "Past Date is not allowed, min Date:"+this.todayDate;
      return;
    }

   
   
    if (this.ticketForm.invalid) {
      return;
    }
   
    if (this.dispatchDriverForm.invalid) {
      return;
    }

    if(!this.ticketForm.get('required_paper_ticket_id')?.value && this.ticketForm.get('approver_id')?.value == ''){
      Swal.fire({
        confirmButtonColor:'#17A1FA',
        title:'Warning',
        text:  
        'Approver is required!. If paper ticket is not set as mandatory.'
      });
      return;
    }
    var is_driver_ticket:boolean=false;
    let dispatches= this.ticketForm.get('dispatches')?.value ;
    let is_error = false;
    dispatches && dispatches.map((item:any)=>{
      if(item.trucking_company_id==this.loggedinUser.id){
        is_driver_ticket=true;
      }
      if(parseFloat(this.ticketForm.get('rate_per_hour_to_tc')?.value.toString()) < parseFloat(item?.rate_per_hour.toString())){
        is_error = true;
      }
    })

    if(is_error){
      return;
    }
    if(is_driver_ticket && this.driver_dispatch_total != this.driver_tickets.length){
      
      Swal.fire({
        confirmButtonColor:'#17A1FA',
        title:'Warning',
        text:  
        'Please fill all driver tickets.'
      });
      $("#assignDrivers").toggle('modal');
      return;
    }


    let data:any=this.ticketForm.value;
    if(this.selected_cc.trucking_company_id){
      data.is_tc_cc = 'YES';
    }else{
      data.is_tc_cc = 'NO';
    }
    
    if(this.selected_project.trucking_company_id){
      data.is_tc_project = 'YES';
    }else{
      data.is_tc_project = 'NO';
    }

    if(this.selected_approver && this.selected_approver.trucking_company_id){
      data.is_tc_approver = 'YES';
    }else{
      data.is_tc_approver = 'NO';
    }
    
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.driver_dispatches = this.dispatchDriverForm.value; 
    data.driver_dispatch_total = this.driver_dispatch_total;
    data.to_dispatch_total = this.to_dispatch_total;
    data.tc_ticket_no_data = this.tc_ticket_no_data;
    data.action = 'tc_ticket';

    this.is_loading_add='tc_ticket';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire({
          confirmButtonColor:'#17A1FA',
          title:'Success',
          text:  
          'Tickets dispatched!'
        });
        if(response.is_trial_started){
          window.location.href='/tc-ticket-listing';
        }
        this.router.navigateByUrl('/tc-ticket-listing');
      }else{
        Swal.fire({
          confirmButtonColor:'#17A1FA',
          title:'Error',
          text:  
          response.message
        });
      }
    });
    
   }

   ngAfterViewInit(): void {
  
    this.checkChanges();
    
  }

  checkChanges():void{
    
    this.ticketForm.valueChanges.subscribe(data=>{
      
      // console.log(data) 
     
      let total:any=0;
    
        total+=parseInt(data.number_of_trucks)>0 ? parseInt(data.number_of_trucks):0;
        
   
      this.number_of_tickets = total;
      if(this.number_of_tickets>0){
        // console.log(data.dispatches)   
        if(data.dispatches && data.dispatches.length>0 && this.ticketForm.dirty){
          var t_done= 0;
          var i=0;
          var tc_disp=0;
          data.dispatches.map((item:any)=>{
            if(item.trucking_company_id == this.loggedinUser.id && item.number_of_trucks>0){
              tc_disp=tc_disp+parseInt(item.number_of_trucks.toString());
            }
            if(t_done<this.number_of_tickets){
              
              t_done +=parseInt(item.number_of_trucks.toString());
  
            }else{
              this.dispatches().removeAt(i);
            }
           
            i++;
          })
         
          this.driver_dispatch_total = tc_disp;

          if(t_done < this.number_of_tickets){
            this.newDispatch();
          }else if(t_done > this.number_of_tickets){
            Swal.fire({
              confirmButtonColor:'#17A1FA',
              title:'Warning',
              text:  
              'Number of trucks for vendors cannot be more than the Customer`s trucks'
            })
          }
        }
      } 

      this.calculateTotal()
      
    })
  }

  
  setTruckNo(event:any,idx:any){
    if(event.target.value){
    
      this.dispatches().at(idx).get('number_of_trucks')?.patchValue(event.target.value)
     
      if(this.driver_dispatch_total>0 && this.ticketForm.get('number_of_trucks')?.value && this.ticketForm.get('rate_per_hour_to_tc')?.value && this.dispatches().at(idx).get('trucking_company_id')?.value && this.dispatches().at(idx).get('trucking_company_id')?.value == this.loggedinUser.id){
        this.driver_availability = []
        $("#assignDrivers").show('modal');
        this.addDriverTickets();
      }
      this.adjustDispatch()
    }
  }

  checkAvailable(type:any,item:any,idx:any){

    let available:boolean=true;
    let driver_form = this.dispatchDriverForm.value;
   
    if(driver_form && driver_form?.driver_tickets){
      switch (type) {
        case 'driver':
          driver_form?.driver_tickets.map((dt:any)=>{
            if(dt.driver_id == item.id){
              available=false;
            }
          })  
          break;
        case 'truck':
          driver_form?.driver_tickets.map((dt:any)=>{
            if(dt.truck_id == item.id){
              available=false;
            }
          })  
          break;
        case 'trailer':
          driver_form?.driver_tickets.map((dt:any)=>{
            if(dt.trailer_id == item.id){
              available=false;
            }
          })  
          break;
      
      }
    }
   
    return available;
  }

  closeAssignDriver(){
    $("#assignDrivers").toggle('modal');
  }

  
  addDriverTickets(){
    let  driver_hour_rate = '';
    
    var ticket_data = this.tc_ticket_no_data;
    var province_id = ticket_data.province_short;
    var state_wise_no = ticket_data.state_wise_no;
    let per:any = 0;    
    var ticket_rate = this.ticketForm.get('rate_per_hour_to_tc')?.value;
    this.driver_tickets.clear();
    this.driver_tickets.reset();

    var interval_between_truck = this.ticketForm.get('interval_between_truck')?.value;
    var first_truck_start_at = this.ticketForm.get('first_truck_start_at')?.value;
    var interval_hours = interval_between_truck;

    var ticket_date = this.ticketForm.get('ticket_date')?.value ? this.ticketForm.get('ticket_date')?.value : this.todayDate;
    var ticket_datetime:any= null;

    for(var i =0;i<this.driver_dispatch_total;i++){   
      if(i==0){
        ticket_datetime = ticket_date+' '+first_truck_start_at;
      }else{
        var endDate = new Date(ticket_datetime);
        endDate.setMinutes(endDate.getMinutes() + (interval_hours));
        ticket_datetime = this.datePipe.transform(endDate ,'yyyy-MM-dd hh:mm a');
        // console.log(ticket_datetime)
        
      }
      
      ticket_rate = this.parseInt(ticket_rate.toString());
      var new_ticket_no = '';
   
      var total = state_wise_no.toString().length;

      var to_zeros = 7 - total;
      for (var j= 0; j < to_zeros; j++) {
          new_ticket_no += '0';
      }

      new_ticket_no += state_wise_no.toString();

      if(this.drivers_list.length>0){
        this.drivers_list.map((driver:any)=>{
          var ava:any = null;
          this.driver_availability.map((ii:any)=>{
            if(ii.driver_id == driver.id && province_id.toString()+new_ticket_no == ii.ticket_id){
              ava = ii;
            }
          })
          if(ava){
            return ava?.is_available
          }else{
            let data = {
              driver_id : driver.id,
              ticket_datetime: ticket_datetime
        
            }
            this.trucking_service.isDriverAvailable(data).subscribe(response=>{
              if(response.status){
                // console.log(response,driver.id,ticket_datetime);
                if(response.current_job){
                
                  this.driver_availability.push({driver_id:driver.id,ticket_id:province_id.toString()+new_ticket_no,current_job:response.current_job,is_available:false})
                }else{
                  
                  this.driver_availability.push({driver_id:driver.id,ticket_id:province_id.toString()+new_ticket_no,current_job:response.current_job,is_available:true})
                 
                }
              }
            })
          }
         
        })
       }else{
        const formData = new FormData();
        formData.append('user_id', this.loggedinUser.id); 
        formData.append('is_pagination', 'false'); 
        formData.append('for_dispatch', 'YES'); 
        this.trucking_service.getTCDrivers(formData).subscribe(response=>{
          if(response.status && response.data){
            this.drivers_list = response.data;
            this.drivers_list.map((driver:any)=>{
              var ava:any = null;
              this.driver_availability.map((ii:any)=>{
                if(ii.driver_id == driver.id && province_id.toString()+new_ticket_no == ii.ticket_id){
                  ava = ii;
                }
              })
              if(ava){
                return ava?.is_available
              }else{
                let data = {
                  driver_id : driver.id,
                  ticket_datetime: ticket_datetime
            
                }
                this.trucking_service.isDriverAvailable(data).subscribe(response=>{
                  if(response.status){
                    // console.log(response,driver.id,ticket_datetime);
                    if(response.current_job){
                    
                      this.driver_availability.push({driver_id:driver.id,ticket_id:province_id.toString()+new_ticket_no,current_job:response.current_job,is_available:false})
                    }else{
                      
                      this.driver_availability.push({driver_id:driver.id,ticket_id:province_id.toString()+new_ticket_no,current_job:response.current_job,is_available:true})
                     
                    }
                  }
                })
              }
             
            })
            
          }else{  
            
          }
        })
   
       }
     
      this.driver_tickets.push(
        this.fb.group({
          ticket_no: [province_id.toString()+new_ticket_no],          
          ticket_state_wise_no: [state_wise_no],
          driver_id:['',Validators.required],
          truck_id:['', Validators.required],  
          ticket_rate:[ticket_rate],        
          trailer_id:[''],
          perc:[per.toFixed(2)],
          rates:[driver_hour_rate, [Validators.required, Validators.max(ticket_rate),Validators.min(0),Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
          driver:[''],
          trailer:[''],
          truck:[''],
        })
      );  
    
         
      state_wise_no = state_wise_no+1;
        
    }
   
  }

  getDriverAvailable(ticket_id:any, driver:any){
    
    var is_available =false;
    var ava:any = null;
    this.driver_availability.map((i:any)=>{
      // console.log(i.driver_id +''+driver.id+' && '+ticket_id+' == '+i.ticket_id)
      if(i.driver_id == driver.id ){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }

    return is_available;

    
  }
  
  getTruckAvailable(index:any, truck:any){
    var ticket_id = this.driver_tickets.at(index)?.get('ticket_id')?.value;
    var driver_id = this.driver_tickets.at(index)?.get('driver_id')?.value;
    
  
    var is_available =false;
    var ava:any = null;
    this.truck_availability.map((i:any)=>{
      // console.log(i.truck_id +''+truck.id+' && '+ticket_id+' == '+i.ticket_id)
      if((i.truck_id == truck.id && ticket_id == i.ticket_id) ){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }

    return is_available;

    
  }


  getTrailerAvailable(index:any, trailer:any){
    var ticket_id = this.driver_tickets.at(index)?.get('ticket_id')?.value;
    var driver_id = this.driver_tickets.at(index)?.get('driver_id')?.value;
    
  
    var is_available =false;
    var ava:any = null;
    this.trailer_availability.map((i:any)=>{
      // console.log(i.trailer_id +''+trailer.id+' && '+ticket_id+' == '+i.ticket_id)
      if((i.trailer_id == trailer.id && ticket_id == i.ticket_id) ){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }


    return is_available;

    
  }
  
  setTruck(idx:any,truck:any,ticket_id:any){
    if(truck && truck.id){
      this.driver_tickets.at(idx).get('truck_id')?.patchValue(truck.id);
      this.driver_tickets.at(idx).get('truck')?.patchValue(truck);
    }else{
      this.driver_tickets.at(idx).get('truck_id')?.patchValue('');
      this.driver_tickets.at(idx).get('truck')?.patchValue('');
    }

    setTimeout(() => {
      $(".truck-div").hide();
     }, 300);
  }

  setTrailer(idx:any,trailer:any,ticket_id:any){
    if(trailer && trailer.id){
      this.driver_tickets.at(idx).get('trailer_id')?.patchValue(trailer.id);
      this.driver_tickets.at(idx).get('trailer')?.patchValue(trailer);
    }else{
      this.driver_tickets.at(idx).get('trailer_id')?.patchValue('');
      this.driver_tickets.at(idx).get('trailer')?.patchValue('');
    }

    setTimeout(() => {
      $(".trailer-div").hide();
     }, 300);
  }

  setDriver(index:any,driver:any,ticket_id:any){
    if(driver && driver.id){
      let driver_id =  driver.id;
      this.driver_tickets.at(index).get('driver_id')?.patchValue(driver_id);
      var driver:any = null;
      this.drivers_list.map((item:any)=>{
        if(driver_id == item.id){
          driver = item;
          this.default_driver = item;
          this.driver_tickets.at(index).get('driver')?.patchValue(item);
        }
      })

      let  driver_hour_rate = '';
      this.default_driver?.sub_users.map((item:any)=>{
      
        if(item.parent_user_id == this.user_id ){
          if(item.driver_hour_rate){
            driver_hour_rate = item?.driver_hour_rate;

          }
        }
        
      });
      
      let ticket_rate:any = this.driver_tickets.at(index).get('ticket_rate')?.value;
     
      if(driver?.role_id ==6||driver?.role_id==6){
        driver_hour_rate = ticket_rate;
      }
      
      if(driver_hour_rate && driver_hour_rate !==''){

        this.driver_tickets.at(index).get('rates')?.patchValue(driver_hour_rate);
      }else{
        this.driver_tickets.at(index).get('rates')?.patchValue('');
      }
      
      if(driver.default_truck_id && driver.default_truck_id !==''){

        this.trucks_list.map((item:any)=>{
          
          if(this.ticketForm.get('ticket_truck_type')?.value && item.id==driver.default_truck_id && item?.truck_type==this.ticketForm.get('ticket_truck_type')?.value ){
            if(this.checkAvailable('truck',item,index) ){
            this.driver_tickets.at(index).get('truck')?.patchValue(item);
            this.driver_tickets.at(index).get('truck_id')?.patchValue(driver.default_truck_id);
            }
       
          }else if(!this.ticketForm.get('ticket_truck_type')?.value && item.id==driver.default_truck_id){
            if(this.checkAvailable('truck',item,index) ){
            this.driver_tickets.at(index).get('truck')?.patchValue(item);
            this.driver_tickets.at(index).get('truck_id')?.patchValue(driver.default_truck_id);
            }
          }
        })
      }else{

        this.driver_tickets.at(index).get('truck_id')?.patchValue('');
        this.driver_tickets.at(index).get('truck')?.patchValue('');
      }

      if(this.selected_trailer_type){

        if(driver.default_trailer_id && driver.default_trailer_id !==''){
          this.trailers_list.map((item:any)=>{
          
            if(item.id==driver.default_trailer_id && item?.trailer_type==this.ticketForm.get('ticket_trailer_type')?.value){
              if(this.checkAvailable('trailer',item,index) ){
              this.driver_tickets.at(index).get('trailer')?.patchValue(item);
              this.driver_tickets.at(index).get('trailer_id')?.patchValue(driver.default_trailer_id);
              }

            }else if(!this.ticketForm.get('ticket_trailer_type')?.value && item.id==driver.default_trailer_id ){
              if(this.checkAvailable('trailer',item,index) ){
              this.driver_tickets.at(index).get('trailer')?.patchValue(item);
              this.driver_tickets.at(index).get('trailer_id')?.patchValue(driver.default_trailer_id);
              }
            }
          })
         
        }else{
  
          this.driver_tickets.at(index).get('trailer_id')?.patchValue('');
          this.driver_tickets.at(index).get('trailer')?.patchValue('');
        }
      }else{
  
        this.driver_tickets.at(index).get('trailer_id')?.patchValue('');
        this.driver_tickets.at(index).get('trailer')?.patchValue('');
      }   

      let per:any = 0;
   
      if(driver_hour_rate && driver_hour_rate !=''  && parseFloat(ticket_rate)>0){
        per = parseFloat(driver_hour_rate) / parseFloat(ticket_rate) *100;
      }

      if(per ){

        this.driver_tickets.at(index).get('perc')?.patchValue(per.toFixed(2));
      }else{

        this.driver_tickets.at(index).get('perc')?.patchValue(0);
      }
      this.driver_tickets.at(index).get('rates')?.setValidators(Validators.max(ticket_rate));
      this.driver_tickets.at(index).get('rates')?.updateValueAndValidity();
      this.driver_tickets.at(index).get('ticket_rate')?.patchValue(ticket_rate);
     
      
    }else{
        this.driver_tickets.at(index).get('rates')?.patchValue('');
        this.driver_tickets.at(index).get('perc')?.patchValue(0);
    }
    setTimeout(() => {
      $(".driver-div").hide();
     }, 300);
  }

  changeRate(event:any,index:any){
    if(event.target.value){
     
      let per:any = 0;
      let driver_rate:any = parseFloat(event.target.value);
      let ticket_rate:any = parseFloat( this.driver_tickets.at(index).get('ticket_rate')?.value);
      // console.log(this.dispatchDriverForm.get('driver_tickets')?.value);
      if(driver_rate && ticket_rate>0){
        per = parseFloat(driver_rate) / parseFloat(ticket_rate) *100;
        this.driver_tickets.at(index).get('perc')?.patchValue(per.toFixed(2));
      }
    }else{
      this.driver_tickets.at(index).get('perc')?.patchValue(0);
    }

  }

  onDriverDispatch(){
    this.form_clicked_driver = true;
  
    let data:any = this.dispatchDriverForm.value;
    var i = 0;
    var is_error:boolean=false
    data?.driver_tickets.map((item:any)=>{
      if(item.rates==''){
        this.error[i] = 'Driver rate is required';
        is_error = true;
      }
      i++;
    })
    if(this.dispatchDriverForm.invalid || is_error){
      this.is_driver_form_error = true;
      this.is_driver_form_error2 = true;

      return;
    }

    this.is_driver_form_error2 = false;

    this.adjustDispatch()
    $("#assignDrivers").toggle('modal');
    
  }
  checkDriversError(){
  
    let data:any = this.dispatchDriverForm.value;
    var i = 0;
    var is_error:boolean=false
    data?.driver_tickets.map((item:any)=>{
      console.log('item : ', item)
      if(item.rates==''){
        
        is_error = true;
      }
      i++;
    })
    if(this.dispatchDriverForm.invalid || is_error){
      this.is_driver_form_error2 = true;
      return;
    }
    
  }

  adjustDispatch(){
     var datas = this.ticketForm.get('dispatches')?.value;
    // console.log(this.dispatches().controls)
      if(datas?.dispatches && datas?.dispatches.length>0){
        var i =0;
        datas?.dispatches.map((item:any)=>{
         
          if(item.trucking_company_id != this.loggedinUser.id){
            
            this.dispatches().at(i).get('rate_per_hour')?.setValidators([Validators.required]);     
            this.dispatches().at(i).get('rate_per_hour')?.updateValueAndValidity();

          }else{
            
            this.dispatches().at(i).get('rate_per_hour')?.clearValidators();            
            this.dispatches().at(i).get('rate_per_hour')?.updateValueAndValidity();
          }     
          i++;
        })
      }   
  } 
}
