import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { TruckingCompanyComponent } from './components/signup/trucking-company/trucking-company.component';
import { TruckingCompanySetupComponent } from './components/trucking-company/trucking-company-setup/trucking-company-setup.component';
import { DriverInvitationComponent } from './components/signup/driver-invitation/driver-invitation.component';
import { CustomerSignupComponent } from './components/signup/customer-signup/customer-signup.component';
import { SettingComponent } from './components/dashboard/customer/setting/setting.component';
import { CustomerSetupComponent } from './components/dashboard/customer/customer-setup/customer-setup.component';
import { CustomerCreateTicketComponent } from './components/dashboard/customer/customer-create-ticket/customer-create-ticket.component';
import { ProjectProfileComponent } from './components/dashboard/customer/project-profile/project-profile.component';
import { SetTruckRatesComponent } from './components/dashboard/customer/set-truck-rates/set-truck-rates.component';
import { CustomerCompanyProfileComponent } from './components/dashboard/customer/customer-company-profile/customer-company-profile.component';
import { CustomerTicketListingComponent } from './components/dashboard/customer/customer-ticket-listing/customer-ticket-listing.component';
import { TruckingSetupComponent } from './components/dashboard/trucking-company/trucking-setup/trucking-setup.component';
import { CompanyAfterSetupComponent } from './components/dashboard/trucking-company/company-after-setup/company-after-setup.component';
import { CompanyRequestsComponent } from './components/dashboard/trucking-company/company-requests/company-requests.component';
import { TicketsToDispatchListComponent } from './components/dashboard/trucking-company/tickets-to-dispatch-list/tickets-to-dispatch-list.component';
import { TruckingCompanySettingsComponent } from './components/dashboard/trucking-company/trucking-company-settings/trucking-company-settings.component';
import { TcTicketListingComponent } from './components/dashboard/trucking-company/tc-ticket-listing/tc-ticket-listing.component';
import { DriverProfileComponent } from './components/dashboard/driver-dashboard/driver-profile/driver-profile.component';
import { DriverAcceptedTicketsComponent } from './components/dashboard/driver-dashboard/driver-accepted-tickets/driver-accepted-tickets.component';
import { DriverClosedTicketsComponent } from './components/dashboard/driver-dashboard/driver-closed-tickets/driver-closed-tickets.component';
import { NgxTimerModule } from 'ngx-timer';
import { TcDraftInvoiceListComponent } from './components/dashboard/trucking-company/tc-draft-invoice-list/tc-draft-invoice-list.component';
import { TcInvoiceListComponent } from './components/dashboard/trucking-company/tc-invoice-list/tc-invoice-list.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { TcPdfInvoiceComponent } from './components/dashboard/trucking-company/tc-pdf-invoice/tc-pdf-invoice.component';
import { CustomerTcContactsComponent } from './components/dashboard/customer/customer-tc-contacts/customer-tc-contacts.component';
import { CustomerBillingListComponent } from './components/dashboard/customer/customer-billing-list/customer-billing-list.component';
import { TcBillingListComponent } from './components/dashboard/trucking-company/tc-billing-list/tc-billing-list.component';
import { TcTraggetPlansComponent } from './components/dashboard/trucking-company/tc-tragget-plans/tc-tragget-plans.component';
import { TcTrialPeriodComponent } from './components/dashboard/trucking-company/tc-trial-period/tc-trial-period.component';
import { CustTraggetPlansComponent } from './components/dashboard/customer/cust-tragget-plans/cust-tragget-plans.component';
import { CustTrialPeriodComponent } from './components/dashboard/customer/cust-trial-period/cust-trial-period.component';
import { SuccessPlansComponent } from './components/common/success-plans/success-plans.component';
import { TcTraggetTicketsComponent } from './components/dashboard/trucking-company/tc-tragget-tickets/tc-tragget-tickets.component';
import { CustTraggetTicketsComponent } from './components/dashboard/customer/cust-tragget-tickets/cust-tragget-tickets.component';
import { TcManageUsersComponent } from './components/dashboard/trucking-company/tc-manage-users/tc-manage-users.component';
import { TcManageTrucksComponent } from './components/dashboard/trucking-company/tc-manage-trucks/tc-manage-trucks.component';
import { TcNotificationSettingsComponent } from './components/dashboard/trucking-company/tc-notification-settings/tc-notification-settings.component';
import { CustNotificationSettingsComponent } from './components/dashboard/customer/cust-notification-settings/cust-notification-settings.component';
import { CustManageUserComponent } from './components/dashboard/customer/cust-manage-user/cust-manage-user.component';
import { CustInvUsersComponent } from './components/dashboard/customer/cust-inv-users/cust-inv-users.component';
import { UserInvitationComponent } from './components/signup/user-invitation/user-invitation.component';
import { TcContactProjectsComponent } from './components/dashboard/trucking-company/tc-contacts/tc-contact-projects/tc-contact-projects.component';
import { SelectCompanyTypeComponent } from './components/signup/select-company-type/select-company-type.component';
import { CustClosedTicketsComponent } from './components/dashboard/customer/cust-closed-tickets/cust-closed-tickets.component';
import { TcClosedTicketsComponent } from './components/dashboard/trucking-company/tc-closed-tickets/tc-closed-tickets.component';
import { TcCustomerInvoicesComponent } from './components/dashboard/trucking-company/tc-customer-invoices/tc-customer-invoices.component';
import { ApproverProjectsComponent } from './components/dashboard/approver/approver-projects/approver-projects.component';
import { ApproverApprovedTicketsComponent } from './components/dashboard/approver/approver-approved-tickets/approver-approved-tickets.component';
import { ApproverTickedsComponent } from './components/dashboard/approver/approver-tickeds/approver-tickeds.component';
import { TcUserProfileComponent } from './components/common/user-profile/tc-user-profile/tc-user-profile.component';
import { CustUserProfileComponent } from './components/common/user-profile/cust-user-profile/cust-user-profile.component';
import { TcUserInvitationComponent } from './components/signup/tc-user-invitation/tc-user-invitation.component';
import { RequestJobDetailComponent } from './components/dashboard/driver-dashboard/request-job-detail/request-job-detail.component';
import { AcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/accepted-job-detail/accepted-job-detail.component';
import { InprogressJobDetailComponent } from './components/dashboard/driver-dashboard/inprogress-job-detail/inprogress-job-detail.component';
import { CompletedJobDetailComponent } from './components/dashboard/driver-dashboard/completed-job-detail/completed-job-detail.component';
import { DriverNotificationsListComponent } from './components/dashboard/driver-dashboard/driver-notifications-list/driver-notifications-list.component';
import { ApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/approved-job-detail/approved-job-detail.component';
import { DriverChangePasswordComponent } from './components/dashboard/driver-dashboard/profile/driver-change-password/driver-change-password.component';
import { DriverContactUsComponent } from './components/dashboard/driver-dashboard/profile/driver-contact-us/driver-contact-us.component';
import { DriverEditProfileComponent } from './components/dashboard/driver-dashboard/profile/driver-edit-profile/driver-edit-profile.component';
import { DriverSignupComponent } from './components/signup/driver-signup/driver-signup.component';
import { DeriverDashboardDesktopComponent } from './components/dashboard/driver-dashboard/deriver-dashboard-desktop/deriver-dashboard-desktop.component';
import { DriverMobileSignupComponent } from './components/signup/driver-signup/driver-mobile-signup/driver-mobile-signup.component';
import { DriverMobileAfterSignupComponent } from './components/signup/driver-signup/driver-mobile-after-signup/driver-mobile-after-signup.component';
import { DeriverDashboardDesktopSchedulerComponent } from './components/dashboard/driver-dashboard/deriver-dashboard-desktop-scheduler/deriver-dashboard-desktop-scheduler.component';
import { DeriverSchedulerComponent } from './components/dashboard/driver-dashboard/deriver-scheduler/deriver-scheduler.component';
import { DriverUserProfileComponent } from './components/common/user-profile/driver-user-profile/driver-user-profile.component';
import { FreelanceAcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-accepted-job-detail/freelance-accepted-job-detail.component';
import { FreelanceInprogressJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-inprogress-job-detail/freelance-inprogress-job-detail.component';
import { FreelanceApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/freelance-driver/freelance-approved-job-detail/freelance-approved-job-detail.component';
import { FreelanceManageTcComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-tc/freelance-manage-tc.component';
import { FreelanceManageConstructionCompanyComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-construction-company/freelance-manage-construction-company.component';
import { FreelanceInvoiceComponent } from './components/dashboard/driver-dashboard/freelance-driver/invoices/freelance-invoice/freelance-invoice.component';
import { ContactVendorsCcComponent } from './components/dashboard/trucking-company/tc-contacts/contact-vendors-cc/contact-vendors-cc.component';
import { ContactTcDriversComponent } from './components/dashboard/trucking-company/tc-contacts/contact-tc-drivers/contact-tc-drivers.component';
import { FreelanceCreateTicketComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-create-ticket/freelance-create-ticket.component';
import { FreelanceManageTrucksComponent } from './components/dashboard/driver-dashboard/freelance-driver/settings/freelance-manage-trucks/freelance-manage-trucks.component';
import { TcInvoicingComponent } from './components/dashboard/trucking-company/tc-invoicing/tc-invoicing.component';
import { TcFeedbackPeriodComponent } from './components/dashboard/trucking-company/tc-feedback-period/tc-feedback-period.component';
import { CustFeedbackPeriodComponent } from './components/dashboard/customer/cust-feedback-period/cust-feedback-period.component';
import { CancelledTicketDetailComponent } from './components/dashboard/driver-dashboard/cancelled-ticket-detail/cancelled-ticket-detail.component';
import { TcProjectsListComponent } from './components/dashboard/trucking-company/tc-projects-list/tc-projects-list.component';
import { TcDispatchNewComponent } from './components/dashboard/trucking-company/tc-dispatch-new/tc-dispatch-new.component';
import { TcAcceptedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-accepted-job-detail/tc-accepted-job-detail.component';
import { TcInprogressJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-inprogress-job-detail/tc-inprogress-job-detail.component';
import { TcRequestJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-request-job-detail/tc-request-job-detail.component';
import { TcApprovedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-approved-job-detail/tc-approved-job-detail.component';
import { TcCompletedJobDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-completed-job-detail/tc-completed-job-detail.component';
import { TcApproverApprovedTicketsComponent } from './components/dashboard/approver/tc-approver/tc-approver-approved-tickets/tc-approver-approved-tickets.component';
import { TcApproverProjectsComponent } from './components/dashboard/approver/tc-approver/tc-approver-projects/tc-approver-projects.component';
import { TcApproverTicketsToApproveComponent } from './components/dashboard/approver/tc-approver/tc-approver-tickets-to-approve/tc-approver-tickets-to-approve.component';
import { TcCancelTicketPopupComponent } from './components/dashboard/trucking-company/tc-ticket-listing/tc-cancel-ticket-popup/tc-cancel-ticket-popup.component';
import { TcCancelledTicketDetailComponent } from './components/dashboard/driver-dashboard/driver-tc-tickets/tc-cancelled-ticket-detail/tc-cancelled-ticket-detail.component';
import { TcCancelledTicketsComponent } from './components/dashboard/trucking-company/tc-cancelled-tickets/tc-cancelled-tickets.component';
import { TcDeclinedTicketsComponent } from './components/dashboard/trucking-company/tc-declined-tickets/tc-declined-tickets.component';
import { DriverTicketsCalendarListComponent } from './components/dashboard/driver-dashboard/driver-tickets-calendar-list/driver-tickets-calendar-list.component';
import { CustDeclinedTicketsComponent } from './components/dashboard/customer/cust-declined-tickets/cust-declined-tickets.component';
import { SuccessPlansSingleTicketsComponent } from './components/common/success-plans-single-tickets/success-plans-single-tickets.component';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { TruckingCompanyTraggetTicketComponent } from './components/dashboard/trucking-company/trucking-company-tragget-ticket/trucking-company-tragget-ticket.component';
import { CustomerCompanyTraggetTicketComponent } from './components/dashboard/customer/customer-company-tragget-ticket/customer-company-tragget-ticket.component';
import { CustomerProjectListingComponent } from './components/dashboard/customer/customer-project-listing/customer-project-listing.component';
import { CustomerProjectProfileComponent } from './components/dashboard/customer/customer-project-profile/customer-project-profile.component';
import { TcProjectProfileComponent } from './components/dashboard/trucking-company/tc-project-profile/tc-project-profile.component';
import { TcDispatchNewTwoComponent } from './components/dashboard/trucking-company/tc-dispatch-new-two/tc-dispatch-new-two.component';
import { CustomerPastTicketsComponent } from './components/dashboard/customer/customer-past-tickets/customer-past-tickets.component';
import { HourSheetsComponent } from './components/dashboard/trucking-company/tc-contacts/contact-tc-drivers/hour-sheets/hour-sheets.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'company-type',
    component: SelectCompanyTypeComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'tc_signup',
    component: TruckingCompanyComponent
  },
  {
    path: 'customer_setting',
    component: SettingComponent
  },
  {
    path: 'customer_signup',
    component: CustomerSignupComponent
  },
  {
    path: 'driver-signup',
    component: DriverSignupComponent
  },
  {
    path: 'invitation',
    component: DriverInvitationComponent
  },
  {
    path: 'user_invitation',
    component: UserInvitationComponent
  },
  {
    path: 'trucking-company-setup',
    component: TruckingCompanySetupComponent
  },
  {
    path: 'trucking-setup',
    component: TruckingSetupComponent
  },
  {
    path: 'company-after-setup',
    component: TruckingSetupComponent
  },
  {
    path: 'customer-setup',
    component: CustomerSetupComponent
  },
  {
    path: 'project-listing',
    component: CustomerProjectListingComponent
  },
  {
    path: 'customer-ticket-listing',
    component: CustomerTicketListingComponent
  },
  {
    path: 'project-profile/:id',
    component: CustomerProjectProfileComponent
  },
  {
    path: 'customer-project-profile/:id',
    component: ProjectProfileComponent
  },
  {
    path: 'set-truck-rates/:id',
    component: SetTruckRatesComponent
  },
  {
    path: 'customer-company-profile',
    component: CustomerCompanyProfileComponent
  },
  {
    path: 'customer-create-ticket',
    component: CustomerCreateTicketComponent
  },
  {
    path: 'customer-past-dispatches',
    component: CustomerPastTicketsComponent
  },
  {
    path: 'trucking-requests',
    component: CompanyRequestsComponent
  },
  {
    path: 'tickets-to-dispatch',
    component: TicketsToDispatchListComponent
  },
  {
    path: 'tc-profile-settings',
    component: TruckingCompanySettingsComponent
  },
  {
    path: 'tc-ticket-listing',
    component: TcTicketListingComponent
  },
  {
    path: 'driver-accepted-tickets',
    component: DriverAcceptedTicketsComponent
  },
  {
    path: 'driver-closed-tickets',
    component: DriverClosedTicketsComponent
  },
  {
    path: "driver-profile",
    component: DriverProfileComponent
  },
  {
    path: 'draft-tc-invoices',
    component: TcInvoicingComponent
  },

  {
    path: 'customer-tc-invoices',
    component: TcCustomerInvoicesComponent
  },
  {
    path: 'reset-password',
    component: ForgetPasswordComponent
  },
  {
    path: 'invoice-pdf-download',
    component: TcPdfInvoiceComponent
  },
  {
    path: 'customer-companies',
    component: CustomerTcContactsComponent
  },
  {
    path: 'billing-list',
    component: CustomerBillingListComponent
  },
  {
    path: 'tc-billing-list',
    component: TcBillingListComponent
  },
  {
    path: 'tc-tragget-plans',
    component: TcTraggetPlansComponent
  },
  {
    path: 'tc-tragget-trial',
    component: TcTrialPeriodComponent
  },
  {
    path: 'cust-tragget-plans',
    component: CustTraggetPlansComponent
  },
  {
    path: 'cust-tragget-trial',
    component: CustTrialPeriodComponent
  },
  {
    path: 'success-plan',
    component: SuccessPlansComponent
  },
  {
    path: 'success-plan-single-tickets',
    component: SuccessPlansSingleTicketsComponent
  },
  {
    path: 'tc-tragget-tickets',
    component: TcTraggetTicketsComponent
  },
  {
    path: 'cust-tragget-tickets',
    component: CustTraggetTicketsComponent
  },
  {
    path: 'tc-manage-users',
    component: TcManageUsersComponent
  },
  {
    path: 'tc-manage-trucks',
    component: TcManageTrucksComponent
  },

  {
    path: 'tc-notification-settings',
    component: TcNotificationSettingsComponent
  },
  {
    path: 'cust-notification-settings',
    component: CustNotificationSettingsComponent
  },
  {
    path: 'cust-manage-users',
    component: CustManageUserComponent
  },
  {
    path: 'tc-drivers',
    component: ContactTcDriversComponent
  },

  {
    path: 'tc-projects',
    component: TcContactProjectsComponent
  },
  {
    path: 'cust-inv-users/:id',
    component: CustInvUsersComponent
  },
  {
    path: 'cust-closed-tickets',
    component: CustClosedTicketsComponent
  },
  {
    path: 'tc-closed-tickets',
    component: TcClosedTicketsComponent
  },
  {
    path: 'approver-projects',
    component: ApproverProjectsComponent
  },
  {
    path: 'approver-tickets',
    component: ApproverTickedsComponent
  },
  {
    path: 'approver-approved-tickets',
    component: ApproverApprovedTicketsComponent
  },
  {
    path: 'tc-approver-projects',
    component: TcApproverProjectsComponent
  },
  {
    path: 'tc-approver-tickets',
    component: TcApproverTicketsToApproveComponent
  },
  {
    path: 'tc-approver-approved-tickets',
    component: TcApproverApprovedTicketsComponent
  },

  {
    path: 'tc-user-profile',
    component: TcUserProfileComponent
  },

  {
    path: 'cust-user-profile',
    component: CustUserProfileComponent
  },

  {
    path: 'tc_user_invitation',
    component: TcUserInvitationComponent
  },

  {
    path: 'request-job-detail/:id',
    component: RequestJobDetailComponent
  },

  {
    path: 'accepted-job-detail/:id',
    component: AcceptedJobDetailComponent
  },

  {
    path: 'completed-job-detail/:id',
    component: CompletedJobDetailComponent
  },

  {
    path: 'approved-job-detail/:id',
    component: ApprovedJobDetailComponent
  },

  {
    path: 'inprogress-job-detail/:id',
    component: InprogressJobDetailComponent
  },


  {
    path: 'driver-notifications-list',
    component: DriverNotificationsListComponent
  },

  {
    path: 'driver-edit-profile',
    component: DriverEditProfileComponent
  },

  {
    path: 'driver-change-password',
    component: DriverChangePasswordComponent
  },

  {
    path: 'driver-contact-us',
    component: DriverContactUsComponent
  },

  {
    path: 'driver-dashboard-2',
    component: DeriverDashboardDesktopComponent
  },

  {
    path: 'driver-signup-mobile',
    component: DriverMobileSignupComponent
  },
  {
    path: 'driver-mobile-after-signup',
    component: DriverMobileAfterSignupComponent
  },
  {
    path: 'driver-dashboard-scheduler',
    component: DeriverDashboardDesktopSchedulerComponent
  },
  {
    path: 'driver-scheduler',
    component: DeriverSchedulerComponent
  },

  {
    path: 'driver-profile-settings',
    component: DriverUserProfileComponent
  },
  {
    path: 'freelance-accepted-detail/:id',
    component: FreelanceAcceptedJobDetailComponent
  },
  {
    path: 'freelance-inprogress-detail/:id',
    component: FreelanceInprogressJobDetailComponent
  },

  {
    path: 'freelance-approved-detail/:id',
    component: FreelanceApprovedJobDetailComponent
  },
  {
    path: 'tc-accepted-job-detail/:id',
    component: TcAcceptedJobDetailComponent
  },
  {
    path: 'tc-completed-job-detail/:id',
    component: TcCompletedJobDetailComponent
  },
  {
    path: 'tc-inprogress-job-detail/:id',
    component: TcInprogressJobDetailComponent
  },
  {
    path: 'tc-request-job-detail/:id',
    component: TcRequestJobDetailComponent
  },
  {
    path: 'tc-approved-job-detail/:id',
    component: TcApprovedJobDetailComponent
  },
  {
    path: 'tc-cancelled-job-detail/:id',
    component: TcCancelledTicketDetailComponent
  },

  {
    path: 'freelance-driver-tc-settings',
    component: FreelanceManageTcComponent
  },
  {
    path: 'freelance-driver-cc-settings',
    component: FreelanceManageConstructionCompanyComponent
  },
  {
    path: 'freelance-invoices',
    component: FreelanceInvoiceComponent
  },
  {
    path: 'freelance-create-ticket',
    component: FreelanceCreateTicketComponent
  },
  {
    path: 'freelance-manage-trucks',
    component: FreelanceManageTrucksComponent
  },
  {
    path: 'contact-vendors-cc',
    component: ContactVendorsCcComponent
  },
  {
    path: 'cancelled-job-detail/:id',
    component: CancelledTicketDetailComponent
  },
  {
    path: 'new-tc-dispatch/:id/:tc_project',
    component: TcDispatchNewComponent
  },
  {
    path: 'tc-projects-list',
    component: TcProjectsListComponent
  },
  {
    path: 'tc-cancelled-tickets',
    component: TcCancelledTicketsComponent
  },
  {
    path: 'tc-declined-tickets',
    component: TcDeclinedTicketsComponent
  },
  {
    path: 'driver-tickets-calendar-list/:calendar_date',
    component: DriverTicketsCalendarListComponent
  },
  {
    path: 'cust-declined-tickets',
    component: CustDeclinedTicketsComponent
  },

  {

    path: 'tc-project-profile/:project_id',
    component: TcProjectProfileComponent
  },
  {

    path: 'tc-profile-tragget-tickets',
    component: TruckingCompanyTraggetTicketComponent
  },
  {

    path: 'cust-profile-tragget-tickets',
    component: CustomerCompanyTraggetTicketComponent
  },
  {
    path: 'tc-dispatch-new/:project_id',
    component: TcDispatchNewTwoComponent
  },
  {
    path: 'hour-sheet',
    component: HourSheetsComponent
  },
  // Wildcard route for handling 404
  { path: '**', pathMatch: 'full', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), NgxTimerModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
