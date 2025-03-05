import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tc-pdf-invoice',
  templateUrl: './tc-pdf-invoice.component.html',
  styleUrls: ['./tc-pdf-invoice.component.css']
})
export class TcPdfInvoiceComponent implements OnInit {

  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  
  loggedinUser: any = {};
  invoice:any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    let invoiceData = JSON.parse(localStorage.getItem('InvoiceToDownloadTragget') || '{}');
    if(invoiceData && invoiceData != undefined && invoiceData.id){
      this.invoice = invoiceData;
    }

    setTimeout(() => {
      window.print();
    }, 5000);
  }

  
  

}
