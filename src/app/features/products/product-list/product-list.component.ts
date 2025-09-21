import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProductsSelectors } from '../../../core/state/products';
import { CartActions } from '../../../core/state/cart';
import { Product } from '../../../core/state/products/products.reducer';
import { CartItem } from '../../../core/state/cart/cart.reducer';
import { SeoService } from '../../../core/services/seo.service';
import { CardComponent } from '../../../shared/card/card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  imports: [CardComponent],
})
export class ProductListComponent implements OnInit {
  private _store = inject(Store);
  private _router = inject(Router);
  private _seoService = inject(SeoService);

  products = this._store.selectSignal(ProductsSelectors.selectAllProducts);
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);

  filteredProducts = computed(() =>
    this.products().filter((product) => {
      const matchesName = product.name.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCategory = this.selectedCategory()
        ? product.type === this.selectedCategory()
        : true;
      return matchesName && matchesCategory;
    }),
  );

  public ngOnInit(): void {
    this._seoService.setMeta({
      title: 'Webshop – Termékek',
      description:
        'Böngéssz a Webshop termékei között – laptopok, telefonok, tabletek és kiegészítők.',
      keywords: 'webshop, laptop, telefon, tablet, kiegészítők',
      siteName: 'My Angular Webshop',
      image: '/assets/default-list-image.png',
      themeColor: '#ffffff',
    });
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
