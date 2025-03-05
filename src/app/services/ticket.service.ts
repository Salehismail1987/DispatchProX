import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import * as moment from 'moment-timezone';

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
export class TicketService {

  constructor(
    private http: HttpClient
  ) { }

  saveTicket(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/save_ticket', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllPastDispatches(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_past_dispatches', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getSinglePastDispatches(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_single_past_dispatches', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getAllClosedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_closed_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getAllRequests(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_requests', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getAllTCTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_tc_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTcApproverTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_tc_approver_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }



  getAllTCClosedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_all_tc_closed_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  downloadClosedTicketPDF(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/download_closed_ticket_pdf', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getTruckTypesForCompany(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_truck_types_trucking_company', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  acceptRequest(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/accept_request', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  timeConversion(params: any): { success: boolean, convertedDate?: string, convertedTime?: string, message?: string } {
    // Check if any of the required parameters is null or empty
    if (!params.ticketDate || params.ticketDate.trim() === '' ||
      !params.ticketTime || params.ticketTime.trim() === '' ||
      !params.userTimeZone || params.userTimeZone.trim() === '') {
      // Return false and a message indicating the missing parameter(s)
      return { success: false, message: 'One or more required parameters are missing or empty.' };
    }

    const sourceTimeZone = 'America/Vancouver';
    const dateTimeFormat = 'YYYY-MM-DD h:mma';

    // Combine ticketDate and ticketTime for parsing
    const dateTimeString = `${params.ticketDate} ${params.ticketTime}`;

    // Parse the combined date and time in the source timezone
    const sourceDateTime = moment.tz(dateTimeString, dateTimeFormat, sourceTimeZone);

    // Convert the dateTime to the user's timezone
    const convertedDateTime = sourceDateTime.tz(params.userTimeZone);

    // Format the date and time as needed
    const convertedDate = convertedDateTime.format('YYYY-MM-DD');
    const convertedTime = convertedDateTime.format('h:mma');
    // console.log(convertedDateTime.toISOString())
    // Return success true with the converted date and time
    return { success: true, convertedDate, convertedTime };
  }

  timeConversion2(params: any): { success: boolean, convertedDate?: string, convertedTime?: string, message?: string } {
    // Check if any of the required parameters is null or empty
    if (!params.ticketDate || params.ticketDate.trim() === '' ||
      !params.ticketTime || params.ticketTime.trim() === '' ||
      !params.userTimeZone || params.userTimeZone.trim() === '') {
      // Return false and a message indicating the missing parameter(s)
      return { success: false, message: 'One or more required parameters are missing or empty.', convertedDate: '', convertedTime: '' };
    }

    const sourceTimeZone = 'America/Vancouver';
    const dateTimeFormat = 'YYYY-MM-DD h:mma';

    // Combine ticketDate and ticketTime for parsing
    const dateTimeString = `${params.ticketDate} ${params.ticketTime}`;

    // Parse the combined date and time in the source timezone
    const sourceDateTime = moment.tz(dateTimeString, dateTimeFormat, sourceTimeZone);

    // Convert the dateTime to the user's timezone
    const convertedDateTime = sourceDateTime.tz(params.userTimeZone);

    const convertedDate = convertedDateTime.format('DD-MM-YYYY');
    // const convertedTime = convertedDateTime.format('h:mm a');
    let convertedTime = convertedDateTime.format('h:mm');
    const amPm = convertedDateTime.format('A'); // Get AM or PM lowercased
    convertedTime += ' ' + amPm;

    return { success: true, convertedDate, convertedTime };
  }


  rejectRequest(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/reject_request', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCompanyTicketToDispatch(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_ticket_to_dispatch', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  getTruckTypesOnTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_truck_types_by_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  saveDispatchtoTrucking(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/save_dispatch_to_trucking', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  saveDisptachToDriver(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/assign_ticket_to_driver', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  approverTicket(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/approve_ticket', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  approverRejectTicket(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/approver_reject_ticket', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  changeApprover(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/change_approver', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  redispatchTicket(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/redispatch_ticket', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTicketDetail(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/ticket_details', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  cancelTicket(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/cancel_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCustomerCompanies(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_customer_companies_for_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getTruckingCompanies(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_trucking_companies_for_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCancelledTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_calendar_cancelled_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getDeclinedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_calendar_declined_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getDeclinedTicketsList(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_declined_tickets_list', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  getCancelledTicketsList(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/get_cancelled_tickets_list', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


  get30DaysClsoedTickets(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/last_30_days_closed_tickets', params, options).pipe(
      tap((response: any) => {
      })
    );
  }

  moveTicketToDeclined(params: any) {
    return this.http.post(environment.apiBaseUrl + 'tickets/move_ticket_declined', params, options).pipe(
      tap((response: any) => {
      })
    );
  }


}
