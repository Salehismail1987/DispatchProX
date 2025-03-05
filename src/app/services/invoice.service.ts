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
export class InvoiceService {

  constructor(
    private http: HttpClient
  ) { }

  getcustInvoices(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/get_customer_invoices',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getInvoices(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/get_invoices',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCompaniesForInvoices(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/get_companies_for_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getProjectsInvoices(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/get_projects_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  getCompaniesInvoices(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/get_companies_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  getBillings(params:any){
    return this.http.post(environment.apiBaseUrl+'billing/get_billings',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCompaniesForBilling(params:any){
    return this.http.post(environment.apiBaseUrl+'billing/get_companies_for_billing',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  

  sendInvoice(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/send_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  reSendInvoice(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/resend_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  downloadInvoice(params:any){
    return this.http.post(environment.apiBaseUrl+'invoices/download_invoice',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getUnbilledTickets(params:any){
    return this.http.post(environment.apiBaseUrl+'billing/get_unbill_tickets',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addCustomBill(params:any){
    return this.http.post(environment.apiBaseUrl+'billing/add_custom_bill',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
}
