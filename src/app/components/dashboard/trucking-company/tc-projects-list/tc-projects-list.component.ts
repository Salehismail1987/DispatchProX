import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { TruckingDispatchService } from 'src/app/services/trucking-dispatch.service';
import { ContactService } from 'src/app/services/contact.service';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-tc-projects-list',
  templateUrl: './tc-projects-list.component.html',
  styleUrls: ['./tc-projects-list.component.css']
})
export class TcProjectsListComponent implements OnInit {

  loggedinUser: any = {};
  user_id:any;
  edit_cc:any;
  show_edit_cc:boolean=false;
  help_page:boolean=false;
  active_menu:any;
  show_edit_project:boolean=false;
  cc_lists:any = null;
  appr_lists:any = null;
  projects_list:any = null;
  selected_cc:any=null;
  selected_project:any=null;
  sort_by:any=null;
  search_by:any=null;
  addressError: string = '';
  cityError: string  = '';
  countryError:string='';
  country:any='Canada';
  provinceError: string = '';
   province:string='';
  edit_add_approver:boolean=false;
  edit_add_dumpsite:boolean=false;
  form_clicked:boolean=false;
  canada_provinces:any=[];  
  usa_provinces:any=[];
  is_loading_add:string='';
  address_error:any='';
  dumpsite_name_error:any='';
  is_loading:boolean= false;

  set_cc:any=null;
  set_appr:any=null;

  to_show_id:any=null;

  addApprover!: FormGroup;
  addCompany!: FormGroup;
  addDumpSite!: FormGroup;
  addProject!: FormGroup;
  updateProject!: FormGroup;
  editProject!: FormGroup;
  editCCForm!: FormGroup;

  show_edit_dump:any='';
  show_edit_approver:any='';

  full_address:any='';
  show_edit_cc_address:any=false;
  active_cc:any='company';
  cc_country:any = '';
  cc_province:any = '';
  cc_street:any = '';
  cc_postcode:any = '';
  cc_city:any = '';

  newDSNameError:any = '';
  newDSAddressError:any = '';

  editDSNameError:any='';
  editDSAddressError:any = '';

  show_new_ds_modal:boolean=false;
  edit_ds:any=null;
  set_role:any=null;
  name_error:any=null;
  email_error:any=null;
  edit_contact:any=null;

  constructor(
    private aRouter:ActivatedRoute,
    private contact_service: ContactService,
    private router:Router,
    private fb: FormBuilder,
    private tc_dispatch_service:TruckingDispatchService,
    private trucking_company_service:TruckingCompanyService
  ) {     
    this.active_menu = {
      parent:'company-projects',
      child:'company-projects',
      count_badge: '',
    };
    this.canada_provinces=[
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "NewFoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon"
    ];

    this.usa_provinces=[
      "Alaska AK",
      " Alabama	AL",
      "Arizona AZ",
      "Arkansas AR",
      "California CA",
      "Colorado CO",
      "Connecticut CT",
      "Delaware DE",
      "Florida FL",
      "Georgia GA",
      "Hawaii HI",
      "Idaho iD",
      "Illinois IL",
      "Indiana IN",
      "Iowa IA",
      "Kansas KS",
      "Kentucky KY",
      "Louisiana LA",
      "Maine ME",
      "Maryland MD",
      "Massachusetts MA",
      "Michigan MI",
      "Minnesota MN",
      "Montana	MT",
      "Nebraska NE",
      "Nevada NV",
      "New Hampshire NH",
      "New Jersey NJ",
      "New Mexico NM",
      "New York NY",
      "North Carolina NC",
      "North Dakota ND",
      "Ohio OH",
      "Oklahoma OK",
      "Oregon OR",
      "Pennsylvania[D] PA",
      "Rhode Island RI",
      "South Carolina SC",
      "South Dakota SD",
      "Tennessee TN",
      "Texas TX",
      "Utah UT",
      "Vermont VT",
      "Virginia[D] VA",
      "Washington WA",
      "West Virginia WV",
      "Wisconsin WI",
      "Wyoming WY",
    ];

    
  }

  ngOnInit(): void {
      
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      } else {
      this.router.navigate(['/home']);
    }

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    $(document).on('click', '.getinputfield',function(this:any) {
      $('.input-popup-div').hide();
      $(this).find('.input-popup-div').show();
    });
    $(document).on('click','.getinputfield2', function(this:any) {
        $('.input-popup-div2').hide();
        $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });
   
    
    $(document).on('mouseover','.projects-list-table > tbody > tr', function(this:any) {
     
      $('.projects-list-table > tbody > tr').removeClass('active');
      $(this).addClass('active');
   });

   $(document).on('click','.getinputfield3' ,function(this:any) {
    $('.input-popup-div3').hide();
    $(this).find('.input-popup-div3').show();
    // console.log("cshhh3")

  });
  $(document).on('click', '.input-popup-div3', function(e:any) {
    e.stopPropagation();  // Correctly stop event propagation
  }); 



    $(window).click(function(e:any) {
        if ( !($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length ) ) {
            // if($(e.target).closest('.edit_project').length<1 && $(".edit_project:visible").length){
            //   $('.edit_project').hide();
            // }else if($(e.target).closest('.edit_project').length>0 ){
             
            //   $('.edit_project').show();
            // }
            $('.input-popup-div').hide();
            $('.input-popup-div2').hide();
           
        }

        if (!($(e.target).hasClass('getinputfield3') || $(e.target).closest('.getinputfield3').length )) {
          $('.input-popup-div3').hide();
          // console.log("closinggg3")
      }



    });
    

    this.getData();


    this.addApprover = this.fb.group({
      full_name: ['', Validators.required],
      contact_number: [''],
      email: ['', Validators.required],
    });

    this.addDumpSite = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      is_default: [''],
    });

    this.editProject = this.fb.group({
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      project_id: ['', Validators.required],
    })

    this.editCCForm= this.fb.group({
      city: [''],
      street: [''],
      state: [''],
      country:[''],
      postcode:[''],
      wsbc_no: ['' ],
      business_no: [''],
      cc_id: [''],
    })

    this.addProject = this.fb.group({
      construction_company_id: ['', Validators.required],
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      state: ['', Validators.required],
      is_default: [''],
      dumpsite_name: [''],
      location: [''],
      approver_id: [''],
      email: [''],
      contact_number: [''],
    });

    this.updateProject =  this.fb.group({
      approvers:  this.fb.array([]),
      state: [''],
    });

    this.addCompany = this.fb.group({
      company_name: ['',Validators.required]
    });
  }

  setCountry(event:any){
    if(event.target.value){
      this.country = event.target.value;
    }
  }
  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    console.log(" im called ", modal)
    if (modal) {
      modal.style.display = 'none';
    }
    this.show_edit_cc_address=false;
  }
  setSortBy(sortBy:any){
    if(sortBy){
      $('.input-popup-div3').hide();

      
      this.sort_by = sortBy;
      setTimeout(() => {
        
      $(".add-comp").hide();
      }, 700);
      this.getData();
      return;
    }
    $('.input-popup-div3').hide();

    this.sort_by = 'recently_added';
    this.getData();
  }


  searchBy(search_by:any){
    if(search_by){
      this.search_by = search_by;
      
      // this.getAllTCCompanies();
      this.getData();
      return;
    }
    this.search_by = '';
    // this.getAllTCCompanies();
    this.getData();
  }


  toShow(id:any){
    if(this.to_show_id == id){
      this.to_show_id=null
    }else{
      this.to_show_id=id;
    }
  }
  helpPage( flag =1){
    if(flag == 2){
      this.help_page=false;
      return;
    }
    else{
      if(this.help_page){
        this.help_page=false;
      }else{
        this.help_page=true;
      }
      
    }

  }

  setCC(cc:any){
    this.set_cc = cc;
    this.addProject.get('construction_company_id')?.patchValue(cc.id);
     setTimeout(() => {
      $('.add-comp').hide()
    }, 600);
  }

  viewCC(cc:any){
    
    this.name_error = '';
    this.email_error='';
    
    $(".modal-edit-contact").hide();
    $(".modal-add-contact").hide();
    $(".modal-edit-dumpsite").hide();
    $(".modal-add-dumpsite").hide();

    this.show_edit_cc_address =false;
    this.edit_cc= cc;
    let full_address:any = '';
    full_address += cc?.address ? cc?.address:'';
    full_address += cc?.city ? ( full_address !='' ? ', ':'')+ cc?.city:'';
    full_address += cc?.province ? ( full_address !='' ? ', ':'')+ cc?.province:(
      cc?.customer?.province ? ( full_address !='' ? ', ':'')+cc?.customer?.province: ''
    );
    full_address += cc?.post_code ? ( full_address !='' ? ', ':'')+ cc?.post_code:'';
    full_address += cc?.country ? ( full_address !='' ? ', ':'')+ cc?.country:(
      cc?.customer?.country ? ( full_address !='' ? ', ':'')+cc?.customer?.country: ''
    );

   
      this.full_address = full_address;
    this.show_edit_cc=false;
    this.editCCForm.get('cc_id')?.patchValue(this.edit_cc?.id)
    $("#edit_cc").modal('show');
  }

  setEditAddress(cc:any){
    
    setTimeout(() => {
      this.cc_street= ((cc?.address ? cc?.address:''));
    
   this.cc_country = (cc?.country ?  cc?.country:'');
    
   this.cc_province= (
      cc?.province ?  cc?.province:(
        cc?.customer?.province ? cc?.customer?.province: ''
      )
    );
    this.cc_country = cc?.country ?  cc?.country:'Canada';
    this.cc_province = (
      cc?.province ?  cc?.province:(
        cc?.customer?.province ? cc?.customer?.province: 'British Columbia'
      )
    );
    this.cc_postcode = (cc?.post_code ?  cc?.post_code:'');

   
     this.cc_city =  cc?.city ?  cc?.city:''
    

    this.show_edit_cc_address =true;
    }, 1000);
   
  }

  setCCCountry(event:any){
    if(event.target.value){
      this.cc_country =event.target.value;
    }
  }

  setCCProvince(event:any){
    if(event.target.value){
      this.cc_province =event.target.value;
    }
  }
  setAppr(appr:any){
    this.set_appr = appr;
    this.addProject.get('approver_id')?.patchValue(appr.id);
    this.addProject.get('email')?.patchValue(appr.email);
    this.addProject.get('contact_number')?.patchValue(appr.contact_number);
    setTimeout(() => {
      $('.job-appr').hide()
    }, 600);
  }

  setDefaultAddProj(event:any){
    if(event.target.checked){
      this.addProject.get('is_default')?.patchValue('YES')
    }else{
      this.addProject.get('is_default')?.patchValue('NO')
    }
  }

  getData(){
    let data={user_id:this.user_id,action:'all_construction_companies'}
    this.tc_dispatch_service.getAllData(data).subscribe(response => {
 
      if (response.status && response.data) {
        this.cc_lists = response.data;
        
      }
    });
    let data2={user_id:this.user_id,action:'all_tc_approvers'}
    this.tc_dispatch_service.getAllData(data2).subscribe(response => {
 
      if (response.status && response.data) {
        this.appr_lists = response.data;

      }
    });
    

    let data22={user_id:this.user_id,action:'tc_projects',sort_by:this.sort_by,search_by:this.search_by}
    this.tc_dispatch_service.getAllData(data22).subscribe(response => {
 
      if (response.status && response.data) {
        this.projects_list = response.data;
        if(this.edit_cc){
          response.data.map((item:any)=>{
            if(item.id == this.edit_cc?.id){
              this.edit_cc = null;
              $("#edit_cc").modal('hide')
              this.edit_cc =item;
              setTimeout(() => {
                
              $("#edit_cc").modal('show')
              }, 300);
            }
          });
         
        }
        if(this.selected_cc){
          
          response.data.map((item:any)=>{
            if(item.id == this.selected_cc.id){
              this.selected_cc = item;
            }
          
            if(this.selected_project){
              item.projects.map((item2:any)=>{
                if(item2.id == this.selected_project.id && (item2.trucking_company_id == this.selected_project.trucking_company_id || item2.user_id == this.selected_project.user_id)){
                  this.selected_project = item2;
                  this.addApprovers(this.selected_project);
                }
              });
            }
          })
        }
      }
    });
  }

  setActive(it:any){
    if(it){

      this.active_cc = it;
    }
  }

  get approvers(): FormArray {
    return this.updateProject.controls["approvers"] as FormArray;
  }

  addApprovers(project:any){
    this.approvers.reset();
    this.approvers.clear();
    project?.approvers.map((item:any)=>{
      this.approvers.push(
        this.fb.group({
          approver_id: [item.id],
          approver_email:[item.email],
          approver_is_default:[item.is_default],
          is_tc_approver:[item.trucking_company_id ? 'YES':"NO"]
        })
      );
    })
  
  }

  setDefault(event:any,idx:any){
    if(event.target.checked){

      this.approvers.at(idx).get('approver_is_default')?.patchValue('YES');
    }else{

      this.approvers.at(idx).get('approver_is_default')?.patchValue('NO');
    }
  }

  showHideApproverEdit(i:any){
    if($("#approver_email_"+i).prop('type') == 'text'){
      $("#approver_email_"+i).attr('type','hidden')
      $("#approver_is_default_"+i).prop('disabled',true)
      $(".label_email_"+i).show();
    }else{

      $("#approver_email_"+i).attr('type','text')
      $("#approver_is_default_"+i).prop('disabled',false)
      $(".label_email_"+i).hide();
    }
  }

  toggleState(){
    $(".label_state").toggle();
    $(".select_state").toggle();
  }

  showEditAddAppr(){
    this.edit_add_approver = !this.edit_add_approver;
    
    this.edit_add_dumpsite = false;
  }

  
  hideEditAddAppr(){
    this.edit_add_approver = false;
  }

  showEditCC(){
    this.show_edit_cc = !this.show_edit_cc;
    this.editCCForm.get('cc_id')?.patchValue(this.edit_cc?.id);
    this.editCCForm.get('city')?.patchValue(this.edit_cc?.city? this.edit_cc?.city:this.edit_cc?.customer?.city);
    this.editCCForm.get('street')?.patchValue(this.edit_cc?.address? this.edit_cc?.address:this.edit_cc?.customer?.address);
    this.editCCForm.get('wsbc_no')?.patchValue(this.edit_cc?.wsbc_no? this.edit_cc?.wsbc_no:this.edit_cc?.customer?.wsbc_no);
    this.editCCForm.get('business_no')?.patchValue(this.edit_cc?.business_no? this.edit_cc?.business_no:this.edit_cc?.customer?.business_no);

    this.editCCForm.get('state')?.patchValue(this.edit_cc?.province? this.edit_cc?.province: this.edit_cc?.customer?.province)
  }

  hideEditCC(){
    this.show_edit_cc = false;
  }

  onEditCC(){
  
    if(this.editCCForm.invalid){
      this.form_clicked=true;  
        return;
      }
      let data:any=this.editCCForm.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      if(this.edit_cc?.open_paper_ticket_photo){
        data.is_tc_cc = 'NO';
      }else{
        data.is_tc_cc = 'YES';
      }

      data.action = 'edit_cc';

      this.is_loading_add='edit_cc';
      this.tc_dispatch_service.updateData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  
            response.message
          })
          this.getData();
          // this.editCCForm.reset();
          // this.show_edit_cc=false;
          setTimeout(() => {
            
       
          }, 600);
        }
      });
      console.log(data);
  }
  
  showEditAddDump(){
    this.edit_add_dumpsite = !this.edit_add_dumpsite;
    this.edit_add_approver = false;
  }
  hideEditAddDump(){
    this.edit_add_dumpsite = false;
  }

  setEditCC(cc:any,project:any){
    this.show_edit_dump='';
    this.show_edit_approver ='';
    this.show_edit_project=false;
    this.selected_cc = cc;
    this.selected_project = project;
    this.addApprovers(this.selected_project);
  }

  setDefaultAppr(event:any, id:any){
    if(event.target.checked){
      $("#approver_is_default"+id).val("YES");
    }else{

      $("#approver_is_default"+id).val("NO");
    }
  }
  onAddApprover(){
    if(this.addApprover.invalid){
      this.form_clicked=true;  
        return;
      }
      let data:any=this.addApprover.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = this.selected_project?.id; 
      data.is_tc_project = this.selected_project?.trucking_company_id ? 'YES' : 'NO';
      data.action = 'tc_approver';

      this.is_loading_add='approver';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          
          this.getData();
          this.addApprover.reset();
          this.edit_add_approver=false;
          setTimeout(() => {
            $('.job-appr').hide()
          }, 600);
        }
      });

  }

  handleAddCompany(){
    console.log(this.addCompany.value)
    if(this.addCompany.invalid){
      this.form_clicked=true;  
        return;
      }
      let data:any=this.addCompany.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = this.selected_project?.id; 
      data.action = 'tc_company';

      this.is_loading_add='add_company';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          
          this.getData();
          this.addCompany.reset();
        }else{

        }
      });
  }

  handleAddProject(){
    
    if(this.addProject.invalid){
      this.form_clicked=true;  
        return;
      }
      let data:any=this.addProject.value;
      
      if(this.set_cc.trucking_company_id){
        data.construction_company_id = null;
        data.tc_construction_company_id = this.set_cc.id;
      }else{
        data.construction_company_id = this.set_cc.id;
        data.tc_construction_company_id = null;
      }

      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = ''; 
      data.action = 'tc_project';

      this.is_loading_add='add_project';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          
          this.getData();
          this.addProject.reset();
          
          $("#add_project").modal('hide')
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  
            response.message
          })
        }else{
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  
            response.message
          })
        }
      });
  }

  onAddDumpsite(){
    
    this.dumpsite_name_error='';
    this.address_error='';
    if(this.addDumpSite.get('name')?.value ==''){
      this.dumpsite_name_error = 'Name is required'
    }
    if(this.addDumpSite.get('address')?.value ==''){
      this.address_error = 'Address is required'
    }
    if(this.addDumpSite.invalid){
      this.form_clicked=true;  
      return;
    }
      let data:any=this.addDumpSite.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = this.selected_project?.id; 
      data.action = 'tc_dumpsite';
      data.is_tc_project = this.selected_project?.trucking_company_id ? 'YES' : 'NO';
      this.is_loading_add='dumpsite';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
         
          this.getData();
          this.addDumpSite.reset();
          this.edit_add_dumpsite=false;
        }
      });

  }

  handleUpdateProject(){
    console.log(this.updateProject.value)

    this.form_clicked=true;  
    
    let data:any=this.updateProject.value;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.project_id = this.selected_project?.id; 
    data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_project';

    this.is_loading_add='update_project';
    this.tc_dispatch_service.updateData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.updateProject.reset();
        this.approvers.reset();
        this.approvers.clear();
        this.getData();
      }
    });
  }

  changeNumber3(event:any){
    
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addApprover.get('contact_number')?.patchValue(abc);
  }

  changeNumber2(event:any){
    
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addApprover.get('contact_number')?.patchValue(abc);
  }

  changeNumber4(event:any,id:any){
    
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    $("#"+id).val(abc);
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

  hideButton(){
    setTimeout(() => {
      
    $(".confirm").hide()
    }, 1000);
  }

  handleDelete(project:any){
    setTimeout(() => {
      
      $(".confirm").hide()
      }, 1000);
    this.form_clicked=true;  
    
    let data:any={};
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.project_id = project?.id; 
    data.is_tc_project = project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_project';

    this.is_loading_add='delete_project';
    this.tc_dispatch_service.deleteData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        $("#view_project").modal('hide')
        this.selected_project = null;
        this.selected_cc = null;
        this.getData();
      }else{
        if(response?.is_already=='YES'){
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Cannot remove the project',
            text:  
           "Project has ticket(s) dispatched or uninvoiced."
          })
        }else{
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  
            response.message
          })
        }
      
      }
    });
  }

  createDispatch(proj:any){
    
    // $("#view_project").modal('hide')
    var is_tc_dispatch = proj.trucking_company_id ? 'YES':'NO';
    this.router.navigateByUrl('tc-dispatch-new/'+proj.id+'-'+is_tc_dispatch)
  }

  toggleEditDS(id:any){
    if(id && this.show_edit_dump==''){
      this.show_edit_dump =id;
    }else{
      this.show_edit_dump ='';
    }
  } 

  toggleEditApprover(id:any){
    if(id && this.show_edit_approver==''){
      this.show_edit_approver =id;
    }else{
      this.show_edit_approver ='';
    }
  }

 

  toggleEditProject(){
    
    
      this.show_edit_project = !this.show_edit_project;
      if(this.show_edit_project){
        this.editProject.get('project_id')?.patchValue(this.selected_project?.id);
        this.editProject.get('job_number')?.patchValue(this.selected_project?.job_number);
        this.editProject.get('street')?.patchValue(this.selected_project?.project_location);
        this.editProject.get('city')?.patchValue(this.selected_project?.city);
        this.editProject.get('project_name')?.patchValue(this.selected_project?.project_name);
        this.editProject.get('state')?.patchValue(this.selected_project?.state);
      }
  }

  handleEditDS(id:any,site:any){

    let data:any ={};
    data.dumpsite_name = $("#ds_name"+id+site).val();
    if(!data.dumpsite_name){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  "Dump site name required"
      })
      return;
    }
    data.location = $("#ds_address"+id+site).val();
    data.id = id;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_edit_dumpsite';

    this.is_loading_add = 'edit_ds_'+id+site;
    this.tc_dispatch_service.updateData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.show_edit_dump='';
        this.getData();
      }
    });
  }

  onEditProject(){

    console.log(this.editProject.value)
    if(this.editProject.invalid){
      return;
    }
    
    this.form_clicked=true;  
    
    let data:any=this.editProject.value;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.project_id = this.selected_project?.id; 
    data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_edit_project';

    this.is_loading_add = 'edit_project';
    this.tc_dispatch_service.updateData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.editProject.reset();
        this.show_edit_project=false;
        this.getData();
      }
    });

  }

  hideDSButton(){
    setTimeout(() => {
      
      $(".confirm").hide()
      }, 1000);
  }

  handleDeleteDS(id:any,is_tc:any,site:any){
    setTimeout(() => {
      
      $(".confirm").hide()
      }, 1000);
    this.form_clicked=true;  
    
    let data:any={};
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.id = site?.id; 
    data.is_tc_project = is_tc;
    data.action = 'dumpsite';

    this.is_loading_add='delete_ds_'+id+is_tc;
    this.tc_dispatch_service.deleteData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();

      }else{
       
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Error',
          text:  
          response.message
        })
      }
    });
  }

  handleEditApprover(id:any,appr:any){
    let data:any ={};
    data.name = $("#approver_name"+appr.id+id).val();
    if(!data.name){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  "Approver name required"
      })
      return;
    }

    data.email = $("#approver_email"+appr.id+id).val();
    if(!data.email){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  "Approver email required"
      })
      return;
    }
    data.contact_number = $("#contact_number"+appr.id+id).val();

    data.is_default = $("#approver_is_default"+appr.id+id).val();
    data.id = appr.id;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.is_tc_project = this.selected_project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_edit_approver';

    this.is_loading_add = 'edit_approver_'+appr.id+id;
    this.tc_dispatch_service.updateData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.show_edit_approver='';
        this.getData();
      }
    });
  }

  handleDeleteApprover(id:any,appr:any){
 setTimeout(() => {
      
      $(".confirm").hide()
      }, 1000);
    this.form_clicked=true;  
    
    let data:any={};
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.id = appr?.id; 
    data.is_tc_project = appr?.tc_projec_id? 'YES':'NO';
    data.action = 'approver';

    this.is_loading_add='delete_appr_'+appr.id+appr?.tc_projec_id? 'YES':'NO';
    this.tc_dispatch_service.deleteData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();

      }else{
       
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Error',
          text:  
          response.message
        })
      }
    });
  }

  toggleApprover(id:any){
    if(id && this.show_edit_approver==''){
      this.show_edit_approver =id;
    }else{
      this.show_edit_approver ='';
    }
  }

  hidePopup(i:any){
    if(i){
      setTimeout(() => {
        $("."+i).hide();
      }, 300);
    }
  }

  clickDelete(proj:any){
    if(proj){

    }
  }

  updateAddress(){
    this.countryError = '';
    this.provinceError= '';
    this.addressError = '';
    let arr:any = false;
    if(!$("#edit_country").val() || $("#edit_country").val() ==''){
      this.countryError = 'Country required!';
      arr=true;
    }
    if(!$("#edit_province").val() || $("#edit_province").val()==''){
      this.provinceError= 'Province required!';
      arr=true;
    }
    if(!$("#edit_street").val() || $("#edit_street").val() ==''){
      this.provinceError= 'Street required!';
      arr=true;
    }

    if(arr){
      return;
    }
    this.editCCForm.get('street')?.patchValue($("#edit_street").val());
    
    this.editCCForm.get('country')?.patchValue($("#edit_country").val());
    
    this.editCCForm.get('state')?.patchValue($("#edit_province").val());
    
    this.editCCForm.get('postcode')?.patchValue($("#edit_postcode").val());

    this.editCCForm.get('city')?.patchValue($("#edit_city").val());
   
    let full_address:any = '';
    full_address += this.editCCForm.get('street')?.value ? this.editCCForm.get('street')?.value:'';
    
    
    full_address += this.editCCForm.get('city')?.value ? ( full_address !='' ? ', ':'')+ this.editCCForm.get('city')?.value:'';
    full_address += this.editCCForm.get('state')?.value ? ( full_address !='' ? ', ':'')+ this.editCCForm.get('state')?.value:'';
    full_address += this.editCCForm.get('postcode')?.value ? ( full_address !='' ? ' ':'')+  this.editCCForm.get('postcode')?.value:'';
    full_address += this.editCCForm.get('country')?.value ? ( full_address !='' ? ' ':'')+ this.editCCForm.get('country')?.value:'';

    this.full_address= full_address;

    setTimeout(() => {
      
      this.closeModal('addNewAddress2')
      $(".modal-backdrop").hide();
      $('.modal-backdrop').removeClass('show');

      $('body').removeClass('modal-open');
      $("body").css({"paddingRight":'0px'})

      $('.modal-backdrop').addClass('hide');
    }, 300);
  }

  addCCDumpsiteNew(){
    this.newDSNameError = '';
    this.newDSAddressError = '';
    let arr:any = false;
    if(!$("#dumpsite_name_new").val() || $("#dumpsite_name_new").val() ==''){
      this.newDSNameError = 'Dump site name required!';
      arr=true;
    }
    if(!$("#dumpsite_address_new").val() || $("#dumpsite_address_new").val()==''){
      this.newDSAddressError= 'Dump site address required!';
      arr=true;
    }

    if(arr){
      return;
    }

    let data:any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      construction_company_id: this.edit_cc?.id,
      is_cc: this.edit_cc?.open_paper_ticket_photo !='' ? 'NO':'YES',
      ds_name: $("#dumpsite_name_new").val(),
      ds_address: $("#dumpsite_address_new").val(),
      
    }

    this.trucking_company_service.addCCdumpsite(data).subscribe(response=>{

      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();
        $(".modal-add-dumpsite").hide();

      }else{
       
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Error',
          text:  
          response.message
        })
      }
    });
  }

  setDSEdit(ds:any){
    if(ds){
      this.edit_ds = ds;
      this.showCustomModal('.modal-edit-dumpsite');
    }
  }

  removeCCDumpsite(){
    let data:any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      construction_company_id: this.edit_cc?.id,
      is_cc: this.edit_cc?.open_paper_ticket_photo !='' ? 'NO':'YES',
      dumpsite_id: this.edit_ds?.id
    }

    
    this.trucking_company_service.removeCCdumpsite(data).subscribe(response=>{

      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();
        this.edit_ds  = null;
        $(".modal-edit-dumpsite").hide();

      }else{
       
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Error',
          text:  
          response.message
        })
      }
    });
  }


  updateCCDumpsiteNew(){
    this.editDSNameError = '';
    this.editDSAddressError = '';
    let arr:any = false;
    if(!$("#dumpsite_name_edit").val() || $("#dumpsite_name_edit").val() ==''){
      this.editDSNameError = 'Dump site name required!';
      arr=true;
    }
    if(!$("#dumpsite_address_edit").val() || $("#dumpsite_address_edit").val()==''){
      this.editDSAddressError= 'Dump site address required!';
      arr=true;
    }

    if(arr){
      return;
    }

    let data:any = {
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      construction_company_id: this.edit_cc?.id,
      is_cc: this.edit_cc?.open_paper_ticket_photo !='' ? 'NO':'YES',
      ds_name: $("#dumpsite_name_edit").val(),
      ds_address: $("#dumpsite_address_edit").val(),
      dumpsite_id: this.edit_ds?.id
      
    }

    this.trucking_company_service.editCCdumpsite(data).subscribe(response=>{

      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();
        this.edit_ds  = null;
        $(".modal-edit-dumpsite").hide();

      }else{
       
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Error',
          text:  
          response.message
        })
      }
    });

  }

  showCustomModal(modal:any){
    if(modal){
      $(modal).show();
    }
  }

  hideCustomModal(modal:any){
    if(modal){
      $(modal).hide();
    }
  }

  updateCCContact(){
    this.name_error = '';
    this.email_error='';

   
    let arr:any = false;
    if(!$("#edit_contact_name").val() || $("#edit_contact_name").val() ==''){
      this.name_error = 'Name is required!';
      arr=true;
    }
    if(!$("#edit_contact_email").val() || $("#edit_contact_email").val()==''){
      this.email_error= 'Email is required!';
      arr=true;
    }

    if(arr){
      return;
    }
    
    let data:any ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      
      
      name: $("#edit_contact_name").val(),
      email: $("#edit_contact_email").val(),
      role:this.set_role,
      phone: $("#edit_contact_phone").val(),
      update_id: this.edit_contact?.id
    }
    if(this.edit_cc?.open_paper_ticket_photo !=''){
      data.company_id= this.edit_cc?.id;
    }else{

      data.tc_company_id= this.edit_cc?.id;
    }
    if($('#edit_default_contact').prop('checked') == true){
      data.is_default = '1';
    }else{
      data.is_default = '0';
    }
    
    if($('#edit_contact_dispatch_to').prop('checked') == true){
      data.is_send_dispatch = '1';
    }else{
      data.is_send_dispatch = '0';
    }

    this.contact_service.updateContacts(data).subscribe(response=>{

        if (response && !response.status ) {
          this.email_error = response.data.email ? response.data.email : '';
          this.name_error = response.data.name ? response.data.name : '';
  
          return;
        }else{
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  
            response.message
          })
          this.getData();
          this.edit_contact  = null;
          $(".modal-edit-contact").hide();
        }
      });
  }

  addCCContact(){
    this.name_error = '';
    this.email_error='';
    
    let arr:any = false;
    if(!$("#add_contact_name").val() || $("#add_contact_name").val() ==''){
      this.name_error = 'Name is required!';
      arr=true;
    }
    if(!$("#add_contact_email").val() || $("#add_contact_email").val()==''){
      this.email_error= 'Email is required!';
      arr=true;
    }

    if(arr){
      return;
    }

    let data:any ={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      name: $("#add_contact_name").val(),
      email: $("#add_contact_email").val(),
      role:this.set_role,
      phone: $("#add_contact_phone").val()
    }

    if(this.edit_cc?.open_paper_ticket_photo !=''){
      data.company_id= this.edit_cc?.id;
    }else{

      data.tc_company_id= this.edit_cc?.id;
    }
    if($('#add_default_contact').prop('checked') == true){
      data.is_default = '1';
    }else{
      data.is_default = '0';
    }
    
    if($('#add_contact_dispatch_to').prop('checked') == true){
      data.is_send_dispatch = '1';
    }else{
      data.is_send_dispatch = '0';
    }
    console.log(data)

    this.contact_service.addContacts(data).subscribe(response=>{

      if (response && !response.status ) {
        this.email_error = response.data.email ? response.data.email : '';
        this.name_error = response.data.name ? response.data.name : '';

        return;
      }else{
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.getData();
        $(".modal-add-contact").hide();
      }
    });
  }

  setContactRole(role:any,type:any){

    if(type=='add'){
      this.set_role = role;

    }
    if(type=='edit'){
      this.set_role = role;
    }
    setTimeout(() => {
      $(".add-contact").hide();
    }, 300);
  }

  setContact(contact:any){
    if(contact){
      this.edit_contact = contact;
      this.set_role = contact?.role;
      setTimeout(() => {
        $(".modal-edit-contact").show();
      }, 300);
    }
  }

  removeCCContact(contact:any){
    if(contact){
      let data:any = {
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        delete_id:contact?.id
      }

      this.contact_service.removeContacts(data).subscribe(response=>{
        if(response.status ){
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  
            response.message
          })
          this.getData();
          this.edit_contact  = null;
          $(".modal-edit-contact").hide();
  
        }else{
         
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  
            response.message
          })
        }
      });
    }
  }

  setAddProjectAddress(){
   
    setTimeout(() => {
      $("#addNewAddress").hide("modal")
      $("#addNewAddress").modal("hide")
      $(".modal-backdrop").hide();
      $('.modal-backdrop').removeClass('show');

      $('body').removeClass('modal-open');
      $("body").css({"paddingRight":'0px'})

      $('.modal-backdrop').addClass('hide');
    }, 300);
    let address:any = '';
    address+= ($("#project_street").val() ? $("#project_street").val() :'')
    address+= ($("#project_city").val() ? (address !=''? ', ':'')+ $("#project_city").val() :'')
    address+= ($("#project_province").val() ? (address !=''? ' ':'')+ $("#project_province").val() :'')
    address+= ($("#project_post_code").val() ? (address !=''? ' ':'')+ $("#project_post_code").val() :'')
    address+= ($("#project_country").val() ? (address !=''? ', ':'')+ $("#project_country").val() :'')
    
    $("#complete_address_project").val(address)

    this.addProject?.get('street')?.patchValue(($("#project_street").val() ? $("#project_street").val() :''));
    this.addProject?.get('city')?.patchValue(($("#project_city").val() ? $("#project_city").val() :''));
    this.addProject?.get('state')?.patchValue(($("#project_province").val() ? $("#project_province").val() :''));

  }
}
