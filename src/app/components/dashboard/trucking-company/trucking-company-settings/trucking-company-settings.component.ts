import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { CustomerService } from 'src/app/services/customer.service';
declare var $: any;

@Component({
  selector: 'app-trucking-company-settings',
  templateUrl: './trucking-company-settings.component.html',
  styleUrls: ['./trucking-company-settings.component.css']
})
export class TruckingCompanySettingsComponent implements OnInit {
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;

  setCompanyForm!: FormGroup;
  canada_provinces:any=[];  
  usa_provinces:any=[];
  companyNameError: string = '';
  provinceError: string = '';
  cityError: string  = '';
  businessNoError: string = '';
  wbscNoError: string  = '';
  addressError: string = '';
  mailingAddressError: string  = '';
  countryError:string='';

  company_details:any;
  country:any='';
  province:string='';

  city:any='';
  profileImage : any ;
  active_menu: any;

  is_loading:boolean= false;

  loggedinUser:any ={};
  full_address:any = '';

  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private customer_service : CustomerService
  ) {
    
    this.active_menu = {
      parent:'settings',
      child:'company-settings',
      count_badge: '',
    }

    this.canada_provinces=[
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "NewFoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon"
    ];

    this.usa_provinces=[
      "Alaska AK",
      " Alabama	AL",
      "Arizona AZ",
      "Arkansas AR",
      "California CA",
      "Colorado CO",
      "Connecticut CT",
      "Delaware DE",
      "Florida FL",
      "Georgia GA",
      "Hawaii HI",
      "Idaho iD",
      "Illinois IL",
      "Indiana IN",
      "Iowa IA",
      "Kansas KS",
      "Kentucky KY",
      "Louisiana LA",
      "Maine ME",
      "Maryland MD",
      "Massachusetts MA",
      "Michigan MI",
      "Minnesota MN",
      "Montana	MT",
      "Nebraska NE",
      "Nevada NV",
      "New Hampshire NH",
      "New Jersey NJ",
      "New Mexico NM",
      "New York NY",
      "North Carolina NC",
      "North Dakota ND",
      "Ohio OH",
      "Oklahoma OK",
      "Oregon OR",
      "Pennsylvania[D] PA",
      "Rhode Island RI",
      "South Carolina SC",
      "South Dakota SD",
      "Tennessee TN",
      "Texas TX",
      "Utah UT",
      "Vermont VT",
      "Virginia[D] VA",
      "Washington WA",
      "West Virginia WV",
      "Wisconsin WI",
      "Wyoming WY",
    ];
   }

  
  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
      this.company_details= userDone;
    }else{
      this.router.navigate(['/home']);
    }

    this.setCompanyForm = this.fb.group({
      company_name: ['', Validators.required],
      website: [''],
      address: [''],
      country: ['', Validators.required],
      province: [this.company_details?.customer?.province || '', Validators.required],
      city: ['', Validators.required],
      business_no: ['', Validators.required],
      wsbc_no: ['', Validators.required],
      post_code:[''],
      mailing_address: [''],
      profile_image: [null]
    });

    let website =this.company_details?.customer?.website && this.company_details?.customer?.website !==null ? this.company_details?.customer?.website :'';
    this.setCompanyForm.get('website')?.patchValue(website);
    let company_name =this.company_details?.customer?.company_name && this.company_details?.customer?.company_name !==null ? this.company_details?.customer?.company_name :'';
    this.setCompanyForm.get('company_name')?.patchValue(company_name);
    let address =this.company_details?.customer?.address && this.company_details?.customer?.address !==null ? this.company_details?.customer?.address :'';
    this.setCompanyForm.get('address')?.patchValue(address);

    this.country =this.company_details?.customer?.country && this.company_details?.customer?.country !==null ? this.company_details?.customer?.country :'';
    this.setCompanyForm.get('country')?.patchValue(this.country);
    this.province=this.company_details?.customer?.province !='' && this.company_details?.customer?.province !==null ? this.company_details?.customer?.province:'Canada';

    this.full_address = (this.company_details &&  this.company_details.address && this.company_details.address !==null && this.company_details.address !='null'? this.company_details.address+', ':'') + ' '+ 
    (this.company_details &&  this.company_details.city && this.company_details.city !==null && this.company_details.city !='null'? this.company_details.city+', ':'') + ' '+
    (this.province ? this.province+','  : '')+ ' '+
    (this.company_details &&  this.company_details.post_code && this.company_details.post_code !==null && this.company_details.post_code !='null'? this.company_details.post_code+', ':'')+' '+
    (this.country? this.country:'');

    
  }

   provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "NewFoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
];

 provinces2 = [
  "Alaska AK",
  "Alabama AL",
  "Arizona AZ",
  "Arkansas AR",
  "California CA",
  "Colorado CO",
  "Connecticut CT",
  "Delaware DE",
  "Florida FL",
  "Georgia GA",
  "Hawaii HI",
  "Idaho ID",
  "Illinois IL",
  "Indiana IN",
  "Iowa IA",
  "Kansas KS",
  "Kentucky KY",
  "Louisiana LA",
  "Maine ME",
  "Maryland MD",
  "Massachusetts MA",
  "Michigan MI",
  "Minnesota MN",
  "Montana MT",
  "Nebraska NE",
  "Nevada NV",
  "New Hampshire NH",
  "New Jersey NJ",
  "New Mexico NM",
  "New York NY",
  "North Carolina NC",
  "North Dakota ND",
  "Ohio OH",
  "Oklahoma OK",
  "Oregon OR",
  "Pennsylvania PA",
  "Rhode Island RI",
  "South Carolina SC",
  "South Dakota SD",
  "Tennessee TN",
  "Texas TX",
  "Utah UT",
  "Vermont VT",
  "Virginia VA",
  "Washington WA",
  "West Virginia WV",
  "Wisconsin WI",
  "Wyoming WY"
];


  saveCompanyProfile(){
    
    this.companyNameError = '';
    this.addressError='';
    this.provinceError ='';
    this.cityError ='';
    this.businessNoError = '';
    this.wbscNoError = '';
    this.mailingAddressError = '';
    this.countryError = '';
    
    if (this.setCompanyForm.get('company_name')?.value == '' || this.setCompanyForm.get('company_name')?.value == undefined
    ) {
      
      this.companyNameError = 'Company Name is required';
    }  
   
    if (this.setCompanyForm.get('province')?.value == '' || this.setCompanyForm.get('province')?.value == undefined) {
      this.provinceError = 'Province is required';
      
    }  
    if (this.setCompanyForm.get('city')?.value == '' || this.setCompanyForm.get('city')?.value == undefined) {
      this.cityError = 'City is required';
      
    }  
    if (this.setCompanyForm.get('business_no')?.value == '' || this.setCompanyForm.get('business_no')?.value == undefined) {
      this.businessNoError = 'Business No is required';
    }  
    if (this.setCompanyForm.get('wsbc_no')?.value == '' || this.setCompanyForm.get('wsbc_no')?.value == undefined) {
      this.wbscNoError = 'Work Safety Number required';
    }  
   
    if (this.setCompanyForm.get('country')?.value == '' || this.setCompanyForm.get('country')?.value == undefined) {
      this.countryError = 'Country is required';
      
    }  

    if (this.setCompanyForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('company_name', this.setCompanyForm.get('company_name')?.value);
    formData.append('website', this.setCompanyForm.get('website')?.value);
    formData.append('address', this.setCompanyForm.get('address')?.value);
    formData.append('country', this.setCompanyForm.get('country')?.value);
    formData.append('province', this.setCompanyForm.get('province')?.value);
    formData.append('city', this.setCompanyForm.get('city')?.value);
    formData.append('post_code', this.setCompanyForm.get('post_code')?.value);
    formData.append('business_no', this.setCompanyForm.get('business_no')?.value);
    formData.append('wsbc_no', this.setCompanyForm.get('wsbc_no')?.value);
    formData.append('mailing_address', this.setCompanyForm.get('mailing_address')?.value);
    formData.append('user_id', this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id);
    formData.append('profile_image', this.profileImage);


    this.is_loading =true;
    this.customer_service.updateCompanyProfile(formData).subscribe(response=>{
              
      if (response && !response.status ) {
        this.companyNameError = response.data.company_name ? response.data.company_name : '';    
        this.addressError = response.data.address ? response.data.address : '';    
        this.provinceError = response.data.province ? response.data.province : ''; 
        this.cityError = response.data.city ? response.data.city : ''; 
        this.businessNoError = response.data.business_no ? response.data.business_no : ''; 
        this.wbscNoError = response.data.wsbc_no ? response.data.wsbc_no : ''; 
         this.is_loading =false;
        return;
      }else{
        this.profileImage = undefined;
        this.company_details = response.user;
        localStorage.setItem('TraggetUser', JSON.stringify(response.user));
        this.is_loading =false;
        Swal.fire(
        
          {
            confirmButtonColor:'#17A1FA',
            title:   
            `Success!`,
            text:  
            `Company Profile Updated!`
          
          }).then((result) => { 
            if (result.isConfirmed) {

              let modalElement = document.getElementById('editProfile') as HTMLElement;
              if (modalElement) {
                (modalElement as any).style.display = 'none';
              }
              let modalElement2 = document.getElementById('changeAddress') as HTMLElement;
              if (modalElement2) {
                (modalElement2 as any).style.display = 'none';
              }

              $('.modal').modal('hide');
              $( ".modal-backdrop" ).remove();
              $(".modal-backdrop").hide();

          }
            
          });
      }
    });

  }

  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.profileImage  =file;
      // alert(file.name)
    }
    
  }

  changeAddressCheck(event:any){
    if(event && event.target.checked && this.loggedinUser.customer){
      this.loggedinUser.customer.mailing_address = this.loggedinUser.customer.address;
    }else{
      this.loggedinUser.customer.mailing_address= '';
    }
    return;
  }

  setCountry(event:any){
    if(event.target.value){
      this.country = event.target.value;
    }
  }
  changeFull(event:any){
    if(event.target.value){
      this.setCompanyForm.get('company_name')?.patchValue(event.target.value)
    }

  }

}
