import { createReducer, on } from '@ngrx/store';
import { CartState } from './cart.model';
import * as CartActions from './cart.actions';

export const initialState: CartState = { items: [] };

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addItem, (state, { item }) => {
    const existing = state.items.find(i => i.id === item.id);
    let items;
    if (existing) {
      items = state.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      items = [...state.items, item];
    }
    return { ...state, items };
  }),
  on(CartActions.removeItem, (state, { id }) => ({
    ...state,
    items: state.items.filter(i => i.id !== id)
  })),
  on(CartActions.clearCart, state => ({ ...state, items: [] }))
);
