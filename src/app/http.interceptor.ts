import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { RequestCancellationService } from './services/request-cancellation.service'; // Import the cancellation service
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private cancellationService: RequestCancellationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Apply the takeUntil operator to each request
    return next.handle(req).pipe(
      takeUntil(this.cancellationService.getCancellationSignal()) // Cancel request if cancellation signal is emitted
    );
  }
}
