
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TruckingDispatchService } from 'src/app/services/trucking-dispatch.service';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-set-tc-rates',
  templateUrl: './set-tc-rates.component.html',
  styleUrls: ['./set-tc-rates.component.css']
})


export class SetTcRatesComponent implements OnInit {

    project:any;
  cc:any;
   is_tc_project:any;
  
    sort_by:any=null;
    search_by:any=null;
    project_id:any = null;
    loggedinUser: any = {};
    message:any;
    edit_comb:any=null;
  
    //Data Container
    project_combinations_data:any;
    trucks_data:any;
    trailers_data:any;
    is_loading_rates:boolean = false;  
  
    setTruckRates!: FormGroup;
    user_id:any=null;

    show_edit_rate:boolean=false;
    show_add_comb:boolean=false;
    constructor(
      private router: Router,
      private activeRouter: ActivatedRoute,
      private projectService: ProjectService,    
      private tc_dispatch_service: TruckingDispatchService,
      private fb: FormBuilder,
    ) { }
  
    ngOnInit(): void {
      let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
      if(userDone && userDone.id){
        this.loggedinUser = userDone;
      }else{
        this.router.navigate(['/home']);
      }
  
      this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
    let project_id2 =  this.activeRouter.snapshot.params['project_id'];
    if(project_id2 !=""){
     
      let proj = project_id2.toString().split('-');
      this.project_id = proj[0];
    
      this.is_tc_project = proj[1];
      
    }
    this.projectDetails( this.project_id);
  
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
  
    projectDetails(pp:any){
      
      let data22={user_id:this.user_id,action:'tc_projects',sort_by:this.sort_by,search_by:this.search_by}
      this.tc_dispatch_service.getAllData(data22).subscribe(response => {
   
        if (response.status && response.data) {
          let projects_list = response.data;
       
          projects_list.map((item:any)=>{
             let projects = item?.projects;
             projects.map((proj:any)=>{

                if(this.is_tc_project == 'YES'){
                    
                  if(proj?.id == this.project_id && proj?.trucking_company_id !=''){
                    this.project = proj;
                 console.log(this.project,this.project_id)   
                 
                 
                    this.project_combinations_data = this.project?.project_combinations_data;
                   
                    this.trucks_data = this.project?.project_trucks;
                    this.trailers_data = this.project?.project_trailers;
                    this.project?.project_trucks && this.project?.project_trucks.length>0 && this.project?.project_trucks.map((item:any)=>{
                      this.addTruckField();               
                    })
            
                    this.project?.project_trailers && this.project?.project_trailers.length>0 && this.project?.project_trailers.map((item:any)=>{
                      this.addTrailerField();             
                    })
            
                    this.project?.project_combinations_data && this.project?.project_combinations_data.length>0 && this.project?.project_combinations_data.map((item:any)=>{
                   
                      this.addCombinationField();               
                    })
        
                    this.cc = item;
                  }
                }
             
                if(this.is_tc_project == 'NO'){
              
                  if(proj?.id == this.project_id && !proj?.trucking_company_id){
                    this.project = proj;
                 
                    this.project_combinations_data = this.project?.project_combinations_data;
                    this.trucks_data = this.project?.project_trucks;
                    this.trailers_data = this.project?.project_trailers;
                    this.project?.project_trucks && this.project?.project_trucks.length>0 && this.project?.project_trucks.map((item:any)=>{
                      this.addTruckField();               
                    })
            
                    this.project?.project_trailers && this.project?.project_trailers.length>0 && this.project?.project_trailers.map((item:any)=>{
                      this.addTrailerField();             
                    })
            
                    this.project?.project_combinations_data && this.project?.project_combinations_data.length>0 && this.project?.project_combinations_data.map((item:any)=>{
                      this.addCombinationField();               
                    })
        
                    
                    this.cc = item;
                  }
                }
             })
          })

        }
      });


    }
  
    onSetTruckRate(){
      if(this.setTruckRates.invalid){
         Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Warning',
            text: `Problem in values you entered.All fields are required. Please recheck!`
          })
        return;
      }else{
        this.is_loading_rates = true;
        let data:any = this.setTruckRates.value;
        data.is_tc_call = 'YES';
        data.is_tc_project = this.is_tc_project;
        data.project_id = this.project_id;
        data.user_id = this.user_id;
        this.projectService.setRates(data).subscribe(respponse=>{
          this.is_loading_rates = false;
          if(respponse.status ){
       this.edit_comb = null;
       this.show_add_comb = false;
       this.show_edit_rate =false;
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Success',
            text:  `Truck Rates & Combinations Saved!`
          })
          }else{
            
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Error',
            text:  respponse.message
          })
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
        
        this.show_add_comb=false;
        this.refresh_comb_data()
        $("#new_comb_name").val('');
        $("#new_comb_truck_type").val('');
         $("#new_comb_trailer_type").val('');
        $("#new_comb_cost").val('');
        this.onSetTruckRate();
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

    showEditRate(){
      this.show_edit_rate=true;
    }

    showAddComb(){
      this.show_add_comb = true;
    }

    setEditComb(d:any){
      this.edit_comb=d;
    }

    updateComb(){
      this.onSetTruckRate();
    }
  }
  