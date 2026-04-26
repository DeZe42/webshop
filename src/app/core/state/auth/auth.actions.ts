import { createAction, props } from '@ngrx/store';
import { AuthResponse, LoginDto } from '../../services/auth.service';

export const initAuth = createAction('[Auth] Init Auth');
export const initAuthSuccess = createAction(
  '[Auth] Init Auth Success',
  props<{ user: AuthResponse['user']; token: string }>(),
);

export const login = createAction('[Auth] Login', props<{ credentials: LoginDto }>());
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthResponse['user']; token: string }>(),
);
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
