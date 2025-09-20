import {Component, inject, Input, signal} from '@angular/core';
import {Product} from '../product.interface';
import {CartService} from '../../../core/services/cart.service';
import {ActivatedRoute} from '@angular/router';
import {ProductsService} from '../../../core/services/products.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  private _route = inject(ActivatedRoute);
  private _productsService = inject(ProductsService);
  private _cart = inject(CartService);

  product = signal<Product | undefined>(undefined);

  constructor() {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._productsService.fetchAll().subscribe(products => {
        this.product.set(products.find(p => p.id === id));
      });
    }
  }

  addToCart() {
    const product = this.product();
    if (!product) return;
    this._cart.add({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }
}
