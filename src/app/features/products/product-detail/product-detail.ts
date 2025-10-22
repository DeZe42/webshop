import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartActions } from '../../../core/state/cart';
import { CartItem } from '../../../core/state/cart/cart.reducer';
import { SeoService } from '../../../core/services/seo.service';
import { Product } from '../../../core/models/product.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit {
  private _store = inject(Store);
  private _seoService = inject(SeoService);
  private _route = inject(ActivatedRoute);
  product = signal<Product | null>(null);

  public ngOnInit(): void {
    this.product.set(this._route.snapshot.data['product']);
    const product = this.product();
    // type narrowing
    if (!product) return;

    switch (product.type) {
      case 'laptop':
        console.log(product.ramGb);
        break;

      case 'phone':
        console.log(product.os);
        break;

      case 'accessory':
        console.log(product.compatibleWith);
        break;
    }

    if (this.product()) {
      this._seoService.setMeta({
        title: this.product()?.name,
        description: this.product()?.description,
        image: this.product()?.image,
        siteName: 'My Angular Webshop',
        keywords: this.product()?.keywords.join(', '),
        themeColor: '#ffffff',
      });
    }
  }

  addToCart() {
    const product = this.product();
    if (product) {
      const item: CartItem = { ...product, quantity: 1 };
      this._store.dispatch(CartActions.addToCart({ item }));
    }
  }
}
