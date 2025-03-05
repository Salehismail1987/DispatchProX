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
export class CustomerSetupService {

  constructor(
    private http: HttpClient
  ) { }

  addUser(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'customer/add_user',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  inviteTruckingCompany(tc_details: any) {
    return this.http.post(environment.apiBaseUrl+'customer/invite_tc',tc_details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  newProject(project_details: any) {
    return this.http.post(environment.apiBaseUrl+'customer/new_project',project_details, options).pipe(
      tap((response: any) => {
      })
    );
  }

  resendTcInv(data: any) {
    return this.http.post(environment.apiBaseUrl+'customer/resend_cc_tc_inv',data, options).pipe(
      tap((response: any) => {
      })
    );
  }


}
