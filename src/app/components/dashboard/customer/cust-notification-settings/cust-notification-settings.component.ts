import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-cust-notification-settings',
  templateUrl: './cust-notification-settings.component.html',
  styleUrls: ['./cust-notification-settings.component.css']
})
export class CustNotificationSettingsComponent implements OnInit {

  active_menu:any;
  loggedInUser:any;
  loading:boolean=false;
  setting:any =null;


  
  settingForm!: FormGroup;

  constructor(
    private aRouter:ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private notification_service:NotificationService
  ) {  this.active_menu = {
        parent:'company-settings',
        child:'company-settings',
        count_badge: '',
      }
    }

    ngOnInit(): void {
        
      let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
      if (userDone && userDone.id) {
        this.loggedInUser = userDone;
        } else {
        this.router.navigate(['/home']);
      }

      this.getSetting()
      this.settingForm = this.fb.group({
        in_app: [''],
        via_sms: [''],
        via_email: [''],
        loggin_loginout_info: [''],
        request_for_dispatching: [''],
        reminders_subscription_ending: [''],
        tickets_dispatched: [''],
        user_id:[this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id]
      });
    }

    onSaveSetting(){
      const formData = new FormData();
      console.log(this.settingForm.value);
      this.loading = true;
      this.notification_service.saveNotificationSetting(this.settingForm.value).subscribe((response:any)=>{
        this.loading = false;
        if (response && response.status && response.message ) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
            },
            buttonsStyling: false
          })
          swalWithBootstrapButtons.fire(
            'Success',
            'Notification setting saved!').then(() => { 
              
            });
         
          this.getSetting()
        }
      });
    }

    getSetting(){

      this.loading = true;
      const formData = new FormData();
      formData.append('user_id', this.loggedInUser?.id ? this.loggedInUser?.id: this.loggedInUser?.user_data_request_id);  
      this.notification_service.getNotificationSetting(formData).subscribe((response:any)=>{
        this.loading = false;
        if (response && response.status && response.data ) {
    
          if(response.data && response.data){
    
            this.setting = response.data;
            this.settingForm.get('via_email')?.patchValue(this.setting?.via_email == 1? true : false)
            this.settingForm.get('via_sms')?.patchValue(this.setting?.via_sms == 1? true : false)
            this.settingForm.get('in_app')?.patchValue(this.setting?.in_app == 1? true : false)
            this.settingForm.get('tickets_dispatched')?.patchValue(this.setting?.tickets_dispatched == 1? true : false)
            this.settingForm.get('loggin_loginout_info')?.patchValue(this.setting?.loggin_loginout_info == 1? true : false)
            this.settingForm.get('request_for_dispatching')?.patchValue(this.setting?.request_for_dispatching == 1? true : false)
            this.settingForm.get('reminders_subscription_ending')?.patchValue(this.setting?.reminders_subscription_ending == 1? true : false)
          }
        }
      });
    }

}
