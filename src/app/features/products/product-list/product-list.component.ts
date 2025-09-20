import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Product } from '../product.interface';
import { Router } from '@angular/router';
import * as ProductsActions from '../../../core/state/products/products.actions';
import * as ProductsSelectors from '../../../core/state/products/products.selectors';
import * as CartActions from '../../../core/state/cart/cart.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private _store = inject(Store);
  private _router = inject(Router);

  products = this._store.selectSignal(ProductsSelectors.selectAllProducts);
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);

  filteredProducts = computed(() =>
    this.products().filter(product => {
      const matchesName = product.name.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCategory = this.selectedCategory() ? product.type === this.selectedCategory() : true;
      return matchesName && matchesCategory;
    })
  );

  ngOnInit() {
    this._store.dispatch(ProductsActions.loadProducts());
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
  }

  updateCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  addToCart(product: Product) {
    this._store.dispatch(CartActions.addToCart({ product }));
  }

  goToDetail(product: Product) {
    this._router.navigate(['/products', product.id]);
  }
}
