import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './shared/header/header.component';
import { RouterOutlet } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { App } from './app';
import { provideMockStore } from '@ngrx/store/testing';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HeaderComponent, RouterOutlet, RouterTestingModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: () => signal({ type: 'Ready', args: true }),
        },
        provideMockStore({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should show header on browser', () => {
    component.isBrowser = true;
    fixture.detectChanges();

    const headerEl = fixture.nativeElement.querySelector('app-header');
    expect(headerEl).toBeTruthy();
  });

  it('should not show header on server', () => {
    component.isBrowser = false;
    fixture.detectChanges();

    const headerEl = fixture.nativeElement.querySelector('app-header');
    expect(headerEl).toBeFalsy();
  });
});
