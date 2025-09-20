import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export const initialState: CartState = {
  items: []
};

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addToCart, (state, { product }) => {
    const existing = state.items.find(i => i.id === product.id);
    let items;
    if (existing) {
      items = state.items.map(i =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      items = [...state.items, { ...product, quantity: 1 }];
    }
    return { ...state, items };
  }),
  on(CartActions.removeFromCart, (state, { id }) => ({
    ...state,
    items: state.items.filter(i => i.id !== id)
  })),
  on(CartActions.clearCart, state => ({
    ...state,
    items: []
  }))
);
