import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
const options = {
  headers: new HttpHeaders({
    Authorization: "Basic " + btoa(environment.phpAuthUser + ':' + environment.phpAuthPassword)
  })
}
@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http: HttpClient
  ) { }

  projectDetails(projectId: any,is_tc_project:any='NO') {    
    return this.http.post(environment.apiBaseUrl+'project/get_project_details',{id:projectId,is_tc_project:is_tc_project}, options).pipe(
      tap((response: any) => {
      })
    );
  }
  projectDumpsiteList(projectId: any,is_tc_project:any='NO') {    
    return this.http.post(environment.apiBaseUrl+'project/get_project_dumpsitelist',{id:projectId,is_tc_project:is_tc_project}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  projectListing(params: any) {    
    return this.http.post(environment.apiBaseUrl+'project/get_all_projects',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateProject(params: any) {    
    return this.http.post(environment.apiBaseUrl+'project/update_project',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  updateDumpSite(params: any) {    
    return this.http.post(environment.apiBaseUrl+'project/update_dumpsite',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
  removeDumpSite(params: any) {    
    return this.http.post(environment.apiBaseUrl+'project/remove_dumpsite',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  

  setRates(params:any){
    return this.http.post(environment.apiBaseUrl+'project/set_truck_rates',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  
  getTruckingProjects(params:any){
    return this.http.post(environment.apiBaseUrl+'project/get_all_projects_trucking_company',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getProjectCombination(id:any){
    return this.http.post(environment.apiBaseUrl+'project/get_project_combination',{id:id}, options).pipe(
      tap((response: any) => {
      })
    );
  }

  
  driverProjects(params:any){
    return this.http.post(environment.apiBaseUrl+'project/get_all_projects_driver',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  addDumpSite(params:any){
    return this.http.post(environment.apiBaseUrl+'project/add_dumpsite',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  addUserIntoProject(params:any){
    return this.http.post(environment.apiBaseUrl+'project/add_user_into_project',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  removeUserFromProject(params:any){
    return this.http.post(environment.apiBaseUrl+'project/remove_user_from_project',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  updateProjectUser(params:any){
    return this.http.post(environment.apiBaseUrl+'project/update_project_user',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

 getProjectTickets(params:any){
    return this.http.post(environment.apiBaseUrl+'project/get_project_tickets',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  
  getProjectUsers(params:any){
    return this.http.post(environment.apiBaseUrl+'project/get_project_users',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllExternalApprovers(params:any){
    return this.http.post(environment.apiBaseUrl+'project/get_all_external_approvers',params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  removeProject(params:any){
    return this.http.post(environment.apiBaseUrl+'project/remove_project',params, options).pipe(
      tap((response: any) => {
      })
    );
  }
  
} 