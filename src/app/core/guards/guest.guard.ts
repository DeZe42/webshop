import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import { DASHBOARD_PATH } from '../../app.routes';
import { environment } from '@environments/environment';
import { Store } from '@ngrx/store';
import { AuthSelectors } from '../state/auth';

export const guestGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const store = inject(Store);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const isAuthenticated = store.selectSignal(AuthSelectors.selectIsAuthenticated)();

  if (isAuthenticated) {
    return router.createUrlTree([DASHBOARD_PATH]);
  }

  if (environment.useKeycloak) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, { optional: true });
    if (!keycloakSignal) {
      return true;
    }

    let authenticated = false;
    const event = keycloakSignal();

    if (event.type === KeycloakEventType.Ready) {
      authenticated = typeEventArgs<ReadyArgs>(event.args);
    }

    if (authenticated) {
      return router.createUrlTree([DASHBOARD_PATH]);
    }
  }

  return true;
};
