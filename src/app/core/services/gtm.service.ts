import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface GtmEvent {
  event: string;
  [key: string]: string | number | boolean | undefined | object;
}

declare global {
  interface Window {
    dataLayer: GtmEvent[];
  }
}

@Injectable({ providedIn: 'root' })
export class GtmService {
  private _platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      window.dataLayer = window.dataLayer || [];
    }
  }

  pushEvent(event: string, params?: Omit<GtmEvent, 'event'>) {
    window.dataLayer.push({ event, ...params });
  }
}
