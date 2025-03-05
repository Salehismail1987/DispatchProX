import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-set-truck-rates',
  templateUrl: './set-truck-rates.component.html',
  styleUrls: ['./set-truck-rates.component.css']
})
export class SetTruckRatesComponent implements OnInit {

  project_id:any = null;
  loggedinUser: any = {};
  message:any;

  //Data Container
  project: any;
  project_combinations_data:any;
  trucks_data:any;
  trailers_data:any;
  is_loading_rates:boolean = false;  

  setTruckRates!: FormGroup;

  constructor(
    private router: Router,
    private activeRouter: ActivatedRoute,
    private projectService: ProjectService,    
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
    }else{
      this.router.navigate(['/home']);
    }

    this.project_id =  this.activeRouter.snapshot.params['id'];
    if(this.project_id !=""){
    
      this.projectDetails(this.project_id);
    }

    this.setTruckRates = this.fb.group({
      project_id: [''],
      project_trucks: this.fb.array([]),
      project_trailers: this.fb.array([]),
      project_combinations: this.fb.array([])
    });

  }
  ngAfterViewInit(): void {
  
    this.checkChanges();
    
  }

  checkChanges():void{
    
    this.setTruckRates.get('project_trucks')?.valueChanges.subscribe(data=>{
     
      let data_push:any =[];
      if(this.setTruckRates.dirty){
        this.trucks_data = data;
        console.log(data);
        this.refresh_comb_data();
      }
    });

    this.setTruckRates.get('project_trailers')?.valueChanges.subscribe(data=>{
     
      let data_push:any =[];
      if(this.setTruckRates.dirty){
        this.trailers_data = data;
        console.log(data);
        this.refresh_comb_data();
      }
    });

    this.setTruckRates.get('project_combinations')?.valueChanges.subscribe(data=>{
     
      let data_push:any =[];
      if(this.setTruckRates.get('project_combinations')?.dirty){

        data && data.map((data_item: any)=>{
          let cost = this.getTruckPrice(data_item.project_trailer_id) + this.getTruckPrice(data_item.project_truck_id);
          data_item.cost= cost;
          data_push.push(data_item);
        })

        this.project_combinations_data = data_push;
      }
  
    })


  }

  refresh_comb_data(){
   let combs =  this.setTruckRates.get('project_combinations')?.value;
   let data_push:any =[];
      if(combs){

        combs && combs.map((data_item: any)=>{
          let cost = this.getTruckPrice(data_item.project_trailer_id) + this.getTruckPrice(data_item.project_truck_id);
          data_item.cost= cost;
          data_push.push(data_item);
        })

        this.project_combinations_data = data_push;
      }
  }

  addTrailerField() {     
    this.project_trailers.push(
      this.fb.group({
        name:['',Validators.required],
        id: ['',Validators.required],
        rate: ['',Validators.required]
      })
    );  
  }

  addCombinationField(){
    this.project_combinations.push(
      this.fb.group({
        nickname: ['',Validators.required],
        project_truck_id: ['',Validators.required],
        project_trailer_id: [''],
        cost: ['',Validators.required]
      })
    );  

  }

  getTruckPrice(truckId:any){
    let tprice = 0;
    this.trucks_data.map((item:any)=>{
     if(item.id == truckId){
      tprice = parseFloat(item.rate.toString()) ;
     } 
    })
    this.trailers_data.map((item:any)=>{
      if(item.id == truckId){
       tprice = parseFloat(item.rate.toString()) ;
      } 
     })
    return tprice;
  }

  addTruckField() { 
    this.project_trucks.push(
      this.fb.group({
        name:[],
        id:[],
        rate: []
      })
    ); 
  }

  get project_trucks(): FormArray {
    return this.setTruckRates.controls["project_trucks"] as FormArray;
  }
  get project_trailers(): FormArray {
    return this.setTruckRates.controls["project_trailers"] as FormArray;
  }
  get project_combinations(): FormArray {
    return this.setTruckRates.controls["project_combinations"] as FormArray;
  }

  projectDetails(project_id:any){
    this.projectService.projectDetails(project_id).subscribe(response=>{
  
      if(response.status && response.data){

        this.project  = response.data;
        this.project_combinations_data = this.project.project_combinations;
        this.trucks_data = this.project.project_trucks;
        this.trailers_data = this.project.project_trailers;

        this.project.project_trucks && this.project.project_trucks.length>0 && this.project.project_trucks.map((item:any)=>{
          this.addTruckField();               
        })

        this.project.project_trailers && this.project.project_trailers.length>0 && this.project.project_trailers.map((item:any)=>{
          this.addTrailerField();             
        })

        this.project.project_combinations && this.project.project_combinations.length>0 && this.project.project_combinations.map((item:any)=>{
          this.addCombinationField();               
        })
      }
    })
  }

  onSetTruckRate(){
    if(this.setTruckRates.invalid){
       const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(`Warning`,`Problem in values you entered.All fields are required. Please recheck!`);
      return;
    }else{
      this.is_loading_rates = true;
      let data:any = this.setTruckRates.value;
      data.project_id = this.project_id;
    
      this.projectService.setRates(data).subscribe(respponse=>{
        this.is_loading_rates = false;
        if(respponse.status ){
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(`Success`,`Truck Rates & Combinations Saved!`);
        }else{
           const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(`Warning`,respponse.message);
        }
      })
    }
    
   

    
  }


  
  addComb(){
    let name = $("#new_comb_name").val();
    let truck_type = $("#new_comb_truck_type").val();
    let trailer_type = $("#new_comb_trailer_type").val();
    let cost = $("#new_comb_cost").val();
    if(name && truck_type  && cost){
      
      this.project_combinations.push(
        this.fb.group({
          nickname: [name,Validators.required],
          project_truck_id: [truck_type,Validators.required],
          project_trailer_id: [trailer_type],
          cost: [cost,Validators.required]
        })
      );  
      this.refresh_comb_data()
      $("#new_comb_name").val('');
      $("#new_comb_truck_type").val('');
       $("#new_comb_trailer_type").val('');
      $("#new_comb_cost").val('');

      $("#addCommboModal").modal('hide');
    }else{
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        `Warning`,
        `Combo name,Truck type and cost are required!`).then(() => { 
       
        });
    }
  }
}
