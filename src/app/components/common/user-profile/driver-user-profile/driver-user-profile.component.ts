import { Component, OnInit, HostListener,ElementRef, ViewChild ,ChangeDetectorRef   } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
import { HelpRequestService } from 'src/app/services/help-request.service';

import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-driver-user-profile',
  templateUrl: './driver-user-profile.component.html',
  styleUrls: ['./driver-user-profile.component.css']
})

// export class DriverUserProfileComponent implements OnInit {


//   current_nav:string = 'profile';
//   passwordError:string= '';
//   confirmPasswordError:string='';
//   oldPasswordError:string='';
//   passwordForm!: FormGroup;
//   updateProfile!: FormGroup;


//   updateProfileImage!: FormGroup;

//   update_loading:boolean=false;
//   password_loading:boolean=false;

//   number_symbol_space:boolean=false;
//   atleast_eight:boolean=false;
//   upper_lower:boolean=false;

//   contactNoError:string='';

//   streetError:string = '';
//   provinceError:string = '';
//   cityError:string = '';

//   province:string='';
//   country:string='';
//   countryError:string='';
//   full_address:any;

//   loggedinUser:any;
//   formClicked:boolean=false;

//   backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
//   profileImage:any;

//   provinces:any=[];
//   canada_provinces:any=[];
//   usa_provinces:any=[];

//   showContent: boolean = true;

//   help_topics: any[] = [];  // Array to store the fetched help topics
//   helpTopicForm!: FormGroup;
//   current_modal: any = '';
//   topicError: any = '';
//   is_loading_topic: boolean = false;
//   open_conversation: any = null; // Track the currently opened conversation
//   write_conversation: number | null = null; // Track which topic is being responded to
//   responseText: string = '';  // Store the text of the user's response


//   constructor(
//     private router: Router,
//     private fb: FormBuilder,
//     private user_service: UserDataService,
//      private cdr: ChangeDetectorRef,
//         private helpRequestService: HelpRequestService,
//   ) {
//     this.canada_provinces=[
//       "Alberta",
//       "British Columbia",
//       "Manitoba",
//       "New Brunswick",
//       "NewFoundland and Labrador",
//       "Northwest Territories",
//       "Nova Scotia",
//       "Nunavut",
//       "Ontario",
//       "Prince Edward Island",
//       "Quebec",
//       "Saskatchewan",
//       "Yukon"
//     ];
//     this.usa_provinces=[
//       "Alaska AK",
//       " Alabama	AL",
//       "Arizona AZ",
//       "Arkansas AR",
//       "California CA",
//       "Colorado CO",
//       "Connecticut CT",
//       "Delaware DE",
//       "Florida FL",
//       "Georgia GA",
//       "Hawaii HI",
//       "Idaho iD",
//       "Illinois IL",
//       "Indiana IN",
//       "Iowa IA",
//       "Kansas KS",
//       "Kentucky KY",
//       "Louisiana LA",
//       "Maine ME",
//       "Maryland MD",
//       "Massachusetts MA",
//       "Michigan MI",
//       "Minnesota MN",
//       "Montana	MT",
//       "Nebraska NE",
//       "Nevada NV",
//       "New Hampshire NH",
//       "New Jersey NJ",
//       "New Mexico NM",
//       "New York NY",
//       "North Carolina NC",
//       "North Dakota ND",
//       "Ohio OH",
//       "Oklahoma OK",
//       "Oregon OR",
//       "Pennsylvania[D] PA",
//       "Rhode Island RI",
//       "South Carolina SC",
//       "South Dakota SD",
//       "Tennessee TN",
//       "Texas TX",
//       "Utah UT",
//       "Vermont VT",
//       "Virginia[D] VA",
//       "Washington WA",
//       "West Virginia WV",
//       "Wisconsin WI",
//       "Wyoming WY",
//     ];
//    }

//   ngOnInit(): void {



//     let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
//     if (userDone && userDone.id) {
//       this.loggedinUser = userDone;
//       } else {
//       this.router.navigate(['/home']);
//     }

//          // Initialize the form with topic_title and detail
//   this.helpTopicForm = this.fb.group({
//     topic_title: ['', [Validators.required, Validators.minLength(3)]],  // Validate topic title
//     detail: ['', [Validators.required, Validators.minLength(5)]],       // Validate details
//   });

//   this.fetchHelpTopics();
//   setInterval(() => {
//     this.fetchHelpTopics(); // Fetch every X seconds
//   }, 5000); // Adjust t


//     this.passwordForm = this.fb.group({
//       old_password:['',Validators.required],
//       new_password: ['', Validators.required],
//       confirm_password: ['', Validators.required],
//     });

//     this.updateProfileImage = this.fb.group({
//       profile_image:['',Validators.required],
//     });
//     this.updateProfile = this.fb.group({
//       full_name:['',Validators.required],
//       contact_number:['',Validators.required],
//       street:['',Validators.required],
//       city:['',Validators.required],
//       post_code:[''],
//       email:['',Validators.required],
//       province_state:['',Validators.required],
//       company_name:[''],
//       business_number:[''],
//       work_safety_number:[''],
//     });



//   }


//   setNav(nav:string){
//     this.current_nav = nav;
//   }

//   uploadimage(event:any) {
//     let file = event.target.files[0];
//     if(file){
//       this.profileImage  =file;
//       // alert(file.name)
//       this.onSaveUser();
//     }

//   }
//   setCountry(event:any){
//     if(event.target.value){
//       this.country = event.target.value;
//     }
//   }
//   changeFull(event:any){
//     if(event.target.value){
//       this.updateProfile.get('full_name')?.patchValue(event.target.value);
//     }
//   }

//   onSaveSetting(){
//     this.formClicked =true;
//     if(this.updateProfile.invalid){
//       return;
//     }
//     this.update_loading = true;
//     let formData:any = this.updateProfile.value;
//     formData.user_id = this.loggedinUser?.id;
//     formData.driver_desktop = 'yes';

//     this.user_service.updateUserProfile(formData).subscribe(response => {
//       this.update_loading = false;
//       if(response && response.status){
//         localStorage.setItem('TraggetUser', JSON.stringify(response.user));
//         this.formClicked =false;
//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })
//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Success',
//             text:
//             'Profile Updated'
//           }).then(() => {
//             window.location.href='/driver-profile-settings';
//           });


//         }else{
//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })
//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Error',
//             text:
//             response.message
//           }).then(() => {

//           });
//       }
//     });
//   }

//   onPassword(){
//     this.passwordError = '';
//     this.oldPasswordError = '';
//     this.confirmPasswordError='';


//     if(this.passwordForm.get('old_password')?.value == ""){
//       this.oldPasswordError = 'Old Password is required';
//     }


//     if(this.passwordForm.get('new_password')?.value == ""){
//       this.passwordError = 'New Password is required';
//     }

//     if(this.passwordForm.get('confirm_password')?.value == ""){
//       this.confirmPasswordError = "Password Confirmation is required";
//     }

//     if(this.passwordForm.get('new_password')?.value != this.passwordForm.get('confirm_password')?.value){
//       this.confirmPasswordError = "New Password and Confirm Password must be the same.";

//       return;
//     }

//     if(this.atleast_eight || this.number_symbol_space || this.upper_lower){
//       this.passwordError = "Please enter password according to given Instructions.";
//       return;
//     }

//     if (this.passwordForm.invalid) {
//       return;
//     }

//     const formData = new FormData();


//     formData.append('user_id', this.loggedinUser?.id);
//     formData.append('old_password', this.passwordForm.get('old_password')?.value);
//     formData.append('password', this.passwordForm.get('new_password')?.value);
//     this.password_loading = true;
//     this.user_service.updatePassword(formData).subscribe(response => {
//       this.password_loading = false;
//       if(response && response.status){

//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })

//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Success',
//             text:
//             response.message
//           }).then(() => {
//             this.passwordForm.reset()
//           });

//       }else{
//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })

//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Error',
//             text:
//             response.message
//           }
//           ).then(() => {

//           });
//       }
//     });
//   }

//   checkPassword(event:any){
//     this.atleast_eight = true;
//     this.number_symbol_space = true;
//     this.upper_lower = true;

//     if(!event.target.value || event.target.value.length < 8){
//       this.atleast_eight = true;
//     }else{
//       this.atleast_eight = false;
//     }

//     if(/(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]/.test(event.target.value)){
//       this.upper_lower = false;
//     }
//     if(/(?=.*?[0-9])|(?=\s)|(?=.*?[#?!+_@$%^&*-])/.test(event.target.value)){
//       this.number_symbol_space = false;
//     }
//     return
//   }

//   changeNumber(event:any){

//     let p:string = event.target.value;
//     var charCode = (event.which) ? event.which : event.keyCode;

//     let abc= this.formatPhoneNumber(p);
//     // console.log(abc)
//     this.updateProfile.get('contact_number')?.patchValue(abc);
//   }

//   formatPhoneNumber(input:any) {

//     if(input.charAt(0) == '+'){
//       // alert(input)
//        input = input.substring(3, input.length);

//     }
//     input = input.replace(/\D/g,'');
//     // Trim the remaining input to ten characters, to preserve phone number format
//     input = input.substring(0,10);

//     // Based upon the length of the string, we add formatting as necessary
//     var size = input.length;
//     if(size == 0){
//             input = input;
//     }else if(size < 4){
//             input = '+1 ('+input;
//     }else if(size < 7){
//             input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6);
//     }else{
//             input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
//     }
//     return input;
//   }

//   onSaveUser(){
//     const formData = new FormData();

//     formData.append('user_id', this.loggedinUser?.id);
//     formData.append('profile_image', this.profileImage);
//     formData.append('only_image', 'yes');
//     this.update_loading = true;
//     this.user_service.updateUserProfile(formData).subscribe(response => {
//       this.update_loading = false;
//       if(response && response.status){
//         localStorage.setItem('TraggetUser', JSON.stringify(response.user));
//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })
//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Success',
//             text:
//             'Profile Updated'
//           }).then(() => {
//           window.location.href='/driver-profile-settings';
//           });


//       }else{
//         const swalWithBootstrapButtons = Swal.mixin({
//           customClass: {
//             confirmButton: 'btn bg-pink width-200'
//           },
//           buttonsStyling: false
//         })
//         swalWithBootstrapButtons.fire(
//           {

//             title:    'Error',
//             text:
//             response.message
//           }).then(() => {

//           });
//       }
//     });
//   }
//   onSaveTopic(): void {
//     // Check if the form is invalid
//     if (this.helpTopicForm.invalid) {
//       this.topicError = 'Both fields are required';
//       return;
//     }

//     // Clear the error message
//     this.topicError = '';
//     this.is_loading_topic = true;

//     // Prepare the payload for the API request
//     const topicData = {
//       user_id: this.loggedinUser.id, // Replace with the dynamic user ID if required
//       topic_title: this.helpTopicForm.value.topic_title,
//       detail: this.helpTopicForm.value.detail
//     };

//     // Make the API call
//     this.helpRequestService.createHelpTopic(topicData).subscribe(
//       (response) => {
//         console.log('Success:', response);
//         this.is_loading_topic = false;

//         // Add the new topic to the help_topics array
//         // this.help_topics.push({
//         //   id: response.data.id,  // Assuming the response contains the newly created topic's ID
//         //   topic_title: response.data.topic_title,
//         //   is_open: false // Default value for 'is_open'
//         // });

//         // Reset the form on success
//         this.helpTopicForm.reset();
//         this.fetchHelpTopics();
//         this.hideModal();
//       },
//       (error) => {
//         console.error('Error:', error);
//         this.is_loading_topic = false;

//         // Handle validation errors returned by the API
//         if (error.status === 422) {
//           const validationErrors = error.error.errors;
//           if (validationErrors?.topic_title) {
//             this.topicError = validationErrors.topic_title[0];
//           } else if (validationErrors?.detail) {
//             this.topicError = validationErrors.detail[0];
//           } else {
//             this.topicError = 'An error occurred while submitting the form.';
//           }
//         }
//       }
//     );
//   }


//   hideModal(){
//     this.current_modal = '';
//   }

//   showModal(modal:any){
//     this.current_modal = modal;
//   }

//   fetchHelpTopics(): void {

//     let user_id = this.loggedinUser?.id;
//     this.helpRequestService.getHelpTopics(user_id).subscribe(
//       (topics) => {
//         const topicIds = topics.map((topic: any) => topic.id);

//         this.helpRequestService.getHelpConversations(topicIds).subscribe(
//           (conversations) => {

//             this.help_topics = [];
//             topics.forEach((topic: any) => {
//               // const existingTopic = this.help_topics.find((t: any) => t.id === topic.id);

//               // // Update existing topic or add a new one
//               // if (existingTopic) {
//               //   existingTopic.conversations = conversations
//               //     .filter((conversation: any) => conversation.topic_id === topic.id)
//               //     .sort(
//               //       (a: any, b: any) =>
//               //         new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//               //     );
//               // } else {
//                 this.help_topics.push({
//                   ...topic,
//                   conversations: conversations.filter(
//                     (conversation: any) => conversation.topic_id === topic.id
//                   ),
//                 });
//               // }
//             });
//           },
//           (error) => {
//             console.error('Error fetching conversations:', error);
//           }
//         );
//       },
//       (error) => {
//         console.error('Error fetching topics:', error);
//       }
//     );
//   }

//   toggleConversation(id: number): void {
//     const topic = this.help_topics.find((t: any) => t.id === id);

//     if (topic) {
//       // Toggle the conversation open/closed regardless of its closed state
//       this.open_conversation = this.open_conversation === id ? null : id;
//       if(this.open_conversation){
//         this.onConversationClick(0,this.open_conversation)
//       }
//     }
//   }

//   toggleWriteConversation(id: number): void {
//     const topic = this.help_topics.find((t: any) => t.id === id);

//     // Only allow writing if the conversation is not closed
//     if (topic && topic.is_closed === 'NO') {
//       this.write_conversation = this.write_conversation === id ? null : id;
//     }
//   }

//   submitResponse(topicId: number): void {
//     if (!this.responseText.trim()) {
//         return; // Prevent empty responses
//     }

//     const responseData = {
//         topic_id: topicId,
//         user_id: this.loggedinUser?.id, // Replace with dynamic user ID
//         text: this.responseText.trim(),
//     };

//     this.helpRequestService.createHelpConversation(responseData).subscribe(
//         (response) => {
//             // Find the topic and add the new response to the conversations
//             const topic = this.help_topics.find((t: any) => t.id === topicId);
//             // if (topic) {
//             //     // Fetch updated conversations for this topic
//             //     this.helpRequestService.getHelpConversations([topicId]).subscribe(
//             //         (conversations) => {
//             //             topic.conversations = conversations; // Update conversations
//             //             topic.conversations.sort((a: any, b: any) =>
//             //                 new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//             //             ); // Ensure sorted order
//             //             this.cdr.detectChanges(); // Trigger change detection
//             //         },
//             //         (error) => console.error('Error fetching updated conversations:', error)
//             //     );
//             // }

//             this.fetchHelpTopics();

//             this.responseText = ''; // Clear the response text
//             this.write_conversation = null; // Close the response box
//         },
//         (error) => console.error('Error submitting response:', error)
//     );
// }

// onConversationClick(conversationId: number, topicId: number): void {
//   // Call the service to mark the conversation as read
//   this.helpRequestService.markConversationAsRead(topicId).subscribe(
//     () => {
//       // Find the topic and conversation to update locally
//       const topic = this.help_topics.find((t: any) => t.id === topicId);
//       if (topic) {
//         const conversation = topic.conversations.map((conversation: any)=>{

//           if (conversation) {
//             conversation.is_read = true; // Mark it as read locally
//           }
//         });
//       }
//     },
//     (error) => {
//       console.error('Error marking conversation as read:', error);
//     }
//   );
// }

// handleImageError(event: any) {
//   event.target.src = '../assets/icons/user.svg';
// }


// }

export class DriverUserProfileComponent implements OnInit {
  @ViewChild('mainClass') mainClass!: ElementRef;

  current_nav:string = 'profile';

  full_nameError:string = '';
  emailError:string = '';

  streetError:string = '';
  provinceError:string = '';
  cityError:string = '';

  province_state:string='';
  country:string='';
  countryError:string='';

  addressError:string = '';
  contactNoError:string='';
  businessNoError:string='';
  updateProfile!: FormGroup;
  canada_provinces:any=[];
  usa_provinces:any=[];

  passwordError:string= '';
  confirmPasswordError:string='';
  oldPasswordError:string='';
  passwordForm!: FormGroup;


  update_loading:boolean=false;
  input_divClicked:boolean=false;
  password_loading:boolean=false;

  number_symbol_space:boolean=false;
  atleast_eight:boolean=false;
  upper_lower:boolean=false;
  showContent: boolean = true;


  loggedinUser:any;

  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  profileImage:any;
  full_address:any;


  help_topics: any[] = [];  // Array to store the fetched help topics
  helpTopicForm!: FormGroup;
  current_modal: any = '';
  topicError: any = '';
  is_loading_topic: boolean = false;
  open_conversation: any = null; // Track the currently opened conversation
  write_conversation: number | null = null; // Track which topic is being responded to
  responseText: string = '';  // Store the text of the user's response


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private helpRequestService: HelpRequestService,
    private user_service: UserDataService
  ) {
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
    if (userDone && userDone.id) {
      this.loggedinUser = userDone;
      } else {
      this.router.navigate(['/home']);
    }
  // Initialize the form with topic_title and detail
  this.helpTopicForm = this.fb.group({
    topic_title: ['', [Validators.required, Validators.minLength(3)]],  // Validate topic title
    detail: [''],       // Validate details
  });

  this.fetchHelpTopics();

  setInterval(() => {
    this.fetchHelpTopics(); // Fetch every X seconds
  }, 15000);


  this.full_address =
  (this.loggedinUser?.address ? this.loggedinUser?.address + ', ' : '') +
  (this.loggedinUser?.city ? this.loggedinUser?.city + ', ' : '') +
  (this.loggedinUser?.province ? this.loggedinUser?.province + ' ' : '') +
  (this.loggedinUser?.post_code ? ', ' + this.loggedinUser?.post_code : '') +
  (this.loggedinUser?.country ? ' ' + this.loggedinUser?.country : 'Canada');

this.updateProfile = this.fb.group({
  country: [this.loggedinUser?.country ?? 'Canada'],
  contact_number: [this.loggedinUser?.contact_number ?? '', Validators.required],
  email: [this.loggedinUser?.email ?? '', Validators.required],
  street: [this.loggedinUser?.address ?? ''],  // Changed back to "address"
  city: [this.loggedinUser?.city ?? ''],
  province_state: [this.loggedinUser?.province ?? ''],
  post_code: [this.loggedinUser?.post_code ?? ''],
  business_name: [this.loggedinUser?.company_name ?? ''],
  business_number: [this.loggedinUser?.business_number ?? ''],
  work_safety_number: [this.loggedinUser?.work_safety_number ?? ''],
  full_name: [this.loggedinUser?.full_name ?? '', Validators.required],
  profile_image: ['']
});


    this.passwordForm = this.fb.group({
      old_password:['',Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });

    this.country = this.loggedinUser?.country !== '' && this.loggedinUser?.country !== null
    ? this.loggedinUser?.country
    : 'Canada';

this.province_state = this.loggedinUser?.province !== '' && this.loggedinUser?.province !== null
    ? this.loggedinUser?.province
    : '';


  }
  handleImageError(event: any) {
    event.target.src = '../assets/icons/user.svg';
  }

   setCountry(event:any){
    if(event.target.value){
      this.country = event.target.value;
    }
  }
  onMainClassClick() {
    this.input_divClicked = true;
  }
  onBackClick() {
    this.emptyErrors();
    this.input_divClicked = false;
  }
  onOutsideClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.main_class')) {
      this.input_divClicked = false;
    }
  }
  updateForm() {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    if (userDone && userDone.id) {
        this.loggedinUser = userDone;
    } else {
        this.router.navigate(['/home']);
    }

    // ✅ Fixing `full_address` to match API response fields
    this.full_address =
        (this.loggedinUser?.address ? this.loggedinUser?.address + ', ' : '') +
        (this.loggedinUser?.city ? this.loggedinUser?.city + ', ' : '') +
        (this.loggedinUser?.province ? this.loggedinUser?.province : '') +
        (this.loggedinUser?.post_code ? ', ' + this.loggedinUser?.post_code : '') + ' ' +
        (this.loggedinUser?.country ? this.loggedinUser?.country : 'Canada');

    // ✅ Ensuring correct field names for FormBuilder
    this.updateProfile = this.fb.group({
        country: [this.loggedinUser?.country ? this.loggedinUser?.country : 'Canada'],
        contact_number: [this.loggedinUser?.contact_number !== 'null' && this.loggedinUser?.contact_number !== null ? this.loggedinUser?.contact_number : '', Validators.required],
        street: [this.loggedinUser?.address ? this.loggedinUser?.address : ''],
        city: [this.loggedinUser?.city ? this.loggedinUser?.city : ''],
        province_state: [this.loggedinUser?.province ? this.loggedinUser?.province : ''],
        post_code: [this.loggedinUser?.post_code ? this.loggedinUser?.post_code : ''],
        business_name: [this.loggedinUser?.company_name ? this.loggedinUser?.company_name : ''],
        business_number: [this.loggedinUser?.business_number ? this.loggedinUser?.business_number : ''],
        work_safety_number: [this.loggedinUser?.work_safety_number ? this.loggedinUser?.work_safety_number : ''],

        full_name: [this.loggedinUser?.full_name !== 'null' && this.loggedinUser?.full_name !== null ? this.loggedinUser?.full_name : '', Validators.required],
        email: [this.loggedinUser?.email, Validators.required],
        profile_image: ['']
    });

    // ✅ Password form remains the same
    this.passwordForm = this.fb.group({
        old_password: ['', Validators.required],
        new_password: ['', Validators.required],
        confirm_password: ['', Validators.required],
    });

    // ✅ Update country and province values correctly
    this.country = this.loggedinUser?.country !== '' && this.loggedinUser?.country !== null ? this.loggedinUser?.country : 'Canada';
    this.province_state = this.loggedinUser?.province !== '' && this.loggedinUser?.province !== null ? this.loggedinUser?.province : '';
}


  emptyErrors(){
    this.full_nameError = '';
    this.emailError = '';
    this.addressError = '';
    this.contactNoError='';
    this.countryError='';
    this.streetError='';
    this.businessNoError='';
    this.provinceError='';
    this.cityError='';
  }

  setNav(nav:string){
    this.current_nav = nav;
  }

  onSaveUser() {
    this.emptyErrors();

    if (this.updateProfile.get('email')?.value == '') {
        this.emailError = 'Email is required';
    }

    let errors = '';
    if (this.updateProfile.get('contact_number')?.value !== undefined &&
        this.updateProfile.get('contact_number')?.value != null &&
        this.updateProfile.get('contact_number')?.value != '') {
        let a = this.updateProfile.get('contact_number')?.value;
        a = a.replace(')', '')
            .replace(/\s+/g, '')
            .replace('+', '')
            .replace('(', '');

        if (a.length < 11) {
            this.contactNoError = "Provide a valid contact number.";
            errors = 'yes';
        }
    }

    if (this.updateProfile.invalid || errors != '') {
        return;
    }

    const formData = new FormData();
    formData.append('user_id', this.loggedinUser?.id);
    formData.append('full_name', this.updateProfile.get('full_name')?.value);
    formData.append('email', this.updateProfile.get('email')?.value);
    formData.append('contact_number', this.updateProfile.get('contact_number')?.value);
    formData.append('street', this.updateProfile.get('street')?.value);
    formData.append('country', this.updateProfile.get('country')?.value);
    formData.append('city', this.updateProfile.get('city')?.value);
    formData.append('province_state', this.updateProfile.get('province_state')?.value);
    formData.append('post_code', this.updateProfile.get('post_code')?.value);
    formData.append('company_name', this.updateProfile.get('business_name')?.value);
    formData.append('business_number', this.updateProfile.get('business_number')?.value);
    formData.append('work_safety_number', this.updateProfile.get('work_safety_number')?.value ?? '');
    formData.append('profile_image', this.profileImage);


    formData.append('driver_desktop', 'yes');

    this.update_loading = true;
    this.user_service.updateUserProfile(formData).subscribe(response => {
        this.update_loading = false;
        if (response && response.status) {
            localStorage.setItem('TraggetUser', JSON.stringify(response.user));
            this.loggedinUser = response.user;
            this.updateForm();
            const swalWithBootstrapButtons = Swal.mixin({
                        customClass: {
                          confirmButton: 'btn bg-pink width-200'
                        },
                        buttonsStyling: false
                      })
                      swalWithBootstrapButtons.fire(
                        {

                          title:    'Success',
                          text:
                          'Profile Updated'
            }).then(() => {
                window.location.reload();
            });
        } else {
                  const swalWithBootstrapButtons = Swal.mixin({
                    customClass: {
                      confirmButton: 'btn bg-pink width-200'
                    },
                    buttonsStyling: false
                  })
                  swalWithBootstrapButtons.fire(
                    {

                      title:    'Error',
                      text:
                      response.message
                    }).then(() => {

                    });
                }
    });
}



  uploadimage(event:any) {
    let file = event.target.files[0];
    if(file){
      this.profileImage  =file;
      this.onSaveUser();
      // alert(file.name)
    }

  }

  onPassword(){
    this.passwordError = '';
    this.oldPasswordError = '';
    this.confirmPasswordError='';


    if(this.passwordForm.get('old_password')?.value == ""){
      this.oldPasswordError = 'Old Password is required';
    }


    if(this.passwordForm.get('new_password')?.value == ""){
      this.passwordError = 'New Password is required';
    }

    if(this.passwordForm.get('confirm_password')?.value == ""){
      this.confirmPasswordError = "Password Confirmation is required";
    }

    if(this.passwordForm.get('new_password')?.value != this.passwordForm.get('confirm_password')?.value){
      this.confirmPasswordError = "New Password and Confirm Password must be the same.";

      return;
    }

    if(this.atleast_eight || this.number_symbol_space || this.upper_lower){
      this.passwordError = "Please enter password according to given Instructions.";
      return;
    }

    if (this.passwordForm.invalid) {
      return;
    }

    const formData = new FormData();


    formData.append('user_id', this.loggedinUser?.id);
    formData.append('old_password', this.passwordForm.get('old_password')?.value);
    formData.append('password', this.passwordForm.get('new_password')?.value);
    this.password_loading = true;
    this.user_service.updatePassword(formData).subscribe(response => {
            this.password_loading = false;
            if(response && response.status){

              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'btn bg-pink width-200'
                },
                buttonsStyling: false
              })

              swalWithBootstrapButtons.fire(
                {

                  title:    'Success',
                  text:
                  response.message
                }).then(() => {
                  this.passwordForm.reset()
                });

            }else{
              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'btn bg-pink width-200'
                },
                buttonsStyling: false
              })

              swalWithBootstrapButtons.fire(
                {

                  title:    'Error',
                  text:
                  response.message
                }
                ).then(() => {

                });
            }
          });
        }


  checkPassword(event:any){
    this.atleast_eight = true;
    this.number_symbol_space = true;
    this.upper_lower = true;

    if(!event.target.value || event.target.value.length < 8){
      this.atleast_eight = true;
    }else{
      this.atleast_eight = false;
    }

    if(/(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]/.test(event.target.value)){
      this.upper_lower = false;
    }
    if(/(?=.*?[0-9])|(?=\s)|(?=.*?[#?!+_@$%^&*-])/.test(event.target.value)){
      this.number_symbol_space = false;
    }
    return
  }

  changeNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatPhoneNumber(p);
    // console.log(abc)
    this.updateProfile.get('contact_number')?.patchValue(abc);
  }


  changeBusinessNumber(event:any){

    let p:string = event.target.value;
    var charCode = (event.which) ? event.which : event.keyCode;

    let abc= this.formatBusinessNumber(p);
    this.updateProfile.get('business_number')?.patchValue(abc);
  }

  formatBusinessNumber(input:any) {

    // Remove all non-digit characters from the input
    input = input.replace(/\D/g, '');

    // Trim the remaining input to nine characters, to preserve phone number format
    input = input.substring(0, 9);

    // Based upon the length of the string, we add formatting as necessary
    const size = input.length;

    if (size === 0) {
      input = '';
    } else if (size < 3) {
      input = input; // No formatting for less than 3 digits
    } else if (size < 6) {
      input = input.substring(0, 3) + ' ' + input.substring(3);
    } else {
      input = input.substring(0, 3) + ' ' + input.substring(3, 6) + ' ' + input.substring(6);
    }

    return input;
  }

  formatPhoneNumber(input:any) {

    if(input.charAt(0) == '+'){
      // alert(input)
       input = input.substring(3, input.length);

    }
    input = input.replace(/\D/g,'');
    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0,10);

    // Based upon the length of the string, we add formatting as necessary
    var size = input.length;
    if(size == 0){
            input = input;
    }else if(size < 4){
            input = '+1 ('+input;
    }else if(size < 7){
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6);
    }else{
            input = '+1 ('+input.substring(0,3)+') '+input.substring(3,6)+' '+input.substring(6,10);
    }
    return input;
  }
  changeFull(event:any){
    if(event.target.value){
      this.updateProfile.get('full_name')?.patchValue(event.target.value);
    }
  }


onSaveTopic(): void {
  // Check if the form is invalid
  if (this.helpTopicForm.invalid) {
    this.topicError = 'Both fields are required';
    return;
  }

  // Clear the error message
  this.topicError = '';
  this.is_loading_topic = true;

  // Prepare the payload for the API request
  const topicData = {
    user_id: this.loggedinUser.id, // Replace with the dynamic user ID if required
    topic_title: this.helpTopicForm.value.topic_title,
    detail: this.helpTopicForm.value.detail
  };

  // Make the API call
  this.helpRequestService.createHelpTopic(topicData).subscribe(
    (response) => {
      console.log('Success:', response);
      this.is_loading_topic = false;

      // Add the new topic to the help_topics array
      // this.help_topics.push({
      //   id: response.data.id,  // Assuming the response contains the newly created topic's ID
      //   topic_title: response.data.topic_title,
      //   is_open: false // Default value for 'is_open'
      // });

      // Reset the form on success
      this.helpTopicForm.reset();
      this.fetchHelpTopics();
      this.hideModal();
    },
    (error) => {
      console.error('Error:', error);
      this.is_loading_topic = false;

      // Handle validation errors returned by the API
      if (error.status === 422) {
        const validationErrors = error.error.errors;
        if (validationErrors?.topic_title) {
          this.topicError = validationErrors.topic_title[0];
        } else if (validationErrors?.detail) {
          this.topicError = validationErrors.detail[0];
        } else {
          this.topicError = 'An error occurred while submitting the form.';
        }
      }
    }
  );
}


  hideModal(){
    this.current_modal = '';
  }

  showModal(modal:any){
    this.current_modal = modal;
  }

  fetchHelpTopics(): void {

    let user_id = this.loggedinUser?.id;
    this.helpRequestService.getHelpTopics(user_id).subscribe(
      (topics) => {
        const topicIds = topics.map((topic: any) => topic.id);

        this.helpRequestService.getHelpConversations(topicIds).subscribe(
          (conversations) => {

            this.help_topics = [];
            topics.forEach((topic: any) => {
              // const existingTopic = this.help_topics.find((t: any) => t.id === topic.id);

              // // Update existing topic or add a new one
              // if (existingTopic) {
              //   existingTopic.conversations = conversations
              //     .filter((conversation: any) => conversation.topic_id === topic.id)
              //     .sort(
              //       (a: any, b: any) =>
              //         new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              //     );
              // } else {
                this.help_topics.push({
                  ...topic,
                  conversations: conversations.filter(
                    (conversation: any) => conversation.topic_id === topic.id
                  ),
                });
              // }
            });
          },
          (error) => {
            console.error('Error fetching conversations:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching topics:', error);
      }
    );
  }

  toggleConversation(id: number): void {
    const topic = this.help_topics.find((t: any) => t.id === id);

    if (topic) {
      // Toggle the conversation open/closed regardless of its closed state
      this.open_conversation = this.open_conversation === id ? null : id;
      if(this.open_conversation){
        this.onConversationClick(0,this.open_conversation)
      }
    }
  }

  toggleWriteConversation(id: number): void {
    const topic = this.help_topics.find((t: any) => t.id === id);

    // Only allow writing if the conversation is not closed
    if (topic && topic.is_closed === 'NO') {
      this.write_conversation = this.write_conversation === id ? null : id;
    }
  }

  submitResponse(topicId: number): void {
    if (!this.responseText.trim()) {
        return; // Prevent empty responses
    }

    const responseData = {
        topic_id: topicId,
        user_id: this.loggedinUser?.id, // Replace with dynamic user ID
        text: this.responseText.trim(),
    };

    this.helpRequestService.createHelpConversation(responseData).subscribe(
        (response) => {
            // Find the topic and add the new response to the conversations
            const topic = this.help_topics.find((t: any) => t.id === topicId);
            // if (topic) {
            //     // Fetch updated conversations for this topic
            //     this.helpRequestService.getHelpConversations([topicId]).subscribe(
            //         (conversations) => {
            //             topic.conversations = conversations; // Update conversations
            //             topic.conversations.sort((a: any, b: any) =>
            //                 new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            //             ); // Ensure sorted order
            //             this.cdr.detectChanges(); // Trigger change detection
            //         },
            //         (error) => console.error('Error fetching updated conversations:', error)
            //     );
            // }

            this.fetchHelpTopics();

            this.responseText = ''; // Clear the response text
            this.write_conversation = null; // Close the response box
        },
        (error) => console.error('Error submitting response:', error)
    );
}
hasUnreadMessages(topic: any): boolean {
  return topic.conversations?.some((conversation: any) => conversation.admin_id && !conversation.is_read);
}

onConversationClick(conversationId: number, topicId: number): void {
  // Call the service to mark the conversation as read
  this.helpRequestService.markConversationAsRead(topicId).subscribe(
    () => {
      // Find the topic and conversation to update locally
      const topic = this.help_topics.find((t: any) => t.id === topicId);
      if (topic) {
        const conversation = topic.conversations.map((conversation: any)=>{

          if (conversation) {
            conversation.is_read = true; // Mark it as read locally
          }
        });
      }
    },
    (error) => {
      console.error('Error marking conversation as read:', error);
    }
  );
}


}


