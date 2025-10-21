import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../../../core/models/product.model';
import { ProductsActions, ProductsSelectors } from '../../../core/state/products';

@Injectable({ providedIn: 'root' })
export class ProductDetailResolver implements Resolve<Product | null> {
  private _store = inject(Store);

  async resolve(route: ActivatedRouteSnapshot): Promise<Product | null> {
    const id = route.params['id'];
    this._store.dispatch(ProductsActions.loadProducts());
    const products = await firstValueFrom(
      this._store.select(ProductsSelectors.selectAllProducts).pipe(
        filter((p) => p.length > 0),
        catchError(() => of([])),
      ),
    );
    return products.find((p) => p.id === id) || null;
  }
}
