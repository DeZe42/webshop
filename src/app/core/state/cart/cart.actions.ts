import { createAction, props } from '@ngrx/store';
import { Product } from '../../../features/products/product.interface';

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ product: Product }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove From Cart',
  props<{ id: string }>()
);

export const clearCart = createAction('[Cart] Clear Cart');
