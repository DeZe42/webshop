import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { Home } from './home';

const huTranslations = {
  HOME: {
    TITLE: 'Üdvözöl a Webshop!',
    SUBTITLE: 'Nézd meg a legújabb termékeinket, add a kosaradhoz, és élvezd a gyors vásárlást!',
    FAST_SHOPPING: 'Gyors vásárlás',
    FAST_SHOPPING_DESC: 'Könnyen hozzáadhatod termékeinket a kosaradhoz néhány kattintással.',
    VARIETY: 'Különböző termékek',
    VARIETY_DESC: 'Laptopok, telefonok, tabletek – mind megtalálod nálunk egy helyen.',
    SECURE_PAYMENT: 'Biztonságos fizetés',
    SECURE_PAYMENT_DESC: 'Minden tranzakció gyors és biztonságos. Vásárolj nyugodtan!',
  },
};

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let element: HTMLElement;
  const seoSpy = jasmine.createSpyObj('SeoService', ['setMeta']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideTranslateService({ defaultLanguage: 'hu' }),
        { provide: SeoService, useValue: seoSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('hu', huTranslations);
    translateService.use('hu');

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title', () => {
    const title = element.querySelector('h1')!;
    expect(title.textContent).toContain('Üdvözöl a Webshop!');
  });

  it('should render description paragraph', () => {
    const paragraph = element.querySelector('p')!;
    expect(paragraph.textContent).toContain('Nézd meg a legújabb termékeinket');
  });

  it('should render 3 feature cards', () => {
    const cards = element.querySelectorAll('.bg-gray-900');
    expect(cards.length).toBe(3);

    expect(cards[0].textContent).toContain('Gyors vásárlás');
    expect(cards[1].textContent).toContain('Különböző termékek');
    expect(cards[2].textContent).toContain('Biztonságos fizetés');
  });
});
