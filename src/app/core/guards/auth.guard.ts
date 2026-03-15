import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import { LOGIN_PATH } from '../../app.routes';
import { environment } from '@environments/environment';
import { Store } from '@ngrx/store';
import { AuthSelectors } from '../state/auth';

export const authCanMatch = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const store = inject(Store);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (store.selectSignal(AuthSelectors.selectIsAuthenticated)()) {
    return true;
  }

  if (environment.useKeycloak) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, { optional: true });
    if (!keycloakSignal) {
      router.navigate([LOGIN_PATH]);
      return false;
    }

    let authenticated = false;
    const event = keycloakSignal();

    if (event.type === KeycloakEventType.Ready) {
      authenticated = typeEventArgs<ReadyArgs>(event.args);
    }

    if (authenticated) {
      return true;
    }
  }

  router.navigate([LOGIN_PATH]);
  return false;
};
