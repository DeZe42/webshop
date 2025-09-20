import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          console.error('HTTP Error', { url: req.url, status: err.status, message: err.message });
        } else {
          console.error('Unknown HTTP error', err);
        }
        // defensive: adjon vissza kontrollált hibát a komponenseknek
        return throwError(() => ({ message: 'Hálózati hiba történt', original: err }));
      }),
    );
  }
}
