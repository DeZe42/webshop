import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeoService } from './core/services/seo.service';
import { CartSyncService } from './core/services/cart-sync.service';
import { PLATFORM_ID } from '@angular/core';
import { Header } from './shared/header/header';
import { RouterModule, RouterOutlet } from '@angular/router';
import { App } from './app';

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let seoServiceSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SeoService', ['init', 'destroy']);

    await TestBed.configureTestingModule({
      imports: [RouterOutlet, Header, RouterModule.forRoot([])],
      providers: [
        { provide: CartSyncService, useValue: {} },
        { provide: SeoService, useValue: spy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    seoServiceSpy = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect browser platform', () => {
    expect(component.isBrowser).toBeTrue();
  });

  it('should call seoService.init on ngOnInit', () => {
    component.ngOnInit();
    expect(seoServiceSpy.init).toHaveBeenCalled();
  });

  it('should call seoService.destroy on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(seoServiceSpy.destroy).toHaveBeenCalled();
  });
});
