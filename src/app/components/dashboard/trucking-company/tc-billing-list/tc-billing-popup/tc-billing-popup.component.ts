import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FreelanceDriverServiceService } from 'src/app/services/freelance-driver-service.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-tc-billing-popup',
  templateUrl: './tc-billing-popup.component.html',
  styleUrls: ['./tc-billing-popup.component.css']
})
export class TcBillingPopupComponent implements OnInit {

  loggedinUser: any = {};
  @Input('edited_invoice') edited_invoice : any;
  @Input('gst') gst : any;
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  user_id:any=null
  is_loading:string='';
  constructor(
    private router: Router,    
    private freelance_driver: FreelanceDriverServiceService,
  ) { }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }
    
    this.user_id = this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id
  }

  
  downloadEditedInvoice(){
    let data2={
      user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id,
      action:'invoice_pdf_download',
      invoice_id:this.edited_invoice?.id
    }
   
    this.is_loading='download'
    this.freelance_driver.invoiceAction(data2).subscribe(response=>{
      this.is_loading='';
      if(response.status){
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', environment.apiInvoiceURL+response.file_name);
        link.setAttribute('download', response.file_name);
        document.body.appendChild(link);
        link.click();
        link.remove();
       
      }
    });
  }
}
