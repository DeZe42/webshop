import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ConsentService } from './consent.service';

const CONSENT_KEY = 'cookie_consent';

describe('ConsentService', () => {
  beforeEach(() => localStorage.clear());

  describe('in browser', () => {
    let service: ConsentService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(ConsentService);
    });

    it('should start with no decision', () => {
      expect(service.hasDecided()).toBeFalse();
      expect(service.analyticsAllowed()).toBeFalse();
      expect(service.marketingAllowed()).toBeFalse();
    });

    it('should set hasDecided and allow all after acceptAll', () => {
      service.acceptAll();
      expect(service.hasDecided()).toBeTrue();
      expect(service.analyticsAllowed()).toBeTrue();
      expect(service.marketingAllowed()).toBeTrue();
    });

    it('should set hasDecided but deny analytics/marketing after rejectAll', () => {
      service.rejectAll();
      expect(service.hasDecided()).toBeTrue();
      expect(service.analyticsAllowed()).toBeFalse();
      expect(service.marketingAllowed()).toBeFalse();
    });

    it('should persist accepted consent to localStorage', () => {
      service.acceptAll();
      const raw = localStorage.getItem(CONSENT_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed['version']).toBe('1');
      expect(parsed['state']['analytics']).toBeTrue();
      expect(parsed['state']['marketing']).toBeTrue();
    });

    it('should persist rejected consent to localStorage', () => {
      service.rejectAll();
      const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY)!);
      expect(parsed['state']['analytics']).toBeFalse();
      expect(parsed['state']['marketing']).toBeFalse();
    });

    it('should load previously accepted consent from localStorage', () => {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          state: { analytics: true, marketing: true, functional: true },
          version: '1',
          timestamp: Date.now(),
        }),
      );
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const loaded = TestBed.inject(ConsentService);
      expect(loaded.hasDecided()).toBeTrue();
      expect(loaded.analyticsAllowed()).toBeTrue();
    });

    it('should ignore stored record with a different version', () => {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          state: { analytics: true, marketing: true, functional: true },
          version: '0',
          timestamp: Date.now(),
        }),
      );
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const loaded = TestBed.inject(ConsentService);
      expect(loaded.hasDecided()).toBeFalse();
    });

    it('should handle corrupted localStorage without throwing', () => {
      localStorage.setItem(CONSENT_KEY, 'not-valid-json{{{');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      expect(() => TestBed.inject(ConsentService)).not.toThrow();
      expect(TestBed.inject(ConsentService).hasDecided()).toBeFalse();
    });

    it('should call gtag consent update with granted on acceptAll', () => {
      const gtagSpy = jasmine.createSpy('gtag');
      (window as unknown as Record<string, unknown>)['gtag'] = gtagSpy;
      service.acceptAll();
      expect(gtagSpy).toHaveBeenCalledWith(
        'consent',
        'update',
        jasmine.objectContaining({ analytics_storage: 'granted', ad_storage: 'granted' }),
      );
      delete (window as unknown as Record<string, unknown>)['gtag'];
    });

    it('should call gtag consent update with denied on rejectAll', () => {
      const gtagSpy = jasmine.createSpy('gtag');
      (window as unknown as Record<string, unknown>)['gtag'] = gtagSpy;
      service.rejectAll();
      expect(gtagSpy).toHaveBeenCalledWith(
        'consent',
        'update',
        jasmine.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied' }),
      );
      delete (window as unknown as Record<string, unknown>)['gtag'];
    });
  });

  describe('on server platform', () => {
    it('should not read localStorage', () => {
      spyOn(localStorage, 'getItem');
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      TestBed.inject(ConsentService);
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });

    it('should not write to localStorage on acceptAll', () => {
      spyOn(localStorage, 'setItem');
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      TestBed.inject(ConsentService).acceptAll();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
