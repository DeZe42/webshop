import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class IdGeneratorService {
  private _platformId = inject(PLATFORM_ID);

  generate(): string {
    if (isPlatformBrowser(this._platformId) && typeof crypto !== 'undefined') {
      return crypto.randomUUID();
    }
    // SSR fallback: centralized random generation
    return `ssr-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}
