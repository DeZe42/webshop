import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Product} from '../state/products/products.reducer';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  _http = inject(HttpClient)

  fetchAll(): Observable<Product[]> {
    if (typeof window === 'undefined') return of([]); // SSR safe
    return this._http.get<Product[]>('/products.json').pipe(
      catchError(err => {
        console.error('Products fetch error', err);
        return of([]);
      })
    );
  }
}
