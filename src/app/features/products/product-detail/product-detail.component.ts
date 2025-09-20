import {Component, inject, Input, signal} from '@angular/core';
import {Product} from '../product.interface';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import * as CartActions from '../../../core/state/cart/cart.actions';
import * as ProductsSelectors from '../../../core/state/products/products.selectors';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  private _route = inject(ActivatedRoute);
  private _store = inject(Store);

  product = signal<Product | undefined>(undefined);

  constructor() {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._store.select(ProductsSelectors.selectAllProducts)
        .subscribe(products => {
          this.product.set(products.find(p => p.id === id));
        });
    }
  }

  addToCart() {
    const product = this.product();
    if (product) {
      this._store.dispatch(CartActions.addToCart({ product }));
    }
  }
}
