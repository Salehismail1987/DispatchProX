// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  phpAuthUser: "dispatchprox-api-client",
  phpAuthPassword: "dispatchprox-api-12345",
  apiBaseUrl: 'http://127.0.0.1:8000/api/',
  apiBackendUrl: 'http://127.0.0.1:8000/',
  apiFilesDir: 'uploads/',
  apiInvoiceURL:'http://127.0.0.1:8000/download?path=invoices/',
  apiInvoiceFreelanceURL:'http://127.0.0.1:8000/download?path=freelance_invoice_pdf/',
  apiClosedPDFURL:'http://127.0.0.1:8000/download?path=closed_tickets_pdf/',
  paperTicketImageUrl:'http://127.0.0.1:8000/preview?path=paper_tickets/',
  timeZone:'America/Los_Angeles',
  encKey:'sdSL34A34aoDASn423S93423SKDLAS712bsa',
  trial_period_days:5,
  mobileDashboardURL:'http://localhost:4300/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
