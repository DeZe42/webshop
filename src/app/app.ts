import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSyncService } from './core/services/cart-sync.service';
import { SeoService } from './core/services/seo.service';
import { Header } from './shared/header/header';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthActions } from './core/state/auth';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@environments/environment';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  private _store = inject(Store);
  private _cartSync = inject(CartSyncService);
  private _seoService = inject(SeoService);
  private _translate = inject(TranslateService);
  private _platformId = inject(PLATFORM_ID);
  private _messageHandler = (event: MessageEvent) => {
    if (event.data?.type === 'CART_UPDATED') {
      console.log('Kosár frissült', event.data.data);
    }
  };
  isBrowser = isPlatformBrowser(this._platformId);

  constructor() {
    const savedLang = this.isBrowser ? (localStorage.getItem('lang') ?? 'hu') : 'hu';
    this._translate.use(savedLang);

    if (environment.useKeycloak && this.isBrowser) {
      const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, { optional: true });
      const keycloak = inject(Keycloak, { optional: true });

      if (keycloakSignal && keycloak) {
        effect(() => {
          const event = keycloakSignal();
          if (event.type === KeycloakEventType.Ready) {
            const authenticated = typeEventArgs<ReadyArgs>(event.args);
            if (authenticated) {
              const parsed = keycloak.tokenParsed;
              this._store.dispatch(
                AuthActions.initAuthSuccess({
                  user: {
                    id: parsed?.['sub'] ?? '',
                    email: parsed?.['email'] ?? '',
                    name: parsed?.['name'] ?? parsed?.['preferred_username'] ?? '',
                    role: parsed?.['realm_access']?.['roles']?.[0] ?? 'user',
                  },
                  token: keycloak.token ?? '',
                }),
              );
            }
          }
        });
      }
    }
  }

  public ngOnInit(): void {
    this._store.dispatch(AuthActions.initAuth());
    if (this.isBrowser) window.addEventListener('message', this._messageHandler);
    this._seoService.init();
  }

  public ngOnDestroy(): void {
    if (this.isBrowser) window.removeEventListener('message', this._messageHandler);
    this._seoService.destroy();
  }
}
