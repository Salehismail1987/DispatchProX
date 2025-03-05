import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,AbstractControl,ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
declare var $: any;
@Component({
  selector: 'app-tc-manage-trucks',
  templateUrl: './tc-manage-trucks.component.html',
  styleUrls: ['./tc-manage-trucks.component.css']
})
export class TcManageTrucksComponent implements OnInit {

  
  active_menu:any;
  loggedInUser:any;
  current_step:any = 'truck-listing';
  current_step_add:any = '';

  is_trailer_loading:boolean=false;
  is_truck_loading:boolean=false;
  is_loading_removing:boolean=false;
  
  loading:boolean=false;

  
  truckForm!: FormGroup;
  truckIDError: string = '';
  truckTypeError: string = '';  
  truckLicensePlateError: string = '';
  truckColorError: string = '';
  truckNicknameError: string = '';
  truckWeightCapacityError: string = '';
  truckWeightCapacityUnitError: string = '';
  truckVolumeCapacityError: string = '';
  truckVolumeCapacityUnitError: string = '';

  trailerForm!: FormGroup;
  trailerIDError: string = '';
  trailerTypeError: string = '';
  trailerNicknameError:string = '';
  trailerLicensePlateError: string = '';
  trailerWeightCapacityError: string = '';
  trailerWeightCapacityUnitError: string = '';
  trailerVolumeCapacityError: string = '';
  trailerVolumeCapacityUnitError: string = '';

  truckEditForm!: FormGroup;
  truckEditIDError: string = '';
  truckEditTypeError: string = '';  
  truckEditLicensePlateError: string = '';
  truckEditColorError: string = '';
  truckEditNicknameError: string = '';
  truckEditWeightCapacityError: string = '';
  truckEditWeightCapacityUnitError: string = '';
  truckEditVolumeCapacityError: string = '';
  truckEditVolumeCapacityUnitError: string = '';

  trailerEditForm!: FormGroup;
  trailerEditIDError: string = '';
  trailerEditTypeError: string = '';
  trailerEditNicknameError: string = '';

  trailerEditLicensePlateError: string = '';
  trailerEditWeightCapacityError: string = '';
  trailerEditWeightCapacityUnitError: string = '';
  trailerEditVolumeCapacityError: string = '';
  trailerEditVolumeCapacityUnitError: string = '';

  
  current:string='Pony';

  trailer_type:string='Pony';
  truck_type:string='Single';
  trailer_weight:string='ton';
  truck_weight:string='ton';
  trailer_volumn:string='m2';
  truck_volumn:string='m2';

  trailer_list:any = null;
  truck_list:any = null;

  selected_trailer:any = null;
  selected_truck:any =null;

  constructor( private router: Router,
    private aRouter:ActivatedRoute,
    private fb: FormBuilder,
    private tc_service:TruckingCompanyService
  ) {     
    this.active_menu = {
      parent:'company-settings',
      child:'company-settings',
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

    this.truckForm = this.fb.group({
      truck_id: [''],
      truck_type: ['', Validators.required], 
      truck_color: ['', [this.alphabeticValidator()]],    
      truck_nickname: ['', Validators.required], 
      truck_license_plate: ['', Validators.required],       
      weight_capacity: ['',this.numericValidator()], 
      weight_capacity_unit: [''],    
      volume_capacity: ['', this.numericValidator()],     
      share_to_customer:[''],
      volume_capacity_unit: [''],     
    }
    );

    this.trailerForm = this.fb.group({
      trailer_id: [''],
      trailer_type: ['', Validators.required],   
      trailer_nickname:['',Validators.required],
      trailer_license_plate: ['', Validators.required],  
      weight_capacity: ['',this.numericValidator()], 
      weight_capacity_unit: [''],    
      volume_capacity: ['',this.numericValidator()],     
      share_to_customer: [''],
      volume_capacity_unit: [''],     
    }
    );

    
    this.truckEditForm = this.fb.group({
      truck_type: ['', Validators.required], 
      truck_color: ['',[this.alphabeticValidator()]],    
      truck_nickname: ['', Validators.required], 
      truck_license_plate: ['', Validators.required],       
      weight_capacity: ['',this.numericValidator()], 
      weight_capacity_unit: [''],    
      volume_capacity: ['',this.numericValidator()],     
      volume_capacity_unit: [''],     
      share_to_customer:[''],
      edit_id: [''],     
    }
    );

    this.trailerEditForm = this.fb.group({
      trailer_id: [''],
      trailer_type: ['', Validators.required],   
      trailer_nickname:['',Validators.required],
      trailer_license_plate: ['', Validators.required],  
      weight_capacity: ['',this.numericValidator()], 
      weight_capacity_unit: [''],    
      volume_capacity: ['',this.numericValidator()],     
      volume_capacity_unit: [''],
      share_to_customer: [''], 
      edit_id: [''],     
    }
    );

    this.getTCTrailers();
    this.getTCTrucks();

    $(document).on('click','.btnremove', function(this:any) {
      $(this).closest('.modal-div').find('.delete-modal').toggle('slow');
    });
    $(document).on('click','.btnaction', function(this:any) {
        $(this).closest('.delete-modal').hide();
    });

   

    $(document).ready(function() {
      $('#truckpopup').on('show.bs.modal', function () {
          $('#modalBackdrop').show();
      });
  
      $('#truckpopup').on('hidden.bs.modal', function () {
          $('#modalBackdrop').hide();
      });
  });
    $(document).ready(function() {
      $('#trailerpopup').on('show.bs.modal', function () {
          $('#modalBackdrop').show();
      });
  
      $('#trailerpopup').on('hidden.bs.modal', function () {
          $('#modalBackdrop').hide();
      });
  });



  $(document).ready(function() {
    $('#newTruck').on('show.bs.modal', function () {
        console.log('Modal is showing');
        $('#modalBackdrop').show();
    });

    $('#newTruck').on('hidden.bs.modal', function () {
        console.log('Modal is hidden');
        $('#modalBackdrop').hide();
    });
});



  }
 closeMore() {
    
    setTimeout(() => {
      $('.modal-backdrop').hide(); 
    }, 100);
    
  }
  
  isActive(tabName: string): boolean {
    return this.current === tabName;
  }

  setActiveTab(tabName: string) {
    this.current = tabName;
  }

  
  
  goToStepAdd(step:string, from:string){
    this.current_step_add = step;
    $('#modalBackdrop').show();

  }

  numericValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      // If the value is not empty and not a valid number
      if (value !== null && value !== '' && isNaN(value)) {
        return { numeric: true };
      }
  
      return null; // Return null for a valid input (including empty or null)
    };
  }
  
  
  alphabeticValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
  
      // If the value is not empty and doesn't match the alphabetic pattern
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        return { alphabetic: true };
      }
  
      return null; // Return null for a valid input (including empty)
    };
  }

  backButton(){
    this.emptyTruckErrors();
    this.emptyTrailerErrors();
    this.current_step_add = '';
    $('#modalBackdrop').hide();
  }

  goToStep(step:string, from:string){
    this.current_step = step;
  }

  setTrailer(trailer:any){
    this.selected_trailer = trailer;
    this.trailerEditForm.get('share_to_customer')?.patchValue(this.selected_trailer?.share_to_customer == 1? true : false)
    this.trailerEditForm.get('edit_id')?.patchValue(trailer?.id);
    this.trailerEditForm.get('trailer_id')?.patchValue(trailer?.trailer_nickname);
    this.trailerEditForm.get('trailer_type')?.patchValue(trailer?.trailer_type);
    this.trailerEditForm.get('trailer_license_plate')?.patchValue(trailer?.trailer_license_plate);
    this.trailerEditForm.get('trailer_nickname')?.patchValue(trailer?.trailer_nickname);
    this.trailerEditForm.get('weight_capacity')?.patchValue(trailer?.weight_capacity);
    this.trailerEditForm.get('weight_capacity_unit')?.patchValue(trailer?.weight_capacity_unit);
    this.trailerEditForm.get('volume_capacity')?.patchValue(trailer?.volume_capacity);
    this.trailerEditForm.get('volume_capacity_unit')?.patchValue(trailer?.volume_capacity_unit);
  }

  setTruck(truck:any){
    this.selected_truck = truck;
    this.truckEditForm.get('share_to_customer')?.patchValue(this.selected_truck?.share_to_customer == 1? true : false)
    this.truckEditForm.get('edit_id')?.patchValue(truck?.id);
    this.truckEditForm.get('truck_type')?.patchValue(truck?.truck_type);
    this.truckEditForm.get('truck_color')?.patchValue(truck?.truck_color);
    this.truckEditForm.get('truck_nickname')?.patchValue(truck?.truck_nickname);
    this.truckEditForm.get('truck_license_plate')?.patchValue(truck?.truck_license_plate);
    this.truckEditForm.get('weight_capacity')?.patchValue(truck?.weight_capacity);
    this.truckEditForm.get('weight_capacity_unit')?.patchValue(truck?.weight_capacity_unit);
     this.truckEditForm.get('volume_capacity')?.patchValue(truck?.volume_capacity);
      this.truckEditForm.get('volume_capacity_unit')?.patchValue(truck?.volume_capacity_unit);
    
  }

  getTCTrucks(){
    this.loading = true;
    const formData = new FormData();
    formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);
    formData.append('is_pagination', 'false');
    formData.append('type', 'truck');
    this.tc_service.getTCTrucks(formData).subscribe(response=>{
      this.loading=false;
      if(response.status && response.data){
        this.truck_list = response.data;
      }else{  
        
      }
    })
  }

  getTCTrailers(){
    this.loading = true;
    const formData = new FormData();
    formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);
    formData.append('is_pagination', 'false');
    formData.append('type', 'trailer');
    this.tc_service.getTCTrucks(formData).subscribe(response=>{
      
      this.loading = false;
      if(response.status && response.data){
        this.trailer_list = response.data;
      }else{  
        
      }
    })
  }

  emptyTruckErrors(){
    this.truckIDError = '';
    this.truckTypeError = '';
    this.truckColorError = '';
    this.truckNicknameError = '';
    this.truckLicensePlateError = '';
    this.truckVolumeCapacityError = '';
    this.truckVolumeCapacityUnitError = '';
    this.truckWeightCapacityError = '';
    this.truckWeightCapacityUnitError = '';
  }
  emptyTrailerErrors(){
    this.trailerIDError = '';
    this.trailerTypeError = '';

    this.trailerLicensePlateError = '';
    this.trailerVolumeCapacityError = '';
    this.trailerVolumeCapacityUnitError = '';
    this.trailerWeightCapacityError = '';
    this.trailerWeightCapacityUnitError = '';
    this.trailerNicknameError='';
  }

  onSaveTruck(){
    this.emptyTruckErrors();
 
    if (this.truckForm.get('truck_type')?.value == '') {
      this.truckTypeError = 'Truck Type is required';
    }   
     
    if (this.truckForm.get('truck_nickname')?.value == '' || this.truckForm.get('truck_nickname')?.value == null) {
      this.truckNicknameError = 'Truck name is required';
    }    
    if (this.truckForm.get('truck_license_plate')?.value == '' || this.truckForm.get('truck_license_plate')?.value == null ) {
      this.truckLicensePlateError = 'Truck License Plate is required';
    }    

    if (this.truckForm.get('weight_capacity')?.value !== '') {
      if(isNaN(this.truckForm.get('weight_capacity')?.value)) {
        this.truckWeightCapacityError = 'Weight Capacity must be numeric.';
      }
    }
    if (this.truckForm.get('volume_capacity')?.value !== '') {
      if (isNaN(this.truckForm.get('volume_capacity')?.value)) {
        this.truckVolumeCapacityError = 'Volume Capacity must be numeric.';
      }
    }
    if (this.truckForm.get('truck_color')?.value !== '') {
      if (this.truckForm.get('truck_color')?.hasError('alphabetic')) {
        this.truckColorError = 'Truck Color must be Alphabetic.';
      }
    } 
    
      
  
    if (this.truckForm.invalid) {
      return;
    }
    let data = {
      truck_id :  this.truckForm.get('truck_nickname')?.value,
      truck_type :  this.truckForm.get('truck_type')?.value,
      truck_color :  this.truckForm.get('truck_color')?.value,
      truck_nickname :  this.truckForm.get('truck_nickname')?.value,
      truck_license_plate :  this.truckForm.get('truck_license_plate')?.value,
      weight_capacity :  this.truckForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.truckForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.truckForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.truckForm.get('volume_capacity_unit')?.value,
      share_to_customer :  this.truckForm.get('share_to_customer')?.value,
      user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id
    }

     this.is_truck_loading =true;
    this.tc_service.saveTruck(data).subscribe(response=>{
              
      this.is_truck_loading =false;
      if (response && !response.status ) {
        this.is_truck_loading =false;
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Error`,
            text:  
            response.message
          }).then(() => {

          });
          
        return;
      }else{
        this.truckForm.reset();
        this.trailer_type='Pony';
        this.truck_type='Single';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        this.is_truck_loading =false;
        this.getTCTrucks()
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success!`,
            text:  
            `Truck Added Successfully.`
          }).then(() => { 
              this.current_step_add = '';
              $('#modalBackdrop').hide();

          });
       
      }
    });

  }

  onSaveTrailer(){
    this.emptyTrailerErrors();

    if (this.trailerForm.get('trailer_type')?.value == '') {
      this.trailerTypeError = 'Trailer Type is required';
    }   
    if (this.trailerForm.get('trailer_nickname')?.value == '' || this.trailerForm.get('trailer_nickname')?.value == null ) {
      this.trailerNicknameError = 'Trailer name is required';
    }    
    if (this.trailerForm.get('trailer_license_plate')?.value == '' || this.trailerForm.get('trailer_license_plate')?.value == null) {
      this.trailerLicensePlateError = 'Trailer License Plate is required';
    }    

    if (this.trailerForm.get('weight_capacity')?.value !== '') {
      if(isNaN(this.trailerForm.get('weight_capacity')?.value)) {
        this.trailerWeightCapacityError = 'Weight Capacity must be numeric.';
      }
    }
    if (this.trailerForm.get('volume_capacity')?.value !== '') {
      if (isNaN(this.trailerForm.get('volume_capacity')?.value)) {
        this.trailerVolumeCapacityError = 'Volume Capacity must be numeric.';
      }
    }

    if (this.trailerForm.invalid) {
      return;
    }

    let data = {
      trailer_id :  this.trailerForm.get('trailer_nickname')?.value,
      trailer_type :  this.trailerForm.get('trailer_type')?.value,
      trailer_license_plate :  this.trailerForm.get('trailer_license_plate')?.value,
      trailer_nickname :  this.trailerForm.get('trailer_nickname')?.value,
      weight_capacity :  this.trailerForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.trailerForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.trailerForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.trailerForm.get('volume_capacity_unit')?.value,
      share_to_customer :  this.trailerForm.get('share_to_customer')?.value,
      user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id
    }

    console.log(data)
    this.is_trailer_loading =true;
    this.tc_service.saveTrailer(data).subscribe(response=>{
      this.is_trailer_loading =false;
      if (response && !response.status ) {
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success`,
            text:  
            `Invoice Send Successfully!`
          }).then(() => {

          });
          
        return;
      }else{
        this.getTCTrailers()
        this.trailerForm.reset();
        this.trailer_type='Pony';
        this.truck_type='Single';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        Swal.fire(
        
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success!`,
            text:  
            `Trailer Added Successfully.`
          }).then(() => { 
              this.current_step_add = '';
              $('#modalBackdrop').hide();

          });
      }
    });

  }

  onEditTruck(){
    this.truckEditIDError = '';
    this.truckEditTypeError = '';
    this.truckEditColorError = '';
    this.truckEditNicknameError = '';
    this.truckEditLicensePlateError = '';
    this.truckEditVolumeCapacityError = '';
    this.truckEditVolumeCapacityUnitError = '';
    this.truckEditWeightCapacityError = '';
    this.truckEditWeightCapacityUnitError = '';
    
    if (this.truckEditForm.get('truck_type')?.value == '') {
      this.truckEditTypeError = 'Truck Type is required';
    }   
    
    if (this.truckEditForm.get('truck_nickname')?.value == '') {
      this.truckEditNicknameError = 'Truck name is required';
    }    

    if (this.truckEditForm.get('truck_license_plate')?.value == '') {
      this.truckEditLicensePlateError = 'Truck License Plate is required';
    }    
  
    
    if (this.truckEditForm.get('weight_capacity')?.value !== '') {
      if(isNaN(this.truckEditForm.get('weight_capacity')?.value)) {
        this.truckEditWeightCapacityError = 'Weight Capacity must be numeric.';
      }
    }
    if (this.truckEditForm.get('volume_capacity')?.value !== '') {
      if (isNaN(this.truckEditForm.get('volume_capacity')?.value)) {
        this.truckEditVolumeCapacityError = 'Volume Capacity must be numeric.';
      }
    }
    if (this.truckEditForm.get('truck_color')?.value !== '' && this.truckEditForm.get('truck_color')?.value !== null ) {
      if (this.truckEditForm.get('truck_color')?.hasError('alphabetic')) {
        this.truckEditColorError = 'Truck Color must be Alphabetic.';
      }
    }

    if (this.truckEditForm.invalid) {
      return;
    }
    let data = {
      edit_id: this.truckEditForm.get('edit_id')?.value,
      truck_type :  this.truckEditForm.get('truck_type')?.value,
      truck_color :  this.truckEditForm.get('truck_color')?.value,
      truck_nickname :  this.truckEditForm.get('truck_nickname')?.value,
      truck_license_plate :  this.truckEditForm.get('truck_license_plate')?.value,
      weight_capacity :  this.truckEditForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.truckEditForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.truckEditForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.truckEditForm.get('volume_capacity_unit')?.value,
      share_to_customer :  this.truckEditForm.get('share_to_customer')?.value,
      user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id
    }

     this.is_truck_loading =true;
    this.tc_service.updateTruck(data).subscribe(response=>{
              
      this.is_truck_loading =false;
      if (response && !response.status ) {
        this.is_truck_loading =false;
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Error`,
            text:  
            'Unable To Update Truck.'
          }).then(() => {

          });
          
        return;
      }else{
        
        $("#truckpopup").modal('hide')
        this.truckEditForm.reset();
        this.trailer_type='Pony';
        this.truck_type='Single';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        this.is_truck_loading =false;
        this.getTCTrucks()
        Swal.fire(
         
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success`,
            text:  
            `Truck Updated Successfully.`
          }).then(() => { 
              this.current_step = 'truck-listing';
              $('body').removeClass('modal-open');  // Manually remove the class
              $('#truckpopup').modal('hide').on('hidden.bs.modal', function () {
                $('body').removeClass('modal-open');  // Manually remove the class
                $('.modal-backdrop').remove();  // Manually remove the backdrop
            });

              $('#truckpopup').modal('hide');
              $('#truckpopup').hide('modal');
              $('#modalBackdrop').hide();
              $(".modal-backdrop").remove();
          });
       
      }
    });
  }


  onEditTrailer(){
    this.trailerEditIDError = '';
    this.trailerEditTypeError = '';

    this.trailerEditLicensePlateError = '';
    this.trailerEditVolumeCapacityError = '';
    this.trailerEditVolumeCapacityUnitError = '';
    this.trailerEditWeightCapacityError = '';
    this.trailerEditWeightCapacityUnitError = '';
    this.trailerEditNicknameError='';

    
    if (this.trailerEditForm.get('trailer_nickname')?.value == '') {
      
      this.trailerEditNicknameError = 'Trailer name is required';
    }     
    
    if (this.trailerEditForm.get('trailer_type')?.value == '') {
      this.trailerEditTypeError = 'Trailer Type is required';
    }    
    if (this.trailerEditForm.get('trailer_license_plate')?.value == '') {
      this.trailerEditLicensePlateError = 'Trailer License Plate is required';
    }    
    
    if (this.trailerEditForm.get('weight_capacity')?.value !== '') {
      if(isNaN(this.trailerEditForm.get('weight_capacity')?.value)) {
        this.trailerEditWeightCapacityError = 'Weight Capacity must be numeric.';
      }
    }
    if (this.trailerEditForm.get('volume_capacity')?.value !== '') {
      if (isNaN(this.trailerEditForm.get('volume_capacity')?.value)) {
        this.trailerEditVolumeCapacityError = 'Volume Capacity must be numeric.';
      }
    }

    if (this.trailerEditForm.invalid) {
      return;
    }
    let data = {
      edit_id: this.trailerEditForm.get('edit_id')?.value,
      trailer_id :  this.trailerEditForm.get('trailer_nickname')?.value,
      trailer_nickname :  this.trailerEditForm.get('trailer_nickname')?.value,
      trailer_type :  this.trailerEditForm.get('trailer_type')?.value,
      trailer_license_plate :  this.trailerEditForm.get('trailer_license_plate')?.value,
      weight_capacity :  this.trailerEditForm.get('weight_capacity')?.value,
      weight_capacity_unit :  this.trailerEditForm.get('weight_capacity_unit')?.value,
      volume_capacity :  this.trailerEditForm.get('volume_capacity')?.value,
      volume_capacity_unit :  this.trailerEditForm.get('volume_capacity_unit')?.value,
      share_to_customer :  this.trailerEditForm.get('share_to_customer')?.value,
      user_id: this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id
    }
    this.is_trailer_loading =true;
    this.tc_service.updateTrailer(data).subscribe(response=>{
      this.is_trailer_loading =false;
      if (response && !response.status ) {
        Swal.fire(
          
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Error`,
            text:  
            `Unable To Update Trailer!`
          }).then(() => {

          });
          
        return;
      }else{
        
        $("#trailerpopup").modal('hide')
        this.getTCTrailers()
        this.trailerEditForm.reset();
        this.trailer_type='Pony';
        this.truck_type='Single';
        this.trailer_weight='ton';
        this.truck_weight='ton';
        this.trailer_volumn='m2';
        this.truck_volumn='m2';
        Swal.fire(
        
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success`,
            text:  
            `Trailer Updated Successfully.`
          }).then(() => { 
              this.current_step = 'trailer-listing';
              $('body').removeClass('modal-open');  // Manually remove the class
              $('#trailerpopup').modal('hide').on('hidden.bs.modal', function () {
                $('body').removeClass('modal-open');  // Manually remove the class
                $('.modal-backdrop').remove();  // Manually remove the backdrop
            });

              $('#truckptrailerpopupopup').modal('hide');
              $('#trailerpopup').hide('modal');
              $('#modalBackdrop').hide();
              $(".modal-backdrop").remove();
          });
      }
    });

  }
  delete(truck:any){
    
  }
  
confirmDelete(truck:any, type:any){
 
  if(!truck || truck?.id==''){
    return;
  }
  const formData = new FormData();
      formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);  
      if(type=='TRAILER'){
        formData.append('type', type); 
      }else{
        formData.append('type', type); 
      }    
      formData.append('delete_id', truck.id);   
      this.is_loading_removing = true;
      this.tc_service.deleteTruckTrailer(formData).subscribe((response:any)=>{
        this.loading = false;
        
      this.is_loading_removing = false;
        if (response && response.status && response.message ) {
    
            Swal.fire(
            {
              confirmButtonColor:'#17A1FA',
              title:   
              `Deleted!`,
              text:  
              response.message
            });
            this.getTCTrailers()
            this.getTCTrucks()
            $("#truckpopup").modal('hide')
            $('#truckpopup').hide('modal');
            $('#trailerpopup').hide('modal');

            $("#trailerpopup").modal('hide');
            $('#modalBackdrop').hide();

            $('.modal-backdrop').remove();  // Manually remove the backdrop

            $('#truckpopup').modal('hide').on('hidden.bs.modal', function () {
              $('body').removeClass('modal-open');  // Manually remove the class
              $('body').removeClass('modal-backdrop');  // Manually remove the class
              $('.modal-backdrop').remove();  // Manually remove the backdrop
          });
          $('#trailerpopup').modal('hide').on('hidden.bs.modal', function () {
            $('body').removeClass('modal-open');  // Manually remove the class
            $('body').removeClass('modal-backdrop');  // Manually remove the class
            $('.modal-backdrop').remove();  // Manually remove the backdrop
        });


        }else{
          Swal.fire(
            {
              confirmButtonColor:'#17A1FA',
              title:   
              `Error!`,
              text:  
              'Unable to delete'
            }
          )
        }
      });
}
}
