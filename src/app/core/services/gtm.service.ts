import { Injectable } from '@angular/core';

export interface GtmEvent {
  event: string;
  [key: string]: string | number | boolean | undefined | object; // opcionális extra paraméterek
}

declare global {
  interface Window {
    dataLayer: GtmEvent[];
  }
}

@Injectable({ providedIn: 'root' })
export class GtmService {
  constructor() {
    window.dataLayer = window.dataLayer || [];
  }

  pushEvent(event: string, params?: Omit<GtmEvent, 'event'>) {
    window.dataLayer.push({ event, ...params });
  }
}
