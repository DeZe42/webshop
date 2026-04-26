import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '@environments/environment';

const HTTP_TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private _http = inject(HttpClient);
  private _apiUrl = `${environment.apiUrl}/products`;

  getAll(type?: string, search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (search) params = params.set('search', search);

    return this._http.get<Product[]>(this._apiUrl, { params }).pipe(
      timeout(HTTP_TIMEOUT_MS),
      retry({ count: MAX_RETRIES, delay: (_, attempt) => timer(Math.pow(2, attempt) * 500) }),
      catchError((err: unknown) => {
        console.error('Products fetch error', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Product> {
    return this._http.get<Product>(`${this._apiUrl}/${id}`).pipe(
      timeout(HTTP_TIMEOUT_MS),
      retry({ count: MAX_RETRIES, delay: (_, attempt) => timer(Math.pow(2, attempt) * 500) }),
      catchError((err: unknown) => {
        console.error('Product fetch error', err);
        return throwError(() => err);
      }),
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    return this._http.post<Product>(this._apiUrl, product).pipe(
      timeout(HTTP_TIMEOUT_MS),
      catchError((err: unknown) => {
        console.error('Product create error', err);
        return throwError(() => err);
      }),
    );
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this._http.patch<Product>(`${this._apiUrl}/${id}`, product).pipe(
      timeout(HTTP_TIMEOUT_MS),
      catchError((err: unknown) => {
        console.error('Product update error', err);
        return throwError(() => err);
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`).pipe(
      timeout(HTTP_TIMEOUT_MS),
      catchError((err: unknown) => {
        console.error('Product delete error', err);
        return throwError(() => err);
      }),
    );
  }
}
