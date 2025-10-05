import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartActions, CartSelectors } from '../../../core/state/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  private _store = inject(Store);

  items = this._store.selectSignal(CartSelectors.selectCartItems);
  total = this._store.selectSignal(CartSelectors.selectCartTotal);

  remove(id: string) {
    this._store.dispatch(CartActions.removeFromCart({ id }));
  }

  clear() {
    this._store.dispatch(CartActions.clearCart());
  }
}
