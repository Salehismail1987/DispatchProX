import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-popup-cancel-ticket',
  templateUrl: './popup-cancel-ticket.component.html',
  styleUrls: ['./popup-cancel-ticket.component.css']
})
export class PopupCancelTicketComponent implements OnInit {

  @Input('tickets') tickets:any;
  messageError:string='';
  reason:string='';
  is_loading:boolean=false;
  @Output() listing= new EventEmitter();
  loggedinUser: any = {};
  constructor(
    private router: Router,
    private ticket_service: TicketService,  
    private user_service: UserDataService
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
  }

  showModal(str:any){
    this.tickets = null;
    $("#myModal2").modal('hide');
      $('.modal-backdrop').removeClass('show');

      $('body').removeClass('modal-open');

      $('.modal-backdrop').addClass('hide');
      $("body").css({"paddingRight":'0px'})
      $(".modal-backdrop").hide();
    this.listing.emit();
  }

  setReason(event:any){
    if(event.target.value){
      this.reason = event.target.value;
    }else{
      this.reason = '';
    }
  }

  handleCancelTicket(){
    let ticket_ids:any=  [];
    this.tickets.map((item:any)=>{
      ticket_ids.push(item.id);
    });
    console.log(ticket_ids);
    if(this.reason==''){
      this.messageError ='Reason is required.';
      return;
    }
    let formData={
      ticket_ids: ticket_ids,
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      reason:this.reason
    }
    this.is_loading = true;
    this.ticket_service.cancelTicket(formData).subscribe(response=>{

      this.is_loading = false;
      if(response.status && response.message){
        $("#myModal2").modal('hide');
        $('.modal-backdrop').removeClass('show');

        $('body').removeClass('modal-open');
        $("body").css({"paddingRight":'0px'})

        $('.modal-backdrop').addClass('hide');
        $(".modal-backdrop").remove();
        this.getMenuCounts();
        this.tickets = null;
        this.listing.emit();
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Success',response.message)
      }else{
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire('Error',response.message)
      }

    });
    
  }

  is_only_approver(roles:any){

    let is_approver:boolean=false;
    if(roles && roles?.length>0){
      roles.map((item:any)=>{
        is_approver = item?.role?.role_name == "Approver" ? true : false;
      });


      if(roles.length== 1 && is_approver){
        is_approver = true;
      }else{
        is_approver = false;
      }
    }


    return is_approver;
  }

  getMenuCounts(){
    let data = {orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: this.loggedinUser?.user_data_request_account_type ? this.loggedinUser?.user_data_request_account_type :  this.loggedinUser?.account_type};

    if(this.is_only_approver(this.loggedinUser?.user_roles) || this.loggedinUser?.account_type=='Customer'){
       data = {orginal_user_id:null,user_id:this.loggedinUser.id ,account_type: this.loggedinUser?.account_type};

    }
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){

          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify( response.data));
        }
      })


  }
}
