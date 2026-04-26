import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _http = inject(HttpClient);
  private _platformId = inject(PLATFORM_ID);
  private _apiUrl = `${environment.apiUrl}/auth`;

  register(data: RegisterDto): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(`${this._apiUrl}/register`, data);
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(`${this._apiUrl}/login`, data);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this._platformId)) {
      return sessionStorage.getItem('access_token');
    }
    return null;
  }
}
