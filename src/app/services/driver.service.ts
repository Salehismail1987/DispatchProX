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

export class DriverService {

  constructor(
    private http: HttpClient
  ) { }

  invitationCheck(codeDetails: any) {
    return this.http.post(environment.apiBaseUrl+'driver/check_code',codeDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  singUpSave(driverDetails:any){
    return this.http.post(environment.apiBaseUrl+'driver/driver_signup',driverDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  singUpNewDriver(driverDetails:any){
    return this.http.post(environment.apiBaseUrl+'driver/new_driver_signup',driverDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }



  getAllRequests(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/get_all_driver_requests',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getDriverTicketDetail(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/get_driver_ticket_details',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllAcceptedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/get_all_accepted_tickets',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateDriverProfile(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/update_profile',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  contactTragget(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/email_tragget',params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getAllClosedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/get_all_closed_tickets',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  rejectDriverTicket(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/reject_driver_request',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  acceptDriverTicket(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/accept_driver_request',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  startRound(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/start_round',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  endRound(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/end_round',params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  addRound(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/add_round',params, options).pipe(
      tap((response: any) => {
      })
    );

  }

  getTicketCompleteData(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/ticket_complete_data',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  sendForApprovel(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/send_for_approval',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  startJob(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/start_job',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  changeDumpSite(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_round_dump_site',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateDriverRoundNotes(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_round_notes',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateMaterial(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_round_material',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateJobNotes(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/save_job_notes',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  changePickupSite(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_round_pickup_site',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  verifyDriverPasswordCode(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/verify_password_code',params,options).pipe(
      tap((response:any)=>{

      })
    );
  }

  verifyOldPassword(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/verify_old_password',params,options).pipe(
      tap((response:any)=>{

      })
    );
  }

  expireOTPPassword(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/expire_password_code',params,options).pipe(
      tap((response:any)=>{

      })
    );
  }

  getSchedularData(params: any) {
    return this.http.post(environment.apiBaseUrl+'driver/get_driver_scheduler_tickets',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateDriverDuration(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_driver_invoice_duration',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updatePaperTicketId(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_paper_ticket_id',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updatePaperTicketPhoto(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_paper_ticket_photo',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getDriverTicketsByDate(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/get_driver_tickets_by_date',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addHaulback(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/add_haulback',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateHaulback(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_haulback',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateRoundPrefilled(params:any){
    return this.http.post(environment.apiBaseUrl+'driver/update_round_prefilled',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

}
