import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestCancellationService {
  private cancelRequest$ = new Subject<void>(); // Subject to emit cancellation signal

  constructor(private router: Router) {
    // Listen for route change events and emit cancellation signal
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.cancelRequests(); // Cancel requests on route change
      }
    });
  }

  // Emit cancellation signal to cancel ongoing requests
  cancelRequests() {
    this.cancelRequest$.next();
  }

  // Return the cancellation observable
  getCancellationSignal() {
    return this.cancelRequest$.asObservable();
  }
}
