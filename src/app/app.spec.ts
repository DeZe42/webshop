import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './shared/header/header.component';
import { RouterOutlet } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { App } from './app';
import { provideMockStore } from '@ngrx/store/testing';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import { RouterTestingModule } from '@angular/router/testing';
import Keycloak from 'keycloak-js';

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
        {
          provide: Keycloak,
          useValue: {
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
          },
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
});
