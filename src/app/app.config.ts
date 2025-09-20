import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { cartReducer } from './core/state/cart/cart.reducer';
import { provideHttpClient } from '@angular/common/http';
import { ProductsEffects } from './core/state/products/products.effects';
import { productsReducer } from './core/state/products/products.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      StoreModule.forRoot({ cart: cartReducer, products: productsReducer }),
      EffectsModule.forRoot([ProductsEffects]),
      StoreDevtoolsModule.instrument({ maxAge: 25 }),
    ),
  ],
};
