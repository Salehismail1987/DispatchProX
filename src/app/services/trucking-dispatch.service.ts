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
export class TruckingDispatchService {

  constructor(
    private http: HttpClient
  ) { }


  saveData(data: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company_ticket/save_data',data, options).pipe(
      tap((response: any) => {

      })
    );
  }

  
  updateData(data: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company_ticket/update_data',data, options).pipe(
      tap((response: any) => {

      })
    );
  }

  
  getAllData(data: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company_ticket/get_all_data',data, options).pipe(
      tap((response: any) => {

      })
    );
  }


  deleteData(data: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company_ticket/delete_data',data, options).pipe(
      tap((response: any) => {

      })
    );
  }


  getSingleData(data: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company_ticket/get_single_data',data, options).pipe(
      tap((response: any) => {

      })
    );
  }
  

}
