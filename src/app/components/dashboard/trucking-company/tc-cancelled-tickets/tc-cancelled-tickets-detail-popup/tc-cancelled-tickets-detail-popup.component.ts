import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-tc-cancelled-tickets-detail-popup',
  templateUrl: './tc-cancelled-tickets-detail-popup.component.html',
  styleUrls: ['./tc-cancelled-tickets-detail-popup.component.css']
})
export class TcCancelledTicketsDetailPopupComponent implements OnInit {

  loggedinUser: any = {};
  active_menu:any;

  user_id:any;
  project_list:any=null;
  companies_list:any=null;

  search_project:any='';

  paperImageURL:any=environment.paperTicketImageUrl;
  selected_project:any='';

  @Input('requestDetail') requestDetail:any;
  selected_company:any='';
  search_company:any='';

  search_list_project:any='';
  selected_list_project:any='';

  selected_list_company:any='';
  search_list_company:any='';
  detail_truck_name:any='';


  calendar_data:any = null;
  ratio:any=null;
  ticket_date:any=null;
  cancelled_date:any=null;
  cancelled_tickets_list:any=null;
  total_rounds:any=0;
  constructor(
    private router: Router,
    private ticket_service: TicketService,
    private project_service: ProjectService,
    private actRouter: ActivatedRoute,
    private user_service: UserDataService
  ) {

    this.active_menu = {
      parent:'tickets',
      child:'tc-declined-tickets',
      count_badge: '',
    }
   }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      if(!this.loggedinUser?.open_paper_ticket_photo ){

        this.loggedinUser.open_paper_ticket_photo = 'NO';
        localStorage.setItem('TraggetUser',JSON.stringify(this.loggedinUser));
      }
    } else {
      this.router.navigate(['/home']);
    }
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id;

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


  setDetail(ticket:any){
    this.detail_truck_name = '';

    this.requestDetail = ticket;
    this.total_rounds=0;
    if(ticket?.ticket?.status=='Approved' || ticket?.ticket?.status=='Completed'){

      ticket?.ticket?.ticket_truck_type_rounds.map((item:any)=>{
        if( item.round_time && item.driver_start_time){
          this.total_rounds++;

        }
      })
    }else{
      console.log(ticket.ticket?.ticket_truck_type_rounds.length)
      this.total_rounds = ticket?.ticket?.ticket_truck_type_rounds?.length;
    }
    setTimeout(() => {
      if( this.loggedinUser?.open_paper_ticket_photo=='YES' && (ticket?.ticket?.status=='Approved' || ticket?.ticket?.status=='Completed')  && ticket?.ticket?.required_paper_ticket_id =='YES'){
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width()+"px");
        }, 300);

      }
    },300);
  }



  parseJobTotal2(item:any){
    var hours= 0;
    var mints = 0;
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

    return hours+(mints/60)+' hr';
  }


  parseJobTotal(item:any){
    var hours= 0;
    var mints = 0;
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


  checkOpenTicketPhoto(event:any){
    if(event ){
      var open_paper_ticket_photo='';
      open_paper_ticket_photo= event.target.checked ? 'YES':'NO';
      this.loggedinUser.open_paper_ticket_photo= open_paper_ticket_photo;
      localStorage.setItem('TraggetUser',JSON.stringify(this.loggedinUser));
      let data = {
        user_id:this.loggedinUser.id,
        open_paper_ticket_photo:open_paper_ticket_photo
      }
      this.user_service.upateOpenTicketPhoto(data).subscribe(response=>{
        if(response.status && response.data){

        }
      });
    }
  }


  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return "mybtn bg-light-grey2 width-fit-content btn-text-very-small2";
        break;
      case 'Declined':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Driving':
        return "mybtn bg-dark-yellow  width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Approved':
        return "mybtn bg-medium-blue width-fit-content btn-text-very-small2 text-white";
        break;
        case 'Accepted':
          return "mybtn mybtn-back-yellow width-fit-content btn-text-very-small2";
          break;
      case 'Completed':
        return "mybtn bg-green width-fit-content btn-text-very-small2 text-white";
        break;
      case 'Cancelled':
        return "mybtn mybtn-back-red width-fit-content btn-text-very-small2 text-white";
        break;

    }
    return "mybtn mybtn-back-lightblue width-fit-content btn-text-very-small text-color-lightblue";
  }

  showTicketImage(){
    setTimeout(() => {

      if(this.requestDetail?.ticket && (this.requestDetail?.ticket?.status=='Approved' || this.requestDetail?.ticket?.status=='Completed') && this.requestDetail?.ticket?.paper_ticket_photo){
        setTimeout(() => {
          $("#myModalGetCamera").modal('show');
          $(".modal-image").css('right', $('.modal-ticket').width()+"px");
        },300);
      }
    },300);
  }

}
