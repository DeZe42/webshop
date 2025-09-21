import { inject, Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

const isValidMetaContent = (content: string | null | undefined): content is string => {
  return content !== null && content !== undefined && content !== '';
};

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly keywords: string;
  readonly siteName: string;
  readonly image: string;
  readonly themeColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  destroy$ = new Subject<void>();
  private _title = inject(Title);
  private _meta = inject(Meta);

  public init(): void {
    this.setMeta({
      title: 'Webshop',
      description: 'Welcome to our webshop',
    });
  }

  public destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setMeta(overridedMeta: Partial<PageMeta>): void {
    const meta: PageMeta = {
      title: overridedMeta.title ?? 'Webshop',
      description: overridedMeta.description ?? 'Welcome to our webshop',
      keywords: overridedMeta.keywords ?? 'webshop, angular',
      siteName: overridedMeta.siteName ?? 'My Angular Webshop',
      image: overridedMeta.image ?? '/assets/default-image.png',
      themeColor: overridedMeta.themeColor ?? '#ffffff',
    };

    this._title.setTitle(meta.title);

    this.updateTag({
      name: 'theme-color',
      content: meta.themeColor,
    });
    this.updateTag({
      name: 'description',
      content: meta.description,
    });
    this.updateTag({
      name: 'keywords',
      content: meta.keywords,
    });
    this.updateTag({
      name: 'og:title',
      property: 'og:title',
      content: meta.title,
    });
    this.updateTag({
      name: 'og:image',
      property: 'og:image',
      content: meta.image,
    });
    this.updateTag({
      name: 'og:image:secure_url',
      property: 'og:image:secure_url',
      content: meta.image,
    });
    this.updateTag({
      name: 'og:description',
      property: 'og:description',
      content: meta.description,
    });
    this.updateTag({
      name: 'og:site_name',
      property: 'og:site_name',
      content: meta.siteName,
    });
    this.updateTag({
      name: 'twitter:site',
      content: meta.siteName,
    });
    this.updateTag({
      name: 'twitter:title',
      content: meta.title,
    });
    this.updateTag({
      name: 'twitter:description',
      content: meta.description,
    });
    this.updateTag({
      name: 'twitter:image',
      content: meta.image,
    });
  }

  private updateTag(tag: MetaDefinition): void {
    if (!isValidMetaContent(tag.content)) {
      return;
    }

    this._meta.updateTag(tag);
  }
}
