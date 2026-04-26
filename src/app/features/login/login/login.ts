import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { environment } from '@environments/environment';
import { SeoService } from '../../../core/services/seo.service';
import * as AuthActions from '../../../core/state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../core/state/auth/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private _seoService = inject(SeoService);
  private _store = inject(Store);

  email = '';
  password = '';
  useKeycloak = environment.useKeycloak;

  loading = toSignal(this._store.select(selectAuthLoading), { initialValue: false });
  error = toSignal(this._store.select(selectAuthError), { initialValue: null });

  private readonly keycloak = environment.useKeycloak ? inject(Keycloak, { optional: true }) : null;
  private readonly keycloakSignal = environment.useKeycloak
    ? inject(KEYCLOAK_EVENT_SIGNAL, { optional: true })
    : null;

  constructor() {
    if (environment.useKeycloak && this.keycloakSignal) {
      // keycloak signal effect handled externally if needed
    }
  }

  public ngOnInit(): void {
    this._seoService.setMeta({
      title: 'Webshop – Bejelentkezés',
      description:
        'Ezen az oldalon bejelentkezhetsz a Webshop fiókodba, hogy hozzáférj az admin felülethez.',
      keywords: 'bejelentkezés, irányítópúlt, termékek',
      siteName: 'My Angular Webshop',
      image: '/assets/default-list-image.png',
      themeColor: '#ffffff',
    });
  }

  loginWithJwt(): void {
    if (!this.email || !this.password) return;
    this._store.dispatch(
      AuthActions.login({ credentials: { email: this.email, password: this.password } }),
    );
  }

  loginWithKeycloak(): void {
    if (this.keycloak) {
      void this.keycloak.login();
    }
  }
}
