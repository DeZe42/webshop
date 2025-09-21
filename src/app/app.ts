import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartSyncService } from './core/services/cart-sync.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private _cartSync = inject(CartSyncService);
  private _seoService = inject(SeoService);

  public ngOnInit(): void {
    this._seoService.init();
  }

  public ngOnDestroy(): void {
    this._seoService.destroy();
  }
}
