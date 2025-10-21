import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartActions, CartSelectors } from '../../../core/state/cart';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit {
  private _store = inject(Store);
  private _seoService = inject(SeoService);

  items = this._store.selectSignal(CartSelectors.selectCartItems);
  total = this._store.selectSignal(CartSelectors.selectCartTotal);

  public ngOnInit(): void {
    this._seoService.setMeta({
      title: 'Webshop – Kosár',
      description: 'Ellenőrizd a kosarad tartalmát és folytasd a vásárlást nálunk.',
      keywords: 'laptop, tablet, phone, cart, kosár',
      siteName: 'My Angular Webshop',
      image: '/assets/default-list-image.png',
      themeColor: '#ffffff',
    });
  }

  remove(id: string) {
    this._store.dispatch(CartActions.removeFromCart({ id }));
  }

  clear() {
    this._store.dispatch(CartActions.clearCart());
  }
}
