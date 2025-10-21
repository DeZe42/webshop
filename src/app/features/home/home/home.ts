import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private _seoService = inject(SeoService);

  public ngOnInit(): void {
    this._seoService.setMeta({
      title: 'Webshop – Főoldal',
      description: 'Laptopok, telefonok, tabletek – mind megtalálod nálunk egy helyen.',
      keywords: 'laptop, tablet, phone',
      siteName: 'My Angular Webshop',
      image: '/assets/default-list-image.png',
      themeColor: '#ffffff',
    });
  }
}
