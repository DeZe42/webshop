import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { environment } from '@environments/environment';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private _seoService = inject(SeoService);
  authenticated = false;

  private readonly keycloak = environment.useKeycloak ? inject(Keycloak, { optional: true }) : null;
  private readonly keycloakSignal = environment.useKeycloak
    ? inject(KEYCLOAK_EVENT_SIGNAL, { optional: true })
    : null;

  constructor() {
    if (environment.useKeycloak && this.keycloakSignal) {
      effect(() => {
        if (this.keycloakSignal) {
          const keycloakEvent = this.keycloakSignal();
          if (keycloakEvent.type === KeycloakEventType.Ready) {
            this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
          }
          if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
            this.authenticated = false;
          }
        }
      });
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

  login() {
    if (this.keycloak) {
      this.keycloak.login();
    } else {
      console.warn('Keycloak nincs engedélyezve ebben a környezetben.');
    }
  }
}
