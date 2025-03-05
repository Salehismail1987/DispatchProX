import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from 'src/app/services/driver.service';
import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-deriver-scheduler',
  templateUrl: './deriver-scheduler.component.html',
  styleUrls: ['./deriver-scheduler.component.css']
})
export class DeriverSchedulerComponent implements OnInit {

  loggedinUser:any=null;
  date_today:any=null;
  active_menu:any;
  is_loading:any='';
  dashboard_data:any=null;
  datejobs:any=null;
  status:any='';
  ticket_status:any='';
  ticket_detail:any=null;
  isDesktop:boolean=true;
  reason_decline: string='';
  reason_error: string='';
  ticket_to_decline: any=null;
  loading_reject: boolean=false;
  show_reason: boolean=false;
  show_address_popup:boolean=false;

  project_id:any=null;
  projects_list:any=null;
  selected_month:any=null;
  screen:string='desktop';
  search_by: any = '';


  ticket_date:string= ''
  ticket_description:string='';
  paper_ticket_id:string='';
  ticket_project:any=null;
  ticket_construction_company:any=null;
  ticket_trucking_company:any=null;
  ticket_trailer:any=null;
  ticket_truck:any=null;
  ticket_dispatcher:any=null;
  ticket_dumpsite:any=null;
  ticket_approver:any=null;
  ticket_start_time:any='';

  date:any=null;

  construction_companies:any=null;
  trucking_companies:any=null;
  projects:any= null;
  dump_sites:any=null;
  approvers:any=null;
  dispatchers:any=null;

  ticket_data:any=null;

  rounds:number=1;
  rounds_arr:any=[1];

  addTC!: FormGroup;
  addCC!: FormGroup;
  addTruck!: FormGroup;
  addTrailer!: FormGroup;
  addProject!: FormGroup;
  addDispatcher!: FormGroup;
  addApprover!: FormGroup;
  addDumpSite!: FormGroup;
  ticketForm!: FormGroup;

  form_clicked:boolean= false;
  is_downloading:boolean=false;
  is_visible:string= '';
  is_loading_add:string= '';

  new_address:any='';

  company_error:string='';
  trucking_error:string='';
  start_time_error:string ='';
  project_error:string='';
  paper_ticket_id_error:string='';
  dispatcher_error:string='';
  truck_error:string='';
  total_rounds_error:string='';

  dumpsite_name_error:string='';
  address_error:string='';
  is_self_dispatched:boolean=false;
  is_tc_ticket:any='NO';
  approver_error:string='';
  ticket_date_error: string='';
  total_rounds:any=0;

  street_error:any = '';
  city_error:any = '';
  province_error:any = '';

  set_country:any = '';
  usa_provinces:any;
  canada_provinces:any;

  constructor(
    private router: Router,
    private actRouter: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private driver_service: DriverService,
    private project_service:ProjectService,
    private ticket_service: TicketService,
    private freelance_driver:FreelanceDriverServiceService,
    private user_service:UserDataService,
    private fb : FormBuilder,
  ) {
    this.responsiveService.checkWidth();
    this.onResize();
    this.active_menu = {
      parent:'Requests',
      child:'Requests',
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

    this.updateMenuCounts()
    let tz = environment.timeZone;
    var d = new Date();
    this.date_today = d.toLocaleString('en-US', { timeZone: tz });

    let cDay = d.getDate();
    let cMonth = d.getMonth() + 1;
    let cYear = d.getFullYear();
    this.date = cDay + "-" + cMonth + "-" + cYear ;
    this.actRouter.queryParams.subscribe(params => {

      this.status = params['status'];

      if(this.status !=""){
        this.status= params['status'];
      }
    });

    if(this.status=='Requests' || this.status=='Closed' || this.status=='Dispatched'){
      this.active_menu = {
        parent:'tickets',
        child:this.status,
        count_badge: '',
      }
    }

    this.getSchedulardata();
    this.getProjects();

    this.addApprover = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],
      email: [''],
    });

    this.addCC = this.fb.group({
      company_name: ['', Validators.required],
    });

    this.addTC = this.fb.group({
      contact_phone: [''],
      contact_email: [''],
      contact_name: ['', Validators.required],
      company_name: ['', Validators.required],
    });

    this.addDispatcher = this.fb.group({
      name: ['', Validators.required],
      contact_number: ['', Validators.required],

    });

    this.addDumpSite = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      is_default: [''],
    });

    this.addProject = this.fb.group({
      project_name: ['', Validators.required],
      job_number: ['', Validators.required],
      street: ['', Validators.required],
      is_default:['']
    });

    this.addTrailer = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      volume:[''],
      volume_unit:['m3'],
      weight:[''],
      weight_unit:['tons'],
      color:['']
    });

    this.addTrailer.get('volume_unit')?.setValue('m3');
    this.addTrailer.get('weight_unit')?.setValue('tons');

    this.addTruck = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      license_plate: ['', Validators.required],
      is_default:[''],
      volume:[''],
      volume_unit:['m3'],
      weight:[''],
      weight_unit:['tons'],
      color:['']
    });
    this.addTruck.get('volume_unit')?.setValue('m3');
    this.addTruck.get('weight_unit')?.setValue('tons');

    this.ticketForm = this.fb.group({
      ticket_rounds: this.fb.array([]),
      // project_id: ['', Validators.required],
      // trucking_company_id: ['', Validators.required],
      // approver_id: ['', Validators.required],
      // construction_company_id: ['', Validators.required],
      // dispatcher_id: [''],
      // truck_id: ['', Validators.required],
      // trailer_id: [''],
      // state_wise_no: [''],
      // ticket_no: [''],
      // paper_ticket_id: [''],
      // description: [''],
      // number_of_rounds: ['', Validators.required],
      // start_time: ['', Validators.required],
    });

    $(document).on('click','.getinputfield22' ,function(this:any) {

      $('.input-popup-div22').hide();
      $('.getinputfield22').find('.input-popup-div22').show();
    });
    $(document).on('click','.getinputfield' ,function(this:any) {
        $('.input-popup-div').hide();
        $(this).find('.input-popup-div').show();
    });
    $(document).on('click','.getinputfield2', function(this:any) {
        $('.input-popup-div2').hide();
        $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });
    $(window).click(function(e:any) {
        if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length || $(e.target).closest('.getinputfield22').length)) {
            $('.input-popup-div').hide();
            $('.input-popup-div2').hide();
            $('.input-popup-div22').hide();
        }

        if (($(e.target).hasClass('job-status'))){
          let status=$(e.target).find('.job-id').text();
          console.log(status)
        }
    });
    setTimeout(() => {

      $(".button.right").html(`<svg width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_23354_2488)">
        <path d="M14.3136 6.67801C14.8876 7.07569 14.8876 7.92431 14.3136 8.32199L5.81949 14.2069C5.15629 14.6663 4.25 14.1917 4.25 13.3849L4.25 1.61514C4.25 0.808322 5.15629 0.33367 5.8195 0.793149L14.3136 6.67801Z" fill="#88898B"/>
        </g>
        <defs>
        <filter id="filter0_d_23354_2488" x="0.25" y="0.613281" width="18.4941" height="21.7734" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_23354_2488"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_23354_2488" result="shape"/>
        </filter>
        </defs>
        </svg>`);

        $(".button.left").html(`<svg width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_23354_2485)">
        <path d="M4.68645 8.32199C4.11244 7.92431 4.11244 7.07569 4.68645 6.67801L13.1805 0.79315C13.8437 0.33367 14.75 0.808326 14.75 1.61514L14.75 13.3849C14.75 14.1917 13.8437 14.6663 13.1805 14.2069L4.68645 8.32199Z" fill="#88898B"/>
        </g>
        <defs>
        <filter id="filter0_d_23354_2485" x="0.255859" y="0.613281" width="18.4941" height="21.7734" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_23354_2485"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_23354_2485" result="shape"/>
        </filter>
        </defs>
        </svg>`);
        $(".driver-desktop table").css({width:'80%'})
        if(this.responsiveService.screenWidth == 'mobile'){
          $(".driver-desktop table").css({width:'100%'})
        }

    }, 1500);
    $(document).on('click','.job-status', function(this:any) {
      var t = $(this).find('.job-id').text();
      var dis = $(this).find('.is_self_dispatched').text();

      var ist = $(this).find('.is_tc_ticket').text();
      window.localStorage.setItem('job_id',t.toString());
      window.localStorage.setItem('is_tc_ticket',ist.toString());
      window.localStorage.setItem('is_self_dispatched',dis.toString());
    });

    $('#pnlEventCalendar2').calendar({
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      onSelect: function(event:any) {
          $('#lblEventCalendar').text(event.label);
      },
      showdetail: false,
      smalldivs: true
    });
    this.newRound(1);


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

  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    let ticketTime;
    let ticketDate;


    if (round == 1 && requestDetail?.ticket?.ticket_date && requestDetail?.ticket?.ticket_time) {
      const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
      const ticketTime = requestDetail.ticket.ticket_time; // Ticket time
      const ticketDate = requestDetail.ticket.ticket_date; // Ticket date

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion(data);

      return conversionResult;
    }
    else if (round == 2 && requestDetail?.ticket_date && requestDetail?.ticket_time)
      {
        const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
        const ticketTime = requestDetail.ticket_time; // Ticket time
        const ticketDate = requestDetail.ticket_date; // Ticket date

        let data = { ticketTime, ticketDate, userTimeZone };

        // Call the service method to perform the conversion
        const conversionResult = this.ticket_service.timeConversion(data);

        return conversionResult;
      }
    else if (round == 3 && requestDetail)
      {
        const userTimeZone = this.loggedinUser?.timezone || environment.timeZone; // Fallback to an empty string if timezone is not set
        const dateTime = new Date(requestDetail?.started_at);
        ticketDate = dateTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        ticketTime = requestDetail?.started_at;

        if (ticketTime) {
          const time = new Date(ticketTime);

          // Format the time to "12:28 am" style
          ticketTime = time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }


        // Check if the date is in Format1 (MM/DD/YYYY) and convert to Format2 (YYYY-MM-DD)
    const format1DateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (format1DateRegex.test(ticketDate)) {
        const [month, day, year] = ticketDate.split('/');
        ticketDate = `${year}-${month}-${day}`;
    }

    // Check if the time is in Format1 (HH:MM AM/PM) and convert to Format2 (HH:MMam/pm)
    const format1TimeRegex = /^\d{2}:\d{2} [APMapm]{2}$/;
    if (format1TimeRegex.test(ticketTime)) {
        const [time, period] = ticketTime.split(' ');
        const [hours, minutes] = time.split(':');
        ticketTime = `${hours}:${minutes}${period.toLowerCase()}`;
    }

        let data = { ticketTime, ticketDate, userTimeZone };

        const conversionResult = this.ticket_service.timeConversion(data);

        // console.log("data 3 : ", data);
        // console.log("conversionResult 3 : ", conversionResult);
        return conversionResult;
      }
    else {
        return {};
    }
  }



  updateMenuCounts(){
    let data = {user_id:this.loggedinUser?.id,account_type: this.loggedinUser?.account_type};

    this.user_service.getMenuCounts(data).subscribe(response=>{
      if(response.status){
        localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(response.data));
      }
    })
  }


  parseJobTime(rounds:any){
    var time:any = '';
    var hours = 0;
    var mints = 0;
    if(rounds && rounds.length>0){

      rounds.map((item:any)=>{
        if(item && item.round_time){
          var rr  = item.round_time.split(' ');
          if(rr[0]){
            var h = rr[0];
            h = h.replace('h','');

            hours += parseFloat(h);
          }else{
            hours = hours;
          }

          if(rr[1]){

            mints +=  parseFloat(rr[1]);
          }else{
            mints = mints;
          }
          if(mints>60){
            var toadd_h =  mints/60;
            hours+=Math.round(toadd_h);
             mints = mints%60;
          }
        }

      })
    }
    return Math.round(hours)+' hr '+mints+'min'
  }

  handlePDFDownload(ticket:any){
    let approver_time = '';
     if(ticket){
       if(this.ticket_detail?.ticket?.status == 'Approved' && this.ticket_detail?.approver_time !=''){
         approver_time= this.ticket_detail?.approver_time ? this.ticket_detail?.approver_time: '';

       }
       if(this.ticket_detail?.ticket?.status == 'Approved' && (this.ticket_detail?.approver_time =='' || this.ticket_detail?.approver_time =='null' || this.ticket_detail?.approver_time ==null)){
         approver_time=  this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min";
       }

      let data={
        is_tc_ticket:this.ticket_detail?.tc_ticket && this.ticket_detail?.tc_ticket=='YES'? 'YES':'NO',
       job_total: this.parseJobTime( this.ticket_detail?.ticket?.ticket_truck_type_rounds),
       approver_time:approver_time,
       driver_total:this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min",
       user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
       ticket_id:this.ticket_detail.ticket_id

      }

     this.is_downloading =true;
     this.ticket_service.downloadClosedTicketPDF(data).subscribe(response=>{

       this.is_downloading = false;
       if (response && !response.status ) {
         if(response.message !=""){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Error', response.message)

         }
       }else{

         const link = document.createElement('a');
         link.setAttribute('target', '_blank');
         link.setAttribute('href', environment.apiClosedPDFURL+response.file_name);
         link.setAttribute('download', response.file_name);
         document.body.appendChild(link);
         link.click();
         link.remove();
       }
     });
     }
   }
  handlePDFDownloadSelf(ticket:any){
    let approver_time = '';
     if(ticket){
       if(this.ticket_detail?.ticket?.status == 'Approved' && this.ticket_detail?.approver_time !=''){
         approver_time= this.ticket_detail?.approver_time ? this.ticket_detail?.approver_time: '';

       }
       if(this.ticket_detail?.ticket?.status == 'Approved' && (this.ticket_detail?.approver_time =='' || this.ticket_detail?.approver_time =='null' || this.ticket_detail?.approver_time ==null)){
         approver_time=  this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min";
       }

      let data={
       job_total: this.parseJobTime( this.ticket_detail?.rounds),
       approver_time:approver_time,
       driver_total:this.ticket_detail?.driver_hours+' hr '+ this.ticket_detail?.driver_minutes+"min",
       user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
       ticket_id:this.ticket_detail.id,
       is_self_dispatched:true

      }

     this.is_downloading =true;
     this.ticket_service.downloadClosedTicketPDF(data).subscribe(response=>{

       this.is_downloading = false;
       if (response && !response.status ) {
         if(response.message !=""){
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn bg-pink width-200'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire('Error', response.message)

         }
       }else{

         const link = document.createElement('a');
         link.setAttribute('target', '_blank');
         link.setAttribute('href', environment.apiClosedPDFURL+response.file_name);
         link.setAttribute('download', response.file_name);
         document.body.appendChild(link);
         link.click();
         link.remove();
       }
     });
     }
   }

  getDataCreateTicket(){


    $('#pnlEventCalendar2').calendar({
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      onSelect: function(event:any) {
          $('#lblEventCalendar').text(event.label);
      },
      showdetail: false,
      smalldivs: true
    });
    $('.input-popup-div22').hide();
    this.form_clicked = false;
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

    this.freelance_driver.getCreateTicketData(formData).subscribe(response=>{

      if(response.status && response.data){
        this.ticket_data = response.data;

        if(this.ticket_construction_company =='' || !this.ticket_construction_company){
          this.ticket_data?.default_construction_company ?  this.setTicketData(this.ticket_data?.default_construction_company,'construction_company') : "";
        }else{
          this.setTicketData(this.ticket_construction_company,'construction_company')
        }

        if(this.ticket_trucking_company=='' || !this.ticket_trucking_company){
          this.ticket_data?.default_trucking_company ? this.setTicketData(this.ticket_data?.default_trucking_company,'trucking_company'): '';
        }else{
          this.setTicketData(this.ticket_trucking_company,'trucking_company')
        }

        if(this.ticket_project =='' || !this.ticket_project){
          this.ticket_data?.default_project ? this.setTicketData(this.ticket_data?.default_project,'project'):'';
        }else{
          this.setTicketData(this.ticket_project,'project')
        }
        if(this.ticket_truck =='' || !this.ticket_truck){
          this.ticket_data?.default_truck ? this.setTicketData(this.ticket_data?.default_truck,'truck'):'';
        }else{
          this.setTicketData(this.ticket_truck,'truck')
        }
        if(this.ticket_trailer =='' || !this.ticket_trailer){
          this.ticket_data?.default_trailer ? this.setTicketData(this.ticket_data?.default_trailer,'trailer') : '';
        }else{
          this.setTicketData(this.ticket_trailer,'trailer')
        }
        if(this.ticket_approver =='' || !this.ticket_approver){
          this.ticket_data?.default_approver ? this.setTicketData(this.ticket_data?.default_approver,'approver'):'';
        }else{
          this.setTicketData(this.ticket_approver,'approver')
        }

        if(this.ticket_dumpsite =='' || !this.ticket_dumpsite){
          this.ticket_data?.default_dumpsite ? this.setTicketData(this.ticket_data?.default_dumpsite,'dumpsite'):'';
        }else{
          this.setTicketData(this.ticket_dumpsite,'dumpsite')
        }


      }

    });

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
        this.getDataCreateTicket();
        switch (table) {
          case 'freelance_trucking_company':

            setTimeout(() => {

            $("#tc-popup").hide();
            },500);
            break;
          case 'approver':

            setTimeout(() => {

            $("#approver-popup").hide();
            },500);
            break;
          case 'freelance_projects':

            setTimeout(() => {

              $("#project-popup").hide();
            },500);
            break;
          case 'freelance_construction_company':
            setTimeout(() => {

              $("#cc-popup").hide();
            },500);
            break;
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

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
      if(this.screen=='mobile'){

        this.router.navigate(['/dashboard']);

      }

    });
  }


  setRound(rounds:any){
    this.rounds_arr=[];
    let data_prev_rounds = this.ticket_rounds().value;
    this.rounds
     = rounds;
     while (this.ticket_rounds().length !== 0) {
      this.ticket_rounds().removeAt(0)
    }
     for(var i=1;i<=this.rounds;i++){
      this.rounds_arr.push(i);
      this.newRound(i,data_prev_rounds);
     }


  }
  getProjects(){
    const formData = new FormData();

    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);

    this.project_service.driverProjects(formData).subscribe(response=>{

      if(response.status && response.data){
        this.projects_list = response.data;
        this.project_id= response.data[0]?.id;
      }
    });
  }

  onProjectChange(event:any){

    if(event.target.value !=''){
      this.project_id= event.target.value;
      this.getSchedulardata()

    }else{
      this.project_id=null;
      this.getSchedulardata()
    }
  }

  getSchedulardata(){

    let data = {
      status:this.status,
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,date:this.date_today,
      user_type:'Driver',
      project_id:this.project_id ? this.project_id:null,
      search_term:this.search_by? this.search_by:null,
      selected_month: this.selected_month? this.selected_month:null
    };

    this.driver_service.getSchedularData(data).subscribe(response => {
      if(response && response.status){
        if(response.data){
          this.datejobs = response.data;
          $('#pnlEventCalendar').calendar({
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              onSelect: function(event:any) {
                  $('#lblEventCalendar').text(event.label);
              },
              showdetail: true,
              smalldivs: false
          });

        }
      }
    });


  }

  getVal(){
    let ticket_id = $(".calendar-frame > table > tbody > tr > td > div.selected > span.job-id").text();
    let status = $(".calendar-frame > table > tbody > tr > td > div.selected > span.job-status").text();
    let is_self_dispatched =$(".calendar-frame > table > tbody > tr > td > div.selected > span.is_self_dispatched").text();
    let is_tc_ticket =$(".calendar-frame > table > tbody > tr > td > div.selected > span.is_tc_ticket").text();
    this.ticket_detail = null;
    setTimeout(() => {
      let ticket_id2= window.localStorage.getItem('job_id');
      let is_self_dispatc=  window.localStorage.getItem('is_self_dispatched');

      let is_tc_ticket2=  window.localStorage.getItem('is_tc_ticket');
      let is_self_dispatched2 = is_self_dispatc=='true'? true :false;
       is_tc_ticket2 = is_tc_ticket2=='YES' ? 'YES':'NO';
      if(ticket_id2){
        this.ticket_status =status;
        this.is_self_dispatched = is_self_dispatched2;
        this.is_tc_ticket = is_tc_ticket2;
        this.getTicketDetail(ticket_id2);
      }else{
        if(ticket_id){
          this.is_self_dispatched = is_self_dispatched;

          this.is_tc_ticket = is_tc_ticket;
          this.ticket_status =status;
          this.getTicketDetail(ticket_id);
        }
      }
    }, 1000);


  }

  getVal2(){
    this.ticket_date = this.date.toString();
    if($("#pnlEventCalendar2  table tr td div.selected job-status").length>0){
      $("#pnlEventCalendar2  table tr td div.selected job-status").remove();
    }
    let date = $("#pnlEventCalendar2  table tr td div.selected").text();
    if($("#pnlEventCalendar2  table tr td div.selected").length>0 && date !=null && date !==''){

      let month_year = $("#pnlEventCalendar2  .header-month-title").text();

      let monthyear=[];
      monthyear= month_year.toString().split(' ');
      let month:any = this.get_month_number(monthyear[0])
     let year = monthyear[1];
      this.ticket_date = date+'-'+month+'-'+year;
    }

  }

  get_month_number(month_name:any){
    let month=null;
    switch (month_name) {
      case 'Jan':
        month = '01';
        break;
      case 'Feb':
        month = '02';
        break;
      case 'Mar':
        month = '03';
        break;
      case 'Apr':
        month = '04';
        break;
      case 'May':
        month = '05';
        break;
      case 'Jun':
        month = '06';
        break;
      case 'Jul':
        month = '07';
        break;
      case 'Aug':
        month = '08';
        break;
      case 'Sep':
        month = '09';
        break;
      case 'Oct':
        month = '10';
        break;
      case 'Nov':
        month = '11';
        break;
      case 'Dec':
        month = '12';
        break;
    }
    return month;
  }

  getTicketDetail(id:any){

    let data = {
      is_tc_ticket:this.is_tc_ticket,
      date:this.date_today,
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      driver_ticket_id: id,
      is_self_dispatched:this.is_self_dispatched
    };
    this.driver_service.getDriverTicketDetail(data).subscribe(response=>{

      if(response.status ){
        this.ticket_detail = response.data.ticket;

        this.total_rounds=0;

          if(this.is_self_dispatched){
            if(this.ticket_detail?.status=='Approved' || this.ticket_detail?.status=='Completed'){

              this.ticket_detail?.rounds.map((item:any)=>{

                if( item.round_time && item.driver_start_time !==null && item.driver_start_time && item.round_time !==null){
                  this.total_rounds++;
                }
              })
            }else{
              this.total_rounds = this.ticket_detail?.rounds?.length;
            }
          }else{
            if(this.ticket_detail?.ticket?.status=='Approved' || this.ticket_detail?.ticket?.status=='Completed'){
              this.ticket_detail?.ticket?.ticket_truck_type_rounds.map((item:any)=>{

                if( item.round_time && item.driver_start_time && item.round_time !==null){

                  this.total_rounds++;
                }
              })
            }else{
              this.total_rounds = this.ticket_detail?.ticket?.ticket_truck_type_rounds?.length;
            }

          }



       switch (this.ticket_status) {
        case 'accepted':
          $("#myModalAccepted").modal('show')
          break;
        case 'approved':
          $("#myModalAapproved").modal('show')
          break;
        case 'completed':
          $("#myModalCompleted").modal('show')
          break;
        case 'pending':
          $("#myModalPending").modal('show')
          break;
        case 'driving':
          $("#myModalInprogress").modal('show')
          break;
       }
      }
    })
  }

  parseJobTotal(item:any){
    var hours= 0;
    var mints = 0;
    if(!item){
      return;
    }
    var rr  = item?.split(':');
    if(rr[0]){
      var h = rr[0];
      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = hours+(mints/60);
    return hours+' hr '+mints+"m";
  }

  parseHour(item:any){
    var hours= 0;
    var mints = 0;
    var rr  = item.split(' ');
    if(rr[0]){
      var h = rr[0];
      h = h.replace('h','');

      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = hours+(mints/60);
    return total.toFixed(2)+' hr';
  }

  getDumpsiteDetail(id:any){
    var item=null;
    this.dump_sites.map((item:any)=>{
      if(item.id == id){
        item= item?.name;
      }
    })

    return item;
  }

  parseJobTotal2(item:any){
    var hours= 0;
    var mints = 0;
    if(!item){
      return;
    }
    var rr  = item?.split(':');
    if(rr[0]){
      var h = rr[0];
      hours += parseFloat(h);
    }else{
      hours = hours;
    }

    if(rr[1]){

      mints +=  parseFloat(rr[1]);
    }else{
      mints = mints;
    }
    if(mints>60){
      var toadd_h =  mints/60;
      hours+= toadd_h;
       mints = mints%60;
    }
    var total = parseFloat(hours.toString())+(parseFloat(mints.toString())/60);
    return total.toFixed(2)+' hr';
  }


  parseDriverTime(hour:any,mints:any){
    var total_time = 0;
    let h =0 ;
    if(parseFloat(mints)){
      h+=parseFloat(mints)/60;
    }
     if(parseFloat(hour)){
      h += parseFloat(hour);
    }

    total_time = h;

    return total_time ? (total_time.toFixed(2))+' hr' :'' ;
  }


  handleDecline(ticket:any){
    this.show_reason=true;
  }


  declineHandler(){

    if(this.reason_decline=='' ){
      this.reason_error='Please enter reason for Decline.';

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn bg-pink width-200'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire(
        `Error`,
        'Please enter reason for Decline.').then(() => {

        });
      return;
    }

    let data = {
        is_tc_ticket: this.ticket_detail?.tc_ticket && this.ticket_detail?.tc_ticket=='YES'?'YES':'NO',
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        ticket_id: this.ticket_detail?.ticket_id,
        reason: this.reason_decline
      };

    this.loading_reject=true;

    this.driver_service.rejectDriverTicket(data).subscribe(response=>{
      this.loading_reject=false;
      if(response.status){



         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          response.message).then(() => {
            this.show_reason =false;
            this.reason_decline='';
            this.updateMenuCounts()

            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
            this.router.navigate(['/driver-scheduler'], {queryParams: {"status": this.status}});
          });
      }else{
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    })

  }

  handleAcceptTicket(driver_ticket:any){
    let data = {
      is_tc_ticket:driver_ticket?.tc_ticket && driver_ticket?.tc_ticket=='YES'?'YES':'NO',
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, ticket_id:driver_ticket.ticket_id};
    this.driver_service.acceptDriverTicket(data).subscribe(response=>{
      if(response.status){
        if(response.status){


        }
        $('.modal').modal('hide');
        this.updateMenuCounts()

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/driver-scheduler'], {queryParams: {"status": this.status}});
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          response.message).then(() => {

          });
      }else{
         const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Error`,
          response.message).then(() => {

          });
      }
    })
  }
  setReason(event:any){
    if(event.target.value){
      this.reason_decline = event.target.value;
    }
  }

  changeDate(event:any){
    if(event.target.value){
      this.selected_month = event.target.value;
      this.getSchedulardata();
    }else{
      this.getSchedulardata()
    }

  }


  searchBy(value: any) {
    this.search_by = value;
    this.getSchedulardata();

  }

  setTicketData(event:any,type:any){


    if(event?.target?.value){
      console.log(event?.target?.value)
      switch (type) {
        case 'description':
          this.ticket_description= event.target.value;

          break;
        case 'start_time':
          this.ticket_start_time= event.target.value;
          break;
        case 'paper_ticket_id':
          this.paper_ticket_id = event.target.value;
          break;
      }
    }else if(event && event !=''){
      switch (type) {
        case 'truck':
          this.ticket_truck= event;
          $('#truck-popup').hide();
          setTimeout(() => {

            $("#truck-popup").hide();
            },500);
          break;
        case 'dispatcher':
          this.ticket_dispatcher= event;
          $('#dispatcher-popup').hide();
          setTimeout(() => {

            $("#dispatcher-popup").hide();
            },500);
          break;
        case 'approver':
          this.ticket_approver= event;
          $('#approver-popup').hide();
          setTimeout(() => {

            $("#approver-popup").hide();
            },500);
          break;
        case 'dumpsite':
          this.ticket_dumpsite = event;

          break;
        case 'trailer':
          this.ticket_trailer= event;
          $('#trailer-popup').hide();
          setTimeout(() => {

            $("#trailer-popup").hide();
            },500);
          break;
        case 'project':
          this.ticket_project= event;
          this.approvers=[];
          if(event && event?.approvers){
            this.approvers = JSON.parse(event?.approvers)
          }

          this.dump_sites=[];
          if(event && event?.dump_sites){
            this.dump_sites = JSON.parse(event?.dump_sites)
          }

          $('#project-popup').hide();
          setTimeout(() => {

            $("#project-popup").hide();
            },500);
          break;
        case 'trucking_company':
          this.ticket_trucking_company= event;

          if(event && event?.contacts){
            let contacts = JSON.parse(event?.contacts);
            let dispatchers_r: any[] = [];
            contacts.map((item:any)=>{
              if(item.role=='Dispatcher'){
                dispatchers_r.push(item);
              }
            })
            this.dispatchers = [];
            this.dispatchers = dispatchers_r;
          }
          $('#tc-popup').hide();
          setTimeout(() => {

            $("#tc-popup").hide();
            },500);
          break;
        case 'construction_company':
          this.ticket_construction_company= event;
          $('#cc-popup').hide();
          setTimeout(() => {

            $("#cc-popup").hide();
            },500);
          break;
      }
    }else{

    }
  }

  onAddCC(){

    if(this.addCC.invalid){
    this.form_clicked=true;
      return;
    }

    this.is_loading_add='cc';
   let data={
    user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
    record_name:'freelance_construction_company',
    data:{
      freelance_driver_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      company_name: this.addCC.get('company_name')?.value
    }
   }


    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        this.is_visible='';
        this.addCC.reset();
        this.getDataCreateTicket();
      }
    });
  }

  onAddProject(){
    if(this.addProject.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addProject.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_construction_company_id = this.ticket_construction_company?.id;

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_projects',
        data: formData
      }

      this.is_loading_add='project';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status){
          this.is_visible='';
          this.addProject.reset()
          this.getDataCreateTicket();
        }
      });
  }

  onAddApprover(){
    if(this.addApprover.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addApprover.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_construction_company_id = this.ticket_construction_company?.id;
      formData.project_id = this.ticket_project?.id;

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'approver',
        data: formData
      }

      this.is_loading_add='approver';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          this.is_visible='';
          this.getDataCreateTicket();
          this.addApprover.reset();
          this.setTicketData(response.data,'project');
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
      let formData:any=this.addDumpSite.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_construction_company_id = this.ticket_construction_company?.id;
      formData.project_id = this.ticket_project?.id;

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'dumpsite',
        data: formData
      }

      this.is_loading_add='dumpsite';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          this.is_visible='';
          this.getDataCreateTicket();
          this.addDumpSite.reset();
          this.setTicketData(response.data,'project');
        }
      });

  }

  onAddDispatcher(){
    if(this.addDispatcher.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addDispatcher.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;
      formData.freelance_trucking_company_id = this.ticket_trucking_company?.id;

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'dispatcher',
        data: formData
      }

      this.is_loading_add='dispatcher';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status ){
          this.is_visible='';
          this.getDataCreateTicket();
          this.setTicketData(response.data,'trucking_company');
          this.addDispatcher.reset()
        }
      });

  }

  onAddTC(){
    if(this.addTC.invalid){
      this.form_clicked=true;
        return;
      }
      let formData:any=this.addTC.value;
      formData.freelance_driver_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

      let data={
        user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
        record_name:'freelance_trucking_company',
        data: formData
      }

      this.is_loading_add='trucking';
      this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
        this.is_loading_add='';
        if(response.status){
          this.is_visible='';
          this.addTC.reset()
          this.getDataCreateTicket();
        }
      });
  }

  onAddTruck(){
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
          this.getDataCreateTicket();
        }
      });
  }

  onAddTrailer(){
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
          this.getDataCreateTicket();
        }
      });
  }
  setVisible(type:any){
    this.is_visible = type;
  }

  addRoundField(index:any,data_prev_rounds:any=null): FormGroup {
    console.log(data_prev_rounds);
    if(data_prev_rounds && data_prev_rounds[index-1]){
      return    this.fb.group({
        material_taken_out:[
          (data_prev_rounds[index-1]?.material_taken_out ? data_prev_rounds[index-1]?.material_taken_out:'')
           ,Validators.required],
        round_no:[],
        dump_site: [
          (data_prev_rounds[index-1]?.dump_site ? data_prev_rounds[index-1]?.dump_site:'')
          ,Validators.required],
        dump_site_name:[
          (data_prev_rounds[index-1]?.dump_site_name ? data_prev_rounds[index-1]?.dump_site_name:'')
          ,Validators.required]
      });
    }else{
      return    this.fb.group({
        material_taken_out:['',Validators.required],
        round_no:[],
        dump_site: ['',Validators.required],
        dump_site_name:['',Validators.required]
      });
    }

  }
  ticket_rounds(): FormArray {
    return this.ticketForm.get("ticket_rounds") as FormArray
  }

  newRound(index:any,data_prev_rounds:any=null) {
    this.ticket_rounds().push(this.addRoundField(index,data_prev_rounds));
  }

  setDumpsite(dumpsite:any,idx:any){
    this.ticket_rounds().at(idx).get('dump_site')?.patchValue(dumpsite.id);
    this.ticket_rounds().at(idx).get('dump_site_name')?.patchValue(dumpsite.name);
  }

  dispatchTicket(){
    this.form_clicked = true;
    this.company_error='';
    this.trucking_error='';
    this.start_time_error ='';
    this.project_error='';
    this.paper_ticket_id_error='';
    this.truck_error='';
    this.total_rounds_error='';
    this.approver_error = '';
    this.ticket_date_error='';
    var is_error:boolean=false;
    if(this.ticket_construction_company && this.ticket_construction_company?.id){}else{
      this.company_error='Construction company is required';
      is_error = true;
    }

    if(this.ticket_date && this.ticket_date !=undefined && this.ticket_date!=null && this.ticket_date !=''){}else{
      this.ticket_date_error = 'Ticket date required';
      is_error=true;
    }
    if(this.ticket_project && this.ticket_project?.id){}else{
      this.project_error='Project is required';
      is_error = true;
    }
    if(this.ticket_approver && this.ticket_approver?.id){}else{
      this.approver_error='Approver is required';
      is_error = true;
    }
    if(this.ticket_trucking_company && this.ticket_trucking_company?.id){}else{
      this.trucking_error='Trucking company is required';
      is_error = true;
    }

    if(this.ticket_truck && this.ticket_truck?.id){}else{
      this.truck_error='Truck is required';
      is_error = true;
    }

    if(this.ticket_start_time && this.ticket_start_time!=''){}else{
      this.start_time_error='Start time is required';
      is_error = true;
    }

    // if(this.paper_ticket_id && this.paper_ticket_id!=''){}else{
    //   this.paper_ticket_id_error='Paper ticket id is required';
    //   is_error = true;
    // }

    if(this.rounds && this.rounds>0){}else{
      this.total_rounds_error='Please select atleast one round';
      is_error = true;
    }

    if(this.ticketForm.invalid || is_error){
      return;
    }

    let formData:any={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      project_id: this.ticket_project?.id,
      trucking_company_id: this.ticket_trucking_company?.id,
      approver_id: this.ticket_approver?.id,
      dispatcher_id: this.ticket_dispatcher?.id,
      truck_id: this.ticket_truck?.id,
      trailer_id: this.ticket_trailer?.id,
      construction_company_id: this.ticket_construction_company?.id,
      ticket_no: this.ticket_data?.ticket_no,
      state_wise_no: this.ticket_data?.state_wise_no,
      ticket_province: this.ticket_data?.province,
      ticket_date:this.ticket_date,
      ticket_time: this.ticket_start_time,
      description: this.ticket_description,
      paper_ticket_id: this.paper_ticket_id,
      number_of_rounds: this.ticket_rounds()?.length,
      status:"Accepted",
      rounds:this.ticketForm.value
    }

    let data={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      record_name:'freelance_ticket',
      data: formData
    }

    this.is_loading_add='freelance_ticket';
    this.freelance_driver.saveFreelancerData(data).subscribe(response=>{
      this.is_loading_add='';
      if(response.status ){
        this.is_visible='';
        this.setRound(1);
        this.paper_ticket_id='';
        this.ticket_description='';
        this.ticket_date_error='';
        this.rounds=1;
        this.ticket_dispatcher=null;
        this.ticket_truck=null;
        this.ticket_trailer=null;
        this.getDataCreateTicket();
        $("#paperticketid_input_selfticket").val("");
        $("#description_input_selfticket").val("");
        $("#myModalCreateTicket").modal("hide");
        this.ticketForm.reset();
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Success',
          'Ticket dispatched successfully'
        );

        this.getSchedulardata();
        this.updateMenuCounts()
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn bg-pink width-200'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          'Error',
          'Error occured while dispatching ticket'
        );
      }
    });

  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addDispatcher.get('contact_number')?.patchValue(abc);
  }

  changeNumber2(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addTC.get('contact_phone')?.patchValue(abc);
  }

  changeNumber3(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.addApprover.get('contact_number')?.patchValue(abc);
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

  filterByStatus(type:any){
    if(type){

      const currentUrl = this.router.url.split('?')[0]; // Get current route without query params
      const newQueryParam = { status: type }; // Your query parameters
      // Navigate to the same route with updated query parameters
      this.router.navigate([currentUrl], { queryParams: newQueryParam, queryParamsHandling: 'merge' }).then(() => {
        // Reload the page after navigation
        window.location.reload();
      });

    }
  }

  closePopup(type:any){
    switch (type) {
      case 'truck':

        $('#truck-popup').hide();
        setTimeout(() => {

          $("#truck-popup").hide();
          },500);
        break;
      case 'dispatcher':

        $('#dispatcher-popup').hide();
        setTimeout(() => {

          $("#dispatcher-popup").hide();
          },500);
        break;
      case 'approver':

        $('#approver-popup').hide();
        setTimeout(() => {

          $("#approver-popup").hide();
          },500);
        break;

      case 'trailer':

        $('#trailer-popup').hide();
        setTimeout(() => {

          $("#trailer-popup").hide();
          },500);
        break;
      case 'project':

        $('#project-popup').hide();
        setTimeout(() => {

          $("#project-popup").hide();
          },500);
        break;
      case 'trucking_company':

        $('#tc-popup').hide();
        setTimeout(() => {

          $("#tc-popup").hide();
          },500);
        break;
      case 'construction_company':

        $('#cc-popup').hide();
        setTimeout(() => {

          $("#cc-popup").hide();
          },500);
        break;
      case 'paper_ticket_id':

        $('#paperticketid-popup').hide();
        setTimeout(() => {

          $("#paperticketid-popup").hide();
          },500);
        break;
    }
  }

  redirectTo(to:any){
    if(to){
      window.open(to, "_blank");
    }
  }

  toggleAddressPopup(status:any){

    this.show_address_popup = status;
  }

  saveAddress(){
    this.street_error = '';
    this.city_error= '';
    this.province_error='';
    let errors = false;

    if(!$("#street").val() || $("#street").val() ==''){
      this.street_error = 'Street required!';
      errors=true;
    }
    if(!$("#province").val() || $("#province").val() ==''){
      this.province_error = 'Province required!';
      errors=true;
    }
    if(!$("#city").val() || $("#city").val() ==''){
      this.city_error = 'City required!';
      errors=true;
    }

    if(errors){
      return ;
    }
    let new_adress:any = '';

    if ($("#street").val()) {
      new_adress += $("#street").val();
    }

    if ($("#city").val()) {
      new_adress += (new_adress != '' ? ', ' : '') + $("#city").val();
    }

    if ($("#province").val()) {
      new_adress += (new_adress != '' ? ', ' : '') + $("#province").val();
    }

    if ($("#postal_code").val()) {
      new_adress += (new_adress != '' ? ' ' : '') + $("#postal_code").val();
    }


    if ($("#country").val()) {
      new_adress += (new_adress != '' ? ' ' : '') + $("#country").val();
    }
    this.is_visible = 'project';
setTimeout(()=>{

  this.addProject.get('street')?.patchValue(new_adress);

 this.toggleAddressPopup(false)
},1500)

  }

  setCountry(event:any){
    if(event.target.value){
      this.set_country = event.target.value;
    }
  }
}
