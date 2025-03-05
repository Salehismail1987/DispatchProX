import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
  selector: 'app-customer-company-profile',
  templateUrl: './customer-company-profile.component.html',
  styleUrls: ['./customer-company-profile.component.css']
})

export class CustomerCompanyProfileComponent implements OnInit {
  
  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;

  setCompanyForm!: FormGroup;
  
  companyNameError: string = '';
  countryError:string='';

  provinceError: string = '';
  cityError: string  = '';
  businessNoError: string = '';
  wbscNoError: string  = '';
  addressError: string = '';
  mailingAddressError: string  = '';
  
  country:string='';
  province:string='';

  company_details:any;
  customer_details:any;
  
  profileImage : any ;

  is_loading:boolean= false;

  loggedinUser:any ={};
  active_menu:any;

  canada_provinces:any=[];  
  usa_provinces:any=[];
  activeTab:any = 'company_profile';
  full_address:any = '';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private customerService : CustomerService
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
      this.customer_details = userDone?.customer ? userDone?.customer : [] ;
      this.country= this.customer_details?.country !='' && this.customer_details?.country !==null ? this.customer_details?.country:'Canada';
      this.province=this.customer_details?.province !='' && this.customer_details?.province !==null ? this.customer_details?.province:'Canada';
    }else{
      this.router.navigate(['/home']);
    }

    this.setCompanyForm = this.fb.group({
      company_name: ['', Validators.required],
      website:[''],
      address: [''],
      country:['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required],
      business_no: ['', Validators.required],
      wsbc_no: [''],
      mailing_address: [''],
      post_code: [''],
      profile_image: [null,]
    });

    this.full_address = (this.customer_details &&  this.customer_details.address && this.customer_details.address !==null && this.customer_details.address !='null'? this.customer_details.address+', ':'') + ' '+ 
    (this.customer_details &&  this.customer_details.city && this.customer_details.city !==null && this.customer_details.city !='null'? this.customer_details.city+', ':'') + ' '+
    (this.province ? this.province+','  : '')+ ' '+
    (this.company_details &&  this.company_details.post_code && this.company_details.post_code !==null && this.company_details.post_code !='null'? this.company_details.post_code+', ':'')+' '+
    (this.country? this.country:'');

    let website = this.customer_details && this.customer_details?.website && this.customer_details?.website!==null ? this.customer_details?.website:'';
    this.setCompanyForm.get('website')?.patchValue(website);
  }

  updateForm(){
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if(userDone && userDone.id){
      this.loggedinUser = userDone;
      this.company_details= userDone;
      this.customer_details = userDone?.customer ? userDone?.customer : [] ;
      this.country= this.customer_details?.country !='' && this.customer_details?.country !==null ? this.customer_details?.country:'Canada';
      this.province=this.customer_details?.province !='' && this.customer_details?.province !==null ? this.customer_details?.province:'Canada';
    }else{
      this.router.navigate(['/home']);
    }

    this.setCompanyForm = this.fb.group({
      company_name: [, Validators.required],
      website:[''],
      address: [''],
      country:['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required],
      business_no: ['', Validators.required],
      wsbc_no: [''],
      mailing_address: [''],
      post_code: [''],
      profile_image: [null,]
    });

    this.full_address = (this.customer_details &&  this.customer_details.address && this.customer_details.address !==null && this.customer_details.address !='null'? this.customer_details.address+', ':'') + ' '+ 
    (this.customer_details &&  this.customer_details.city && this.customer_details.city !==null && this.customer_details.city !='null'? this.customer_details.city+', ':'') + ' '+
    (this.province ? this.province+','  : '')+ ' '+
    (this.company_details &&  this.company_details.post_code && this.company_details.post_code !==null && this.company_details.post_code !='null'? this.company_details.post_code+', ':'')+' '+
    (this.country? this.country:'');

    let website = this.customer_details && this.customer_details?.website && this.customer_details?.website!==null ? this.customer_details?.website:'';
    this.setCompanyForm.get('website')?.patchValue(website);
    this.setCompanyForm.get('company_name')?.patchValue(this.loggedinUser?.company_name);
    this.setCompanyForm.get('country')?.patchValue(this.country);
    this.setCompanyForm.get('province')?.patchValue(this.province);
    this.setCompanyForm.get('post_code')?.patchValue((this.company_details &&  this.company_details.post_code && this.company_details.post_code !==null && this.company_details.post_code !='null'? this.company_details.post_code:''));
    this.setCompanyForm.get('wsbc_no')?.patchValue(this.customer_details && this.customer_details.wsbc_no && this.customer_details.wsbc_no !==null && this.customer_details.wsbc_no !='null' ? this.customer_details.wsbc_no:'');
    this.setCompanyForm.get('business_no')?.patchValue(this.customer_details && this.customer_details.business_no && this.customer_details.business_no !==null  && this.customer_details.business_no !='null' ? this.customer_details.business_no:'');
    this.setCompanyForm.get('city')?.patchValue(this.customer_details &&  this.customer_details.city && this.customer_details.city !==null && this.customer_details.city !='null'? this.customer_details.city:'');
    this.setCompanyForm.get('address')?.patchValue((this.customer_details &&  this.customer_details.address && this.customer_details.address !==null && this.customer_details.address !='null'? this.customer_details.address:''));
  }

  saveCompanyProfile(){
    
    this.companyNameError = '';
    this.addressError='';
    this.provinceError ='';
    this.cityError ='';
    this.businessNoError = '';
    this.wbscNoError = '';
    this.mailingAddressError = '';
    
    if (this.setCompanyForm.get('company_name')?.value == '' || this.setCompanyForm.get('company_name')?.value == undefined
    ) {
      
      this.companyNameError = 'Company Name is required';
    }  
  
    if (this.setCompanyForm.get('province')?.value == '' || this.setCompanyForm.get('province')?.value == undefined) {
      this.provinceError = 'Province is required';
      
    }  

    if (this.setCompanyForm.get('country')?.value == '' || this.setCompanyForm.get('country')?.value == undefined) {
      this.countryError = 'Country is required';
      
    }  
    if (this.setCompanyForm.get('city')?.value == '' || this.setCompanyForm.get('city')?.value == undefined) {
      this.cityError = 'City is required';
      
    }  
    if (this.setCompanyForm.get('business_no')?.value == '' || this.setCompanyForm.get('business_no')?.value == undefined) {
      this.businessNoError = 'Business No is required';
      
    }  


    if (this.setCompanyForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('company_name', this.setCompanyForm.get('company_name')?.value);
    formData.append('address', this.setCompanyForm.get('address')?.value);
    formData.append('country', this.setCompanyForm.get('country')?.value);
    formData.append('province', this.setCompanyForm.get('province')?.value);
    formData.append('city', this.setCompanyForm.get('city')?.value);
    formData.append('business_no', this.setCompanyForm.get('business_no')?.value);
    formData.append('post_code', this.setCompanyForm.get('post_code')?.value);
    formData.append('wsbc_no', this.setCompanyForm.get('wsbc_no')?.value);
    formData.append('mailing_address', this.setCompanyForm.get('mailing_address')?.value);
    formData.append('website', this.setCompanyForm.get('website')?.value);
    formData.append('user_id', this.loggedinUser.id ? this.loggedinUser.id : this.loggedinUser?.user_data_request_id);
    formData.append('profile_image', this.profileImage);


    this.is_loading =true;
    this.customerService.updateCompanyProfile(formData).subscribe(response=>{
              
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
        this.updateForm();
        $("#editProfile").hide('modal');
        $("#changeAddress").hide('modal');
        $(".modal-backdrop").hide();

        this.is_loading =false;
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'mybtn mybtn-back-yellow mybtn-padding'
          },
          buttonsStyling: false
        })
        swalWithBootstrapButtons.fire(
          `Success`,
          `Company Profile Updated!`).then(() => { 
          });
      }
    });

  }

  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.profileImage  =file;
      this.saveCompanyProfile();
      // alert(file.name)
    }
    
  }

  changeAddressCheck(event:any){
    if(event && event.target.checked){
      this.loggedinUser.customer.mailing_address = this.loggedinUser?.customer?.address;
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

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  isActive(tabName: string): boolean {
    return this.activeTab === tabName;
  }
  changeFull(event:any){
    if(event.target.value){
      this.setCompanyForm.get('company_name')?.patchValue(event.target.value)
    }

  }
}
