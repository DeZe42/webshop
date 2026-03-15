import { createAction, props } from '@ngrx/store';
import { Product } from '../../models/product.model';

export interface ProductError {
  message: string;
  code?: number;
}

export const loadProducts = createAction('[Products] Load Products');
export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: Product[] }>(),
);
export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: ProductError | null }>(),
);
export const addProduct = createAction('[Products] Add Product', props<{ product: Product }>());

export const deleteProduct = createAction('[Products] Delete Product', props<{ id: string }>());
export const deleteProductSuccess = createAction(
  '[Products] Delete Product Success',
  props<{ id: string }>(),
);
export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ error: ProductError | null }>(),
);

export const createProduct = createAction(
  '[Products] Create Product',
  props<{ product: Partial<Product> }>(),
);
export const createProductSuccess = createAction(
  '[Products] Create Product Success',
  props<{ product: Product }>(),
);
export const createProductFailure = createAction(
  '[Products] Create Product Failure',
  props<{ error: ProductError | null }>(),
);
