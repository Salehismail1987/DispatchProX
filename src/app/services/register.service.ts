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
export class RegisterService {

  constructor(
    private http: HttpClient
  ) { }


  verifyCode(email: string, code: string) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/verify_code',{email:email, code: code }, options).pipe(
      tap((response: any) => {
      })
    );
  }

  verifyEmail(email: string, first_name: string) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/verify_email',{email:email, first_name:first_name}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  singUpSave(userDetails: any) {
    return this.http.post(environment.apiBaseUrl+'trucking_company/register',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }
  invTCSave(userDetails:any){
    return this.http.post(environment.apiBaseUrl+'trucking_company/tc_inv_save',userDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }

  checkEmail(email:string){
    return this.http.post(environment.apiBaseUrl+'trucking_company/checkemail',{email:email}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  login(loginDetails:any){
    return this.http.post(environment.apiBaseUrl+'auth/login',loginDetails, options).pipe(
      tap((response: any) => {
      })
    );
  }


}
