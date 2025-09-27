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

export const authCanMatch = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  let authenticated = false;
  const event = keycloakSignal();
  if (event.type === KeycloakEventType.Ready) {
    authenticated = typeEventArgs<ReadyArgs>(event.args);
  }

  if (!authenticated) {
    router.navigate([LOGIN_PATH]);
    return false;
  }

  return true;
};
