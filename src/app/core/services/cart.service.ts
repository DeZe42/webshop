import {computed, inject, Injectable, signal} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {CartItem} from '../state/cart.model';
import * as CartActions from '../state/cart.actions';
import * as CartSelectors from '../state/cart.selectors';

@Injectable({ providedIn: 'root' })
export class CartService {
  store = inject(Store)
  private _items = signal<CartItem[]>([]);
  private _total = computed(() => this._items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  readonly items = this._items;
  readonly total = this._total;

  constructor() {
    this.store.pipe(select(CartSelectors.selectCartItems))
      .subscribe(items => this._items.set(items));
  }

  add(item: CartItem) {
    this.store.dispatch(CartActions.addItem({ item }));
  }

  remove(id: string) {
    this.store.dispatch(CartActions.removeItem({ id }));
  }

  clear() {
    this.store.dispatch(CartActions.clearCart());
  }
}
