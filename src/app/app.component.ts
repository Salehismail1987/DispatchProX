import { Component } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

declare var $: any;

declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tragget';


  constructor(
    private router: Router,
    ){
        this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        )
        .subscribe(event => {
          // "event" here is now of type "NavigationEnd"
        //   gtag('event', 'page_view', {
        //     page_path: event.urlAfterRedirects
        // })
        });

      //   $(document).on('click','#sidebarCollapse', function() {
      //     if($('#sidebar').hasClass('active')){
      //         $('#sidebar').removeClass('active');
      //     }else{

      //         $('#sidebar').addClass('active');
      //     }

      // });
  }

  ngOnInit(): void {
    this.checkDeviceAndRedirect();
  }

  checkDeviceAndRedirect(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|android|blackberry|mobile|windows phone/.test(userAgent);
    const isTablet = /ipad|tablet/.test(userAgent);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects;
        var width = window.innerWidth;
        if ((isMobile || width <= 768) &&  !currentRoute.includes('success-plan') &&   !currentRoute.includes('success-plan-single-tickets')) {
          window.location.href = environment.mobileDashboardURL;
        }
      }
    });

  }
}
