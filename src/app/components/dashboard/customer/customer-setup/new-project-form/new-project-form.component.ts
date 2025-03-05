import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerSetupService } from 'src/app/services/customer-setup.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
declare var $:any;
@Component({
  selector: 'app-new-project-form',
  templateUrl: './new-project-form.component.html',
  styleUrls: ['./new-project-form.component.css']
})
export class NewProjectFormComponent implements OnInit {
  @Output() refreshParent: EventEmitter<void> = new EventEmitter<void>();

  @Output() showModl = new EventEmitter<string>();
  @Output() setAct = new EventEmitter<string>();

  @Input('current_modal') current_modal: string | undefined;

  is_loading:boolean = false;

  loggedinUser : any = {};
  approver_list: any;
  suprident_list:any;

  newProjForm!: FormGroup;
  is_clicked:boolean=false;

  newProjJobNumberError: string  ='';
  newProjNameError: string = '';
  newProjLocationError: string = '';

  canada_provinces: any = [];
  usa_provinces: any = [];

  country: any = 'Canada';
  province: any = 'British Columbia';
  address: any = null;
  user_id:any;

  constructor(
    private fb: FormBuilder,
    private cs_service: CustomerSetupService,
    private user_service: UserDataService
  ) { }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id

    this.getApprovers();
    this.getSupritendents();

    this.newProjForm = this.fb.group({
      job_number: ['', Validators.required],
      project_name: ['', Validators.required],
      project_location: ['', Validators.required],
      approver_id: [''],
      supritendent_id: [''],
      start_date: [''],
      planned_enddate: [''],
      default_rounds: [''],
      parent_user_id: [''],
      dump_sites:this.fb.array([]),
    });
    this.addDumpField()


    this.canada_provinces = [
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

    this.usa_provinces = [
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

  getSupritendents(){

      const formData = new FormData();

      formData.append('type', 'Approver');
      formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
      this.user_service.getUserList(formData).subscribe(response=>{
        if(response.status && response.data){
          this.approver_list = response.data;
        }else{

        }
      })

  }

  getApprovers(){
    const formData = new FormData();

    formData.append('type', 'All');
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    this.user_service.getUserList(formData).subscribe(response=>{
      if(response.status && response.data){
        this.suprident_list = response.data;
      }else{

      }
    })
  }

  get dump_sites(): FormArray {
      return this.newProjForm.get('dump_sites') as FormArray;
  }

  addDumpField() {

      this.dump_sites.push(
        this.fb.group({
          name:['',Validators.required],
          location: [],
        })
      )

  }

  onNewProject(){

    this.is_clicked=true;
    this.newProjJobNumberError  ='';
    this.newProjNameError = '';
    this.newProjLocationError = '';

    if(this.newProjForm.get('job_number')?.value == ''){
      this.newProjJobNumberError  = "Job Number is required";
    }

    if(this.newProjForm.get('project_name')?.value == ''){
      this.newProjNameError  = "Project Name is required";
    }


    if(this.newProjForm.get('project_location')?.value == ''){
      this.newProjLocationError  = "Project Location is required";
    }


    if (this.newProjForm.invalid) {
      return;
    }


   this.is_loading =true;
    this.cs_service.newProject(this.newProjForm.value).subscribe(response=>{

      if (response && !response.status ) {
        this.is_loading =false;
        if(response.message){

          return;
        }

        this.newProjJobNumberError = response.data.job_number ? response.data.job_number : '';
        this.newProjNameError = response.data.project_name ? response.data.project_name : '';
        this.newProjLocationError = response.data.project_location ? response.data.project_location : '';

        return;
      }else{
        this.newProjForm.reset();

        this.is_loading =false;
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        this.getMenuCounts();
        swalWithBootstrapButtons.fire(
          `Success`,
          `New Project added!`).then(() => {

          });
          this.setAct.emit('newproject');
         $("#newProject").modal('hide')
         $(".modal-backdrop").hide();
         $("#newProject").toggle('modal')
         this.is_clicked=false;
         this.refreshParent.emit();
      }
    });

  }

  getMenuCounts(){
    let data = {orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};

      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){

          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })
  }

  showModal(param:string){
    if(param  == ''){
      let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

      this.loggedinUser = userDone;
      this.loggedinUser.is_new_project_active = true;
      localStorage.setItem('TraggetUser', JSON.stringify(this.loggedinUser));
      this.setAct.emit('newproject');
    }
    this.showModl.emit(param);
  }


  setCountry(event: any) {
    if (event?.target?.value) {
      this.country = event?.target?.value;
    }
  }

  saveAddress() {
    let address: any = '';
    if ($("#street").val()) {
      address += $("#street").val();
    }

    if ($("#city").val()) {
      address += (address != '' ? ', ' : '') + $("#city").val();
    }

    if ($("#province_state").val()) {
      address += (address != '' ? ', ' : '') + $("#province_state").val();
    }

    if ($("#postal_code").val()) {
      address += (address != '' ? ' ' : '') + $("#postal_code").val();
    }


    if ($("#country").val()) {
      address += (address != '' ? ' ' : '') + $("#country").val();
    }
    this.newProjForm.get('project_location')?.patchValue(address);
    $("#closeBtn").trigger('click');
  }

}
