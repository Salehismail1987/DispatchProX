import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

import  *  as CryptoJS from  'crypto-js';
const options = {
  headers: new HttpHeaders({
    Authorization: "Basic "+btoa(environment.phpAuthUser+':'+environment.phpAuthPassword)
  })
}
@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(
    private http: HttpClient
  ) { }

  getUserList(data:any){
    return this.http.post(environment.apiBaseUrl+'user/user_list_by_type',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTimeZone(data:any){
    return this.http.post(environment.apiBaseUrl+'user/get_time_zone',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getMenuCounts(data:any){
    return this.http.post(environment.apiBaseUrl+'user/total_menu_counts',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  sendResetLink(data:any){
    return this.http.post(environment.apiBaseUrl+'user/set_reset_link',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  verifyResetCode(data:any){
    return this.http.post(environment.apiBaseUrl+'user/verify_reset_code',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


  resetPassword(data:any){
    return this.http.post(environment.apiBaseUrl+'user/reset_password',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getDashboardData(data:any){
    return this.http.post(environment.apiBaseUrl+'dashboard/get_dashboard_data',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  getDriverCalendarData(data:any){
    return this.http.post(environment.apiBaseUrl+'dashboard/get_driver_calendar_data',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


  invitationCheck(data:any){
    return this.http.post(environment.apiBaseUrl+'user/verify_code',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  userSignup(data:any){
    return this.http.post(environment.apiBaseUrl+'user/signup_user',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getSubStatus(data:any){
    return this.http.post(environment.apiBaseUrl+'user/get_subscription_status',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  encryptData(data:any){
    return CryptoJS.AES.encrypt(data, environment.encKey).toString();
  }

  decryptData(data: string) {
    return CryptoJS.AES.decrypt(data, environment.encKey).toString(CryptoJS.enc.Utf8);
  }

  updateRole(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_user_role',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  updateUserInfo(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_user_Info',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateUserProfile(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_user_profile',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updatePassword(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_password',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  inviteByRole(data:any){
    return this.http.post(environment.apiBaseUrl+'user/invite_user_by_role',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  inviteByRoleTc(data:any){
    return this.http.post(environment.apiBaseUrl+'user/invite_user_by_role_tc',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateUserTC(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_user_tc',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  updateUserTC2(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_user_tc_2',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getUserTax(data:any){
    return this.http.post(environment.apiBaseUrl+'user/get_user_tax_percentage',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getGraphData(data:any){
    return this.http.post(environment.apiBaseUrl+'tickets/get_graph_data',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


  upateOpenTicketPhoto(data:any){
    return this.http.post(environment.apiBaseUrl+'user/update_open_ticket_photo',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


  cancelInv(data: any) {
    return this.http.post(environment.apiBaseUrl+'user/cancel_inv',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

}
