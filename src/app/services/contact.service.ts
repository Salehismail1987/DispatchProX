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
export class ContactService {

  constructor(
    private http: HttpClient
  ) { }

  getContacts(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/get_contacts',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }
  getTrucks_Trailers(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/get_trucks_trailers',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateContacts(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/update_contact',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }
  updateVendor(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/update_vendor',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addContacts(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/add_contact',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeContacts(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/remove_contact',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  
  invoicingStatus(userDetails: any) {    
    return this.http.post(environment.apiBaseUrl+'contacts/invoicing_status',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  dispatchingStatus(userDetails:any){
    return this.http.post(environment.apiBaseUrl+'contacts/dispatching_status',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
}
