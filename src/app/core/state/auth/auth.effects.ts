import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function isStoredUser(value: unknown): value is StoredUser {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['email'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['role'] === 'string'
  );
}

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      map(() => {
        if (isPlatformBrowser(this.platformId)) {
          const token = sessionStorage.getItem('access_token');
          const userJson = sessionStorage.getItem('user');
          if (token && userJson) {
            try {
              const parsed: unknown = JSON.parse(userJson);
              if (isStoredUser(parsed)) {
                return AuthActions.initAuthSuccess({ user: parsed, token });
              }
            } catch {
              sessionStorage.removeItem('user');
              sessionStorage.removeItem('access_token');
            }
          }
        }
        return { type: '[Auth] Init Auth No Session' };
      }),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) =>
            AuthActions.loginSuccess({ user: response.user, token: response.access_token }),
          ),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.error?.message || 'Bejelentkezési hiba történt',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('access_token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
          }
          void this.router.navigate(['/dashboard']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('user');
          }
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
