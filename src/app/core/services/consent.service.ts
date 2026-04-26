import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface ConsentRecord {
  state: ConsentState;
  version: string;
  timestamp: number;
}

const CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = '1';

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== 'object' || value === null) return false;
  const rec = value as Record<string, unknown>;
  const state = rec['state'];
  return (
    typeof rec['version'] === 'string' &&
    typeof rec['timestamp'] === 'number' &&
    typeof state === 'object' &&
    state !== null &&
    typeof (state as Record<string, unknown>)['analytics'] === 'boolean' &&
    typeof (state as Record<string, unknown>)['marketing'] === 'boolean' &&
    typeof (state as Record<string, unknown>)['functional'] === 'boolean'
  );
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private _platformId = inject(PLATFORM_ID);

  private _state = signal<ConsentState | null>(null);

  readonly hasDecided = computed(() => this._state() !== null);
  readonly analyticsAllowed = computed(() => this._state()?.analytics ?? false);
  readonly marketingAllowed = computed(() => this._state()?.marketing ?? false);

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      this._loadFromStorage();
      this._applyConsentMode();
    }
  }

  acceptAll(): void {
    this._save({ analytics: true, marketing: true, functional: true });
  }

  rejectAll(): void {
    this._save({ analytics: false, marketing: false, functional: false });
  }

  private _save(state: ConsentState): void {
    this._state.set(state);
    if (isPlatformBrowser(this._platformId)) {
      const record: ConsentRecord = {
        state,
        version: CONSENT_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    }
    this._applyConsentMode();
  }

  private _loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (isConsentRecord(parsed) && parsed.version === CONSENT_VERSION) {
        this._state.set(parsed.state);
      }
    } catch {
      // corrupted storage entry — banner shows again on next visit
    }
  }

  private _applyConsentMode(): void {
    if (!isPlatformBrowser(this._platformId) || typeof window.gtag !== 'function') return;
    const state = this._state();
    if (state === null) {
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    } else {
      window.gtag('consent', 'update', {
        ad_storage: state.marketing ? 'granted' : 'denied',
        analytics_storage: state.analytics ? 'granted' : 'denied',
        ad_user_data: state.marketing ? 'granted' : 'denied',
        ad_personalization: state.marketing ? 'granted' : 'denied',
      });
    }
  }
}
