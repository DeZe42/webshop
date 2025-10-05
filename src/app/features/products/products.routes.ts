import { Routes } from '@angular/router';
import { ProductList } from './product-list/product-list';
import { ProductDetail } from './product-detail/product-detail';
import { ProductDetailResolver } from './resolvers/product-detail.resolver';
import { ProductListResolver } from './resolvers/product-list.resolver';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductList, resolve: { product: ProductListResolver } },
  { path: ':id', component: ProductDetail, resolve: { product: ProductDetailResolver } },
];
