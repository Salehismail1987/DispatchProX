import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { AppComponent } from './app.component';
import { DashboardHeaderComponent } from './components/common/dashboard-header/dashboard-header.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TruckingCompanyComponent } from './components/signup/trucking-company/trucking-company.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';

import { NgOtpInputModule } from  'ng-otp-input';
import { TruckingCompanySetupComponent } from './components/trucking-company/trucking-company-setup/trucking-company-setup.component';
import { DriverInvitationComponent } from './components/signup/driver-invitation/driver-invitation.component';

import { DriverDashboardComponent } from './components/dashboard/driver-dashboard/driver-dashboard.component';
import { DashboardTopHeaderComponent } from './components/common/dashboard-top-header/dashboard-top-header.component';
import { CustomerSignupComponent } from './components/signup/customer-signup/customer-signup.component';
import { CustomerDashboardComponent } from './components/dashboard/customer/customer-dashboard/customer-dashboard.component';
import { SettingComponent } from './components/dashboard/customer/setting/setting.component';
import { TruckingHeaderComponent } from './components/common/dashboard-header/trucking-header/trucking-header.component';
import { CustomerHeaderComponent } from './components/common/dashboard-header/customer-header/customer-header.component';
import { DriverHeaderComponent } from './components/common/dashboard-header/driver-header/driver-header.component';
import { CustomerSetupComponent } from './components/dashboard/customer/customer-setup/customer-setup.component';
import { NewProjectFormComponent } from './components/dashboard/customer/customer-setup/new-project-form/new-project-form.component';
import { InvitePeopleFormComponent } from './components/dashboard/customer/customer-setup/invite-people-form/invite-people-form.component';
import { AddUserFormComponent } from './components/dashboard/customer/customer-setup/add-user-form/add-user-form.component';
import { CustomerCreateTicketComponent } from './components/dashboard/customer/customer-create-ticket/customer-create-ticket.component';
import { ProjectProfileComponent } from './components/dashboard/customer/project-profile/project-profile.component';
import { ProjectProfileNavComponent } from './components/dashboard/customer/project-profile-nav/project-profile-nav.component';
import { SetTruckRatesComponent } from './components/dashboard/customer/set-truck-rates/set-truck-rates.component';
import { CustomerCompanyProfileComponent } from './components/dashboard/customer/customer-company-profile/customer-company-profile.component';
import { CustomerProfileNavComponent } from './components/dashboard/customer/customer-profile-nav/customer-profile-nav.component';
import { CustomerTicketListingComponent } from './components/dashboard/customer/customer-ticket-listing/customer-ticket-listing.component';
import { CustomerTicketPopupComponent } from './components/dashboard/customer/customer-ticket-popup/customer-ticket-popup.component';
import { TruckingSetupComponent } from './components/dashboard/trucking-company/trucking-setup/trucking-setup.component';
import { CompanyAfterSetupComponent } from './components/dashboard/trucking-company/company-after-setup/company-after-setup.component';
import { CompanyRequestsComponent } from './components/dashboard/trucking-company/company-requests/company-requests.component';
import { CompanyRequestsPopupComponent } from './components/dashboard/trucking-company/company-requests-popup/company-requests-popup.component';
import { TicketsToDispatchListComponent } from './components/dashboard/trucking-company/tickets-to-dispatch-list/tickets-to-dispatch-list.component';
import { CompanyDispatchTruckingPopupComponent } from './components/dashboard/trucking-company/company-dispatch-trucking-popup/company-dispatch-trucking-popup.component';
import { TruckingCompanySettingsComponent } from './components/dashboard/trucking-company/trucking-company-settings/trucking-company-settings.component';
import { TcProfileNavComponent } from './components/dashboard/trucking-company/tc-profile-nav/tc-profile-nav.component';
import { TcTicketListingComponent } from './components/dashboard/trucking-company/tc-ticket-listing/tc-ticket-listing.component';
import { DriverProfileComponent } from './components/dashboard/driver-dashboard/driver-profile/driver-profile.component';
import { DriverAcceptedTicketsComponent } from './components/dashboard/driver-dashboard/driver-accepted-tickets/driver-accepted-tickets.component';
import { DriverClosedTicketsComponent } from './components/dashboard/driver-dashboard/driver-closed-tickets/driver-closed-tickets.component';
import { NgxTimerModule } from 'ngx-timer';
import { DatePipe } from '@angular/common';
import { TcInvoiceListComponent } from './components/dashboard/trucking-company/tc-invoice-list/tc-invoice-list.component';
import { TcDraftInvoiceListComponent } from './components/dashboard/trucking-company/tc-draft-invoice-list/tc-draft-invoice-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { TcPdfInvoiceComponent } from './components/dashboard/trucking-company/tc-pdf-invoice/tc-pdf-invoice.component';
import {NgxPrintModule} from 'ngx-print';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomerTcContactsComponent } from './components/dashboard/customer/customer-tc-contacts/customer-tc-contacts.component';
import { CustomerBillingListComponent } from './components/dashboard/customer/customer-billing-list/customer-billing-list.component';
import { TcBillingListComponent } from './components/dashboard/trucking-company/tc-billing-list/tc-billing-list.component';
import { TcTraggetPlansComponent } from './components/dashboard/trucking-company/tc-tragget-plans/tc-tragget-plans.component';
import { TcTrialPeriodComponent } from './components/dashboard/trucking-company/tc-trial-period/tc-trial-period.component';
import { CustTrialPeriodComponent } from './components/dashboard/customer/cust-trial-period/cust-trial-period.component';
import { CustTraggetPlansComponent } from './components/dashboard/customer/cust-tragget-plans/cust-tragget-plans.component';
import { SuccessPlansComponent } from './components/common/success-plans/success-plans.component';
import { CustTraggetTicketsComponent } from './components/dashboard/customer/cust-tragget-tickets/cust-tragget-tickets.component';
import { TcTraggetTicketsComponent } from './components/dashboard/trucking-company/tc-tragget-tickets/tc-tragget-tickets.component';
import { TcManageUsersComponent } from './components/dashboard/trucking-company/tc-manage-users/tc-manage-users.component';
import { TcManageTrucksComponent } from './components/dashboard/trucking-company/tc-manage-trucks/tc-manage-trucks.component';
import { TcNotificationSettingsComponent } from './components/dashboard/trucking-company/tc-notification-settings/tc-notification-settings.component';
import { CustManageUserComponent } from './components/dashboard/customer/cust-manage-user/cust-manage-user.component';
import { CustNotificationSettingsComponent } from './components/dashboard/customer/cust-notification-settings/cust-notification-settings.component';
import { CustInvUsersComponent } from './components/dashboard/customer/cust-inv-users/cust-inv-users.component';
import { UserInvitationComponent } from './components/signup/user-invitation/user-invitation.component';
import { TcContactProjectsComponent } from './components/dashboard/trucking-company/tc-contacts/tc-contact-projects/tc-contact-projects.component';
import { SelectCompanyTypeComponent } from './components/signup/select-company-type/select-company-type.component';
import { TcClosedTicketsComponent } from './components/dashboard/trucking-company/tc-closed-tickets/tc-closed-tickets.component';
import { CustClosedTicketsComponent } from './components/dashboard/customer/cust-closed-tickets/cust-closed-tickets.component';
import { TcCustomerInvoicesComponent } from './components/dashboard/trucking-company/tc-customer-invoices/tc-customer-invoices.component';
import { ApproverTickedsComponent } from './components/dashboard/approver/approver-tickeds/approver-tickeds.component';
import { ApproverProjectsComponent } from './components/dashboard/approver/approver-projects/approver-projects.component';
import { ApproverApprovedTicketsComponent } from './components/dashboard/approver/approver-approved-tickets/approver-approved-tickets.component';
import { TcUserProfileComponent } from './components/common/user-profile/tc-user-profile/tc-user-profile.component';
import { CustUserProfileComponent } from './components/common/user-profile/cust-user-profile/cust-user-profile.component';
import { TcUserInvitationComponent } from './components/signup/tc-user-invitation/tc-user-invitation.component';
import { DashboardTopHeaderDriverComponent } from './components/common/dashboard-top-header-driver/dashboard-top-header-driver.component';
import { RequestJobDetailComponent } from './components/dashboard/driver-dashboard/request-job-detail/request-job-detail.component';
import { AcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/accepted-job-detail/accepted-job-detail.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { InprogressJobDetailComponent } from './components/dashboard/driver-dashboard/inprogress-job-detail/inprogress-job-detail.component';
import { CompletedJobDetailComponent } from './components/dashboard/driver-dashboard/completed-job-detail/completed-job-detail.component';
import { DriverNotificationsListComponent } from './components/dashboard/driver-dashboard/driver-notifications-list/driver-notifications-list.component';
import { ApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/approved-job-detail/approved-job-detail.component';
import { DriverChangePasswordComponent } from './components/dashboard/driver-dashboard/profile/driver-change-password/driver-change-password.component';
import { DriverEditProfileComponent } from './components/dashboard/driver-dashboard/profile/driver-edit-profile/driver-edit-profile.component';
import { DriverContactUsComponent } from './components/dashboard/driver-dashboard/profile/driver-contact-us/driver-contact-us.component';
import { DriverSignupComponent } from './components/signup/driver-signup/driver-signup.component';
import { DeriverDashboardDesktopComponent } from './components/dashboard/driver-dashboard/deriver-dashboard-desktop/deriver-dashboard-desktop.component';
import { DriverMobileSignupComponent } from './components/signup/driver-signup/driver-mobile-signup/driver-mobile-signup.component';
import { DriverMobileAfterSignupComponent } from './components/signup/driver-signup/driver-mobile-after-signup/driver-mobile-after-signup.component';
import { DeriverDashboardDesktopSchedulerComponent } from './components/dashboard/driver-dashboard/deriver-dashboard-desktop-scheduler/deriver-dashboard-desktop-scheduler.component';
import { DeriverSchedulerComponent } from './components/dashboard/driver-dashboard/deriver-scheduler/deriver-scheduler.component';
import { DriverUserProfileComponent } from './components/common/user-profile/driver-user-profile/driver-user-profile.component';
import { FreelanceAcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-accepted-job-detail/freelance-accepted-job-detail.component';
import { FreelanceRequestJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-request-job-detail/freelance-request-job-detail.component';
import { FreelanceInprogressJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-inprogress-job-detail/freelance-inprogress-job-detail.component';
import { FreelanceApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-approved-job-detail/freelance-approved-job-detail.component';
import { FreelanceManageTcComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-tc/freelance-manage-tc.component';
import { FreelanceDriverSettingsNavComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-driver-settings-nav/freelance-driver-settings-nav.component';
import { FreelanceManageConstructionCompanyComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-construction-company/freelance-manage-construction-company.component';
import { FreelanceInvoiceComponent } from './components/dashboard/driver-dashboard/freelance-driver/invoices/freelance-invoice/freelance-invoice.component';
import { ContactVendorsCcComponent } from './components/dashboard/trucking-company/tc-contacts/contact-vendors-cc/contact-vendors-cc.component';
import { ContactTcDriversComponent } from './components/dashboard/trucking-company/tc-contacts/contact-tc-drivers/contact-tc-drivers.component';
import { FreelanceCreateTicketComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-create-ticket/freelance-create-ticket.component';
import { FreelanceManageTrucksComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-trucks/freelance-manage-trucks.component';
import { TcInvoicingComponent } from './components/dashboard/trucking-company/tc-invoicing/tc-invoicing.component';
import { TcApprovedPopupComponent } from './components/dashboard/trucking-company/tc-approved-popup/tc-approved-popup.component';
import { TcFeedbackPeriodComponent } from './components/dashboard/trucking-company/tc-feedback-period/tc-feedback-period.component';
import { CustFeedbackPeriodComponent } from './components/dashboard/customer/cust-feedback-period/cust-feedback-period.component';
import { TcBillingPopupComponent } from './components/dashboard/trucking-company/tc-billing-list/tc-billing-popup/tc-billing-popup.component';
import { CustomerBillingPopupComponent } from './components/dashboard/customer/customer-billing-list/customer-billing-popup/customer-billing-popup.component';
import { TcAddBillComponent } from './components/dashboard/trucking-company/tc-billing-list/tc-add-bill/tc-add-bill.component';
import { CustomerAddBillComponent } from './components/dashboard/customer/customer-billing-list/customer-add-bill/customer-add-bill.component';
import { AccountSwitcherComponent } from './components/common/account-switcher/account-switcher.component';
import { PopupCancelTicketComponent } from './components/dashboard/customer/customer-ticket-listing/popup-cancel-ticket/popup-cancel-ticket.component';
import { CancelledTicketDetailComponent } from './components/dashboard/driver-dashboard/cancelled-ticket-detail/cancelled-ticket-detail.component';
import { TcProjectsListComponent } from './components/dashboard/trucking-company/tc-projects-list/tc-projects-list.component';
import { TcDispatchNewComponent } from './components/dashboard/trucking-company/tc-dispatch-new/tc-dispatch-new.component';
import { TcRequestJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-request-job-detail/tc-request-job-detail.component';
import { TcAcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-accepted-job-detail/tc-accepted-job-detail.component';
import { TcInprogressJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-inprogress-job-detail/tc-inprogress-job-detail.component';
import { TcCompletedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-completed-job-detail/tc-completed-job-detail.component';
import { TcApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-approved-job-detail/tc-approved-job-detail.component';
import { TcApproverApprovedTicketsComponent } from './components/dashboard/approver/tc-approver/tc-approver-approved-tickets/tc-approver-approved-tickets.component';
import { TcApproverTicketsToApproveComponent } from './components/dashboard/approver/tc-approver/tc-approver-tickets-to-approve/tc-approver-tickets-to-approve.component';
import { TcApproverProjectsComponent } from './components/dashboard/approver/tc-approver/tc-approver-projects/tc-approver-projects.component';
import { TcCancelTicketPopupComponent } from './components/dashboard/trucking-company/tc-ticket-listing/tc-cancel-ticket-popup/tc-cancel-ticket-popup.component';
import { TcCancelledTicketDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-cancelled-ticket-detail/tc-cancelled-ticket-detail.component';
import { ClosedTicketGraphComponent } from './components/common/closed-ticket-graph/closed-ticket-graph.component';
import { TcCancelledTicketsComponent } from './components/dashboard/trucking-company/tc-cancelled-tickets/tc-cancelled-tickets.component';
import { TcDeclinedTicketsComponent } from './components/dashboard/trucking-company/tc-declined-tickets/tc-declined-tickets.component';
import { TcCancelledTicketsDetailPopupComponent } from './components/dashboard/trucking-company/tc-cancelled-tickets/tc-cancelled-tickets-detail-popup/tc-cancelled-tickets-detail-popup.component';
import { DriverTicketsCalendarListComponent } from './components/dashboard/driver-dashboard/driver-tickets-calendar-list/driver-tickets-calendar-list.component';
import { CustDeclinedTicketsComponent } from './components/dashboard/customer/cust-declined-tickets/cust-declined-tickets.component';
import { SuccessPlansSingleTicketsComponent } from './components/common/success-plans-single-tickets/success-plans-single-tickets.component';
import { TicketStatusDotComponent } from './components/common/ticket-status-dot/ticket-status-dot.component';
import { TcTrialScreenClosedTicketsComponent } from './components/dashboard/trucking-company/tc-closed-tickets/tc-trial-screen-closed-tickets/tc-trial-screen-closed-tickets.component';
import { TrialClosedGraphComponent } from './components/common/trial-closed-graph/trial-closed-graph.component';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { CustomerCompanyTraggetTicketComponent } from './components/dashboard/customer/customer-company-tragget-ticket/customer-company-tragget-ticket.component';
import { TruckingCompanyTraggetTicketComponent } from './components/dashboard/trucking-company/trucking-company-tragget-ticket/trucking-company-tragget-ticket.component';
import { CustomerProjectListingComponent } from './components/dashboard/customer/customer-project-listing/customer-project-listing.component';
import { CustomerProjectProfileComponent } from './components/dashboard/customer/customer-project-profile/customer-project-profile.component';
import { CustomerProjectTrackerComponent } from './components/dashboard/customer/customer-project-tracker/customer-project-tracker.component';
import { AddExternalApproverComponent } from './components/dashboard/customer/customer-setup/add-external-approver/add-external-approver.component';
import { TcProjectProfileComponent } from './components/dashboard/trucking-company/tc-project-profile/tc-project-profile.component';
import { SetTcRatesComponent } from './components/dashboard/trucking-company/set-tc-rates/set-tc-rates.component';
import { TcDispatchNewTwoComponent } from './components/dashboard/trucking-company/tc-dispatch-new-two/tc-dispatch-new-two.component';
import { AddNewBackhaulComponent } from './components/dashboard/driver-dashboard/add-new-backhaul/add-new-backhaul.component';
import { CustomerPastTicketsComponent } from './components/dashboard/customer/customer-past-tickets/customer-past-tickets.component';
import { HttpRequestInterceptor } from './http.interceptor';
import { HourSheetsComponent } from './components/dashboard/trucking-company/tc-contacts/contact-tc-drivers/hour-sheets/hour-sheets.component';
@NgModule({
  declarations: [
    AppComponent,
    DashboardHeaderComponent,
    DashboardComponent,
    TruckingCompanyComponent,
    HomeComponent,
    SignupComponent,
    TruckingCompanySetupComponent,
    DriverInvitationComponent,
    DriverDashboardComponent,
    DashboardTopHeaderComponent,
    CustomerSignupComponent,
    CustomerDashboardComponent,
    SettingComponent,
    TruckingHeaderComponent,
    CustomerHeaderComponent,
    DriverHeaderComponent,
    CustomerSetupComponent,
    NewProjectFormComponent,
    InvitePeopleFormComponent,
    AddUserFormComponent,
    CustomerCreateTicketComponent,
    ProjectProfileComponent,
    ProjectProfileNavComponent,
    SetTruckRatesComponent,
    CustomerCompanyProfileComponent,
    CustomerProfileNavComponent,
    CustomerTicketListingComponent,
    CustomerTicketPopupComponent,
    TruckingSetupComponent,
    CompanyAfterSetupComponent,
    CompanyRequestsComponent,
    CompanyRequestsPopupComponent,
    TicketsToDispatchListComponent,
    CompanyDispatchTruckingPopupComponent,
    TruckingCompanySettingsComponent,
    TcProfileNavComponent,
    TcTicketListingComponent,
    DriverProfileComponent,
    DriverAcceptedTicketsComponent,
    DriverClosedTicketsComponent,
    TcInvoiceListComponent,
    TcDraftInvoiceListComponent,
    ForgetPasswordComponent,
    TcPdfInvoiceComponent,
    CustomerTcContactsComponent,
    CustomerBillingListComponent,
    TcBillingListComponent,
    TcTraggetPlansComponent,
    TcTrialPeriodComponent,
    CustTrialPeriodComponent,
    CustTraggetPlansComponent,
    SuccessPlansComponent,
    CustTraggetTicketsComponent,
    TcTraggetTicketsComponent,
    TcManageUsersComponent,
    TcManageTrucksComponent,
    TcNotificationSettingsComponent,
    CustManageUserComponent,
    CustNotificationSettingsComponent,
    CustInvUsersComponent,
    UserInvitationComponent,
    TcContactProjectsComponent,
    SelectCompanyTypeComponent,
    TcClosedTicketsComponent,
    CustClosedTicketsComponent,
    TcCustomerInvoicesComponent,
    ApproverTickedsComponent,
    ApproverProjectsComponent,
    ApproverApprovedTicketsComponent,
    TcUserProfileComponent,
    CustUserProfileComponent,
    TcUserInvitationComponent,
    DashboardTopHeaderDriverComponent,
    RequestJobDetailComponent,
    AcceptedJobDetailComponent,
    InprogressJobDetailComponent,
    CompletedJobDetailComponent,
    DriverNotificationsListComponent,
    ApprovedJobDetailComponent,
    DriverChangePasswordComponent,
    DriverEditProfileComponent,
    DriverContactUsComponent,
    DriverSignupComponent,
    DeriverDashboardDesktopComponent,
    DriverMobileSignupComponent,
    DriverMobileAfterSignupComponent,
    DeriverDashboardDesktopSchedulerComponent,
    DeriverSchedulerComponent,
    DriverUserProfileComponent,
    FreelanceAcceptedJobDetailComponent,
    FreelanceRequestJobDetailComponent,
    FreelanceInprogressJobDetailComponent,
    FreelanceApprovedJobDetailComponent,
    FreelanceManageTcComponent,
    FreelanceDriverSettingsNavComponent,
    FreelanceManageConstructionCompanyComponent,
    FreelanceInvoiceComponent,
    ContactVendorsCcComponent,
    ContactTcDriversComponent,
    FreelanceCreateTicketComponent,
    FreelanceManageTrucksComponent,
    TcInvoicingComponent,
    TcApprovedPopupComponent,
    TcFeedbackPeriodComponent,
    CustFeedbackPeriodComponent,
    TcBillingPopupComponent,
    CustomerBillingPopupComponent,
    TcAddBillComponent,
    CustomerAddBillComponent,
    AccountSwitcherComponent,
    PopupCancelTicketComponent,
    CancelledTicketDetailComponent,
    TcProjectsListComponent,
    TcDispatchNewComponent,
    TcRequestJobDetailComponent,
    TcAcceptedJobDetailComponent,
    TcInprogressJobDetailComponent,
    TcCompletedJobDetailComponent,
    TcApprovedJobDetailComponent,
    TcApproverApprovedTicketsComponent,
    TcApproverTicketsToApproveComponent,
    TcApproverProjectsComponent,
    TcCancelTicketPopupComponent,
    TcCancelledTicketDetailComponent,
    ClosedTicketGraphComponent,
    TcCancelledTicketsComponent,
    TcDeclinedTicketsComponent,
    TcCancelledTicketsDetailPopupComponent,
    DriverTicketsCalendarListComponent,
    CustDeclinedTicketsComponent,
    SuccessPlansSingleTicketsComponent,
    TicketStatusDotComponent,
    TcTrialScreenClosedTicketsComponent,
    TrialClosedGraphComponent,
    NotFoundComponent,
    TruckingCompanyTraggetTicketComponent,
    CustomerCompanyTraggetTicketComponent,
    CustomerProjectListingComponent,
    CustomerProjectProfileComponent,
    CustomerProjectTrackerComponent,
    AddExternalApproverComponent,
    TcProjectProfileComponent,
    SetTcRatesComponent,
    TcDispatchNewTwoComponent,
    AddNewBackhaulComponent,
    CustomerPastTicketsComponent,
    HourSheetsComponent
  ],
  imports: [

    BrowserModule,
    FormsModule,
    NgOtpInputModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    HttpClientModule,
    NgxTimerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    NgxPrintModule,
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    CanvasJSAngularChartsModule
  ],
  providers: [DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
