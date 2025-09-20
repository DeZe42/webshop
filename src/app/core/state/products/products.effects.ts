import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ProductsActions from './products.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private productsService = inject(ProductsService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      mergeMap(() =>
        this.productsService.fetchAll().pipe(
          map((products) => ProductsActions.loadProductsSuccess({ products })),
          catchError((error) => of(ProductsActions.loadProductsFailure({ error }))),
        ),
      ),
    ),
  );
}
