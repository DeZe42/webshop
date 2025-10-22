import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSyncService } from './core/services/cart-sync.service';
import { SeoService } from './core/services/seo.service';
import { Header } from './shared/header/header';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  private _cartSync = inject(CartSyncService);
  private _seoService = inject(SeoService);
  private _platformId = inject(PLATFORM_ID);
  private _messageHandler = (event: MessageEvent) => {
    if (event.data?.type === 'CART_UPDATED') {
      console.log('Kosár frissült', event.data.data);
    }
  };
  isBrowser = isPlatformBrowser(this._platformId);

  public ngOnInit(): void {
    if (this.isBrowser) window.addEventListener('message', this._messageHandler);
    this._seoService.init();
  }

  public ngOnDestroy(): void {
    if (this.isBrowser) window.removeEventListener('message', this._messageHandler);
    this._seoService.destroy();
  }
}
