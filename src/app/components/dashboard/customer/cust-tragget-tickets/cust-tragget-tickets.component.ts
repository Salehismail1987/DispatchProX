import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PlansService } from 'src/app/services/plans.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { chargebeeConfig } from 'src/chargebee-slabs-config';
declare var $: any;
declare var Chargebee: any;

@Component({
  selector: 'app-cust-tragget-tickets',
  templateUrl: './cust-tragget-tickets.component.html',
  styleUrls: ['./cust-tragget-tickets.component.css'],
})
export class CustTraggetTicketsComponent implements OnInit {
  active_menu: any;
  loggedInUser: any;
  is_subscribed: boolean = false;
  tragget_tickets: any;
  free_trial: any = null;
  slabs: any = chargebeeConfig.slabs;

  max_end: any = chargebeeConfig.max_end;
  upgrade_plan_quantity: any = 0;
  upgrade_plan_price: any = 0;
  menu_counts: any = {};

  active_tab: any = '10-pack';
  subscriptionForm!: FormGroup;
  tenPackForm!: FormGroup;

  tenPackError = '';
  subscriptionError = '';

  ten_pack_plan: any;
  subscription_plan: any;

  active_plan: any;

  ten_pack_qty: number = 1;
  subs_plan_qty: number = 25;
  free_trial_loading: boolean = false;

  is_expired: any = 'NO';
  is_loading_upgrade: boolean = false;
  is_loading_cancel: boolean = false;
  constructor(
    private router: Router,
    private aRouter: ActivatedRoute,
    private fb: FormBuilder,
    private user_service: UserDataService,
    private plan_service: PlansService
  ) {
    this.active_menu = {
      parent: 'tragget-tickets',
      child: 'tragget-tickets',
      count_badge: '',
    };
  }

  ngOnInit(): void {
    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');
    if (userDone && userDone.id) {
      this.loggedInUser = userDone;
    } else {
      this.router.navigate(['/home']);
    }

    var tt: any = sessionStorage.getItem('TraggetUserSub');

    if (tt && tt !== null) {
      let userSubs = this.user_service.decryptData(tt);
      this.is_subscribed = userSubs && userSubs == 'YES' ? true : false;
    } else {
      let data = {
        user_id: this.loggedInUser?.id
          ? this.loggedInUser?.id
          : this.loggedInUser?.user_data_request_id,
        account_type: userDone?.user_data_request_account_type
          ? userDone?.user_data_request_account_type
          : userDone?.account_type,
      };

      this.user_service.getSubStatus(data).subscribe((response) => {
        if (response.status) {
          if (response.is_valid == true) {
            this.is_subscribed = true;
            let datas: any = this.user_service.encryptData(this.is_subscribed);
            sessionStorage.setItem('TraggetUserSub', datas);
          } else {
          }
        }
      });
    }

    this.getTraggetTickets();
    let data = {
      user_id: this.loggedInUser?.id
        ? this.loggedInUser?.id
        : this.loggedInUser?.user_data_request_id,
      account_type: userDone?.user_data_request_account_type
        ? userDone?.user_data_request_account_type
        : userDone?.account_type,
    };

    var count: any = localStorage.getItem('TraggetUserMenuCounts');
    let counts = JSON.parse(count);

    if (counts && counts !== null && counts !== undefined) {
      this.menu_counts = counts;
      // console.log(this.menu_counts);
    } else {
      this.user_service.getMenuCounts(data).subscribe((response) => {
        if (response.status) {
          this.menu_counts = response.data;
          localStorage.setItem(
            'TraggetUserMenuCounts',
            JSON.stringify(this.menu_counts)
          );
        }
      });
    }
    this.getPlans();
    this.getTraggetTickets();

    // $(document).on('click','.openOptionModal', function(this:any) {
    //   $(this).closest('.modal-div').find('.option-modal').toggle('slow');
    // });
    $(document).on('click', '.btnaction', function (this: any) {
      $(this).closest('.option-modal').hide();
    });
    $(document).on('click', '.btndownarrow', function () {
      var subs_value = $('.subs-value').val();
      subs_value = parseInt(subs_value) - 25;
      $('.subs-value').val(subs_value);
      $('.subs-html').html(subs_value);
    });
    $(document).on('click', '.btnuparrow', function () {
      var subs_value = $('.subs-value').val();
      subs_value = parseInt(subs_value) + 25;
      $('.subs-value').val(subs_value);
      $('.subs-html').html(subs_value);
    });

    $(document).on('click', '.10-pack-click', function () {
      const cbInstance = Chargebee.init({
        site: 'tragget-test',
        isItemsModel: true, // Product catalog 2.0
      });
      const data = JSON.parse($('#user').html());

      var cart = cbInstance.getCart();
      var customer: any = {
        first_name: data.full_name,
        last_name: '',
        email: data.email,
        billing_address: {
          first_name: data.full_name,
          last_name: '',
          company: data.company,
          phone: data.phone,
          line1: '',
          line2: '',
        },
      };
      // Setting custom fields
      customer['cf_custom_field1'] = 'Custom field 1';
      cart.setCustomer(customer);
      var shippingAddress = {
        first_name: data.full_name,
        last_name: '',
        company: data.company,
        phone: data.phone,
        line1: '',
        line2: '',
      };
      cart.setShippingAddress(shippingAddress);
      var link = document.querySelectorAll(
        "[data-cb-item-0='10-tickets-package-CAD']"
      )[0];

      link.setAttribute('data-cb-item-0-quantity', '2');
      var link = document.querySelectorAll(
        "[data-cb-item-0='10-tickets-package-CAD']"
      )[0];

      var product = cbInstance.getProduct(link);
      if (product && product !== undefined) {
        product.setPlanQuantity($('.10-pack-click-quantity').val());

        product.items[0]['quantity'] = $('.10-pack-click-quantity').val();
        // console.log(product);
        cart.replaceProduct(product);
        cart.proceedToCheckout();
      }

      // const cart = cbInstance.getCart();
      //   const data = JSON.parse($("#user").html());
      //   const customer = data;
      //     cart.setCustomer(customer);
      // const product = cbInstance.initializeProduct("Pack---of---ten-USD-Monthly");
      // console.log(product);
      // product.setPlanQuantity(2);
      // console.log("After updating.");
      // console.log(product)
      // cart.replaceProduct(product);
      // console.log(cart);
      // cart.proceedToCheckout();
    });
  }

  ngAfterViewInit(): void {
    Chargebee.registerAgain();
  }

  showOptions() {
    setTimeout(() => {
      $('.modal-div').find('.option-modal').toggle('slow');
    }, 300);
  }

  getUserPlan() {
    const formData = new FormData();
    formData.append(
      'user_id',
      this.loggedInUser?.id
        ? this.loggedInUser?.id
        : this.loggedInUser?.user_data_request_id
    );
    this.plan_service.getUserPlan(formData).subscribe((response: any) => {
      if (response && response.status && response.data) {
        this.active_plan = response.data;
      }
    });
  }
  getPlans() {
    this.plan_service.getTraggetPlans({}).subscribe((response: any) => {
      if (response && response.status && response.data) {
        this.subscription_plan = response.data.subscription_plan;
        this.ten_pack_plan = response.data.ten_pack_plan;
        this.ten_pack_qty = 1;
        this.subs_plan_qty = 1 * 25;
        let qty = 1;
        this.subscriptionForm = this.fb.group({
          plan: [
            response.data.subscription_plan.plan_name,
            Validators.required,
          ],
          quantity: [1 * 25, Validators.required],
          priceItem: [
            response.data.subscription_plan.unit_price,
            Validators.required,
          ],
          totalPrice: [
            response.data.subscription_plan.unit_price * qty,
            Validators.required,
          ],
        });

        this.tenPackForm = this.fb.group({
          plan: [response.data.ten_pack_plan.plan_name, Validators.required],
          quantity: [1, Validators.required],
          tickets: [10],
          priceItem: [
            response.data.ten_pack_plan.unit_price,
            Validators.required,
          ],
          totalPrice: [
            response.data.ten_pack_plan.unit_price,
            Validators.required,
          ],
        });
      } else {
      }
    });
  }

  handleSubscription() {}
  setTab(tab: any) {
    this.active_tab = tab;
  }

  handleTenPack() {}

  handleTenPackChange(event: any) {
    let total = this.ten_pack_plan.unit_price * event.target.value;
    this.tenPackForm.get('totalPrice')?.patchValue(total);

    this.ten_pack_qty = event.target.value;
    this.tenPackForm.get('tickets')?.patchValue(event.target.value * 10);
  }

  // getDifForcast(){
  //   var diff= 0 ;

  //   diff= parseFloat(this.tragget_tickets?.usage?.total?.toString()) - (parseFloat(this.tragget_tickets?.usage?.used?.toString()) + (parseFloat(this.tragget_tickets?.usage?.left<1? this.tragget_tickets?.without_tragget_tickets?.toString() : 0)) + (this.menu_counts?.dispatched_tickets ? parseFloat(this.menu_counts?.dispatched_tickets?.toString()):0) + (this.menu_counts?.requests ? parseFloat(this.menu_counts?.requests?.toString()):0));
  //   return diff;
  // }

  getDifForcast() {
    var diff = 0;
    if (this.tragget_tickets?.subscription) {

      diff =
       (parseFloat(this.tragget_tickets?.individual_tickets?.toString())+ parseFloat(this.tragget_tickets?.usage?.total?.toString()) ) -
        ((this.tragget_tickets?.usage?.closed_tickets
          ? parseFloat(
              (
                this.tragget_tickets?.usage?.closed_tickets
              )?.toString()
            ) + parseFloat(
              (this.tragget_tickets?.usage?.left < 1 &&
                this.is_subscribed == true
                  ? this.tragget_tickets?.without_tragget_tickets
                  : 0).toString()
            )
          : 0) +
          (this.tragget_tickets?.usage?.dispatched
            ? parseFloat(this.tragget_tickets?.usage?.dispatched?.toString())
            : 0) +
          (this.tragget_tickets?.usage?.requests
            ? parseFloat(this.tragget_tickets?.usage?.requests?.toString())
            : 0));
    }
    if (!this.tragget_tickets?.subscription && parseFloat(this.tragget_tickets?.usage?.total?.toString())>0) {
      diff =
       (parseFloat(this.tragget_tickets?.individual_tickets?.toString())+ parseFloat(this.tragget_tickets?.usage?.total?.toString())) -
        (parseFloat(this.tragget_tickets?.closed_tickets.toString()) +
          parseFloat(this.tragget_tickets?.dispatched_tickets.toString()) +
          parseFloat(this.tragget_tickets?.request_tickets.toString()));
    }
    if (!this.tragget_tickets?.subscription && parseFloat(this.tragget_tickets?.usage?.total?.toString())<1) {
      diff =
       (parseFloat(this.tragget_tickets?.individual_tickets?.toString())+ parseFloat(this.tragget_tickets?.closed_tickets?.toString())) -
        (parseFloat(this.tragget_tickets?.closed_tickets.toString()) +
          parseFloat(this.tragget_tickets?.dispatched_tickets.toString()) +
          parseFloat(this.tragget_tickets?.request_tickets.toString()));
    }
    return diff;
  }

  handleSubsDefault() {
    // let qty = this.tragget_tickets?.subscription_upgrade?.quantity / 25;
    let qty = (this.upgrade_plan_quantity? this.upgrade_plan_quantity:this.tragget_tickets?.usage?.total_subs) / 25;

    var total_price = 0;
    for (var i = 1; i <= qty; i++) {
      let qty_check = i * 25;
      var slab_price = null;
      var slabb = null;
      this.slabs.map((slab: any) => {
        if (qty_check >= slab.start && qty_check <= slab.end) {
          slab_price = 25 * slab.price;
          slabb = slab;
        }
      });
      if (!slab_price) {
        slab_price = this.max_end;
      }
      total_price += slab_price;
    }
    this.tragget_tickets.usage.total_upgrade_subs_price =
      total_price.toFixed(2);
  }
  getTraggetTickets() {
    const formData = new FormData();
    formData.append(
      'user_id',
      this.loggedInUser?.id
        ? this.loggedInUser?.id
        : this.loggedInUser?.user_data_request_id
    );
    this.plan_service.getTraggetTickets(formData).subscribe((response) => {
      if (response.status && response.data) {
        this.tragget_tickets = response.data;
        // console.log(' this is the tragger tickets : ', this.tragget_tickets);
        var total_units = this.tragget_tickets?.usage?.total_subs;

        var qty = total_units / 25;
        var total_price = 0;
        for (var i = 1; i <= qty; i++) {
          let qty_check = i * 25;
          var slab_price = null;
          var slabb = null;
          this.slabs.map((slab: any) => {
            if (qty_check >= slab.start && qty_check <= slab.end) {
              slab_price = 25 * slab.price;
              slabb = slab;
            }
          });
          if (!slab_price) {
            slab_price = this.max_end;
          }
          total_price += slab_price;
        }

        this.tragget_tickets.usage.total_subs_price = total_price.toFixed(2);

        /* added after TM-661 */
        if (
          this.tragget_tickets?.subscription_upgrade &&
          this.tragget_tickets.subscription_upgrade?.subscription_upgrade
            ?.quantity
        ) {
          // this.tragget_tickets.subscription_upgrade.quantity = total_units;
          this.upgrade_plan_quantity = total_units;
        } else {
          // this.tragget_tickets.subscription_upgrade.quantity = total_units;
          this.upgrade_plan_quantity = total_units;
        }
        /* end of comment */

        var total_units: any = 0;
        if (this.tragget_tickets?.subscription_upgrade?.quantity) {
          parseFloat(
            this.tragget_tickets?.subscription_upgrade?.quantity?.toString()
          );
        } else {
          this.tragget_tickets?.usage?.total_subs;
        }

        var qty = total_units / 25;
        var total_price = 0;
        for (var i = 1; i <= qty; i++) {
          let qty_check = i * 25;
          var slab_price = null;
          var slabb = null;
          this.slabs.map((slab: any) => {
            if (qty_check >= slab.start && qty_check <= slab.end) {
              slab_price = 25 * slab.price;
              slabb = slab;
            }
          });
          if (!slab_price) {
            slab_price = this.max_end;
          }
          total_price += slab_price;
        }

        this.tragget_tickets.usage.total_upgrade_subs_price =
          total_price.toFixed(2);

        this.is_subscribed = response.data?.is_subscribed;
        let formData: any = {
          user_id: this.loggedInUser?.id
            ? this.loggedInUser?.id
            : this.loggedInUser?.user_data_request_id,
        };

        this.plan_service
          .checkFreeTrial(formData)
          .subscribe((response: any) => {
            if (response && response.data) {
              this.free_trial = response.data.is_free_trial;
              this.is_expired = response.data.is_expired;
            } else {
              this.free_trial = 'NO';
              this.is_expired = response?.data?.is_expired
                ? response?.data?.is_expired
                : 'NO';
            }
            if (this.is_subscribed && this.free_trial == 'NO') {
              this.router.navigate(['/cust-tragget-tickets']);
            } else if (
              !this.is_subscribed &&
              this.free_trial == 'NO' &&
              this.is_expired == 'NO'
            ) {
              this.router.navigate(['/cust-tragget-plans']);
            }
          });
      } else {
      }
    });
  }

  handleCancel() {
    setTimeout(() => {
      $('.option-modal').hide();
    }, 300);
    let formData: any = {
      user_id: this.loggedInUser?.id
        ? this.loggedInUser?.id
        : this.loggedInUser?.user_data_request_id,
    };
    this.is_loading_cancel = true;
    this.plan_service
      .cancelSubscription(formData)
      .subscribe((response: any) => {
        this.is_loading_cancel = false;
        if (response && response.status) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding',
            },
            buttonsStyling: false,
          });
          swalWithBootstrapButtons
            .fire(`Success!`, response.message)
            .then(() => {
              this.upgrade_plan_price = 0;
              this.upgrade_plan_quantity = 0;
              this.getTraggetTickets();
              $('#increaseSubs').modal('hide');
            });
        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding',
            },
            buttonsStyling: false,
          });
          swalWithBootstrapButtons
            .fire(`Error!`, response.message)
            .then(() => {});
        }
      });
  }

  confirmUpgrade() {
    if (this.upgrade_plan_quantity < 1) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'mybtn mybtn-back-yellow mybtn-padding',
        },
        buttonsStyling: false,
      });
      swalWithBootstrapButtons
        .fire(`Warning!`, 'For upgrading quantity cannot be 0.')
        .then(() => {});
      return;
    }
    let formData: any = {
      user_id: this.loggedInUser?.id
        ? this.loggedInUser?.id
        : this.loggedInUser?.user_data_request_id,
      quantity: this.upgrade_plan_quantity,
    };
    this.is_loading_upgrade = true;
    this.plan_service
      .upgradeSubscription(formData)
      .subscribe((response: any) => {
        this.is_loading_upgrade = false;
        if (response && response.status) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding',
            },
            buttonsStyling: false,
          });
          swalWithBootstrapButtons
            .fire(`Success!`, response.message)
            .then(() => {
              this.upgrade_plan_price = 0;
              this.upgrade_plan_quantity = 0;
              this.getTraggetTickets();
              $('#increaseSubs').modal('hide');
            });
        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'mybtn mybtn-back-yellow mybtn-padding',
            },
            buttonsStyling: false,
          });
          swalWithBootstrapButtons
            .fire(`Warning!`, response.message)
            .then(() => {});
        }
      });
  }

  closeCancelOption() {
    setTimeout(() => {
      $('.option-modal').hide();
    }, 300);
  }
  handleSubsChange(event: any) {
    let qty = event.target.value / 25;
    var total_price = 0;
    for (var i = 1; i <= qty; i++) {
      let qty_check = i * 25;
      var slab_price = null;
      var slabb = null;
      this.slabs.map((slab: any) => {
        if (qty_check >= slab.start && qty_check <= slab.end) {
          slab_price = 25 * slab.price;
          slabb = slab;
        }
      });
      if (!slab_price) {
        slab_price = this.max_end;
      }
      total_price += slab_price;
      // console.log(slabb, slab_price, total_price);
    }
    this.upgrade_plan_price = total_price.toFixed(2);
    this.subs_plan_qty = event.target.value;
    this.upgrade_plan_quantity = event.target.value;

    this.tragget_tickets.usage.total_upgrade_subs_price =
      total_price.toFixed(2);
    this.subscriptionForm.get('totalPrice')?.patchValue(total_price.toFixed(2));
  }

  parseF(i:any){
    i = parseFloat(i);
    return i;
  }

}
