import { Routes } from '@angular/router';

export const PRODUCTS_PATH = 'products';
export const CART_PATH = 'cart';
export const LOGIN_PATH = 'login';
export const DASHBOARD_PATH = 'dashboard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: PRODUCTS_PATH,
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
  {
    path: CART_PATH,
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES),
  },
  {
    path: LOGIN_PATH,
    loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: DASHBOARD_PATH,
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
];
