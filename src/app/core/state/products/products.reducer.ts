import { createReducer, on } from '@ngrx/store';
import * as ProductsActions from './products.actions';
import { ProductError } from './products.actions';

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'laptop' | 'phone' | 'tablet';
  ramGb: number;
  cpu: string;
  screenSizeInch: number;
  os: string;
  screenInch: number;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: ProductError | null;
}

export const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const productsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProducts, (state) => ({ ...state, loading: true, error: null })),
  on(ProductsActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
  })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
