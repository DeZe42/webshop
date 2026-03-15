import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

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
          const token = localStorage.getItem('access_token');
          const userJson = localStorage.getItem('user');
          if (token && userJson) {
            return AuthActions.initAuthSuccess({ user: JSON.parse(userJson), token });
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
            localStorage.setItem('access_token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }
          this.router.navigate(['/dashboard']);
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
