import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import * as ProductsActions from './products.actions';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private productsService = inject(ProductsService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(() =>
        this.productsService.getAll().pipe(
          map((products) => ProductsActions.loadProductsSuccess({ products })),
          catchError((error) =>
            of(ProductsActions.loadProductsFailure({ error: { message: error.message } })),
          ),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProduct),
      switchMap(({ product }) =>
        this.productsService.create(product).pipe(
          map((created) => ProductsActions.createProductSuccess({ product: created })),
          catchError((error) =>
            of(ProductsActions.createProductFailure({ error: { message: error.message } })),
          ),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.deleteProduct),
      switchMap(({ id }) =>
        this.productsService.delete(id).pipe(
          map(() => ProductsActions.deleteProductSuccess({ id })),
          catchError((error) =>
            of(ProductsActions.deleteProductFailure({ error: { message: error.message } })),
          ),
        ),
      ),
    ),
  );
}
