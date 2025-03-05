import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import * as moment from 'moment-timezone';

import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-company-requests-popup',
  templateUrl: './company-requests-popup.component.html',
  styleUrls: ['./company-requests-popup.component.css']
})
export class CompanyRequestsPopupComponent implements OnInit {


  @Input('requestDetail') requestDetail : any;
  @Input('roundId') roundId : number=0;
  @Output() listing= new EventEmitter();

  edit_qauntity:any;
  reason_decling:string='';
  show_reason_modal:boolean=false;
  is_modal_for_accepted_tickets:boolean=false;
  accepted_declined_qty:any=null;
  partially_to_reject:any = null;
  loggedinUser: any = {};
  user_id:any=null;
  is_decline_loading:boolean=false;
  constructor(
    private ticket_service: TicketService,
    private router: Router,
    private user_service:UserDataService
  ) {

  }

  ngOnInit(): void {
    this.edit_qauntity = '';
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
    if(this.requestDetail?.tickets_to_accept?.length){
      this.edit_qauntity = this.requestDetail?.tickets_to_accept?.length;
    }
    // console.log(' thhissssss :', this.requestDetail );
  }



  time_conversion(requestDetail: any, round: number = 1): { convertedDate?: string, convertedTime?: string } {
    if (requestDetail?.ticket?.ticket_date && requestDetail?.ticket?.ticket_time) {
      const userTimeZone = this.loggedinUser?.time_zone || '';
      const ticketTime = requestDetail.ticket.ticket_time;
      const ticketDate = requestDetail.ticket.ticket_date;

      let data = { ticketTime, ticketDate, userTimeZone };

      const conversionResult = this.ticket_service.timeConversion(data);
      // console.log('data ** :', data);
      // console.log('Converted Date ** :', conversionResult.convertedDate);
      // console.log('Converted Time ** :', conversionResult.convertedTime);

      return conversionResult;
    } else {
      return {};
    }
  }



  setQuantity(quantity:any){
    if(quantity && quantity.target.value){

      this.edit_qauntity = quantity.target.value;
    }
  }


  getTicket(tickets:any){
    if(tickets && tickets?.length){

      var total = tickets.length;
      if(total>1){
        var ticket = tickets[0]?.ticket?.ticket_no+'-'+tickets[total-1]?.ticket?.state_wise_no;
        return ticket+' ['+tickets.length+']';
      }else{
        return tickets[0]?.ticket?.ticket_no;
      }
    }

  }

  getTicketAccepted(tickets:any){
    if(tickets && tickets?.length){

      var total = tickets.length;
      if(total>1){
        let qty = total-parseInt(this.edit_qauntity);
        this.accepted_declined_qty  =  qty;

        if(qty<2 && qty>0){
          return tickets[total-1]?.ticket?.ticket_no
        }else{
          var ticket = tickets[parseInt(this.edit_qauntity)]?.ticket?.ticket_no+'-'+tickets[total-1]?.ticket?.state_wise_no;
          return ticket+' ['+qty+']';
        }

      }else{
        return tickets[0]?.ticket?.ticket_no;
      }
    }
  }

  acceptTicketHandler(tickets:any){

     let tickets_arr:any = [];
     let to_reject:any=[];
     if(tickets?.length > 0 ){
      var i = 0;
      tickets.map((item:any)=>{

        tickets_arr.push(item?.ticket?.id);
        i++;
      })
     }

     if(parseInt(this.edit_qauntity)<1 && this.edit_qauntity !=''){
      Swal.fire( {
        confirmButtonColor:'#17A1FA',
        title:
        `Warning`,
        text:
        `Quantity must be atleast 1.`
      })
      return;
     }

     if(parseInt(tickets?.length) > parseInt(this.edit_qauntity) && this.reason_decling==''){

      this.is_modal_for_accepted_tickets=true;
      this.show_reason_modal=true;
      $("#myModal").modal('show');
      return;
     }

    if(this.is_modal_for_accepted_tickets){
      this.is_decline_loading = true;
    }
    var is_tc_ticket=  this.requestDetail && this.requestDetail.tc_ticket=='YES' ? 'YES':'NO';

    let data:any = {is_tc_ticket:is_tc_ticket,reason_declining:this.reason_decling,tickets:tickets_arr,logged_in_user_id:this.loggedinUser?.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,ticket_truck_type_id: this.requestDetail.ticket_truck_type_id, edited_quantity : this.edit_qauntity};

    this.ticket_service.acceptRequest(data).subscribe(response=>{
      if(this.is_modal_for_accepted_tickets){
        this.is_decline_loading = false;
      }
      if(response.status ){

        // console.log(response.data)
        //  Swal.fire(
        //  {
        //   confirmButtonColor:'#17A1FA',
        //   title:    'Success',
        //   text:
        //  'Request Accepted'
        // }).then(()=>{
        // });
        this.is_modal_for_accepted_tickets=false;
        this.is_modal_for_accepted_tickets=false;
        this.show_reason_modal=false;
        this.accepted_declined_qty = null;
        this.edit_qauntity='';
        this.reason_decling='';
        this.getMenuCounts();
        $("#myModal").modal('hide');
        this.listing.emit();

      }else{
        this.edit_qauntity = '';
        if(response.quantity && response.quantity !=''){

          Swal.fire( {
            confirmButtonColor:'#17A1FA',
            title:
            `Warning`,
            text:
            `Quantity edited cannot be more than required quantity.`
          })
        }else{

          Swal.fire(
          {
            confirmButtonColor:'#17A1FA',
            title:
            `Error`,
            text:
            `Problem occured while processing Accept Requests.`
          });
        }
      }
    })

  }

  rejectTicketHandler(tickets:any){
    setTimeout(() => {

      $("#myModal").modal('show');
    }, 100);
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
    let tickets_arr:any = [];
    var is_tc_ticket:any ='NO';
    if(tickets?.length > 0 ){
     tickets.map((item:any)=>{
      if(item?.tc_ticket && item?.tc_ticket=='YES'){
        is_tc_ticket='YES';
      }
       tickets_arr.push(item?.ticket?.id);
     })
    }

    this.is_decline_loading = true;

    let data:any = {
      is_tc_ticket:is_tc_ticket,
      reason_declining:this.reason_decling,
      logged_in_user_id:this.loggedinUser?.id,
      tickets:tickets_arr,
      user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,

      ticket_truck_type_id: this.requestDetail.ticket_truck_type_id
    };
    this.ticket_service.rejectRequest(data).subscribe(response=>{
      this.is_decline_loading = false;
      if(response.status ){

        this.getMenuCounts();
        this.show_reason_modal= false;
        this.reason_decling='';
         this.listing.emit();

         $("#myModal").modal('hide');
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

  getMenuCounts(){
    let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};

      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
          $(".sa_request").text('['+(response.data?.requests? response.data?.requests:0)+']');
          $(".sa_pending").text('['+(response.data?.pending_dispatches? response.data?.pending_dispatches:0)+']');
          $(".count-requests").text((response.data?.requests? response.data?.requests:0));
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })


  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2 no-shadow";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white no-shadow";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
        case 'Accepted':
          return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2 no-shadow";
          break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white no-shadow";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-color-white no-shadow";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue no-shadow";
  }

  setReason(event:any){
    if(event.target.value){
      this.reason_decling = event.target.value;
    }
  }

  hideDeclineModal(){
    this.show_reason_modal =false;
  }
}
