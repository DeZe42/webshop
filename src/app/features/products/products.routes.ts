import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductDetailResolver } from './resolvers/product-detail.resolver';
import { ProductListResolver } from './resolvers/product-list.resolver';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductListComponent, resolve: { product: ProductListResolver } },
  { path: ':id', component: ProductDetailComponent, resolve: { product: ProductDetailResolver } },
];
