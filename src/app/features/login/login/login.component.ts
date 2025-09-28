import { Component, effect, inject } from '@angular/core';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
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

  login() {
    if (this.keycloak) {
      this.keycloak.login();
    } else {
      console.warn('Keycloak nincs engedélyezve ebben a környezetben.');
    }
  }
}
