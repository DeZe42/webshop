import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsentService } from '../../core/services/consent.service';

@Component({
  selector: 'app-consent-banner',
  standalone: true,
  templateUrl: './consent-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentBanner {
  private _consentService = inject(ConsentService);

  readonly hasDecided = this._consentService.hasDecided;

  acceptAll(): void {
    this._consentService.acceptAll();
  }

  rejectAll(): void {
    this._consentService.rejectAll();
  }
}
