import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ConsentBanner } from './consent-banner';
import { ConsentService } from '../../core/services/consent.service';

function makeService(hasDecided: boolean) {
  return jasmine.createSpyObj<ConsentService>('ConsentService', ['acceptAll', 'rejectAll'], {
    hasDecided: signal(hasDecided),
  });
}

describe('ConsentBanner', () => {
  let fixture: ComponentFixture<ConsentBanner>;
  let element: HTMLElement;
  let serviceSpy: jasmine.SpyObj<ConsentService>;

  async function setup(hasDecided: boolean) {
    serviceSpy = makeService(hasDecided);
    await TestBed.configureTestingModule({
      imports: [ConsentBanner],
      providers: [{ provide: ConsentService, useValue: serviceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ConsentBanner);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  describe('when the user has not decided yet', () => {
    beforeEach(async () => setup(false));

    it('should render the banner', () => {
      expect(element.querySelector('[role="dialog"]')).not.toBeNull();
    });

    it('should show cookie consent text', () => {
      expect(element.textContent).toContain('Cookie-k és adatvédelem');
    });

    it('should call acceptAll when the accept button is clicked', () => {
      (element.querySelectorAll('button')[1] as HTMLButtonElement).click();
      expect(serviceSpy.acceptAll).toHaveBeenCalledTimes(1);
    });

    it('should call rejectAll when the reject button is clicked', () => {
      (element.querySelectorAll('button')[0] as HTMLButtonElement).click();
      expect(serviceSpy.rejectAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the user has already decided', () => {
    beforeEach(async () => setup(true));

    it('should not render the banner', () => {
      expect(element.querySelector('[role="dialog"]')).toBeNull();
    });
  });
});
