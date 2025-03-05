import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators,ValidatorFn,AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-freelance-manage-trucks',
  templateUrl: './freelance-manage-trucks.component.html',
  styleUrls: ['./freelance-manage-trucks.component.css']
})
export class FreelanceManageTrucksComponent implements OnInit {

  loggedinUser:any=null;
  date_today:any=null;
  active_menu:any;
  is_loading:any='';
  screen:string='desktop';

  date:any=null;

  addTruck!: FormGroup;
  addTrailer!: FormGroup;


  editTruck!: FormGroup;
  editTrailer!: FormGroup;

  form_clicked:boolean= false;
  is_visible:string= '';
  is_loading_add:string= '';
  is_loading_removing:string= '';

  trailers_data:any= null;
  trucks_data:any = null;

  truckColorError: string = '';
  truckEditColorError: string = '';
  trailerColorError: string = '';
  trailerEditColorError: string = '';

  WeightError :string = '';
  WeightUnitError :string = '';
  VolumeError :string = '';
  VolumeUnitError :string = '';
  selected_truck:any =null;
  selected_trailer:any = null;
  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private project_service:ProjectService,
    private freelance_driver:FreelanceDriverServiceService,
    private fb : FormBuilder,
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
    this.active_menu = {
      parent:'projects',
      child:'projects',
      count_badge: '',
    }
  }

  ngOnInit(): void {

    this.responsiveService.checkWidth();
    this.onResize();

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


    $(document).on('click','.btnremove', function(this:any) {
      $(this).closest('.modal-div').find('.delete-modal').toggle('slow');
    });
    $(document).on('click','.btnaction', function(this:any) {
        $(this).closest('.delete-modal').hide();
    });


    this.addTrailer = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      weight: ['',this.numericValidator()], 
      weight_unit: [''],    
      volume: ['', this.numericValidator()],     
      volume_unit: [''],   
      // color:['',this.alphabeticValidator()]
    });

    this.addTruck = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      weight: ['',this.numericValidator()], 
      weight_unit: [''],    
      volume: ['', this.numericValidator()],     
      volume_unit: [''],   
      color:['',this.alphabeticValidator()]
    });
    

    this.editTrailer = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      weight: ['',this.numericValidator()], 
      weight_unit: [''],    
      volume: ['', this.numericValidator()],     
      volume_unit: [''],   
      // color:['',this.alphabeticValidator()],
      id: [''],  
    });

    this.editTruck = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      weight: ['',this.numericValidator()], 
      weight_unit: [''],    
      volume: ['', this.numericValidator()],     
      volume_unit: [''],   
      color:['',this.alphabeticValidator()],
      id: [''],  
    });


    $(document).on('click','.getinputfield22' ,function(this:any) {
      $('.input-popup-div22').hide();
      $(this).find('.input-popup-div22').show();
    });

    $(document).on('click','.getinputfieldedit22' ,function(this:any) {

      $('.input-popup-divedit22').hide();
      $(this).find('.input-popup-divedit22').show();
    });

    $(window).click(function(e:any) {
        if (!($(e.target).hasClass('getinputfield22') || $(e.target).closest('.getinputfield22').length)) {
            $('.input-popup-div22').hide();
        }

        if (!($(e.target).hasClass('getinputfieldedit22') || $(e.target).closest('.getinputfieldedit22').length)) {
          $('.input-popup-divedit22').hide();
      }

        if (($(e.target).hasClass('job-status'))){
          let status=$(e.target).find('.job-id').text();
          console.log(status)
        }
    });

    this.getData();
  }

  alphabeticValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!/^[a-zA-Z\s]+$/.test(value) || value === null || /^\s+$/.test(value)) 
    {
    return { alphabetic: true };
    }
    return null;
    }; 
  }
  
  numericValidator(): ValidatorFn { 
    return (control: AbstractControl): { [key: string]: any } | null => { const value = control.value; if (isNaN(value) || value === null || /^\s+$/.test(value)) { return { numeric: true }; } return null; };
  } 
  
  
  getData(){

    let filter = {
      record_type:'truck',
      freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    };
    let formData = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name: 'freelance_trucks',
      filter:filter
    }

    this.freelance_driver.getFreelancerDetail(formData).subscribe(response=>{

      if(response.status && response.data){
        this.trucks_data = response.data;
      }
    });

    let filter2 = {record_type:'trailer',
    freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id};
    let formData2 = {
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name: 'freelance_trucks',
      filter:filter2
    }

    this.freelance_driver.getFreelancerDetail(formData2).subscribe(response=>{
      if(response.status && response.data){
        this.trailers_data = response.data;
      }
    });
  }

  onAddTruck(){
    this.truckColorError = '';

    if (this.addTruck.get('color')?.value !== '') {
      if (this.addTruck.get('color')?.hasError('alphabetic')) {
        this.truckColorError = 'Truck Color must be Alphabetic.';
      }
    }

    if(this.addTruck.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addTruck.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.record_type= 'truck';
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_trucks',
        data: formData
      }

      this.is_loading_add='truck';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status){
          this.is_visible='';
          this.addTruck.reset()
          this.getData();
        }
      });
  }

  // onEditTruck(){

  //   this.truckEditColorError = '';

  //   if (this.editTruck.get('color')?.value !== '') {
  //     if (this.editTruck.get('color')?.hasError('alphabetic')) {
  //       this.truckEditColorError = 'Truck Color must be Alphabetic.';
  //     }
  //   }

  //   if(this.editTruck.invalid){
  //     this.form_clicked=true;
  //       return;
  //     }
  //     let formData:any=this.editTruck.value;
  //     formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
  //     formData.record_type= 'truck';
  //     let data={
  //       user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
  //       record_name:'freelance_trucks',
  //       filter:{
  //         id:formData?.id,
  //         freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
  //       },
  //       data: formData
  //     }

  //     this.is_loading_add='edit-truck';
  //     this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
  //       this.is_loading_add='';
  //       if(response.status){
  //         this.is_visible='';
  //         this.editTruck.reset()
  //         this.getData();
  //       }
  //     });
  // }

  onEditTruck() {
    this.truckEditColorError = '';
  
    if (this.editTruck.get('color')?.value !== '') {
      if (this.editTruck.get('color')?.hasError('alphabetic')) {
        this.truckEditColorError = 'Truck Color must be Alphabetic.';
      }
    }
  
    if (this.editTruck.invalid) {
      this.form_clicked = true;
      return;
    }
  
    let formData: any = this.editTruck.value;
    formData.freelance_driver_id = this.loggedinUser?.id
      ? this.loggedinUser?.id
      : this.loggedinUser?.user_data_request_id;
    formData.record_type = 'truck';
  
    let data = {
      user_id: this.loggedinUser?.id
        ? this.loggedinUser?.id
        : this.loggedinUser?.user_data_request_id,
      record_name: 'freelance_trucks',
      filter: {
        id: formData?.id,
        freelance_driver_id: this.loggedinUser?.id
          ? this.loggedinUser?.id
          : this.loggedinUser?.user_data_request_id,
      },
      data: formData,
    };
  
    this.is_loading_add = 'edit-truck';
    this.freelance_driver.updateFreelancerData(data).subscribe((response) => {
      this.is_loading_add = '';
      if (response.status) {
        Swal.fire({
          confirmButtonColor: '#FDD7E4',
          title: 'Success',
          text: 'Trailer Updated Successfully.',
        }).then(() => {
          this.is_visible = ''; // Hide the edit modal
          this.editTruck.reset();
          this.getData();
          $('#edittruck').modal('hide'); 
        });
      }
    });
  }
  
  onDeleteTruck() {
    let data = {
      user_id: this.loggedinUser?.id
        ? this.loggedinUser?.id
        : this.loggedinUser?.user_data_request_id,
      record_name: 'freelance_trucks',
    };
  
    this.is_loading_add = 'delete-truck';
    this.freelance_driver.deleteFreelancerData(data).subscribe((response) => {
      this.is_loading_add = '';
      if (response.status) {
        Swal.fire({
          confirmButtonColor: '#FDD7E4',
          title: 'Deleted!',
          text: 'Truck has been deleted.',
        }).then(() => {
          this.getData(); // Refresh the truck list
        });
      } else {
        Swal.fire({
          confirmButtonColor: '#d33',
          title: 'Error!',
          text: 'Failed to delete truck.',
          icon: 'error',
        });
      }
    });
  }
  
  
  
  setTruck(truck: any) {
    this.selected_truck = truck; // Store the full truck object
  
    this.editTruck.patchValue({
      id: truck?.id,
      type: truck?.type,
      color: truck?.color,
      name: truck?.name,
      license_plate: truck?.license_plate,
      weight: truck?.weight,
      weight_unit: truck?.weight_unit,
      volume: truck?.volume,
      volume_unit: truck?.volume_unit,
    });
  }
  

  setTrailer(trailer:any){
    this.selected_trailer = trailer;
    this.editTrailer.get('id')?.patchValue(trailer?.id);
    this.editTrailer.get('type')?.patchValue(trailer?.type);
    // this.editTrailer.get('color')?.patchValue(trailer?.color);
    this.editTrailer.get('name')?.patchValue(trailer?.name);
    this.editTrailer.get('license_plate')?.patchValue(trailer?.license_plate);
    this.editTrailer.get('weight')?.patchValue(trailer?.weight);
    this.editTrailer.get('weight_unit')?.patchValue(trailer?.weight_unit);
     this.editTrailer.get('volume')?.patchValue(trailer?.volume);
      this.editTrailer.get('volume_unit')?.patchValue(trailer?.volume_unit);
    
  }


  onAddTrailer(){
    // this.trailerColorError = '';

    // if (this.addTrailer.get('color')?.value !== '') {
    //   if (this.addTrailer.get('color')?.hasError('alphabetic')) {
    //     this.trailerColorError = 'Trailer Color must be Alphabetic.';
    //   }
    // }

    if(this.addTrailer.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addTrailer.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

      formData.record_type= 'trailer';
      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_trucks',

        data: formData
      }

      this.is_loading_add='trailer';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status){
          this.is_visible='';
          this.addTrailer.reset()
          this.getData();
        }
      });
  }

  onEditTrailer(){
    
    if(this.editTrailer.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.editTrailer.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.record_type= 'trailer';

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_trucks',
        data: formData,
        filter:{
          id:formData?.id,
          freelance_driver_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
        },
      }

      this.is_loading_add='edit-trailer';
      this.freelance_driver.updateFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';

        if (response.status) {
          Swal.fire({
            confirmButtonColor: '#FDD7E4',
            title: 'Success',
            text: 'Trailer Updated Successfully.',
          }).then(() => {
            this.is_visible = ''; // Hide the edit modal
            this.editTruck.reset();
            this.getData();
            $('#edittrailer').modal('hide').on('hidden.bs.modal', function () {
              $('body').removeClass('modal-open');  // Manually remove the class
          });

          });
        }
      });
  }


  onDeleteTrailer() {
    if (!this.selected_trailer?.id) return; // Prevent accidental calls without a selected trailer
  
    let data = {
      user_id: this.loggedinUser?.id
        ? this.loggedinUser?.id
        : this.loggedinUser?.user_data_request_id,
      record_name: 'freelance_trucks', // Same as trucks
      filter: {
        id: this.selected_trailer.id, // Ensures only the selected trailer is deleted
        freelance_driver_id: this.loggedinUser?.id
          ? this.loggedinUser?.id
          : this.loggedinUser?.user_data_request_id,
      },
    };
  
    this.is_loading_add = 'delete-trailer';
    this.freelance_driver.deleteFreelancerData(data).subscribe((response) => {
      this.is_loading_add = '';
      if (response.status) {
        Swal.fire({
          confirmButtonColor: '#FDD7E4',
          title: 'Deleted!',
          text: 'Trailer has been deleted.',
          icon: 'success',
        }).then(() => {
          this.getData(); // Refresh the trailer list
        });
      } else {
        Swal.fire({
          confirmButtonColor: '#d33',
          title: 'Error!',
          text: 'Failed to delete trailer.',
          icon: 'error',
        });
      }
    });
  }
  



  confirmDelete(truck:any, type:any){
 
    if(!truck || truck?.id==''){
      return;
    }
    let formData:any=this.addTrailer.value;
    formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
        if(type=='TRAILER'){
          formData.append('type', type); 
          console.log('this is the trailer')
        }else{
          formData.append('type', type); 
          console.log('this is the truck')
        }    
        formData.append('delete_id', truck.id);   
      
      }

  

  markDefault(event:any,table:any,id:any){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('record_name',table);
    formData.append('id',id);

    if(event.target.checked == true){
     formData.append('status','1');
    }else{
      formData.append('status','0');
    }


    this.freelance_driver.markDefault(formData).subscribe(response=>{

      if(response.status && response.data){
        this.getData();
        switch (table) {
          case 'freelance_trucks':
            setTimeout(() => {

              $("#truck-popup").hide();
              $("#trailer-popup").hide();
            }, 500);
            break;

        }
      }

    });

  }

  setVisible(type:string, data:any=null){
    if(type && type!=''){
      if(data && data?.id){
        if(type == 'edit-truck'){
          this.editTruck.get('name')?.patchValue(data?.name);
          this.editTruck.get('id')?.patchValue(data?.id);
          this.editTruck.get('type')?.patchValue(data?.type);
          this.editTruck.get('license_plate')?.patchValue(data?.license_plate);
          this.editTruck.get('color')?.patchValue(data?.color);
          this.editTruck.get('is_default')?.patchValue(data?.is_default);
          this.editTruck.get('table')?.patchValue(data?.table);
        }

        if(type == 'edit-trailer'){
          this.editTrailer.get('name')?.patchValue(data?.name);
          this.editTrailer.get('id')?.patchValue(data?.id);
          this.editTrailer.get('type')?.patchValue(data?.type);
          this.editTrailer.get('license_plate')?.patchValue(data?.license_plate);
          this.editTrailer.get('color')?.patchValue(data?.color);
          this.editTrailer.get('is_default')?.patchValue(data?.is_default);
          this.editTrailer.get('table')?.patchValue(data?.table);
        }
      }
      this.is_visible = type;
      this.is_loading_add = '';
    }
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='mobile'){

        this.router.navigate(['/dashboard']);

      }

    });
  }

}
