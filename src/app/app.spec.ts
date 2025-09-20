import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: { cart: { items: [] } } }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navbar with links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const nav = compiled.querySelector('nav');
    expect(nav).toBeTruthy();

    const links = nav?.querySelectorAll('a') || [];
    const linkTexts = Array.from(links).map((a) => a.textContent?.trim());

    expect(linkTexts).toContain('Főoldal');
    expect(linkTexts).toContain('Termékek');
    expect(linkTexts).toContain('Kosár');
  });

  it('should have a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
