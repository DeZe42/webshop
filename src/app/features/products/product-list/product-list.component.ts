import {Component, inject, OnInit, signal} from '@angular/core';
import {Product} from '../product.interface';
import {ProductsService} from '../../../core/services/products.service';
import {CartService} from '../../../core/services/cart.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private _productsService = inject(ProductsService);
  private _cart = inject(CartService);
  private _router = inject(Router);
  products = signal<Product[]>([]);

  ngOnInit() {
    this._productsService.fetchAll().subscribe(data => this.products.set(data));
  }

  addToCart(product: Product) {
    this._cart.add({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }

  goToDetail(product: Product) {
    this._router.navigate(['/products', product.id]);
  }
}
