import {Component, computed, inject, Input, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {ProductsSelectors} from '../../../core/state/products';
import {CartActions} from '../../../core/state/cart';
import {Product} from '../../../core/state/products/products.reducer';
import {CartItem} from '../../../core/state/cart/cart.reducer';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  private _route = inject(ActivatedRoute);
  private _store = inject(Store);
  private _id = this._route.snapshot.paramMap.get('id');

  product = computed<Product | undefined>(() => {
    const products = this._store.selectSignal(ProductsSelectors.selectAllProducts)();
    return products.find(p => p.id === this._id);
  });

  addToCart() {
    const product = this.product();
    if (product) {
      const item: CartItem = { ...product, quantity: 1 };
      this._store.dispatch(CartActions.addToCart({ item }));
    }
  }
}
