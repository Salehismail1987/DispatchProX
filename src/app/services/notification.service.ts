import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
const options = {
  headers: new HttpHeaders({
    Authorization: "Basic "+btoa(environment.phpAuthUser+':'+environment.phpAuthPassword)
  })
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient
  ) { }

  
  getNotificationSetting(data: any) {    
    return this.http.post(environment.apiBaseUrl+'notification/get_user_notification_setting',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  saveNotificationSetting(data:any){
    return this.http.post(environment.apiBaseUrl+'notification/update_user_notification_setting',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  markNotificationViewed(data:any){
    return this.http.post(environment.apiBaseUrl+'notification/mark_notification_viewed',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllNotifications(data:any){
    return this.http.post(environment.apiBaseUrl+'notification/get_all_notifications',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  
}
