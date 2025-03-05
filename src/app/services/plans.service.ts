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
@Injectable({
  providedIn: 'root'
})
export class PlansService {

  constructor(
    private http: HttpClient
  ) { }

  getTraggetPlans(projectId: any) {    
    return this.http.post(environment.apiBaseUrl+'plan/get_tragget_plans',{}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  checkFreeTrial(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/check_free_trial',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  startFreeTrial(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/start_free_trial',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  saveUserPlan(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/save_user_plan',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTraggetTickets(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/get_tragget_ticket',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  getUserPlan(data:any){
  return this.http.post(environment.apiBaseUrl+'plan/get_user_current_plan',data, options).pipe(
    tap((response: any) => {
    })
  );
  }
  getLast30DaysTickets(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/get_user_last_30_days_tickets',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  sendFeedback(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/send_feedback',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  upgradeSubscription(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/upgrade_subscription',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  cancelSubscription(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/cancel_subscription',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  getTrialScreenGraphData(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/get_trial_screen_graph_data',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getProfileTraggetData(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/get_profile_tragget_data',data, options).pipe(
      tap((response: any) => {
      })
    );
  }

  downloadInvoicePDF(data:any){
    return this.http.post(environment.apiBaseUrl+'plan/download_invoice_pdf',data, options).pipe(
      tap((response: any) => {
      })
    );
  }
}
