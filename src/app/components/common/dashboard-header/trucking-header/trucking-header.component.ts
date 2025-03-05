import { Component, Input, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { TraggetUserMenuCountsService } from 'src/app/services/local-storage.service';
import { PlansService } from 'src/app/services/plans.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-trucking-header',
  templateUrl: './trucking-header.component.html',
  styleUrls: ['./trucking-header.component.css']
})
export class TruckingHeaderComponent implements OnInit {

  @Input('active_menu') active_menu: any;
  is_subscribed: any = null;
  is_free_trial:any='NO';
  loggedinUser: any = {};
  menu_counts: any = {};
  permissions: any = null;
  isProjectMenuOpen: boolean = true;
  Tickets_list: boolean = true;
  Business_list: boolean = true;
  Company_list: boolean = true;
  tragget_tickets: any;

  backendAPIURL = environment.apiBackendUrl;
  constructor(
    private router: Router,
    private plan_service: PlansService,
    private user_service: UserDataService,
    private traggetUserMenuCountsService: TraggetUserMenuCountsService
  ) {
    this.traggetUserMenuCountsService.getTraggetUserMenuCounts().subscribe((TraggetUserMenuCounts) => {
      this.menu_counts = TraggetUserMenuCounts;
    });
    
  }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    this.is_subscribed = 'NO';
    this.loggedinUser = userDone;
    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, account_type: userDone?.user_data_request_account_type ? userDone?.user_data_request_account_type : userDone?.account_type };

    var count: any = localStorage.getItem('TraggetUserMenuCounts');
    let counts = JSON.parse(count);

    if (counts && counts !== null && counts !== undefined) {
      this.menu_counts = counts;
      console.log(this.menu_counts)
    } else {
      this.user_service.getMenuCounts(data).subscribe(response => {
        if (response.status) {
          this.menu_counts = response.data;
          localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(this.menu_counts));
        }
      })

    }

    this.user_service.getMenuCounts(data).subscribe(response => {
      if (response.status) {
        let storedMenuCounts = JSON.parse(localStorage.getItem('Unknown_disp') || '{}');        
        this.menu_counts = response.data;
        if(storedMenuCounts && storedMenuCounts.Unknown_disp && !isNaN(storedMenuCounts.Unknown_disp) && storedMenuCounts.Unknown_disp != null && storedMenuCounts.Unknown_disp != ''){
          // this.menu_counts.dispatched_tickets += Number(storedMenuCounts?.Unknown_disp ? storedMenuCounts?.Unknown_disp : 0);
        }
        localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(this.menu_counts));
      }
    })





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

    if (this.loggedinUser && this.loggedinUser?.account_type && this.loggedinUser?.account_type == 'User') {
      let data_perm = localStorage.getItem('TraggetUserPermission') ? localStorage.getItem('TraggetUserPermission') : null;

      if (data_perm !== null) {


        data_perm = this.user_service.decryptData(data_perm);

        this.permissions = data_perm;

      } else {

        if (this.loggedinUser && this.loggedinUser?.role && this.loggedinUser?.role?.permissions) {

          this.permissions = this.loggedinUser?.role?.permissions;
          let data: any = this.user_service.encryptData(this.loggedinUser?.role?.permissions);

          localStorage.setItem('TraggetUserPermission', data);

        } 
        else if(this.loggedinUser && this.loggedinUser?.parent_user?.account_type == 'Trucking Company' && this.loggedinUser?.account_type =='User')
        {
          console.log(" this in trucking header file, loggedinUser : ",this.loggedinUser)
        }
        else {
          localStorage.removeItem('TraggetUser');
          localStorage.removeItem('TraggetUserPermission');
          sessionStorage.removeItem('TraggetUserSub');
          sessionStorage.removeItem('TraggetUserTrial');
          localStorage.removeItem('TraggetUserMenuCounts');
          this.router.navigate(['/home']);
        }

      }
    }

    var tt:any= sessionStorage.getItem('TraggetUserSub');
   
    if(tt && tt!==null){
        
      let userSubs = this.user_service.decryptData(tt);
      this.is_subscribed = userSubs;

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
          }else{
            this.user_service.getSubStatus(data).subscribe(response=>{
              if(response.status ){
      
                if(response.is_valid == true){
                  this.is_subscribed = 'YES';
                  let datas:any= this.user_service.encryptData(this.is_subscribed);
                  sessionStorage.setItem('TraggetUserSub',(datas));
                }else{
                  
                  this.is_subscribed = 'NO';
                  if(this.active_menu?.child == 'dispatched-tickets' || this.active_menu?.child == 'closed-tickets' || this.active_menu?.child == 'tc-billing-list' || this.active_menu?.child == 'invoices'){
                    if(this.is_free_trial == 'NO' && this.is_subscribed=='NO'){
                      if(this.active_menu?.child == 'dispatched-tickets'){
                        this.user_service.getMenuCounts(data).subscribe(response => {
                          if (response.status) {
                            this.menu_counts = response.data;
                            if(this.menu_counts?.tc_to_approve>0){
    
                            }else{
                              this.router.navigate(['/tc-tragget-plans'])
                            }
                            localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(this.menu_counts));
                          }else{
                            this.router.navigate(['/tc-tragget-plans'])
                          }
                        })
                      }else{
    
                        this.router.navigate(['/tc-tragget-plans'])
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
      this.user_service.getSubStatus(data).subscribe(response=>{
        if(response.status ){

          if(response.is_valid == true){
            this.is_subscribed = 'YES';
            let datas:any= this.user_service.encryptData(this.is_subscribed);
            sessionStorage.setItem('TraggetUserSub',(datas));
          }else{

          }
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
                    // if(this.active_menu?.child == 'dispatched-tickets' || this.active_menu?.child == 'closed-tickets' || this.active_menu?.child == 'tc-billing-list' || this.active_menu?.child == 'invoices'){
                    //   if(this.is_free_trial == 'NO' && this.is_subscribed=='NO'){
                    //     if(this.active_menu?.child == 'dispatched-tickets'){
                    //       this.user_service.getMenuCounts(data).subscribe(response => {
                    //         if (response.status) {
                    //           this.menu_counts = response.data;
                    //           if(this.menu_counts?.tc_to_approve>0){
      
                    //           }else{
                    //             this.router.navigate(['/tc-tragget-plans'])
                    //           }
                    //           localStorage.setItem('TraggetUserMenuCounts', JSON.stringify(this.menu_counts));
                    //         }else{
                    //           this.router.navigate(['/tc-tragget-plans'])
                    //         }
                    //       })
                    //     }else{
      
                    //       this.router.navigate(['/tc-tragget-plans'])
                    //     }
                      
      
                    //   }
                    // }

                     /* End of Commented on sep 5 junaid */
              
                  }
                }
              })
            }
          });
        }

      });
    }
   
   

   
   this.getTraggetTickets();

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

  logoutUser() {
    localStorage.removeItem('TraggetUser');
    localStorage.getItem('TraggetUserPermission');
    localStorage.removeItem('TraggetUserMenuCounts');
    sessionStorage.removeItem('TraggetUserSub');
    sessionStorage.removeItem('TraggetUserTrial');
    localStorage.removeItem('Unknown_disp');
    this.router.navigate(['/home']);
  }

}
