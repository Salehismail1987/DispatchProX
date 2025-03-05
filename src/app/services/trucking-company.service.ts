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
export class TruckingCompanyService {

  constructor(
    private http: HttpClient
  ) { }


  saveTruck(truckDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/add_truck',truckDetails, options).pipe(
      tap((response: any) => {

      })
    );
  }

  updateTrailer(trailerDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_trailer',trailerDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }


  updateTruck(truckDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_truck',truckDetails, options).pipe(
      tap((response: any) => {

      })
    );
  }

  saveTrailer(trailerDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/add_trailer',trailerDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  inviteDriver(driverDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/invite_driver',driverDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  inviteTruckingCompany(tc_details: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/invite_tc',tc_details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addUser(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/add_user',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateCompanyProfile(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_tc_profile',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  setSetupStatus(user_id: string) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/set_setup_shown',{user_id:user_id}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  invitationCheckTC(codeDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/check_code',codeDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTCDrivers(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_all_trucking_drivers',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTCTrucks(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_all_trucking_company_trucks',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  deleteUser(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/delete_user',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  deleteTruckTrailer(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/delete_truck_trailer',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllUsers(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_all_users',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  resendDriverInv(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/resend_driver_invitation',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  resendTCInv(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/resend_tc_invitation',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllTCCompanies(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_all_trucking_truckings',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllTCCustomers(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_all_construction_comapnies',params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getTCCustomers(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_tc_customers',params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  saveCustomer(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/save_customer',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }
  updateCustomer(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_customer',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  setDefaultTruckTrailer(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/set_default_truck_trailer',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeDriver(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/remove_tc_driver',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateDriverPhone(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_driver_phone',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  setAsDriver(params:object){
    return this.http.post(environment.apiBaseUrl+'trucking_company/update/role', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  isDriverAvailable(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/is_driver_available', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  isTruckAvailable(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/is_truck_available', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  isTrailerAvailable(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/is_trailer_available', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeTruckingCompany(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/remove_Trucking_Companys', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addCCdumpsite(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/add_cc_dumpsite', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  editCCdumpsite(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/edit_cc_dumpsite', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeCCdumpsite(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/remove_cc_dumpsite', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addUsertoTCProject(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/add_user_tc_project', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateTCUserRoles(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_tc_user_roles', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  setTCCustomer(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_tc_project_customer', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateTCCCRates(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/update_tc_cc_rates', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAvailabilityData(params:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/get_availability_data', params, options).pipe(
      tap((response: any) => {
      })
    );
  }
}
