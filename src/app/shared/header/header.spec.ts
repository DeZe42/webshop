import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { RouterModule } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { environment } from '@environments/environment';
import { provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;
  let keycloakMock: any;
  let keycloakSignalMock: jasmine.Spy;

  beforeEach(async () => {
    keycloakMock = { logout: jasmine.createSpy('logout') };
    keycloakSignalMock = jasmine.createSpy('keycloakSignal');

    (environment as any).useKeycloak = true;

    await TestBed.configureTestingModule({
      imports: [Header, RouterModule.forRoot([])],
      providers: [
        provideMockStore({
          initialState: {
            auth: { user: null, isAuthenticated: false, loading: false, error: null },
          },
        }),
        provideTranslateService(),
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize authenticated signal to false', () => {
    expect(component.authenticated()).toBeFalse();
  });

  it('should set authenticated signal to false on Keycloak AuthLogout event', () => {
    keycloakSignalMock.and.returnValue({ type: KeycloakEventType.AuthLogout, args: null });
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    expect(component.authenticated()).toBeFalse();
  });

  it('should call keycloak.logout on logout()', () => {
    component.logout();
    expect(keycloakMock.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
  });
});
