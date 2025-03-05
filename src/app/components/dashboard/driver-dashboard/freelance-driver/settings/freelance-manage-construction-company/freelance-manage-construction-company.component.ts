import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-freelance-manage-construction-company',
  templateUrl: './freelance-manage-construction-company.component.html',
  styleUrls: ['./freelance-manage-construction-company.component.css']
})
export class FreelanceManageConstructionCompanyComponent implements OnInit {
  
  loggedinUser:any=null;
  date_today:any=null;
  active_menu:any;
  is_loading:any='';
  date:any=null;
  
  is_default:any=false;
  form_clicked:boolean=false;
  selectedTabIndex: number = 0; // By default, the first tab will be selected
  approved_freelance_ticket_count:any=null;

  trucking_companies:any=null;
  company_detail:any=null;
  hour_rate:any='';
  
  approver_detail:any=null;
  project_detail:any=null;

  canada_provinces:any=null;
  usa_provinces:any=null;
  country:any='Canada';
  province: string = '';
  inviteCC!: FormGroup;
  AddCC!: FormGroup;
  editCC!: FormGroup;
  editApprover!: FormGroup;
  addApprover!: FormGroup;
  addProject!: FormGroup;
  editProject!: FormGroup;

  current_project_step: any = null;
current_project: any = null;
selectedProject: any = null; // Define selectedProject
  constructor(
    private router: Router,
   
    private freelance_driver:FreelanceDriverServiceService,
    private fb : FormBuilder,
  ) { 
    this.active_menu = {
      parent:'settings',
      child:'settings',
      count_badge: '',
    }

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
    this.date = cDay + "-" + cMonth + "-" + cYear ;

    this.inviteCC = this.fb.group({
      contact_name: ['', Validators.required],
      contact_email: ['', Validators.required],
      contact_number: [''],
      
    });

    this.editApprover = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: [''],      
    });

    this.addApprover = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: [''],      
    });

    this.AddCC = this.fb.group({
      company_name: ['', Validators.required],
      is_default: [''],
      project_name: ['', Validators.required], 
      job_number: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postal_code:[''],
      approver_name: ['', Validators.required],
      approver_number: ['', Validators.required],
      approver_email: [''],
      approver_is_default: [''],
      
    });
    
    this.editCC = this.fb.group({
      company_name: ['', Validators.required],
      
    });


    this.addProject = this.fb.group({
      is_default: [''],
      project_name: ['', Validators.required], 
      job_number: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postal_code: [''],
      // approver_name: ['',],
      // approver_number: ['', ],
      // approver_email: [''],   
    });

    this.editProject = this.fb.group({
      is_default: [''],
      project_name: ['', Validators.required], 
      job_number: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postal_code: [''],

    });

    $(document).on('click','.btnremove', function(this:any) {
      $(this).closest('.modal-div').find('.delete-modal').toggle('slow');
    });
    $(document).on('click','.btnaction', function(this:any) {
        $(this).closest('.delete-modal').hide();
    });
    $(document).on('click','.btnselectlist', function(this:any) {
        $(this).closest('.selectdiv').find('.selectlistdiv').toggle('slow');
    });
    $(document).on('click','.selectlistitems li', function(this:any) {
        $(this).closest('.selectdiv').find('.selectlistdiv').hide();
        $(this).closest('.selectdiv').find('.selectlistname').html($(this).html());
    });

    this.getData();

    
  }

  setProject(contact:any){
    this.project_detail=contact;
  }
  selectTab(index: number) {
    this.selectedTabIndex = index; // Set the selected tab index
  }

  setApprover(approver:any){
    this.approver_detail = approver;
    this.editApprover.get('name')?.patchValue(approver?.name);
    this.editApprover.get('contact_number')?.patchValue(approver?.contact_number);
    this.editApprover.get('email')?.patchValue(approver?.email);
  }
  getData(){
    var formData={
      freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
    }
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_construction_company_list',
      filter: formData
    }
   
    this.is_loading='freelance_construction_company_list';
    this.freelance_driver.getFreelancerDetail(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        this.trucking_companies= response.data;
        if(this.company_detail?.id!=''){
          this.trucking_companies.map((item:any)=>{
            if(item.id==this.company_detail?.id){
             
              this.company_detail= item;
              this.is_default = item?.is_default;
              
              this.approved_freelance_ticket_count = this.company_detail?.approved_freelance_ticket_count;

            }
          })
        }
      }
    });
  }

  setData(event:any,type:any=null,index:any=null){
    if(type && type=='project_default'){
      if(event.target.checked==true){
        if(this.company_detail?.freelance_projects[index]){
          this.company_detail.freelance_projects[index].is_default = event.target.checked;
        }
      }else{
        if(this.company_detail?.freelance_projects[index]){
          this.company_detail.freelance_projects[index].is_default = event.target.checked;
        }
      }
      console.log(this.company_detail.freelance_projects[index])
    }

    if(type && type=='approver_default'){
   
      if(event.target.checked==true){
        if(this.project_detail?.approvers_list[index]){
          this.project_detail.approvers_list[index].is_default = event.target.checked;
        }
      }else{
        if(this.project_detail?.approvers_list[index]){
          this.project_detail.approvers_list[index].is_default = event.target.checked;
        }
      }
      console.log(this.project_detail.approvers_list[index])
    }
  }

  handleUpdateProject(){
    let formFilter:any={id:this.project_detail?.id};
    let formData:any={
      project: this.project_detail
    };
   
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_project_update',
      filter: formFilter,
      data:formData
    }
    this.is_loading='update_project';
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Project updated.'
        );
       
        this.getData();
      }
    });
  }

  setDetail(detail:any){
    this.company_detail = detail;
    this.is_default = this.company_detail?.is_default;
    this.editCC.get('name')?.patchValue(detail?.name);
    this.approved_freelance_ticket_count = this.company_detail?.approved_freelance_ticket_count;

  }
 

  onSaveInvite(){
    if(this.inviteCC.invalid){
      this.form_clicked=true;
      return;
    }
    this.is_loading='invite_tc';
    let formData:any=this.inviteCC.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'invite_freelance_construction_company',
      data: formData
    }
   
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Invitation sent.'
        );

        this.getData();
        this.form_clicked=false;
        this.inviteCC.reset()
      }
    });

  }

  
  changeNumber(event:any){
    
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.inviteCC.get('contact_number')?.patchValue(abc);
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

  onAddCC(){
    if(this.AddCC.invalid){
      this.form_clicked= true;
      return;
    }
    this.is_loading='adding_cc';
    this.form_clicked= false;

    console.log(this.AddCC.value)
    let formData:any=this.AddCC.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
  
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_construction_company',
      data: formData
    }
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company added.'
        );
        this.project_detail=null;
        this.company_detail=null;
        this.getData();
        $(".modal-backdrop").remove();
        $('#myModalAddCompany').modal('toggle');
      }
    });
  }

  changeNumberContact(event:any,type:any){
    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;
    
    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    if(type=='edit-appr'){
      this.editApprover.get('contact_number')?.patchValue(abc);
    }else if(type=='add-appr'){
      this.addApprover.get('contact_number')?.patchValue(abc);
    }else if(type=='add-proj'){
      // this.addProject.get('approver_number')?.patchValue(abc);
    }else if(type=='add-cc'){
      this.AddCC.get('approver_number')?.patchValue(abc);
    }
    
  }

  handleUpdateCompany(){
    if(this.editCC.invalid){
      this.form_clicked= true;
      return;
    }
    this.is_loading='updating_approver';
    this.form_clicked= false;

    console.log(this.editCC.value)
    let formData:any=this.editCC.value;
    
    let formFilter:any={id:this.company_detail?.id};
  
   
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_construction_company',
      filter: formFilter,
      data:formData
    }
    this.is_loading='updating_company';
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company updated.'
        );
        
        this.getData();
        this.editCC.reset();
        
      }
    });
  }

  deleteCompany(id:any){
    this.is_loading='invite_tc';
    let formData:any={id:id};
    
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_construction_company',
      filter: formData
    }
    this.is_loading='deleting_company';
    this.freelance_driver.deleteFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Company deleted.'
        );
        this.company_detail=null;
        this.hour_rate='';
        this.is_default='';
        this.getData();
        
        $(".modal-backdrop").remove();
        $('#myModalEditCompany').modal('toggle');
      }
    });
  }

  deleteProject(id:any){
  this.is_loading='invite_tc';
    let formData:any={id:id};
    
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_project',
      filter: formData
    }
    this.is_loading='deleting_project';
    this.freelance_driver.deleteFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Project deleted.'
        );
        this.project_detail=null;
        this.getData();
        $(".modal-backdrop").remove();
        this.editProject.reset();
        $('#myModalEditProject').modal('toggle');
      }
    });
  }

  deleteApprover(id:any){
    this.is_loading='invite_tc';
      let formData:any={id:id,project_id:this.project_detail?.id};
      
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_approver',
        data:{project_id:this.project_detail?.id},
        filter: formData
      }
      this.is_loading='deleting_approver';
      this.freelance_driver.deleteFreelancerData(data).subscribe(response=>{
        this.is_loading='';
        if(response.status){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Success',
            'Approver deleted.'
          );
          this.approver_detail=null;
          if(response.data && response?.data?.id){
            this.project_detail = response?.data;
          }
          this.getData();
          $('#myModalEditApprover').modal('toggle');
        }
      });
    }

  handleUpdateApprover(){
    if(this.editApprover.invalid){
      this.form_clicked= true;
      return;
    }
    this.is_loading='updating_approver';
    this.form_clicked= false;

    console.log(this.editApprover.value)
    let formData:any=this.editApprover.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    formData.project_id  = this.project_detail?.id;
    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_approver',
      data: formData,
      filter:{id:this.approver_detail?.id}
    }
    this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Approver updated.'
        );
        this.approver_detail=null;
        if(response.data && response?.data?.id){
          this.project_detail = response?.data;
        }
        this.editApprover.reset();
        this.getData();
        $('#myModalEditApprover').modal('toggle');
      }
    });
  }

  handleAddApprover(){
    if(this.addApprover.invalid){
      this.form_clicked=true;  
        return;
      }
      let formData:any=this.addApprover.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_construction_company_id = this.company_detail?.id; 
      formData.project_id = this.project_detail?.id;
      formData.return_project = true;
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'approver',
        data: formData
      }
     
      this.is_loading='adding_project';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading='';
        if(response.status ){
          if(response.data && response?.data?.id){
            this.project_detail = response?.data;
          }
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Success',
            'Approver added.'
          );
          this.getData();
          $('#myModalAddApprover').modal('toggle');
          this.addApprover.reset();
        }
      });
  }

  handleAddProject(){
    if(this.addProject.invalid){

      this.form_clicked=true;  
        return;
      }

      let formData:any=this.addProject.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_construction_company_id = this.company_detail?.id; 
      formData.return_project = true;
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_projects',
        data: formData
      }
     
      this.is_loading='add_project';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading='';
        if(response.status ){
          if(response.data && response?.data?.id){
            this.company_detail = response?.data;
          }
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Success',
            'Project added.'
          );
          this.getData();
          $('#myModalAddProject').modal('toggle');
          this.addProject.reset();
        }
      });
  }
  
  setEditProject(proj:any){
    this.editProject.get("project_name")?.patchValue(proj?.project_name);
    this.editProject.get("job_number")?.patchValue(proj?.job_number);
    this.editProject.get("province")?.patchValue(proj?.province);
    this.editProject.get("country")?.patchValue(proj?.country);
    this.editProject.get("postal_code")?.patchValue(proj?.postal_code);
    this.editProject.get("city")?.patchValue(proj?.city);
    this.editProject.get("street")?.patchValue(proj?.street);
  }


  handleEditProject(){
    if(this.editProject.invalid){

      this.form_clicked=true;  
        return;
      }

      let formData:any=this.editProject.value;
     
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_projects',
        data: formData,
        filter:{id:this.project_detail?.id}
      }
     
      this.is_loading='update_project';
      this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
        this.is_loading='';
        if(response.status ){
          if(response.data && response?.data?.id){
            this.project_detail = response?.data;
          }
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Success',
            'Project updated.'
          );
          this.getData();
          $('#myModalEditProject2').modal('toggle');
          this.editProject.reset();
        }
      });
  }

  setCountry(event: any) {
    if (event.target.value) {
      this.country = event.target.value;
    }
}
}

