import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private keycloak = inject(KeycloakService);

  async canActivate(): Promise<boolean> {
    const authenticated = await this.keycloak.isLoggedIn();

    if (!authenticated) {
      // Ha nincs bejelentkezve, irányítsd a login oldalra
      await this.keycloak.login({ redirectUri: window.location.href });
      return false;
    }

    return true;
  }
}
