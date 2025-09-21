import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../core/state/products/products.reducer';
import { loadProductsSuccess } from '../../../core/state/products/products.actions';
import { ProductsService } from '../../../core/services/products.service';

@Injectable({ providedIn: 'root' })
export class ProductListResolver implements Resolve<Product[] | null> {
  private _http = inject(HttpClient);
  private _store = inject(Store);
  private _productsService = inject(ProductsService);

  resolve(): Promise<Product[] | null> {
    return firstValueFrom(
      this._productsService.getAll().pipe(
        map((products) => {
          this._store.dispatch(loadProductsSuccess({ products }));
          return products;
        }),
        catchError((err) => {
          console.error('Product fetch failed', err);
          return of(null);
        }),
      ),
    );
  }
}
