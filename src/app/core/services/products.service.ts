import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private _http = inject(HttpClient);
  private _apiUrl = `${environment.apiUrl}/products`;

  /**
   * Összes termék lekérése (szűrési lehetőséggel)
   */
  getAll(type?: string, search?: string): Observable<Product[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this._http.get<Product[]>(this._apiUrl, { params }).pipe(
      catchError((err) => {
        console.error('Products fetch error', err);
        return of([]);
      }),
    );
  }

  /**
   * Egy termék lekérése ID alapján
   */
  getById(id: string): Observable<Product> {
    return this._http.get<Product>(`${this._apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Product fetch error', err);
        throw err;
      }),
    );
  }

  /**
   * Új termék létrehozása (admin only)
   */
  create(product: Partial<Product>): Observable<Product> {
    return this._http.post<Product>(this._apiUrl, product).pipe(
      catchError((err) => {
        console.error('Product create error', err);
        throw err;
      }),
    );
  }

  /**
   * Termék módosítása (admin only)
   */
  update(id: string, product: Partial<Product>): Observable<Product> {
    return this._http.patch<Product>(`${this._apiUrl}/${id}`, product).pipe(
      catchError((err) => {
        console.error('Product update error', err);
        throw err;
      }),
    );
  }

  /**
   * Termék törlése (admin only)
   */
  delete(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Product delete error', err);
        throw err;
      }),
    );
  }
}
