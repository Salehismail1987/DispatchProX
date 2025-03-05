import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { TruckingDispatchService } from 'src/app/services/trucking-dispatch.service';
import { ContactService } from 'src/app/services/contact.service';
declare var $: any;
declare var bootstrap: any;
interface ProjectRole {
  project_id: number;
  user_id: number;
  project_name: string;
  roles: any[]; // Assuming 'role' can have multiple data types; adjust as needed.
}
interface UserRole {
  role_id: number;
}

interface Role {
  id: number;
  name: string;
  selected: boolean; // Add this to track selection state
}

@Component({
  selector: 'app-tc-project-profile',
  templateUrl: './tc-project-profile.component.html',
  styleUrls: ['./tc-project-profile.component.css']
})
export class TcProjectProfileComponent implements OnInit {

  loggedinUser: any = {};
  user_id:any;
  active_menu:any;
  usa_provinces:any = null;
  canada_provinces:any = null;
  cc_lists:any=null;
  cc_contacts:any=null;
  sort_by:any=null;
  search_by:any=null;
  project_id:any=null;
  project:any=null;
  cc:any = null;
  is_tc_project:any = null;
  is_tc_cc:any=null;

  complete_address:any=null;
  show_edit_cc_address:any=false;

  addressError:any ='';
  cityError:any='';
  countryError:any ='';
  provinceError:any ='';
  project_country:any = 'Canada';
  project_province:any = 'British Columbia';
  
  updateProject!: FormGroup;
  editProject!: FormGroup;
  addDumpSite!: FormGroup;

  is_loading_add:any='';
  require_paper_ticket:any = 'NO';
  edit_ds:any = null;
  form_clicked:any=false;

  show_add_ds:any=false;
  edit_team_user:any=null;
  users_list:any=null;
  users_project_list:any=null;

  edit_roles:any = [];
  default_roles:any = null;
  customer_contact:any=null;
  editCustomerRate!:FormGroup;

  custom_truck_rates: any[] = [];
  edit_cc_rates:boolean=false;
  companyTrucks_Trailers:any=null;
  customers_list:any=null;
  companies_list:any=null;

  constructor(
    private activeRouter:ActivatedRoute,
    private contact_service: ContactService,
    private trucking_service: TruckingCompanyService,
    private tc_service: TruckingCompanyService,
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
      "Alabama AL",
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
         
            $('.input-popup-div').hide();
            $('.input-popup-div2').hide();
            
        }

        if (!($(e.target).hasClass('getinputfield3') || $(e.target).closest('.getinputfield3').length )) {
          $('.input-popup-div3').hide();
          // console.log("closinggg3")
      }
    });

    
    let project_id =  this.activeRouter.snapshot.params['project_id'];
    if(project_id !=""){
      let proj = project_id.toString().split('-');
      this.project_id = proj[0];
      this.is_tc_project = proj[1];
      
    }

    this.getData();
    this,this.getAllUsers();

    this.editProject = this.fb.group({
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      state: [''],
      postcode: [''],
      country: [''],
      require_paper_ticket: [''],
      default_rounds: [''],
      project_id: ['', Validators.required],
    })

    this.addDumpSite = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      is_default: [''],
    });

    this.editCustomerRate = this.fb.group({
      Custom_truck_trailer_rates_list:[[]],
      Single:[100],
      Tandem:[110],
      Tridem:[120],
      quard:[140],
      Pony:[100],
      tri_pony:[110],
      quard_wag:[120],
      Transfer:[120],
    });
    
    this.getAllTCCustomers();
    this.getAllTCCompanies();
  }

  
  getAllTCCustomers(){
    let data:any ={
      user_id:this.user_id,
      is_pagination:'true',
      is_contact_call:'YES',
       search_by:null,
      sort_by:null,
    };
 

    this.trucking_service.getAllTCCustomers(data).subscribe(response=>{
    
      if(response.status && response.data){
        this.customers_list = response.data;
      }else{
        this.customers_list = null;

      }
    })
  }
  
  
  getAllTCCompanies(){

    let data:any ={
      user_id: this.user_id,
      is_pagination: 'false',
      is_contact_call: 'YES',
      sort_by:this.sort_by,
      search_by:this.search_by
    }


    this.trucking_service.getAllTCCompanies(data).subscribe(response=>{

      if(response.status && response.data){
        this.companies_list = response.data;
      }else{

      }
    })
  }

  getAllUsers(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_profile_request', 'YES');
    this.tc_service.getAllUsers(formData).subscribe((response:any)=>{
     
      if (response && response.status && response.data ) {

        if(response.data && response.data.length>0){

          this.users_list = response.data;
        }else{
          this.users_list  = null;
        }

        if(response.data && response.ProjectUser.length>0){
          this.users_project_list = this.restructureProjectUserData(response.ProjectUser);

        }else{
          this.users_project_list = null;
        }


      }
    });
  }

  private restructureProjectUserData(data: any[]): ProjectRole[] {
    const projectUserMap = new Map<string, ProjectRole>();
  
    for (const item of data) {
      const projectUserIdKey = `${item.project_id}-${item.user_id}`;
      if (projectUserMap?.has(projectUserIdKey)) {
        let projectUserEntry = projectUserMap?.get(projectUserIdKey);
        projectUserEntry?.roles?.push(item.role);
      } else {
        projectUserMap?.set(projectUserIdKey, {
          project_id: item.project_id,
          user_id: item.user_id,
          project_name: item.project?.project_name,
          roles: [item.role]
        });
      }
    }
  
    return Array.from(projectUserMap.values());
  }
  getData(){
    
      
    let data22={user_id:this.user_id,action:'tc_projects',sort_by:this.sort_by,search_by:this.search_by}
    this.tc_dispatch_service.getAllData(data22).subscribe(response => {
 
      if (response.status && response.data) {
        let projects_list = response.data;
        this.cc_lists = response.data;
        projects_list.map((item:any)=>{
           let projects = item?.projects;
           projects.map((proj:any)=>{
              if(this.is_tc_project == 'YES'){
                  
                if(proj?.id == this.project_id && proj?.trucking_company_id !=''){
                  this.project = proj;
                  this.customer_contact = proj?.customer_contact;
                  this.cc = item;
                  this.require_paper_ticket = proj?.require_paper_ticket == 'YES'?'YES':'NO';
                  this.is_tc_cc = item?.open_paper_ticket_photo !=''  ? 'NO':'YES';
                }
              }

              if(this.is_tc_project == 'NO'){
                  
                if(proj?.id == this.project_id && !proj?.trucking_company_id){
                  this.project = proj;
                  this.customer_contact = proj?.customer_contact;
                  
                  this.require_paper_ticket = proj?.require_paper_ticket == 'YES'?'YES':'NO';
                  this.cc = item;
                  this.is_tc_cc = item?.open_paper_ticket_photo !=''  ? 'NO':'YES';
                }
              }
           })
        })
        if(this.project){
          let dd ='';
          
    
          dd += this.project?.project_location ? this.project?.project_location:'';
          dd += this.project?.city ? ( dd !='' ? ', ':'')+ this.project?.city:'';
          dd += this.project?.state ? ( dd !='' ? ', ':'')+this.project?.state:'';
          dd += this.project?.postcode ? ( dd !='' ? ' ':'')+  this.project?.postcode:'';
          dd += this.project?.country ? ( dd !='' ? ' ':'')+ this.project?.country:'';

        this.complete_address = dd;
        }
        let ccc:any = this.cc;
        if(this.customer_contact?.customer_id){

          projects_list.map((item:any)=>{
            if(item?.id == this.customer_contact?.customer_id && item?.open_paper_ticket_photo !=''){
              ccc=item;
            }
          });
        }else if(this.customer_contact?.tc_customer_id){
          projects_list.map((item:any)=>{
            if(item?.id == this.customer_contact?.tc_customer_id && !item?.open_paper_ticket_photo){
              ccc=item;
              console.log(ccc?.tc_cc_rates)
            }
          });
        }
        if(ccc){
          let default_rates = null;
          if(ccc?.tc_cc_rates?.length>0){

            this.companyTrucks_Trailers = ccc?.tc_cc_rates;
    
            const trucks = [
              { name: 'Single', type: 'TRUCK', rate: 100 },
              { name: 'Tandem', type: 'TRUCK', rate: 110  },
              { name: 'Tridem', type: 'TRUCK', rate: 120  },
              { name: 'Quard-Axle', type: 'TRUCK', rate: 140  },
              { name: 'Pony', type: 'TRAILER', rate: 100  },
              { name: 'Tri Pony', type: 'TRAILER', rate: 110  },
              { name: 'Quad (wagon)', type: 'TRAILER', rate: 120  },
              { name: 'Transfer', type: 'TRAILER', rate: 120  }
            ];
                   
            this.companyTrucks_Trailers.map((item:any)=>{
    
              trucks.forEach(truck => {
                if(item.name == truck.name && item.rate ){
    
                  if(item.name == 'Quard-Axle')
                    {
                      this.editCustomerRate?.get('quard')?.patchValue(item.rate);
                    }
                    else if(item.name == 'Tri Pony'  ){
                      this.editCustomerRate?.get('tri_pony')?.patchValue(item.rate);
                    }
                    else if(item.name == 'Quad (wagon)'  ){
                      this.editCustomerRate?.get('quard_wag')?.patchValue(item.rate);
                    }
                    else{
                      this.editCustomerRate?.get(item.name)?.patchValue(item.rate);
                      
                    }
                }
                  
              });
                
            })
              
            trucks.forEach(truck => {
              let itm:any;
    
    
              if(truck.name == 'Quard-Axle')
              {
                itm = this.editCustomerRate?.get('quard')?.value;
              }
              else if(truck.name == 'Tri Pony'  ){
                itm = this.editCustomerRate?.get('tri_pony')?.value;
              }
              else if(truck.name == 'Quad (wagon)'  ){
                itm = this.editCustomerRate?.get('quard_wag')?.value;
              }
              else{
                itm = this.editCustomerRate?.get(truck.name)?.value;
              }
              if(itm !='' && itm != null ){
              }
              else{
                if(truck.name == 'Quard-Axle')
                  {
                    this.editCustomerRate?.get('quard')?.patchValue(truck.rate);
                    }
                    else if(truck.name == 'Tri Pony'  ){
                      this.editCustomerRate?.get('tri_pony')?.patchValue(truck.rate);
                  }
                    else if(truck.name == 'Quad (wagon)'  ){
                      this.editCustomerRate?.get('quard_wag')?.patchValue(truck.rate);
                  }
                    else{
                    this.editCustomerRate?.get(truck.name)?.patchValue(truck.rate);
    
                  }
              }
              
            });
              
          }else{
            
            const trucks = [
                { name: 'Single', type: 'TRUCK', rate: 100 },
                { name: 'Tandem', type: 'TRUCK', rate: 110  },
                { name: 'Tridem', type: 'TRUCK', rate: 120  },
                { name: 'Quard-Axle', type: 'TRUCK', rate: 140  },
                { name: 'Pony', type: 'TRAILER', rate: 100  },
                { name: 'Tri Pony', type: 'TRAILER', rate: 110  },
                { name: 'Quad (wagon)', type: 'TRAILER', rate: 120  },
                { name: 'Transfer', type: 'TRAILER', rate: 120  }
              ];
            
            trucks.forEach(truck => {
                if(truck.name == 'Quard-Axle')
                  {
                    this.editCustomerRate?.get('quard')?.patchValue(truck.rate);
                  }
                  else if(truck.name == 'Tri Pony'  ){
                    this.editCustomerRate?.get('tri_pony')?.patchValue(truck.rate);
                  }
                  else if(truck.name == 'Quad (wagon)'  ){
                    this.editCustomerRate?.get('quard_wag')?.patchValue(truck.rate);
                  }
                  else{
                    this.editCustomerRate?.get(truck.name)?.patchValue(truck.rate);
    
                  }
        
            });
          }
          
        }
      }
    });
  }

  toggleEditProject(d:any){
    this.edit_ds = null;
    // if(this.project && this.project?.trucking_company_id ){
      if(d == 'show'){
        $(".edit-project-view").show();
        $(".project-details").hide();
        this.editProject.get('project_id')?.patchValue(this.project?.id);
        this.editProject.get('job_number')?.patchValue(this.project?.job_number);
        this.editProject.get('project_name')?.patchValue(this.project?.project_name);
        this.editProject.get('street')?.patchValue(this.project?.project_location);
        this.editProject.get('city')?.patchValue(this.project?.city);
        this.editProject.get('state')?.patchValue(this.project?.state);
        this.editProject.get('city')?.patchValue(this.project?.city);
        this.editProject.get('country')?.patchValue(this.project?.country);
        this.editProject.get('require_paper_ticket')?.patchValue(this.project?.require_paper_ticket);
        this.editProject.get('default_rounds')?.patchValue(this.project?.default_rounds);
        
      }else if(d == 'hide'){
        $(".edit-project-view").hide();
        $(".project-details").show();
      }
    // }
   
  }

  showEditAddress(){
    this.show_edit_cc_address = true;
  }

  
  hideEditAddress(){
    this.show_edit_cc_address = false;
  }


  setCCCountry(event:any){
    if(event?.target?.value){
      this.project_country = event.target.value;
    }
  }

  setCCProvince(event:any){
    if(event.target.value){
      this.project_province = event.target.value;
    }
  }

  updateAddress(){
    let complt_address = '';
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
    this.editProject.get('street')?.patchValue($("#edit_street").val());
    
    this.editProject.get('country')?.patchValue($("#edit_country").val());
    
    this.editProject.get('state')?.patchValue($("#edit_province").val());
    
    this.editProject.get('postcode')?.patchValue($("#edit_postcode").val());

    this.editProject.get('city')?.patchValue($("#edit_city").val());
   
    let full_address:any = '';
    full_address += this.editProject.get('street')?.value ? this.editProject.get('street')?.value:'';
    
    
    full_address += this.editProject.get('city')?.value ? ( full_address !='' ? ', ':'')+ this.editProject.get('city')?.value:'';
    full_address += this.editProject.get('state')?.value ? ( full_address !='' ? ', ':'')+ this.editProject.get('state')?.value:'';
    full_address += this.editProject.get('postcode')?.value ? ( full_address !='' ? ' ':'')+  this.editProject.get('postcode')?.value:'';
    full_address += this.editProject.get('country')?.value ? ( full_address !='' ? ' ':'')+ this.editProject.get('country')?.value:'';

    this.complete_address= full_address;

    this.show_edit_cc_address = false;
  }

  onEditProject(){
    
    this.form_clicked=true;
    if(this.editProject.invalid){
      return;
    }
  
    let data:any=this.editProject.value;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.project_id = this.project?.id; 
    data.is_tc_project = this.project.trucking_company_id ? 'YES' : 'NO';
    data.require_paper_ticket = this.require_paper_ticket;
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
        this.getData();
        
        $(".edit-project-view").hide();
        $(".project-details").show();
      }
    });

  }

  changeRP(event:any){
    if(event.target && event.target.checked ){
        this.require_paper_ticket = 'YES';
    }else if(event.target && !event.target.checked){
      this.require_paper_ticket = 'NO';

    }
  }

  showEditDump(ds:any){
    this.edit_ds = ds;
  }

  hideEditDump(){
    this.edit_ds = null;
  }

  
  handleEditDS(){

    let data:any ={};
    data.dumpsite_name = $("#edit_ds_dumpsite").val();
    if(!data.dumpsite_name){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  "Dump site name required"
      })
      return;
    }
    data.location = $("#edit_ds_location").val();
    data.id = this.edit_ds?.id;
    data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    data.is_tc_project = this.project.trucking_company_id ? 'YES' : 'NO';
    data.action = 'tc_edit_dumpsite';

    this.is_loading_add = 'edit_ds';
    this.tc_dispatch_service.updateData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        Swal.fire(  {
          confirmButtonColor:'#17A1FA',
          title:    'Success',
          text:  
          response.message
        })
        this.edit_ds=null;
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

    this.is_loading_add='delete_ds';
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
        this.edit_ds=null;

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
        this.router.navigate(['/tc-projects-list']);
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

  hideAddDump(){
    this.show_add_ds = false;
  }

  showAddDump(){
    this.show_add_ds = true;
  }


  onAddDumpsite(){
    
    if(this.addDumpSite.get('name')?.value ==''){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  
        'Dump site name is required!'
      })
      return;
    }
    if(this.addDumpSite.get('address')?.value ==''){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  
        'Dump site address is required!'
      })
      return;
    }
    if(this.addDumpSite.invalid){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  
        'Dump site name and address are required!'
      })
      return;
    }
      let data:any=this.addDumpSite.value;
      data.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      data.project_id = this.project?.id; 
      data.action = 'tc_dumpsite';
      data.is_tc_project = this.project?.trucking_company_id ? 'YES' : 'NO';
      this.is_loading_add='add_ds';
      this.tc_dispatch_service.saveData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
         
          this.edit_ds=null;
          this.getData();
          this.addDumpSite.reset();
          this.show_add_ds=false;
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

  showEditTeamUser(user:any){
    this.edit_team_user = user;
    let r:any=[];
    user?.roles?.map((item:any)=>{
      r.push(item?.role?.role_name)
    })
    this.edit_roles = r;

    let d:any=null;
    user?.roles?.map((item:any)=>{
      if(item?.is_default){
        d = item?.role?.role_name
      }
    })

    this.default_roles = d;
  }

  hideEditTeamUser(){
    this.edit_team_user = null;
    this.edit_roles=[];
    this.default_roles=null;
  }

  setProjectUser(u:any){
    if(u){
      let data:any = {
        project_id: this.project?.id,
        tc_project: this.project?.trucking_company_id ? 'YES':'NO',
        trucking_company_id:  this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        user_id: u?.id,
        is_invited: u?.invitation_code ? 'YES':'NO'
      }

      this.tc_service.addUsertoTCProject(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          Swal.fire({
            confirmButtonColor:'#17A1FA',
            title: 'Success',
            text:  
            response.message
          })
          this.getData();
        }else{
          Swal.fire({
            confirmButtonColor:'#17A1FA',
            title: 'Error',
            text:  
            response.message
          })
        }
      });
    }
  }

  checkrole(t:any,roles:any){
    let r='NO';
      roles.map((item:any)=>{
        if(item == t){
          r='YES';
        }
      })
    return r;
  }
  
  setEditRole(r:any){
    if(r &&  this.checkrole(r,this.edit_roles) == 'NO'){
      this.edit_roles.push(r)
    }else{
      if(r &&  this.checkrole(r,this.edit_roles) == 'YES'){
        this.edit_roles.pop(r)
      }
    }
   
  }

  setDefaultRole(r:any,role:any){
   
    if(r.target.checked){
      if(role &&  this.checkrole(role,this.edit_roles) == 'NO'){
        this.edit_roles.push(role)
      }
      this.default_roles = role;
    }else if(r.target){
      this.default_roles = null;
    }
   
  }


  handleRolesSet(){
    if(this.edit_roles?.length<1){
      Swal.fire(  {
        confirmButtonColor:'#17A1FA',
        title:    'Warning',
        text:  
        'At least one role is required!'
      })
      return
    }
    let data:any ={
      roles: this.edit_roles,
      default_role: this.default_roles,
      user_id: this.edit_team_user?.id,
      is_invited: this.edit_team_user?.invitation_code ? 'YES':'NO',
      full_name: $("#edit_team_fullname").val(),
      email: $("#edit_team_email").val(),
      contact_number: $("#edit_team_contact_number").val()
    }

    data.project_id = this.project?.id; 
    data.tc_project = this.project?.trucking_company_id ? 'YES' : 'NO';
    data.trucking_company_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    this.tc_service.updateTCUserRoles(data).subscribe(response=>{

      if(response.status ){
       
        this.edit_team_user=null;
        this.edit_roles = [];
        this.default_roles = null;
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

  closerolesdiv(){
    setTimeout(() => {
      $(".edit-roles-popup").hide();
    }, 300);
  }

  setTCCustomer(cc:any){
    let data:any={
      trucking_company_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    data.project_id = this.project?.id; 
    data.is_tc_project = this.project?.trucking_company_id ? 'YES' : 'NO';
    
    data.customer_id = cc?.id; 
    data.is_tc_customer = cc?.trucking_company_id ? 'YES' : 'NO';

    this.tc_service.setTCCustomer(data).subscribe(response=>{

      if(response.status ){
       
        setTimeout(() => {
          $(".input-popup-div").hide()
        }, 300);
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

  setTCCustomerContact(contact:any){
    let data:any={
      trucking_company_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    }
    data.project_id = this.project?.id; 
    data.is_tc_project = this.project?.trucking_company_id ? 'YES' : 'NO';
    
    data.contact_id  = contact?.id
    this.tc_service.setTCCustomer(data).subscribe(response=>{

      if(response.status ){
       
        setTimeout(() => {
          $(".input-popup-div").hide()
        }, 300);
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

  showEditCCRates(){
    this.edit_cc_rates = true;
  }

  
  hideEditCCRates(){
    this.edit_cc_rates = false;
  }

  handleCCRates(){
    console.log(this.editCustomerRate.value)
    this.custom_truck_rates = [];
    const trucks = [
      {  name: 'Single', type: 'TRUCK', rate: 100 },
      {  name: 'Tandem', type: 'TRUCK', rate: 110  },
      {  name: 'Tridem', type: 'TRUCK', rate: 120  },
      {  name: 'Quard-Axle', type: 'TRUCK', rate: 140  },
      {  name: 'Pony', type: 'TRAILER', rate: 100  },
      {  name: 'Tri Pony', type: 'TRAILER', rate: 110  },
      {  name: 'Quad (wagon)', type: 'TRAILER', rate: 120  },
      {  name: 'Transfer', type: 'TRAILER', rate: 120  }
    ];
  
    
    trucks.forEach(truck => {


      if(truck.name == 'Quard-Axle')
        {
          const rate = this.editCustomerRate.get('quard')?.value;
           if (rate !== '' && rate != undefined && rate !== null  ) {
            this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
          }
        }
        else if(truck.name == 'Tri Pony'  ){
          const rate = this.editCustomerRate.get('tri_pony')?.value;
          if (rate !== '' && rate != undefined&& rate !== null  ) {
            this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
          }
        }
        else if(truck.name == 'Quad (wagon)'  ){
          const rate = this.editCustomerRate.get('quard_wag')?.value;
          if (rate !== '' && rate != undefined && rate !== null) {
            this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
          }
        }
        else{
          const rate = this.editCustomerRate.get(truck.name)?.value;
           if (rate !== '' && rate != undefined && rate !== null) {
            this.custom_truck_rates.push({ name: truck.name, rate: rate, type: truck.type });
          }
        }
    });
  
    if (this.custom_truck_rates.length > 0) {
      this.editCustomerRate.get('Custom_truck_trailer_rates_list')?.patchValue(this.custom_truck_rates);
    }

    let data:any = this.editCustomerRate.value;
    data.trucking_company_id = this.loggedinUser?.id;
    if(this.customer_contact?.customer_id || this.customer_contact?.tc_customer_id){
      if(this.customer_contact?.customer_id){
        data.customer_id = this.customer_contact?.customer_id;
        data.is_tc_customer = 'NO';
      }else if(this.customer_contact?.tc_customer_id){
        console.log(this.customer_contact)
        data.customer_id = this.customer_contact?.tc_customer_id;
        data.is_tc_customer = 'YES';
      }
    }else{
      
        data.is_tc_customer =   this.is_tc_cc ;
        data.customer_id = this.cc?.id;
     
    }
    this.tc_service.updateTCCCRates(data).subscribe(response=>{

      if(response.status ){
       
        setTimeout(() => {
         this.edit_cc_rates = false;
        }, 300);
        this.getData();
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
}
