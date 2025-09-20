import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';
import { Product } from '../products/products.reducer';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export const initialState: CartState = { items: [] };

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addToCart, (state, { item }) => {
    const existing = state.items.find((i) => i.id === item.id);
    return {
      ...state,
      items: existing
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...state.items, item],
    };
  }),
  on(CartActions.removeFromCart, (state, { id }) => ({
    ...state,
    items: state.items.filter((i) => i.id !== id),
  })),
  on(CartActions.clearCart, (state) => ({ ...state, items: [] })),
);
