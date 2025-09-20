import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {Store} from '@ngrx/store';
import {ProductsActions, ProductsSelectors} from '../../../core/state/products';
import {CartActions} from '../../../core/state/cart';
import {Product} from '../../../core/state/products/products.reducer';
import {CartItem} from '../../../core/state/cart/cart.reducer';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
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
    const item: CartItem = { ...product, quantity: 1 };
    this._store.dispatch(CartActions.addToCart({ item }));
  }

  goToDetail(product: Product) {
    this._router.navigate(['/products', product.id]);
  }
}
