import { Component, effect, inject, signal } from '@angular/core';
import { CART_PATH, DASHBOARD_PATH, LOGIN_PATH, PRODUCTS_PATH } from '../../app.routes';
import { RouterLink } from '@angular/router';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [RouterLink],
})
export class HeaderComponent {
  protected readonly PRODUCTS_PATH = PRODUCTS_PATH;
  protected readonly CART_PATH = CART_PATH;
  protected readonly DASHBOARD_PATH = DASHBOARD_PATH;
  protected readonly LOGIN_PATH = LOGIN_PATH;
  private keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  authenticated = signal(false);
  private keycloak = inject(Keycloak);

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();
      if (event.type === KeycloakEventType.Ready) {
        this.authenticated.set(typeEventArgs<ReadyArgs>(event.args));
      }
      if (event.type === KeycloakEventType.AuthLogout) {
        this.authenticated.set(false);
      }
    });
  }

  public logout(): void {
    this.keycloak.logout({ redirectUri: window.location.href });
  }
}
