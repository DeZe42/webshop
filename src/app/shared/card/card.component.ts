import { Component, inject, input } from '@angular/core';
import { Product } from '../../core/state/products/products.reducer';
import { CartItem } from '../../core/state/cart/cart.reducer';
import { CartActions } from '../../core/state/cart';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ProductsActions } from '../../core/state/products';

@Component({
  selector: 'app-card',
  standalone: true,
  styles: [
    `
      :host {
        display: flex;
      }
    `,
  ],
  templateUrl: './card.component.html',
})
export class CardComponent {
  private _store = inject(Store);
  private _router = inject(Router);
  product = input<Product>();
  isDashboard = input<boolean>();

  addToCart(product: Product): void {
    const item: CartItem = { ...product, quantity: 1 };
    this._store.dispatch(CartActions.addToCart({ item }));
  }

  goToDetail(product: Product): void {
    this._router.navigate(['/products', product.id]);
  }

  deleteProduct(id: string) {
    this._store.dispatch(ProductsActions.deleteProduct({ id }));
  }
}
