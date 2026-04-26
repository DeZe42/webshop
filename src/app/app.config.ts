import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { productsReducer } from './core/state/products';
import { cartReducer } from './core/state/cart';
import { authReducer } from './core/state/auth';
import { ProductsEffects } from './core/state/products/products.effects';
import { AuthEffects } from './core/state/auth/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideKeycloakAngular } from '../../keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideKeycloakAngular(),
    provideTranslateService({ fallbackLang: 'hu' }),
    ...provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    provideHttpClient(
      withInterceptors([authInterceptor]), // JWT interceptor
    ),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      StoreModule.forRoot({ cart: cartReducer, products: productsReducer, auth: authReducer }),
      EffectsModule.forRoot([ProductsEffects, AuthEffects]),
      StoreDevtoolsModule.instrument({ maxAge: 25 }),
    ),
  ],
};
