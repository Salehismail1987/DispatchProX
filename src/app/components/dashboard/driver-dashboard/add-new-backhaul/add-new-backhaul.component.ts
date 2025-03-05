import { ChangeDetectorRef, Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-add-new-backhaul',
  templateUrl: './add-new-backhaul.component.html',
  styleUrls: ['./add-new-backhaul.component.css']
})
export class AddNewBackhaulComponent implements OnInit {

  @Input('inprogress_round') inprogress_round:any;
  @Input('ticket_detail') ticket_detail:any;

  @Output() hideAddBackhaul= new EventEmitter();
  
  loggedinUser: any;
  canada_provinces:any=null;
  usa_provinces:any=null;
  date_today: any;

  detail_round:any=null;
  hours: any = null;
  screen: string = 'mobile';
  driver_ticket_id: any;
  round_to_start: any = null;
  round_in_progress: any = null;

  edited_hours: any = null;
  edited_mints: any;


  active_tab: string = 'rounds-detail';

  roundTime: any;
  jobTime: any;

  all_rounds_done: boolean = false;

  ticket_to_decline: any = null;
  show_reason: boolean = false;

  reason_decline: string = '';
  reason_error: string = '';

  loading_reject: boolean = false;
  notes_for_approval: any;

  loading_details: boolean = true;

  more_tickets: any = null;
  more_more_tickets: any = null;

  dump_sites: any = null;

  // Round Updates
  new_dum_site: string = '';
  current_site: string = '';
  new_material_taken_out: string = '';
  driver_round_notes: string = '';
  show_round_update_popup: string = '';
  update_round_id: any = null;

  new_material_error: string = '';
  round_notes_error: string = '';
  new_dumpsite_error: string = '';

  job_notes_error: string = '';
  pickup_site_error: string = '';
  detail_round_id: any = null;
  loading_update: boolean = false;

  show_notes_popup: boolean = false;
  show_time_edit_popup: boolean = false;
  notification_id: any = null;
  notification_type: any = null;
  pickup_site: any = null;

  show_add_dumpsite: boolean = false;
  addDumpsite!: FormGroup;
  loading_add: boolean = false;
  isFormClicked: boolean = false;

  hide_modal_paper_ticket: boolean = false;
  new_paper_ticket_id: any = null;
  paper_ticket_id_error: any = '';
  hide_modal_paper_ticket_photo: boolean = false;
  loading_paper_ticket:boolean=false;
  new_paper_ticket_photo: any = null;
  paper_ticket_photo_error: any = '';
  loading_add_h:boolean=false;
  show_edit_address_ds:any=false;
  show_edit_address_pl:any=false;
  edited_address_ds:any = null;
  street_error:any =null;
  city_error:any = null;
  set_country:any = 'Canada';
  show_add_backhaul:boolean=false;

  drop_location_name:any=null;
  drop_location_address:any=null;
  material_in:any = null;
  haulback_notes:any= null;
  pickup_location_name:any= null;
  pickup_location_address:any= null;
  addPickupLocation!:FormGroup;

  show_add_pickuplocation = false;
  edited_address_pl:any= null;

  drop_location_error='';
  pickup_location_error='';
  material_in_error='';

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private fb: FormBuilder,
    private responsiveService: ResponsiveService,
    private project_service: ProjectService,
    private driver_service: DriverService,
    private user_service: UserDataService,
    private changeDetector: ChangeDetectorRef,

    private notification_service: NotificationService,
  ) { }

  ngOnInit(): void {

    

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

    
    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });


    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if (!userDone || userDone.full_name == undefined) {
      this.router.navigate(['/home']);
    }
    this.addDumpsite = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.addPickupLocation= this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  setHideAddBackhaul(){
    this.hideAddBackhaul.emit();
  }

  setRoundPopup(type: any, round_id: any, current_site: string = '', notes: string = '', material: string = '') {
    if (type !== "") {
      this.show_round_update_popup = type;
    }
    if (round_id != '') {
      this.update_round_id = round_id;
    }

    if (current_site != "") {
      if (type == 'pickupsite-popup') {
        this.pickup_site = current_site;
      } else {
        this.new_dum_site = current_site;
        this.new_dum_site = current_site;
      }

    }

    if (notes != '') {
      this.driver_round_notes = notes;
    }

    if (material != "") {
      this.new_material_taken_out = material;
    }
  }

  closeRoundPopup() {
    this.update_round_id = null;
    this.show_round_update_popup = '';
    this.new_material_taken_out = '';
    this.new_dum_site = '';
    this.driver_round_notes = '';
    this.loading_update = false;
  }

  handleSiteChange() {

    this.closeRoundPopup();
  }

  handleAddDumpsite(){
    this.isFormClicked = true;
    if (this.addDumpsite.invalid) {
      return;
    }
    let data: any = this.addDumpsite.value;
    this.drop_location_name  = data?.name ;
    this.drop_location_address = data?.location;
    this.show_add_dumpsite = false;
  }
  
  showAddDumpSite() {
    this.isFormClicked = false;
    this.show_add_dumpsite = true;
  }

  setEditPLAddress(){
    this.street_error = null;
    this.city_error=null;
    let d:any=false;
    if(!$("#pl_street").val()){
      this.street_error = 'Street required';
      d=true;
    }

    if(!$("#pl_city").val()){
      this.city_error = 'City required';
      d=true;
    }

    if(d){
      return;
    }

    let address:any = '';
    if($("#pl_street").val()){
      address = $("#pl_street").val();
    }

    if($("#pl_city").val()){
      address += address !='' ? ',':'';
      address += $("#pl_city").val();
    }


    if($("#pl_province").val()){
      address += address !='' ? ' ':'';
      address += $("#pl_province").val();
    }
    if($("#pl_postal_code").val()){
      address += address !='' ? ' ':'';
      address += $("#pl_postal_code").val();
    }

    
    if($("#pl_country").val()){
      address += address !='' ? ', ':'';
      address += $("#pl_country").val();
    }

    this.edited_address_pl = address;
    this.addPickupLocation.get('location')?.patchValue(address);

    this.show_edit_address_pl=false;
  }
  
  setEditDSAddress(){
    this.street_error = null;
    this.city_error=null;
    let d:any=false;
    if(!$("#ds_street").val()){
      this.street_error = 'Street required';
      d=true;
    }

    if(!$("#ds_city").val()){
      this.city_error = 'City required';
      d=true;
    }

    if(d){
      return;
    }

    let address:any = '';
    if($("#ds_street").val()){
      address = $("#ds_street").val();
    }

    if($("#ds_city").val()){
      address += address !='' ? ',':'';
      address += $("#ds_city").val();
    }


    if($("#ds_province").val()){
      address += address !='' ? ' ':'';
      address += $("#ds_province").val();
    }
    if($("#ds_postal_code").val()){
      address += address !='' ? ' ':'';
      address += $("#ds_postal_code").val();
    }

    
    if($("#ds_country").val()){
      address += address !='' ? ', ':'';
      address += $("#ds_country").val();
    }

    this.edited_address_ds = address;
    this.addDumpsite.get('location')?.patchValue(address);

    this.show_edit_address_ds=false;
  }

  hideAddDumpSite() {
    this.isFormClicked = false;
    this.show_add_dumpsite = false;

  }

  showEditAddressDS(){
    this.show_edit_address_ds  = true;
  }

  hideEditAddressDS(){
    this.show_edit_address_ds  = true;
  }
  
  hideAddAddressSite(){
    this.show_edit_address_ds=false;
  }

  setCountry(event:any){
    this.set_country = event.target.value;
  }

  setNewMaterial(e:any){
    if(e.target.value){
      this.material_in = e?.target.value;
    }else{
      this.new_material_error ='Material in required!'
    }
  }

  setNewNotes(e:any){
    if(e.target.value){
      this.haulback_notes = e?.target.value;
    }else{
      this.round_notes_error ='Notes required!'
    }
  }

  handleNewNotes(){
    this.closeRoundPopup();
  }

  handleNewMaterial(){
    this.closeRoundPopup();
  }

  handlePickupChange(){
    this.isFormClicked = true;
    if (this.addPickupLocation.invalid) {
      return;
    }
    let data: any = this.addPickupLocation.value;
    this.pickup_location_name  = data?.name ;
    this.pickup_location_address = data?.location;
    this.show_add_pickuplocation = false;
    this.closeRoundPopup();
  }

  showAddPickup(){
    this.isFormClicked =false;
    this.show_add_pickuplocation=true;
  }

 
  showEditAddressPL(){
    this.show_edit_address_pl  = true;
  }

  hideEditAddressPL(){
    this.show_edit_address_pl  = true;
  }
  
  
  hideAddPickup(){
    this.isFormClicked =false;
    this.show_add_pickuplocation=false;
  }

  
  hideAddAddressPL(){
    this.show_edit_address_pl=false;
  }

  handleAddBackhaul(){
    this.drop_location_error= '';
    this.pickup_location_error = '';
    this.material_in_error = '';

    let error:any=false;
    if(!this.drop_location_address || !this.drop_location_name ){
      if(this.ticket_detail?.ticket?.project?.project_location){
        this.drop_location_name = this.ticket_detail?.ticket?.project?.project_location;
      }else{
        
      this.drop_location_error = 'Drop location required';
      error=true;
      }
    }

    if(!this.pickup_location_address || !this.pickup_location_name ){
      if(this.inprogress_round?.dump_site){
        this.pickup_location_name = this.inprogress_round?.dump_site;
      }else{

        this.pickup_location_error = 'Pickup location required';
        error=true;
      }
    }

    if(!this.material_in){
      this.material_in_error = 'Material in required';
      error=true;
    }

    if(error){
      return;
    }

    let data:any = {
      drop_location_address: this.drop_location_address,
      drop_location_name: this.drop_location_name,
      pickup_location_name: this.pickup_location_name,
      pickup_location_address: this.pickup_location_address,
      haulback_notes: this.haulback_notes,
      material_in: this.material_in,
      round_id:this.inprogress_round?.id,
      is_tc_ticket: this.ticket_detail?.ticket?.tc_ticket ? 'YES':'NO',
      ticket_id: this.ticket_detail?.ticket?.id,
      driver_id: this.ticket_detail?.driver_id
    }
    this.loading_add_h=true;

    this.driver_service.addHaulback(data).subscribe(response => {

      this.loading_add_h = false;
      if (response.status) {
    

          this.closeRoundPopup();
          this.hideAddBackhaul.emit()
      } else {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          })
      }
    });
  }
  setLocation(location:any){
    if(location){
      this.pickup_location_name = location;
      this.closeRoundPopup();
    }
  }

  setDLocation(location:any){
    if(location){
      this.drop_location_name = location;
      this.closeRoundPopup();
    }
  }
  
}
