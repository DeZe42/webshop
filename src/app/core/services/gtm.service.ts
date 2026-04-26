import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';
import { IdGeneratorService } from './id-generator.service';

export type GtmEventParams = Record<string, string | number | boolean | undefined | object>;

declare global {
  interface Window {
    dataLayer: object[];
  }
}

@Injectable({ providedIn: 'root' })
export class GtmService {
  private _platformId = inject(PLATFORM_ID);
  private _idGenerator = inject(IdGeneratorService);

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      window.dataLayer = window.dataLayer || [];
    }
  }

  pushEvent(event: string, params?: GtmEventParams): void {
    if (!isPlatformBrowser(this._platformId)) return;
    window.dataLayer.push({
      event,
      event_id: this._idGenerator.generate(),
      timestamp: new Date().toISOString(),
      app_version: environment.appVersion,
      env: environment.production ? 'production' : 'development',
      ...params,
    });
  }
}
