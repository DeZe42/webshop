import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CartItem } from '../../core/state/cart/cart.reducer';
import { CartActions } from '../../core/state/cart';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ProductsActions } from '../../core/state/products';
import { GtmService } from '../../core/services/gtm.service';
import { Product } from '../../core/models/product.model';

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
  templateUrl: './card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class Card {
  private _store = inject(Store);
  private _router = inject(Router);
  private _gtmService = inject(GtmService);
  product = input<Product>();
  isDashboard = input<boolean>();

  addToCart(product: Product): void {
    const item: CartItem = { ...product, quantity: 1 };
    this._store.dispatch(CartActions.addToCart({ item }));
    this._gtmService.pushEvent('add_to_cart', {
      product_id: product.id,
      name: product.name,
      price: product.price,
    });
    window.postMessage({ type: 'CART_UPDATED', data: product }, '*');
  }

  goToDetail(product: Product): void {
    this._router.navigate(['/products', product.id]);
  }

  deleteProduct(id: string) {
    this._store.dispatch(ProductsActions.deleteProduct({ id }));
  }
}
