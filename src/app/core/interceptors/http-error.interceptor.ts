import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          this.logger.error('HTTP Error', { url: req.url, status: err.status, message: err.message });
        } else {
          this.logger.error('Unknown HTTP error', err);
        }
        // defensive: adjon vissza kontrollált hibát a komponenseknek
        return throwError(() => ({ message: 'Hálózati hiba történt', original: err }));
      })
    );
  }
}
