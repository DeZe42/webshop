import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSyncService } from './core/services/cart-sync.service';
import { SeoService } from './core/services/seo.service';
import { HeaderComponent } from './shared/header/header.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private _cartSync = inject(CartSyncService);
  private _seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  public ngOnInit(): void {
    this._seoService.init();
  }

  public ngOnDestroy(): void {
    this._seoService.destroy();
  }
}
