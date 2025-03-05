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
export class CustomerService {

  constructor(
    private http: HttpClient
  ) { }

  
  verifyCode(email: string, code: string) {
    return this.http.post(environment.apiBaseUrl+'customer/verify_code',{email:email, code: code }, options).pipe(
      tap((response: any) => {
      })
    );
  }

  verifyEmail(email: string, first_name: string) {
    return this.http.post(environment.apiBaseUrl+'customer/verify_email',{email:email, first_name:first_name}, options).pipe(
      tap((response: any) => {
      })
    );
  }  

  singUpSave(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/register',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  checkEmail(email:string){
    return this.http.post(environment.apiBaseUrl+'customer/checkemail',{email:email}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateCompanyProfile(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/update_customer_company',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCustomerCompanies(params: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/get_customer_companies',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getContactCompanies(params: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/get_contact_companies',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  customerAction(params: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/customer_action',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  deleteUser(params:any){
    return this.http.post(environment.apiBaseUrl+'customer/delete_user',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  removeUser(params:any){
    return this.http.post(environment.apiBaseUrl+'customer/remove_user',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllUsers(params:any){
    return this.http.post(environment.apiBaseUrl+'customer/get_all_users',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addUser(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'customer/add_user',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  invUser(params:any){
    return this.http.post(environment.apiBaseUrl+'customer/inv_user',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeVendors(params:any){
    return this.http.post(environment.apiBaseUrl+'customer/remove_Vendors',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
}