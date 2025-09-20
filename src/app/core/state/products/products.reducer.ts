import { createReducer, on } from '@ngrx/store';
import * as ProductsActions from './products.actions';
import {Product} from '../../../features/products/product.interface';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: any;
}

export const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null
};

export const productsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProducts, state => ({ ...state, loading: true, error: null })),
  on(ProductsActions.loadProductsSuccess, (state, { products }) => ({ ...state, products, loading: false })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
