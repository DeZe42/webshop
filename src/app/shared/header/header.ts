import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CART_PATH, DASHBOARD_PATH, LOGIN_PATH, PRODUCTS_PATH } from '../../app.routes';
import { RouterLink } from '@angular/router';
import { environment } from '@environments/environment';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthSelectors, AuthActions } from '../../core/state/auth';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  imports: [RouterLink, TranslatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly PRODUCTS_PATH = PRODUCTS_PATH;
  protected readonly CART_PATH = CART_PATH;
  protected readonly DASHBOARD_PATH = DASHBOARD_PATH;
  protected readonly LOGIN_PATH = LOGIN_PATH;

  private store = inject(Store);
  private keycloak = environment.useKeycloak ? inject(Keycloak, { optional: true }) : null;
  private translate = inject(TranslateService);

  authenticated = this.store.selectSignal(AuthSelectors.selectIsAuthenticated);
  currentLang = signal(this.translate.currentLang || 'hu');

  public logout(): void {
    this.store.dispatch(AuthActions.logout());
    if (environment.useKeycloak && this.keycloak) {
      void this.keycloak.logout({ redirectUri: window.location.origin });
    }
  }

  public switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }
}
