import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { max } from 'rxjs';
import { TicketService } from 'src/app/services/ticket.service';
import { TruckingCompanyService } from 'src/app/services/trucking-company.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
// import Swal from 'sweetalert2';
declare var $: any;


interface Ticket {
  ticket_no: string;
  state_wise_no: number;
  }

@Component({
  selector: 'app-company-dispatch-trucking-popup',
  templateUrl: './company-dispatch-trucking-popup.component.html',
  styleUrls: ['./company-dispatch-trucking-popup.component.css']
})
export class CompanyDispatchTruckingPopupComponent implements OnInit {

  @Input('ticket_list') ticket_list : any;
  @Input('all_checked') all_checked:any;
  @Input('selected_items') selected_items:any;
  @Input('type') type:any;
  @Input('is_tc_disp') is_tc_disp:any;

  @Input('selected_ticket_list') selected_ticket_list:any;

  @Output() listing= new EventEmitter();

  dispatchForm!: FormGroup;
  dispatchDriverForm!: FormGroup;
  selected_driver:string= '';
  default_driver:any= null;
  selected_truck:string= '';
  selected_trailer:string='';
  request_project_name:string='';

  user_id:any;
  error:any = [];
  rateErrorr:any;
  driver_availability:any = [];
  truck_availability:any = [];
  trailer_availability:any = [];
  error_trailer:any = [];

  is_form_valid = false;
  rate_per_hour:any;
  loggedinUser: any = {};
  truck_types: any;
  is_dispatched:boolean = false;
  is_dispatched_driver:boolean =false;
  is_loading_driver:boolean =false;
  is_loading_tc:boolean =false;
  trucking_companies: any;
  selected_tickets:any;
  truck_types_data:any;
  trucking_company_name:any;
  total_rates:any = 0;


  requestDetail : any;
  reason_decling:string='';
  show_reason_modal:boolean=false;
  is_decline_loading:boolean=false;

  is_driver_form_error = false
  is_tc_form_error = false
  drivers_list:any;
  trucks_list:any;
  trailers_list:any;
  data_tickets:any;


  //errors
  errorDate:string ='';
  errorTruckingComp:string = '';
  rateError:any;
  driver_message:any = '';
  todayDate: any;
  availability_data:any=null;

  formedClicked:boolean=false;
  formedClicked2:boolean=false;

  constructor(
    private fb : FormBuilder,
    private ticket_service: TicketService,
    private router: Router,
    private trucking_service: TruckingCompanyService,
    private datePipe:DatePipe
  ) {

  }

  ngOnInit(): void {

    this.rateErrorr = '';
    let tz = environment.timeZone;
    var d = new Date();
    var samp_date = d.toLocaleString('en-US', { timeZone: tz });
    this.todayDate = this.datePipe.transform(new Date(samp_date), 'yyyy-MM-dd')

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

    this.dispatchDriverForm = this.fb.group({
      trucking_company_id: [''],
      user_id:[''],
      driver_tickets: this.fb.array([]),
    });

    this.dispatchForm = this.fb.group({
      dispatch_date: ['',Validators.required],
      total_tickets: [''],
      trucking_company_id: ['',Validators.required],
      selected_tickets:[''],
      user_id:[''],
      ticket_truck_types: this.fb.array([]),
    });

    this.ngOnAfterInit()
    this.getData(this.selected_tickets)

    $(document).on('click','.getinputfield', function(this:any) {
        $('.input-popup-div').hide();
        $(this).find('.input-popup-div').show();
    });
    $(document).on('click','.getinputfield2', function(this:any) {
        $('.input-popup-div2').hide();
        $(this).closest('.input-popup-div').find('.input-popup-div2').show();
    });
    $(window).click(function(e:any) {
        if (!($(e.target).hasClass('getinputfield') || $(e.target).closest('.getinputfield').length)) {
            $('.input-popup-div').hide();
            $('.input-popup-div2').hide();
        }
    });

  }
  ngOnAfterInit(){
    this.ticket_truck_types.valueChanges.subscribe(val=>{
      if(val){
        var total = 0;
        val.map((it:any)=>{
          total += parseFloat( it.rates? it.rates:0)
        })
        // console.log(total)
        if(total !=this.total_rates){
          this.total_rates = total
        }
      }
    })



  }


  get ticket_truck_types(): FormArray {
    return this.dispatchForm.controls["ticket_truck_types"] as FormArray;
  }

  get driver_tickets(): FormArray {
    return this.dispatchDriverForm.controls["driver_tickets"] as FormArray;
  }

  changeRate(event:any,index:any){
    if(event.target.value){

      let per:any = 0;
      let driver_rate:any = parseFloat(event.target.value);
      let ticket_rate:any = parseFloat( this.driver_tickets.at(index).get('ticket_rate')?.value);

      if(driver_rate && ticket_rate>0){
        per = parseFloat(driver_rate) / parseFloat(ticket_rate) *100;
        this.driver_tickets.at(index).get('perc')?.patchValue(per.toFixed(2));
      }
    }else{
      this.driver_tickets.at(index).get('perc')?.patchValue(0);
    }

  }



  getData(selected_ticket_list:any){
  //  console.log(" i am theee ggg::: ", selected_ticket_list)
    this.driver_availability = [];
    this.truck_availability = [];
    this.trailer_availability=[];

    this.formedClicked=false;
    this.selected_tickets = 0;
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }



    this.getTCTrucks();

    this.getTCTrailers();
    // this.getTCDrivers();

    let data:any ;
    let items:any[] =[];
    if(selected_ticket_list){
      let i =0;
      selected_ticket_list.map((item:any)=>{
        if(item.id){
          i++;
          items.push({id:item.id,is_tc_ticket:item?.tc_ticket && item?.tc_ticket=='YES'? 'YES':'NO'})
        }
      });
      this.selected_tickets = i;

      this.selected_items = items;
    }

    this.is_tc_disp = localStorage.getItem('is_tc_disp');
    data ={is_tc_disp: this.is_tc_disp,tickets: items, user_id:this.loggedinUser.id};



    this.ticket_service.getTruckTypesOnTickets(data).subscribe(response=>{
      if(response && response.status){
        this.truck_types = response.data.ticket_truck_types;
        this.truck_types_data = response.data.ticket_truck_types;
        this.data_tickets = response.data.data_tickets;

        this.ticket_truck_types.clear()
        if(this.truck_types && this.truck_types.length>0){

          this.truck_types.map((item:any)=>{

            this.total_rates+= parseFloat(item.ticket_truck_type.rate_per_hour);
            this.addTruckType(item);

          })
        }
        var j =0;
        this.driver_tickets.clear()

        const formData = new FormData();
        formData.append('user_id', this.loggedinUser.id);
        formData.append('is_pagination', 'false');
        formData.append('for_dispatch', 'YES');
        this.trucking_service.getTCDrivers(formData).subscribe(response => {
          if (response.status && response.data) {
            this.drivers_list = response.data;
            this.selected_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0].id : '';
            this.default_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0] : [];
            let drivers:any = [];
            this.drivers_list.map((driver:any)=>{
            drivers.push({id:driver?.id,full_name:driver?.full_name})
            })

            let data = {tickets:items,drivers_list:drivers}
            this.trucking_service.getAvailabilityData(data).subscribe(response => {
              if (response.status && response.data) {
                this.availability_data = response.data;
                if (items && items.length > 0) {
                  var i = 0;
                  items && items.map((item: any) => {

                    if (item === null) {

                    } else {
                      // alert(JSON.stringify(item))
                      this.addDriverTicket(item, i);


                      i++;
                    }

                  })

                }
              }else{
                if (items && items.length > 0) {
                  var i = 0;
                  items && items.map((item: any) => {

                    if (item === null) {

                    } else {
                      // alert(JSON.stringify(item))
                      this.addDriverTicket(item, i);


                      i++;
                    }

                  })

                }
              }
            });
          } else {
            if (items && items.length > 0) {
              var i = 0;
              items && items.map((item: any) => {

                if (item === null) {

                } else {
                  // alert(JSON.stringify(item))
                  this.addDriverTicket(item, i);


                  i++;
                }

              })

            }
          }
        })

        // if(items && items.length>0){
        //   var i =0;
        //   items && items.map((item:any)=>{

        //     if(item ===null){

        //     }else{
        //       this.addDriverTicket(item,i);


        //       i++;

        //     }

        //   })

        // }

        this.trucking_companies = response.data.trucking_companies;
        if(this.trucking_companies && this.trucking_companies?.length>0){

          this.dispatchForm.get('trucking_company_id')?.patchValue(this.trucking_companies[0]?.id)
        }

          let datass = this.driver_tickets.value;
          var i = 0;

            datass.map((itemform:any)=>{
              this.data_tickets && this.data_tickets.map((item:any)=>{
                if(itemform.ticket_id == item.id){

                  this.driver_tickets.at(i).get('ticket_no')?.patchValue(item.ticket_no);

                }
              })

            i++;
          })


      }else{
        this.truck_types = []
      }



    })



    this.is_dispatched=false;

  }

  getTicketRate(id:any){
    if(this.truck_types && this.truck_types.length>0){
      this.truck_types.map((item:any)=>{
        if(item.id == id){
          // console.log(item.trucking_company_request.rate_per_hour)
          return item.trucking_company_request?.rate_per_hour;
        }
      });
    }
  }

  getTicketDetail(id:any){
    if(this.data_tickets && this.data_tickets.length>0){
      this.data_tickets.map((item:any)=>{

        if(item.id == id){

          return item.ticket_no;
        }
      });
    }
  }

  getTicketData(id:any){
    if(this.data_tickets && this.data_tickets.length>0){
      this.data_tickets.map((item:any)=>{

        if(item.id == id){

          return item;
        }
      });
    }
  }
  addTruckType(type:any) {
    // console.log(type)
    let name = '';

    if(type?.tc_ticket && type?.tc_ticket=='YES'){
      name = type?.ticket_truck_type+ (type?.ticket_trailer_type ? ' - '+type?.ticket_trailer_type:'');
     }else{
      name = type.ticket_truck_type?.project_combination ? type.ticket_truck_type?.project_combination?.nickname : (type.ticket_truck_type?.project_truck ? type.ticket_truck_type?.project_truck?.name.toString().replace('axle','')+ 'x' +type.ticket_truck_type?.project_trailer?.name.toString().replace('axle','')+' axle' :'' );
    }

    let rate = type.trucking_company_request?.rate_per_hour;
    this.ticket_truck_types.push(
      this.fb.group({
        truck_names:[name,Validators.required],
        truck_ids: [type?.tc_ticket && type?.tc_ticket=='YES'? type.ticket_truck_type:type.ticket_truck_type.id,Validators.required],
        old_rates:[rate],
        is_tc_ticket:[type?.tc_ticket && type?.tc_ticket=='YES'? 'YES':'NO'],
        rates: ['',[Validators.required,Validators.min(0),Validators.pattern('^-?\\d*(\\.\\d+)?$')]]
      })
    );
  }

  getTCTrucks(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');

    formData.append('type', 'truck');
    formData.append('dispatch_for', 'YES');

    this.trucking_service.getTCTrucks(formData).subscribe(response=>{
      if(response.status && response.data){
        this.trucks_list = response.data;
        this.selected_truck = this.trucks_list && this.trucks_list[0] ? this.trucks_list[0].id : '';
      }else{

      }
    })
  }

  getTCTrailers(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');
    formData.append('dispatch_for', 'YES');

    formData.append('type', 'trailer');

    this.trucking_service.getTCTrucks(formData).subscribe(response=>{
      if(response.status && response.data){
        this.trailers_list = response.data;

      }else{

      }
    })
  }

  getTCDrivers(){
    const formData = new FormData();
    formData.append('user_id', this.loggedinUser.id);
    formData.append('is_pagination', 'false');
    formData.append('for_dispatch', 'YES');
    this.trucking_service.getTCDrivers(formData).subscribe(response=>{
      if(response.status && response.data){
        this.drivers_list = response.data;
        this.selected_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0].id : '';
        this.default_driver = this.drivers_list && this.drivers_list[0] ? this.drivers_list[0] : [];

      }else{

      }
    })
  }

  addDriverTicket(ticket: any, index: any) {
    let driver_hour_rate = '';

    //  this.default_driver.sub_users && this.default_driver.sub_users.length>0 && this.default_driver.sub_users.map((item:any)=>{
    //     if(item.parent_user_id == this.user_id ){
    //       driver_hour_rate = item?.driver_hour_rate;
    //     }
    //   });
    let ticket_rate: any = 0;
    let ticket_data: any = null;
    if (this.data_tickets && this.data_tickets.length > 0) {
      this.data_tickets.map((item: any) => {
        if (item.id == ticket.id && item.trucking_company_request?.rate_per_hour) {
          ticket_data = item;
          ticket_rate = item.trucking_company_request?.rate_per_hour;
        }
      });
    }
    let per: any = 0;
    // if(driver_hour_rate && driver_hour_rate !='' && parseFloat(ticket_rate)>0){
    //   per = parseFloat(driver_hour_rate) / parseFloat(ticket_rate) *100;
    // }

    if (ticket && ticket?.id != "" && ticket?.id !== null) {

      var ticket_no:any = this.getTicketDetail(ticket.id);
      var ticket_truck_type = null;
      var ticket_trailer_type = null;


      if (ticket_data && ticket_data?.tc_ticket && ticket_data?.tc_ticket == 'YES') {

        ticket_truck_type = ticket_data?.ticket_truck_type;
        ticket_trailer_type = ticket_data?.ticket_trailer_type;
      } else {

        if (ticket_data?.ticket_truck_type && ticket_data?.ticket_truck_type?.project_truck) {
          ticket_truck_type = ticket_data?.ticket_truck_type?.project_truck?.name;
        } else {
          if (ticket_data?.ticket_truck_type?.project_combination && ticket_data?.ticket_truck_type?.project_combination?.truck) {
            ticket_truck_type = ticket_data?.ticket_truck_type?.project_combination?.truck?.name;
          }
        }

        if (ticket_data?.ticket_truck_type && ticket_data?.ticket_truck_type?.project_trailer) {
          ticket_trailer_type = ticket_data?.ticket_truck_type?.project_trailer?.name;
        }
      }
      // Setting Driver Availability
      if (this.drivers_list?.length > 0) {

        this.drivers_list.map((driver: any) => {
          var ava: any = null;
          this.driver_availability.map((i: any) => {
            if (i.driver_id == driver.id && ticket_data?.ticket_id == i.ticket_id) {
              ava = i;
            }
          })
          if (ava) {
            return ava?.is_available
          } else {
            // let data = {
            //   driver_id: driver.id,
            //   ticket_datetime: ticket_data?.ticket_datetime

            // }
            // this.trucking_service.isDriverAvailable(data).subscribe(response => {
            //   if (response.status) {
            //     // console.log(response,driver.id,ticket_data?.ticket_datetime);
            //     if (response.current_job) {

            //       this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
            //     } else {

            //       this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

            //     }
            //   }
            // })

            let job:any= null;
            this.availability_data?.map((item:any)=>{
              // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
              if(item?.driver_id == driver?.id && ticket?.id == item.ticket_id){
                job = item;
              }
            })

            if(job){
              this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
            }else{
              this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job:  job?.ticket, is_available: true })
            }
          }

          // Checking Truck Availability
          if (this.trucks_list?.length > 0) {

            this.trucks_list.map((truck: any) => {
              var ava: any = null;
              this.truck_availability.map((i: any) => {
                if (i.truck_id == truck.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                  ava = i;
                }
              })
              if (ava) {
                return ava?.is_available
              } else {
                // let data = {
                //   driver_id: driver.id,
                //   truck_id: truck.id,
                //   ticket_datetime: ticket_data?.ticket_datetime

                // }
                // this.trucking_service.isTruckAvailable(data).subscribe(response => {
                //   if (response.status) {
                //     if (response.current_job) {

                //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                //     } else {

                //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                //     }
                //   }
                // })
                let job:any= null;
                this.availability_data?.map((item:any)=>{
                  // console.log(item?.driver_id +"=="+ driver?.id +"&&"+item?.truck_id +"=="+ truck?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                  if(item?.driver_id == driver?.id && item?.truck_id == truck?.id && ticket?.id == item.ticket_id){
                    job = item;
                  }
                })
                console.log(job)
                if(job){
                  this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                }else{
                  this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                }
              }

            })
          } else {
            const formData = new FormData();
            formData.append('user_id', this.loggedinUser.id);
            formData.append('is_pagination', 'false');

            formData.append('type', 'truck');
            formData.append('dispatch_for', 'YES');

            this.trucking_service.getTCTrucks(formData).subscribe(response => {
              if (response.status && response.data) {
                this.trucks_list = response.data;
                this.selected_truck = this.trucks_list && this.trucks_list[0] ? this.trucks_list[0].id : '';
                this.trucks_list.map((truck: any) => {
                  var ava: any = null;
                  this.truck_availability.map((i: any) => {
                    if (i.truck_id == truck.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                      ava = i;
                    }
                  })
                  if (ava) {
                    return ava?.is_available
                  } else {
                    // let data = {
                    //   driver_id: driver.id,
                    //   truck_id: truck.id,
                    //   ticket_datetime: ticket_data?.ticket_datetime

                    // }
                    // this.trucking_service.isTruckAvailable(data).subscribe(response => {
                    //   if (response.status) {
                    //     if (response.current_job) {

                    //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                    //     } else {

                    //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                    //     }
                    //   }
                    // })
                    let job:any= null;
                    this.availability_data?.map((item:any)=>{
                      // console.log(item?.driver_id +"=="+ driver?.id +"&&"+item?.truck_id +"=="+ truck?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                      if(item?.driver_id == driver?.id && item?.truck_id == truck?.id && ticket?.id == item.ticket_id){

                        job = item;
                      }
                    })
                    console.log(job)
                    if(job){
                      this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                    }else{
                      this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                    }
                  }

                })
              } else {

              }
            })
          }

          // Checking Trailer Availability
          if (this.trailers_list?.length > 0) {

            this.trailers_list.map((trailer: any) => {
              var ava: any = null;
              this.trailer_availability.map((i: any) => {
                if (i.trailer_id == trailer.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                  ava = i;
                }
              })
              if (ava) {
                return ava?.is_available
              } else {
                // let data = {
                //   driver_id: driver.id,
                //   trailer_id: trailer.id,
                //   ticket_datetime: ticket_data?.ticket_datetime

                // }
                // this.trucking_service.isTrailerAvailable(data).subscribe(response => {
                //   if (response.status) {
                //     if (response.current_job) {

                //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                //     } else {

                //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                //     }
                //   }
                // })
                let job:any= null;
                this.availability_data?.map((item:any)=>{

                  if(item?.driver_id == driver?.id && item?.trailer_id == trailer?.id && ticket?.id == item.ticket_id){
                    job = item;
                  }
                })

                if(job){
                  this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                }else{
                  this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                }
              }

            })
          } else {
            const formData = new FormData();
            formData.append('user_id', this.loggedinUser.id);
            formData.append('is_pagination', 'false');

            formData.append('type', 'trailer');
            formData.append('dispatch_for', 'YES');

            this.trucking_service.getTCTrucks(formData).subscribe(response => {
              if (response.status && response.data) {
                this.trailers_list = response.data;
                this.trailers_list.map((trailer: any) => {
                  var ava: any = null;
                  this.trailer_availability.map((i: any) => {
                    if (i.trailer_id == trailer.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                      ava = i;
                    }
                  })
                  if (ava) {
                    return ava?.is_available
                  } else {
                    // let data = {
                    //   driver_id: driver.id,
                    //   trailer_id: trailer.id,
                    //   ticket_datetime: ticket_data?.ticket_datetime

                    // }
                    // this.trucking_service.isTrailerAvailable(data).subscribe(response => {
                    //   if (response.status) {
                    //     if (response.current_job) {

                    //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                    //     } else {

                    //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                    //     }
                    //   }
                    // })
                    let job:any= null;
                    this.availability_data?.map((item:any)=>{
                      // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                      if(item?.driver_id == driver?.id && item?.trailer_id == trailer?.id && ticket?.id == item.ticket_id){
                        job = item;
                      }
                    })

                    if(job){
                      this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                    }else{
                      this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                    }
                  }

                })
              } else {

              }
            })
          }
        })
      } else {
        const formData = new FormData();
        formData.append('user_id', this.loggedinUser.id);
        formData.append('is_pagination', 'false');
        formData.append('for_dispatch', 'YES');
        this.trucking_service.getTCDrivers(formData).subscribe(response => {
          if (response.status && response.data) {
            this.drivers_list = response.data;
            this.drivers_list.map((driver: any) => {
              var ava: any = null;
              this.driver_availability.map((i: any) => {
                if (i.driver_id == driver.id && ticket.id == i.ticket_id) {
                  ava = i;
                }
              })
              if (ava) {
                return ava?.is_available
              } else {
                // let data = {
                //   driver_id: driver.id,
                //   ticket_datetime: ticket_data?.ticket_datetime

                // }
                // this.trucking_service.isDriverAvailable(data).subscribe(response => {
                //   if (response.status) {
                //     // console.log(response,driver.id,ticket_data?.ticket_datetime);
                //     if (response.current_job) {

                //       this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                //     } else {

                //       this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                //     }
                //   }
                // })
                let job:any= null;
                this.availability_data?.map((item:any)=>{
                  // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                  if(item?.driver_id == driver?.id && ticket?.id == item.ticket_id){
                    job = item;
                  }
                })

                if(job){
                  this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                }else{
                  this.driver_availability.push({ driver_id: driver.id, ticket_id: ticket.id, current_job:  job?.ticket, is_available: true })
                }
              }

              // Checking Truck Availability
              if (this.trucks_list.length > 0) {

                this.trucks_list.map((truck: any) => {
                  var ava: any = null;
                  this.truck_availability.map((i: any) => {
                    if (i.truck_id == truck.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                      ava = i;
                    }
                  })
                  if (ava) {
                    return ava?.is_available
                  } else {
                    // let data = {
                    //   driver_id: driver.id,
                    //   truck_id: truck.id,
                    //   ticket_datetime: ticket_data?.ticket_datetime

                    // }
                    // this.trucking_service.isTruckAvailable(data).subscribe(response => {
                    //   if (response.status) {
                    //     if (response.current_job) {

                    //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                    //     } else {

                    //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                    //     }
                    //   }
                    // })
                    let job:any= null;
                    this.availability_data?.map((item:any)=>{
                      // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                      if(item?.driver_id == driver?.id && item?.truck_id == truck?.id && ticket?.id == item.ticket_id){
                        job = item;
                      }
                    })

                    if(job){
                      this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                    }else{
                      this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                    }
                  }

                })
              } else {
                const formData = new FormData();
                formData.append('user_id', this.loggedinUser.id);
                formData.append('is_pagination', 'false');

                formData.append('type', 'truck');
                formData.append('dispatch_for', 'YES');

                this.trucking_service.getTCTrucks(formData).subscribe(response => {
                  if (response.status && response.data) {
                    this.trucks_list = response.data;
                    this.selected_truck = this.trucks_list && this.trucks_list[0] ? this.trucks_list[0].id : '';
                    this.trucks_list.map((truck: any) => {
                      var ava: any = null;
                      this.truck_availability.map((i: any) => {
                        if (i.truck_id == truck.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                          ava = i;
                        }
                      })
                      if (ava) {
                        return ava?.is_available
                      } else {
                        // let data = {
                        //   driver_id: driver.id,
                        //   truck_id: truck.id,
                        //   ticket_datetime: ticket_data?.ticket_datetime

                        // }
                        // this.trucking_service.isTruckAvailable(data).subscribe(response => {
                        //   if (response.status) {
                        //     if (response.current_job) {

                        //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                        //     } else {

                        //       this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                        //     }
                        //   }
                        // })
                        let job:any= null;
                        this.availability_data?.map((item:any)=>{
                          // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                          if(item?.driver_id == driver?.id && item?.truck_id == truck?.id && ticket?.id == item.ticket_id){
                            job = item;
                          }
                        })

                        if(job){
                          this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                        }else{
                          this.truck_availability.push({ truck_id: truck.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                        }
                      }

                    })
                  } else {

                  }
                })
              }

              // Checking Trailer Availability
              if (this.trailers_list?.length > 0) {

                this.trailers_list.map((trailer: any) => {
                  var ava: any = null;
                  this.trailer_availability.map((i: any) => {
                    if (i.trailer_id == trailer.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                      ava = i;
                    }
                  })
                  if (ava) {
                    return ava?.is_available
                  } else {
                    // let data = {
                    //   driver_id: driver.id,
                    //   trailer_id: trailer.id,
                    //   ticket_datetime: ticket_data?.ticket_datetime

                    // }
                    // this.trucking_service.isTrailerAvailable(data).subscribe(response => {
                    //   if (response.status) {
                    //     if (response.current_job) {

                    //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                    //     } else {

                    //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                    //     }
                    //   }
                    // })
                    let job:any= null;
                    this.availability_data?.map((item:any)=>{
                      // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                      if(item?.driver_id == driver?.id && item?.trailer_id == trailer?.id && ticket?.id == item.ticket_id){
                        job = item;
                      }
                    })

                    if(job){
                      this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                    }else{
                      this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                    }
                  }

                })
              } else {
                const formData = new FormData();
                formData.append('user_id', this.loggedinUser.id);
                formData.append('is_pagination', 'false');

                formData.append('type', 'trailer');
                formData.append('dispatch_for', 'YES');

                this.trucking_service.getTCTrucks(formData).subscribe(response => {
                  if (response.status && response.data) {
                    this.trailers_list = response.data;
                    this.trailers_list.map((trailer: any) => {
                      var ava: any = null;
                      this.trailer_availability.map((i: any) => {
                        if (i.trailer_id == trailer.id && ticket_data?.ticket_id == i.ticket_id && i.driver_id == driver.id) {
                          ava = i;
                        }
                      })
                      if (ava) {
                        return ava?.is_available
                      } else {
                        // let data = {
                        //   driver_id: driver.id,
                        //   trailer_id: trailer.id,
                        //   ticket_datetime: ticket_data?.ticket_datetime

                        // }
                        // this.trucking_service.isTrailerAvailable(data).subscribe(response => {
                        //   if (response.status) {
                        //     if (response.current_job) {

                        //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: false })
                        //     } else {

                        //       this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: response.current_job, is_available: true })

                        //     }
                        //   }
                        // })
                        let job:any= null;
                        this.availability_data?.map((item:any)=>{
                          // console.log(item?.driver_id +"=="+ driver?.id +"&&"+ ticket?.id +"=="+ item.ticket_id)
                          if(item?.driver_id == driver?.id && item?.trailer_id == trailer?.id && ticket?.id == item.ticket_id){
                            job = item;
                          }
                        })

                        if(job){
                          this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: false })
                        }else{
                          this.trailer_availability.push({ trailer_id: trailer.id, driver_id: driver.id, ticket_id: ticket.id, current_job: job?.ticket, is_available: true })
                        }
                      }

                    })
                  } else {

                  }
                })
              }

            })

          } else {

          }
        })

      }
      // console.log(this.truck_availability)

      this.trailer_availability = this.trailer_availability.filter((value:any, index:any, self:any) =>
        index === self.findIndex((t:any) => (
          t.trailer_id === value.trailer_id &&
          t.driver_id === value.driver_id &&
          t.ticket_id === value.ticket_id
        ))
      );

      this.truck_availability = this.truck_availability.filter((value:any, index:any, self:any) =>
        index === self.findIndex((t:any) => (
          t.truck_id === value.truck_id &&
          t.driver_id === value.driver_id &&
          t.ticket_id === value.ticket_id
        ))
      );

      this.driver_availability = this.driver_availability.filter((value:any, index:any, self:any) =>
        index === self.findIndex((t:any) => (
          t.driver_id === value.driver_id && t.ticket_id === value.ticket_id
        ))
      );

      let ticketno = ticket_no? ticket_no: (ticket_data?.ticket_no ? ticket_data?.ticket_no : '');

      this.driver_tickets.push(
        this.fb.group({
          ticket_id: [ticket.id, Validators.required],
          is_tc_ticket: [ticket.is_tc_ticket],
          ticket: [ticket_data],
          ticket_no: [ticketno],
          driver_id: ['', Validators.required],
          truck_id: ['', Validators.required],
          ticket_rate: [ticket_rate],
          trailer_id: [''],
          perc: [per.toFixed(2)],
          rates: [driver_hour_rate, [Validators.required, Validators.max(ticket_rate), Validators.min(0), Validators.pattern('^-?\\d*(\\.\\d+)?$')]],
          driver: [''],
          ticket_trailer_type: [ticket_trailer_type],
          ticket_truck_type: [ticket_truck_type],
          truck: [''],
          trailer: [''],
        })
      );
    }
    // console.log(ticket_no,ticket_rate)
  }

  getDriverAvailable(index:any, driver:any){
    var ticket_id = this.driver_tickets.at(index)?.get('ticket_id')?.value;


    var is_available =false;
    var ava:any = null;
    this.driver_availability.map((i:any)=>{
      // console.log(i.driver_id +''+driver.id+' && '+ticket_id+' == '+i.ticket_id)
      if(i.driver_id == driver.id && ticket_id == i.ticket_id){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }

    return is_available;


  }

  getTruckAvailable(index:any, truck:any){
    var ticket_id = this.driver_tickets.at(index)?.get('ticket_id')?.value;
    var driver_id = this.driver_tickets.at(index)?.get('driver_id')?.value;


    var is_available =false;
    var ava:any = null;
    this.truck_availability.map((i:any)=>{
      // console.log(i.truck_id +''+truck.id+' && '+ticket_id+' == '+i.ticket_id)
      if((i.truck_id == truck.id && ticket_id == i.ticket_id) ){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }

    return is_available;


  }


  getTrailerAvailable(index:any, trailer:any){
    var ticket_id = this.driver_tickets.at(index)?.get('ticket_id')?.value;
    var driver_id = this.driver_tickets.at(index)?.get('driver_id')?.value;


    var is_available =false;
    var ava:any = null;
    this.trailer_availability.map((i:any)=>{

      if((i.trailer_id == trailer.id && ticket_id == i.ticket_id) ){
        ava = i;
      }
    })
    // console.log(ava)
    if(ava){
      is_available= ava?.is_available
    }


    return is_available;


  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-yellow width-fit-content btn-text-very-small";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;
      case 'Driving':
        return "mybtn mybtn-back-green width-fit-content btn-text-very-small text-color-green";
        break;
      case 'Approved':
        return "mybtn bg-yellow width-fit-content btn-text-very-small";
        break;
        case 'Accepted':
          return "mybtn bg-pink width-fit-content btn-text-very-small";
          break;
      case 'Completed':
        return "mybtn bg-pink width-fit-content btn-text-very-small";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  setDriver(index:any,driver:any,ticket_id:any){
    if(driver.id){
      let driver_id = driver.id;
      this.driver_tickets.at(index).get('driver_id')?.patchValue(driver_id);
      var driver:any = null;
      this.drivers_list.map((item:any)=>{
        if(driver_id == item.id){
          if(this.getDriverAvailable(index,item)){
            driver = item;
            this.default_driver = item;
            this.driver_tickets.at(index).get('driver')?.patchValue(item);
          }
        }
      })


      let ticket_rate:any = this.driver_tickets.at(index).get('ticket_rate')?.value;
      let  driver_hour_rate = '';
      this.default_driver?.sub_users.map((item:any)=>{

        if(item.parent_user_id == this.user_id ){
          if(item.driver_hour_rate){
            driver_hour_rate = item?.driver_hour_rate;

          }
        }

      });

      if(driver?.role_id==6 || driver?.role_id=="6"){
        driver_hour_rate = ticket_rate;
      }

      if(driver_hour_rate && driver_hour_rate !==''){

        this.driver_tickets.at(index).get('rates')?.patchValue(parseFloat(driver_hour_rate).toFixed(2));
      }else{
        this.driver_tickets.at(index).get('rates')?.patchValue('');
      }

      if(driver.default_truck_id && driver.default_truck_id !==''){

        this.trucks_list.map((item:any)=>{
          if(this.driver_tickets.at(index).get('ticket_truck_type')?.value && item.id==driver.default_truck_id && item.truck_type ==  this.driver_tickets.at(index).get('ticket_truck_type')?.value && this.getTruckAvailable(index,item)){

            if(this.checkAvailable('truck',item,index) ){

              this.driver_tickets.at(index).get('truck')?.patchValue(item);
              this.driver_tickets.at(index).get('truck_id')?.patchValue(driver.default_truck_id);
            }

          }else if(!this.driver_tickets.at(index).get('ticket_truck_type')?.value &&  item.id==driver.default_truck_id && this.getTruckAvailable(index,item)){

            this.driver_tickets.at(index).get('truck')?.patchValue(item);
            this.driver_tickets.at(index).get('truck_id')?.patchValue(driver.default_truck_id);
          }
        })
      }else{

        this.driver_tickets.at(index).get('truck_id')?.patchValue('');
        this.driver_tickets.at(index).get('truck')?.patchValue('');
      }

      if(this.selected_ticket_list[index]?.ticket_truck_type?.project_trailer_id){

        if(driver.default_trailer_id && driver.default_trailer_id !==''){

          this.trailers_list.map((item:any)=>{

            if(this.driver_tickets.at(index).get('ticket_trailer_type')?.value && item.trailer_type ==  this.driver_tickets.at(index).get('ticket_trailer_type')?.value && item.id==driver.default_trailer_id && this.getTrailerAvailable(index,item)){
              if(this.checkAvailable('trailer',item,index) ){

              this.driver_tickets.at(index).get('trailer')?.patchValue(item);
              this.driver_tickets.at(index).get('trailer_id')?.patchValue(driver.default_trailer_id);
              }

            }else if(!this.driver_tickets.at(index).get('ticket_trailer_type')?.value && item.id==driver.default_trailer_id && item.trailer_type ==  this.driver_tickets.at(index).get('ticket_trailer_type')?.value && this.getTrailerAvailable(index,item)){

            if(this.checkAvailable('trailer',item,index) ){
              this.driver_tickets.at(index).get('trailer')?.patchValue(item);
              this.driver_tickets.at(index).get('trailer_id')?.patchValue(driver.default_trailer_id);
            }
            }
          })
        }else{

          this.driver_tickets.at(index).get('trailer_id')?.patchValue('');
          this.driver_tickets.at(index).get('trailer')?.patchValue('');
        }
      }else{
          this.driver_tickets.at(index).get('trailer_id')?.patchValue('');
          this.driver_tickets.at(index).get('trailer')?.patchValue('');
      }



      let per:any = 0;

      if(driver_hour_rate && driver_hour_rate !=''  && parseFloat(ticket_rate)>0){
        per = parseFloat(driver_hour_rate) / parseFloat(ticket_rate) *100;
      }

      if(per ){

        this.driver_tickets.at(index).get('perc')?.patchValue(per.toFixed(2));
      }else{

        this.driver_tickets.at(index).get('perc')?.patchValue(0);
      }
      this.driver_tickets.at(index).get('rates')?.setValidators(Validators.max(ticket_rate));
      this.driver_tickets.at(index).get('rates')?.updateValueAndValidity();
      this.driver_tickets.at(index).get('ticket_rate')?.patchValue(ticket_rate);


    }else{
        this.driver_tickets.at(index).get('rates')?.patchValue('');
        this.driver_tickets.at(index).get('perc')?.patchValue(0);
    }
    // console.log(this.dispatchDriverForm.value)
   setTimeout(() => {
    $(".driver-div").hide();
   }, 300);
  }

  rateChange(event:any,idx:any){
    var per=0;
    this.rateErrorr = '';
    var ticket_rate = this.driver_tickets.at(idx)?.get('ticket_rate')?.value;
    var driver_hour_rate = event.target.value;
    if(driver_hour_rate && parseFloat(ticket_rate)>0){
      if(driver_hour_rate > parseFloat(ticket_rate)){
        this.rateErrorr = 'Driver rate can not be greater than ' + ticket_rate;
        this.formedClicked=true;
      }
      per = parseFloat(driver_hour_rate) / parseFloat(ticket_rate) *100;
    }

    if(per ){

      this.driver_tickets.at(idx).get('perc')?.patchValue(per.toFixed(2));
    }else{

      this.driver_tickets.at(idx).get('perc')?.patchValue(0);
    }
    // console.log(driver_hour_rate,ticket_rate,per)
  }

  setTruck(idx:any,truck:any,ticket_id:any){
    if(truck && truck.id){
      this.driver_tickets.at(idx).get('truck_id')?.patchValue(truck.id);
      this.driver_tickets.at(idx).get('truck')?.patchValue(truck);
    }else{
      this.driver_tickets.at(idx).get('truck_id')?.patchValue('');
      this.driver_tickets.at(idx).get('truck')?.patchValue('');
    }

    setTimeout(() => {
      $(".truck-div").hide();
     }, 300);
  }

  setTrailer(idx:any,trailer:any,ticket_id:any){
    if(trailer && trailer.id){
      this.driver_tickets.at(idx).get('trailer_id')?.patchValue(trailer.id);
      this.driver_tickets.at(idx).get('trailer')?.patchValue(trailer);
    }else{
      this.driver_tickets.at(idx).get('trailer_id')?.patchValue('');
      this.driver_tickets.at(idx).get('trailer')?.patchValue('');
    }

    setTimeout(() => {
      $(".trailer-div").hide();
     }, 300);
  }

  tc_disp_error(){
    this.show_reason_modal = false;
    this.formedClicked2 = false;
    this.is_tc_form_error = false;
  }
  driver_disp_error(){
    this.show_reason_modal = false;
    this.formedClicked2 = false;
    this.is_tc_form_error = false;
  }


  onTCDispatch(){

    this.formedClicked2 = true;
    this.is_tc_form_error = false;
    this.errorDate = '';
    this.errorTruckingComp = '';
    this.rateError = '';

    let is_error = false;
    if(this.dispatchForm.get('dispatch_date')?.value ==''){
      this.errorDate = 'Date selection is required';
      is_error = true;
    }

    if(this.dispatchForm.get('trucking_company_id')?.value == ''){
      this.errorTruckingComp = 'Trucking Company selection is required';
      is_error = true;
    }


    if(this.dispatchForm.invalid || is_error){

      this.is_tc_form_error = true;
      return;
    }
    else if(this.rateErrorr != ''){
      this.is_tc_form_error = true;
      return;
    }

    var i = 0;
    this.ticket_truck_types.controls.map(item=>{

        if(item.get('rates')?.invalid && item.get('rates')?.hasError('pattern') ){

          is_error=true;
        }else{
          if(item.get('rates')?.value.toString() !=''){

            if(item.get('rates')?.value.toString() !='' && parseFloat(item.get('rates')?.value.toString()) > parseFloat(item.get('old_rates')?.value.toString())){
              // console.log(item.get('rates')?.value+'>'+item.get('old_rates')?.value)
              this.is_tc_form_error = true;
              this.error[i] = 'Rate cannot be greater than '+item.get('old_rates')?.value;
              is_error=true;

            }else{
              this.error[i] = '';
            }
          }else{
            is_error=true;
          }

        }


        i++;
    })

    // this.dispatchForm.get('ticket_truck_types')?.value && this.dispatchForm.get('ticket_truck_types')?.value.map((item:any)=>{

    //   if(item.rates > item.old_rates){
    //    console.log(item.rates+'>'+item.old_rates)
    //     this.rateError = 'Rate you enter cannot be more than $'+item.old_rates;
    //     is_error = true;

    //   }else{
    //     this.rateError = '';
    //   }
    //   i++;

    // })

    if(is_error){
      return;
    }
    if(this.rateError !=""){
      return;
    }
    this.is_loading_tc=true;

    this.ticket_service.saveDispatchtoTrucking(this.dispatchForm.value).subscribe((response)=>{
      this.is_loading_tc=false;
      if(response.status){
      //  this.is_dispatched = true;
        $('#myModal').hide('modal')
        $('#myModal').modal('hide');
        $('.modal-backdrop').hide()
        $('body').removeClass('modal-open');
        $('.modal-backdrop').addClass('hide');
       if(response?.trucking_company){
        this.trucking_company_name = response?.trucking_company?.company_name;
       }
       this.driver_tickets.clear();
       this.ticket_truck_types.clear();
       this.selected_tickets =0;
       this.selected_items = null;
       this.listing.emit();
       this.router.navigate(['/tickets-to-dispatch'])

       this.formedClicked2 = false;

      }else{
        if(response && response.data && response?.data?.errors){
          this.errorDate = response.data.errors?.disptach_date ? response.data.errors?.disptach_date : "";
          this.errorDate = response.data.errors?.trucking_company_id ? response.data.errors?.trucking_company_id : "";
        }else if(response.message){
          Swal.fire(  {
            confirmButtonColor:'#17A1FA',
            title:    'Warning',
            text:
            response.message
          })
          this.listing.emit();
          this.router.navigate(['/tickets-to-dispatch'])
        }
      }
    })


  }

  getTicketsToDispatch(){
    let data:any = this.dispatchDriverForm.value;
    let total:any = 0;
    let idx=  0 ;
    data?.driver_tickets.map((item:any)=>{
      if(item.rates !='' && item.driver_id !='' && item.truck_id !='' && (((this.selected_ticket_list[idx]?.ticket_trailer_type || this.selected_ticket_list[idx]?.ticket_truck_type?.project_trailer_id) && item?.trailer_id !='')  || (!this.selected_ticket_list[idx]?.ticket_trailer_type && !this.selected_ticket_list[idx]?.ticket_truck_type?.project_trailer_id))){
        total++;
      }
      idx++;
    });
    return total;
  }


  getName(ticket:any){
    var type='';
    if(ticket?.tc_ticket && ticket?.tc_ticket=='YES'){

      type = ticket?.ticket_truck_type + (ticket?.ticket_trailer_type? ' - '+ticket?.ticket_trailer_type:'')

    }else{

      type= ticket?.ticket_truck_type?.project_combination ? ticket?.ticket_truck_type?.project_combination?.nickname : (ticket?.ticket_truck_type?.project_truck ? ticket?.ticket_truck_type?.project_truck?.name+ (ticket?.ticket_truck_type?.project_trailer ?  ' - ' + ticket?.ticket_truck_type?.project_trailer?.name : '') :'' )

    }

    return type;
  }

  handleClick(){
    this.listing.emit()
    this.is_dispatched=false;

    // window.location.href  ='/tickets-to-dispatch';
  }

  onDriverDispatch(){

    this.formedClicked = true;

    let data:any = this.dispatchDriverForm.value;
    var i = 0;
    var is_error:boolean=false;
    let driver_tickets:any = [];
    let total:any=0;
    data?.driver_tickets.map((item:any)=>{
      if(item.rates==''){
        this.error[i] = 'Driver rate is required';
        is_error = true;
      }
      if(this.rateErrorr != ''){
        this.rateError = ' ';
        is_error = true;
      }
      if(item.rates !='' && item.driver_id !='' && item.truck_id !='' && (((this.selected_ticket_list[i]?.ticket_trailer_type || this.selected_ticket_list[i]?.ticket_truck_type?.project_trailer_id) && item?.trailer_id !='')  || (!this.selected_ticket_list[i]?.ticket_trailer_type && !this.selected_ticket_list[i]?.ticket_truck_type?.project_trailer_id))){
        driver_tickets.push(item);
        total++;
      }

      if(item.trailer_id =='' && item.ticket_trailer_type !='' && item.ticket_trailer_type!=null ){

        this.error_trailer[i] = 'Trailer is required';
        is_error = true;
      }

      i++;
    })

    if((this.dispatchDriverForm.invalid || is_error) && total<1){
      this.is_driver_form_error = true;
      return;
    }
    else if(this.rateErrorr != ''){
      this.is_driver_form_error = true;
      return;
    }
    this.is_loading_driver = true;
    let dts:any = [];
    driver_tickets?.map((item:any)=>{
      let it = item;
      if(it.ticket){
        it.ticket=null;
      }
      if(it.driver){
        it.driver=null;
        dts.push(it);
      }
    })
    data.driver_tickets = dts;
    this.ticket_service.saveDisptachToDriver(data).subscribe((response)=>{
      this.is_loading_driver = false;
      if(response.status){

       this.driver_tickets.clear();
       this.ticket_truck_types.clear();
       this.selected_tickets =0;
       this.selected_items = [];
       this.formedClicked = false;
       this.listing.emit()

      //  this.is_dispatched_driver = true;
        $('#myModal2').hide('modal');
        $('#myModal2').modal('hide');
        $('.modal-backdrop').hide();
        $('body').removeClass('modal-open');
        $('.modal-backdrop').addClass('hide');

       const modalElement = document.getElementById('myModal2');
      if (modalElement) {
        modalElement.style.display = 'none';
        $('#myModal2').modal('hide');

      }


      }else{
        if(response.message){
          this.driver_message = response.message;
          Swal.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:    'Warning',
            text:
            response.message
          })
          this.listing.emit();
          this.router.navigate(['/tickets-to-dispatch'])
        }
      }
    })
  }
  getDataDiff(startDate:any, endDate:any) {
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  checkAvailable(type:any,item:any,idx:any){

    let available:boolean=true;
    let driver_form = this.dispatchDriverForm.value;
    let ticket_data = this.driver_tickets?.at(idx).get('ticket')?.value;

    let default_datetime = ticket_data?.ticket_datetime;

    if(driver_form && driver_form?.driver_tickets){
      switch (type) {
        case 'driver':
          driver_form?.driver_tickets.map((dt:any)=>{

            let dt_datetime =  dt?.ticket?.ticket_datetime;
            var diff:any = null;

            if(new Date(default_datetime) > new Date(dt_datetime)){
              diff = this.getDataDiff( new Date(dt_datetime), new Date(default_datetime));
            }else{
              diff = this.getDataDiff(new Date(default_datetime), new Date(dt_datetime));
            }
            let hours = 0;
            let day=0;
            hours += parseInt(diff?.hour.toString());

            if( parseInt(diff?.day) <0){
              day = parseInt(diff?.day.toString()) * -1;
              hours += day * 24;
            }else{
              day = parseInt(diff?.day.toString());
              hours += day * 24;
            }

            // console.log({diff:diff,dt_datetime:dt_datetime, hours:hours});

            //If current job and meant job is far away for it
            let hours_current = 0;
            let current_datetime = ticket_data?.current_job?.ticket?.ticket_datetime;
            if(ticket_data?.current_job && current_datetime && current_datetime !=null){

              var diff:any = null;

              if(new Date(current_datetime) > new Date(dt_datetime)){
                diff = this.getDataDiff( new Date(dt_datetime), new Date(current_datetime));
              }else{
                diff = this.getDataDiff(new Date(current_datetime), new Date(dt_datetime));
              }
              let day=0;
              hours_current += parseInt(diff?.hour.toString());

              if( parseInt(diff?.day) <0){
                day = parseInt(diff?.day.toString()) * -1;
                hours_current += day * 24;
              }else{
                day = parseInt(diff?.day.toString());
                hours_current += day * 24;
              }
            }
            if(dt.driver_id == item.id && hours<5 && hours_current<5){
              available=false;
            }
          })
          break;
        case 'truck':
          driver_form?.driver_tickets.map((dt:any)=>{
            let dt_datetime =  dt?.ticket?.ticket_datetime;
            var diff:any = null;

            if(new Date(default_datetime) > new Date(dt_datetime)){
              diff = this.getDataDiff( new Date(dt_datetime), new Date(default_datetime));
            }else{
              diff = this.getDataDiff(new Date(default_datetime), new Date(dt_datetime));
            }
            let hours = 0;
            let day=0;
            hours += parseInt(diff?.hour.toString());

            if( parseInt(diff?.day) <0){
              day = parseInt(diff?.day.toString()) * -1;
              hours += day * 24;
            }else{
              day = parseInt(diff?.day.toString());
              hours += day * 24;
            }

            //If current job and meant job is far away for it
            let hours_current = 0;
            let current_datetime = ticket_data?.current_job?.ticket?.ticket_datetime;
            if(ticket_data?.current_job && current_datetime && current_datetime !=null){

              var diff:any = null;

              if(new Date(current_datetime) > new Date(dt_datetime)){
                diff = this.getDataDiff( new Date(dt_datetime), new Date(current_datetime));
              }else{
                diff = this.getDataDiff(new Date(current_datetime), new Date(dt_datetime));
              }
              let day=0;
              hours_current += parseInt(diff?.hour.toString());

              if( parseInt(diff?.day) <0){
                day = parseInt(diff?.day.toString()) * -1;
                hours_current += day * 24;
              }else{
                day = parseInt(diff?.day.toString());
                hours_current += day * 24;
              }

            }
            if(dt.truck_id == item.id && hours<5 && hours_current<5){
              available=false;
            }

          })
          break;
        case 'trailer':
          driver_form?.driver_tickets.map((dt:any)=>{
            let dt_datetime =  dt?.ticket?.ticket_datetime;
            var diff:any = null;

            if(new Date(default_datetime) > new Date(dt_datetime)){
              diff = this.getDataDiff( new Date(dt_datetime), new Date(default_datetime));
            }else{
              diff = this.getDataDiff(new Date(default_datetime), new Date(dt_datetime));
            }
            let hours = 0;
            let day=0;
            hours += parseInt(diff?.hour.toString());

            if( parseInt(diff?.day) <0){
              day = parseInt(diff?.day.toString()) * -1;
              hours += day * 24;
            }else{
              day = parseInt(diff?.day.toString());
              hours += day * 24;
            }

            //If current job and meant job is far away for it
            let hours_current = 0;
            let current_datetime = ticket_data?.current_job?.ticket?.ticket_datetime;
            if(ticket_data?.current_job && current_datetime && current_datetime !=null){

              var diff:any = null;

              if(new Date(current_datetime) > new Date(dt_datetime)){
                diff = this.getDataDiff( new Date(dt_datetime), new Date(current_datetime));
              }else{
                diff = this.getDataDiff(new Date(current_datetime), new Date(dt_datetime));
              }
              let day=0;
              hours_current += parseInt(diff?.hour.toString());

              if( parseInt(diff?.day) <0){
                day = parseInt(diff?.day.toString()) * -1;
                hours_current += day * 24;
              }else{
                day = parseInt(diff?.day.toString());
                hours_current += day * 24;
              }

            }
            if(dt.trailer_id == item.id && hours<5 && hours_current<5){
              available=false;
            }
          })
          break;

      }
    }

    return available;
  }


  setData(data: any) {
    console.log('Received data in child:', data);
    this.requestDetail = data;
    console.log('Received data in requestDetail:',
    this.requestDetail[0]?.project?.project_name);
    this.request_project_name = this.requestDetail[0]?.project?.project_name
  }

  combineTickets(ticketList: Ticket[]) :any {

    if(ticketList && ticketList?.length){

      var total = ticketList.length;

      if(total>1){

        const groupedTickets: { [key: string]: Ticket[] } = {};
        // Group tickets by initials alphabet
        ticketList.forEach((ticket) => {
        const initial = ticket.ticket_no.substring(0, 2);
        // Assuming initials are the first two characters
        if (!groupedTickets[initial]) {
        groupedTickets[initial] = [];
        }
        groupedTickets[initial].push(ticket);
        });
        // Process grouped tickets and generate combined strings
        const combinedResults: string[] = [];
        for (const initial in groupedTickets) {
          if (groupedTickets.hasOwnProperty(initial)) {
            const tickets = groupedTickets[initial];
            if (tickets.length === 1) {
              combinedResults.push(`${tickets[0].ticket_no} [1]`);
            } else {
              const sortedTickets = tickets.sort((a, b) => {
                if (a.ticket_no < b.ticket_no) return -1;
                if (a.ticket_no > b.ticket_no) return 1;
                return 0;
              });
              const minTicket = sortedTickets[0];
              const maxTicket = sortedTickets[sortedTickets.length - 1];

              const combinedString = `${minTicket.ticket_no}-
              ${maxTicket.state_wise_no} [${tickets.length}]`;
              combinedResults.push(combinedString);
            }
          }
        }
        return combinedResults;

      }else{

        return ticketList[0]?.ticket_no;
      }
    }
  }

  setReason(event:any){
    if(event.target.value){
      this.reason_decling = event.target.value;
    }
  }

  backHandle(){
    this.show_reason_modal= false;
    this.reason_decling='';
    // this.listing.emit();
  }


  handleClose(){
    this.formedClicked2 = false;
    this.show_reason_modal = false;
    this.show_reason_modal = false;
    this.reason_decling='';
    this.listing.emit();

    $('.modal-backdrop').addClass('hide');
    $("#myModal").hide();
    $("#myModal").hide('modal');
    $("#myModal").modal('hide');
    $("#myModal2").hide();
    $("#myModal2").hide('modal');
    $("#myModal2").modal('hide');
    $(".modal-backdrop").hide();
    $('.modal-backdrop').removeClass('show');
  }


  declineTicketHandler(){

    // this.show_reason_modal= false;
    // this.reason_decling='';
    // this.listing.emit();

    if(this.reason_decling ==''){
      if(this.show_reason_modal ){
        Swal.fire( {
        confirmButtonColor:'#17A1FA',
        title:
        `Warning`,
        text:
        `Please provide reason for decling.`
        })
        return;
      }else{
        this.show_reason_modal=true;
      }
      return;
    }else{
    }
    let tickets:any = this.selected_ticket_list;
    let tickets_arr:any = [];
    let ticket_truck_type_id_arr:any = [];
    var is_tc_ticket:any ='NO';
    if(tickets?.length > 0 ){
      tickets.map((item:any)=>{
        tickets_arr.push(item?.id);
        ticket_truck_type_id_arr.push(item?.ticket_truck_type_id);
        if(item?.tc_ticket && item?.tc_ticket=='YES'){
          is_tc_ticket='YES';
        }
      })
    }
    this.is_decline_loading = true;
    let data:any = {
      is_tc_ticket:is_tc_ticket,
      is_accepted:true,
      reason_declining:this.reason_decling,
      logged_in_user_id:this.loggedinUser?.id,
      tickets:tickets_arr,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id :
      this.loggedinUser.user_data_request_id,
      ticket_truck_type_id: ticket_truck_type_id_arr
    };

    this.handleClose();
    this.ticket_service.rejectRequest(data).subscribe(response=>{
      this.is_decline_loading = false;
      if(response.status ){
        Swal.fire(
        {
        confirmButtonColor:'#17A1FA',
        title:
        `Success`,
        text:
        `Tickets declined Successfully`
        })
         this.show_reason_modal= false;
        this.reason_decling='';
        this.listing.emit();
        this.is_dispatched=false;

      }else{
        Swal.fire(
        {
        confirmButtonColor:'#17A1FA',
        title:
        `Error`,
        text:
        `Problem occured while processing declining request.`
        });
      }
    })



  }
}
