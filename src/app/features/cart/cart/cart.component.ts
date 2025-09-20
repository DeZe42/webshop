import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import * as CartSelectors from '../../../core/state/cart/cart.selectors';
import * as CartActions from '../../../core/state/cart/cart.actions';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
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
