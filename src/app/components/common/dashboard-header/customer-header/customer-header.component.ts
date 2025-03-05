import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-customer-header',
  templateUrl: './customer-header.component.html',
  styleUrls: ['./customer-header.component.css']
})
export class CustomerHeaderComponent implements OnInit {

  @Input('active_menu') active_menu:any;

  loggedinUser : any = {};
  menu_counts:any = {};
  is_subscribed:any = 'NO';
  tickets_to_approve:boolean=false;
  permissions:any = null;
  is_free_trial:any='NO';
  tragget_tickets: any;
  isProjectMenuOpen: boolean = true;
  Tickets_list: boolean = true;
  Business_list: boolean = true;
  Company_list: boolean = true;
  isProjectMenuOpen2: boolean = true;
  isProjectMenuOpen3: boolean = true;



  backendAPIURL = environment.apiBackendUrl;
  constructor(
    private router: Router,
    private plan_service: PlansService,
    private user_service: UserDataService
  ) {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    this.loggedinUser = userDone;
    this.is_subscribed = 'NO';
    // let userSubs = JSON.parse(sessionStorage.getItem('TraggetUserSub') || '{}');
    // userSubs = this.user_service.decryptData(userSubs);

    // if(userSubs !=''){

    //   this.is_subscribed = userSubs;
    // }else{
    //   let data = {user_id:this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type :  userDone?.account_type};
    //   this.user_service.getSubStatus(data).subscribe(response=>{
    //     if(response.status ){

    //       if(response.is_valid == true){
    //         this.is_subscribed = 'YES';
    //         let data:any= this.user_service.encryptData(this.is_subscribed);
    //         sessionStorage.setItem('TraggetUserSub',JSON.stringify(data));
    //       }else{
    //         if(this.active_menu?.child == 'billing-list' || this.active_menu?.child == 'closed-tickets' || this.active_menu?.child == 'dispatched-tickets' ){
    //           this.router.navigate(['/cust-tragget-plans'])
    //         }
    //         this.is_subscribed = null;
    //       }
    //     }
    //   })
    // }
   }

  ngOnInit(): void {



    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    this.loggedinUser = userDone;
    let data = {orginal_user_id:this.loggedinUser.id,user_id:this.loggedinUser?.id ? this.loggedinUser?.id:this.loggedinUser.user_data_request_id ,account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type :  userDone?.account_type};

    if(this.is_only_approver(this.loggedinUser?.user_roles) || this.loggedinUser?.account_type=='Customer'){
       data = {orginal_user_id:null,user_id:this.loggedinUser.id ,account_type: userDone?.user_data_request_account_type ?
       userDone?.user_data_request_account_type : userDone?.account_type};

    }

    var count:any =localStorage.getItem('TraggetUserMenuCounts');
    let counts = JSON.parse(count);

    if(counts && counts !==null && counts!==undefined){
      this.menu_counts= counts;
      console.log(this.menu_counts)
    }else{
      this.user_service.getMenuCounts(data).subscribe(response=>{
        if(response.status){
          this.menu_counts = response.data;
          localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(this.menu_counts));
        }
      })

    }

    this.user_service.getMenuCounts(data).subscribe(response=>{
      if(response.status){

        let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');
        this.menu_counts = response.data;
        if(storedMenuCounts && storedMenuCounts.Unknown_disp && !isNaN(storedMenuCounts.Unknown_disp) && storedMenuCounts.Unknown_disp != null && storedMenuCounts.Unknown_disp != ''){
          // this.menu_counts.dispatched_tickets += Number(storedMenuCounts?.Unknown_disp ? storedMenuCounts?.Unknown_disp : 0);
        }

        localStorage.setItem('TraggetUserMenuCounts',JSON.stringify(this.menu_counts));
      }
    })

    if(this.loggedinUser && this.loggedinUser?.account_type && this.loggedinUser?.account_type == 'User'){
      let data_perm = localStorage.getItem('TraggetUserPermission') ? localStorage.getItem('TraggetUserPermission') :null ;

      if( data_perm !==null ){

          data_perm = this.user_service.decryptData(data_perm);
          this.permissions= data_perm;

      }else{

        if(this.loggedinUser ){
          if(this.is_only_approver(this.loggedinUser?.user_roles)){
            this.permissions = this.get_permission(this.loggedinUser?.user_roles);
            let data:any= this.user_service.encryptData( this.permissions );

            localStorage.setItem('TraggetUserPermission',data);
          }else{
            this.permissions = 'all';
            let data:any= this.user_service.encryptData(this.permissions);

            localStorage.setItem('TraggetUserPermission',data);
          }


        }else{


          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserTrial');
          localStorage.removeItem('TraggetUserMenuCounts');
          sessionStorage.removeItem('TraggetUserSub');
          this.router.navigate(['/home']);
        }

      }
    }

    $(document).on('click','#sidebarCollapse', function() {
      if($('#sidebar').hasClass('active')){
        setTimeout(() => {
          $('#sidebar').removeClass('active');
        }, 500);
      }else{
        setTimeout(() => {

          $('#sidebar').addClass('active');
        }, 500);
      }
    });



    var tt:any= sessionStorage.getItem('TraggetUserSub');

    if(tt && tt!==null){

      let userSubs = this.user_service.decryptData(tt);
      this.is_subscribed = userSubs;
      this.user_service.getSubStatus(data).subscribe(response=>{
        if(response.status ){
          if(response.is_valid == true){
              this.is_subscribed = 'YES';
              let datas:any= this.user_service.encryptData(this.is_subscribed);
              sessionStorage.setItem('TraggetUserSub',(datas));
            }else{
              this.is_subscribed = 'NO';
              let datas:any= this.user_service.encryptData(this.is_subscribed);
              sessionStorage.setItem('TraggetUserSub',(datas));
            }

        }
      })
      if(!this.is_subscribed || this.is_subscribed=='NO'){
        var dd:any= sessionStorage.getItem('TraggetUserTrial');

    if(dd && dd!==null){

      let istrial = this.user_service.decryptData(dd);
      this.is_free_trial = (istrial)
    }
    let formData:any = {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id}
    this.is_subscribed = 'NO';
    this.plan_service.checkFreeTrial(formData).subscribe((response:any)=>{
      if(response && response.data){
        this.is_free_trial = response.data.is_free_trial;
      }else{
        this.is_free_trial = 'NO';
      }
      let datas:any= this.user_service.encryptData(this.is_free_trial);
      sessionStorage.setItem('TraggetUserTrial',(datas));

      var tt:any= sessionStorage.getItem('TraggetUserSub');

      if(tt && tt!==null){

        let userSubs = this.user_service.decryptData(tt);
        this.is_subscribed = userSubs;
      }else{
        this.user_service.getSubStatus(data).subscribe(response=>{
          if(response.status ){

            if(response.is_valid == true){
              this.is_subscribed = 'YES';
              let datas:any= this.user_service.encryptData(this.is_subscribed);
              sessionStorage.setItem('TraggetUserSub',(datas));
            }else{

              this.is_subscribed = 'NO';
              if(this.active_menu?.child == 'billing-list' || this.active_menu?.child == 'closed-tickets' || this.active_menu?.child == 'dispatched-tickets' ){
                if(this.is_free_trial == 'NO' && this.is_subscribed=='NO'){

                  if( this.active_menu?.child == 'dispatched-tickets'){
                    if(this.loggedinUser && this.loggedinUser?.id){
                      let data:any= {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser.user_data_request_id  , user_type:"Customer"};

                      if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Trucking Company'){
                        data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,for_approver:"YES", user_type:"Trucking Company"};

                      }else if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Customer'){
                        data= {original_user_id:this.loggedinUser.id,user_id:  this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer",for_approver:"YES",};

                      }
                    this.user_service.getDashboardData(data).subscribe(response => {
                      if(response && response.status){
                        if(response.data){
                          if(response.data?.pending_requests>0){
                            this.tickets_to_approve = true;
                          }else{

                            this.router.navigate(['/cust-tragget-plans'])
                          }
                        }

                      }else{
                        this.router.navigate(['/cust-tragget-plans'])
                      }
                    });

                    }
                  }else{
                    this.router.navigate(['/cust-tragget-plans'])
                  }

                }
              }
            }
          }
        })
      }
    });
      }

    }else{
      var dd:any= sessionStorage.getItem('TraggetUserTrial');

    if(dd && dd!==null){

      let istrial = this.user_service.decryptData(dd);
      this.is_free_trial = (istrial)
    }
    let formData:any = {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id}
    this.is_subscribed = 'NO';
    this.plan_service.checkFreeTrial(formData).subscribe((response:any)=>{
      if(response && response.data){
        this.is_free_trial = response.data.is_free_trial;
      }else{
        this.is_free_trial = 'NO';
      }
      let datas:any= this.user_service.encryptData(this.is_free_trial);
      sessionStorage.setItem('TraggetUserTrial',(datas));

      var tt:any= sessionStorage.getItem('TraggetUserSub');

      if(tt && tt!==null){

        let userSubs = this.user_service.decryptData(tt);
        this.is_subscribed = userSubs;
      }else{
        this.user_service.getSubStatus(data).subscribe(response=>{
          if(response.status ){

            if(response.is_valid == true){
              this.is_subscribed = 'YES';
              let datas:any= this.user_service.encryptData(this.is_subscribed);
              sessionStorage.setItem('TraggetUserSub',(datas));
            }else{
              /* Commented on sep 5 junaid */

              // this.is_subscribed = 'NO';
              // if(this.active_menu?.child == 'billing-list' || this.active_menu?.child == 'closed-tickets' || this.active_menu?.child == 'dispatched-tickets' ){
              //   if(this.is_free_trial == 'NO' && this.is_subscribed=='NO'){

              //     if( this.active_menu?.child == 'dispatched-tickets'){
              //       if(this.loggedinUser && this.loggedinUser?.id){
              //         let data:any= {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer"};

              //         if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Trucking Company'){
              //           data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,for_approver:"YES", user_type:"Trucking Company"};

              //         }else if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Customer'){
              //           data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer",for_approver:"YES",};

              //         }
              //       this.user_service.getDashboardData(data).subscribe(response => {
              //         if(response && response.status){
              //           if(response.data){
              //             if(response.data?.pending_requests>0){
              //               this.tickets_to_approve = true;
              //             }else{

              //               this.router.navigate(['/cust-tragget-plans'])
              //             }
              //           }

              //         }else{
              //           this.router.navigate(['/cust-tragget-plans'])
              //         }
              //       });

              //       }
              //     }else{
              //       this.router.navigate(['/cust-tragget-plans'])
              //     }

              //   }
              // }

              /* end of Commented on sep 5 junaid */
            }
          }
        })
      }
    });
    }


    this.getDashboardData();
    this.getTraggetTickets();
  }

  toggleProjectMenu(menu:any='0') {
    if(menu=='1'){
      this.Tickets_list = !this.Tickets_list;
    }
    else if(menu=='2'){
      this.Business_list = !this.Business_list;
    }
    else if(menu=='3'){
      this.Company_list = !this.Company_list;
    }
    else if(menu=='0'){
      this.isProjectMenuOpen = !this.isProjectMenuOpen;
    }
  }

  getTraggetTickets() {
    const formData = new FormData();
    formData.append(
      'user_id',
      this.loggedinUser?.id
        ? this.loggedinUser?.id
        : this.loggedinUser?.user_data_request_id
    );
    this.plan_service.getTraggetTickets(formData).subscribe((response) => {
      if (response.status && response.data) {
        this.tragget_tickets = response.data;
      }
    });
  }

  getDashboardData(){
    if(this.loggedinUser && this.loggedinUser?.id){
      let data:any= {user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer"};

      if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Trucking Company'){
        data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,for_approver:"YES", user_type:"Trucking Company"};

      }else if(this.loggedinUser.role && this.loggedinUser.role.role_name=='Approver' && this.loggedinUser.parent_user?.account_type=='Customer'){
        data= {original_user_id:this.loggedinUser.id,user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id , user_type:"Customer",for_approver:"YES",};

      }
    this.user_service.getDashboardData(data).subscribe(response => {
      if(response && response.status){
        if(response.data){
          if(response.data?.pending_requests>0){
            this.tickets_to_approve = true;
          }
        }

      }else{

      }
    });

    }
  }

  get_permission(roles:any){
    let permission:any='';
    if(roles && roles?.length>0){

      roles.map((item:any)=>{
        permission = item?.role?.role_name == "Approver" ? item?.role?.permissions : '';
      });
    }
    return permission;
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


  has_role(roles:any,role:any){

    let has_role:boolean=false;

    if(roles && roles?.length>0){
      roles.map((item:any)=>{
        if(item?.role?.role_name == role){
          has_role =  true
        }
      });
    }

    return has_role;
  }

  logoutUser(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    localStorage.removeItem('TraggetUserMenuCounts');
    sessionStorage.removeItem('TraggetUserSub');
    localStorage.removeItem('Unknown_disp');
    sessionStorage.removeItem('TraggetUserTrial');
    this.router.navigate(['/home']);
  }


  moveToStatus(status:string){

  }
}

