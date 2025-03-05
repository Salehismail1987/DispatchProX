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

export class FreelanceDriverServiceService {

  constructor(
    private http: HttpClient
  ) { }

  getCreateTicketData(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/get_create_ticket_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getFreelancerDetail(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/get_all_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getFreelancerDataDetail(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/get_single_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  saveFreelancerData(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/save_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateFreelancerData(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/update_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  deleteFreelancerData(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/delete_data',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  markDefault(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/mark_default',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  freelanceTicketAction(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/freelance_ticket_action',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  freelanceInvoiceAction(details: any) {
    return this.http.post(environment.apiBaseUrl+'freelance_driver/freelance_invoice_action',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  invoiceAction(details: any) {
    return this.http.post(environment.apiBaseUrl+'invoices/invoice_action',details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateAddress(id: number, details: any) {
    return this.http.post(`${environment.apiBaseUrl}freelance_driver/updateAddress/${id}`, details, options).pipe(
      tap((response: any) => {
        // You can log or manipulate the response if necessary
      })
    );
  }
}
