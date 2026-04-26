import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { environment } from '@environments/environment';
import { signal } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { SeoService } from '../../../core/services/seo.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let keycloakMock: any;
  let keycloakEventSignal: ReturnType<typeof signal>;
  let keycloakSignalMock: jasmine.Spy;

  beforeEach(async () => {
    keycloakMock = { login: jasmine.createSpy('login') };
    (environment as any).useKeycloak = true;

    keycloakEventSignal = signal({ type: KeycloakEventType.AuthLogout, args: null });

    keycloakSignalMock = jasmine
      .createSpy('keycloakSignal')
      .and.callFake(() => keycloakEventSignal());

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideMockStore({
          initialState: {
            auth: { user: null, isAuthenticated: false, loading: false, error: null },
          },
        }),
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignalMock },
        { provide: SeoService, useValue: jasmine.createSpyObj('SeoService', ['setMeta']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have useKeycloak enabled', () => {
    expect(component).toBeTruthy();
    expect(component.useKeycloak).toBeTrue();
  });

  it('should call keycloak.login on loginWithKeycloak()', () => {
    component.loginWithKeycloak();
    expect(keycloakMock.login).toHaveBeenCalled();
  });

  it('should not throw when Keycloak Ready event fires', () => {
    keycloakEventSignal.set({ type: KeycloakEventType.Ready, args: true });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should not throw when Keycloak AuthLogout event fires', () => {
    keycloakEventSignal.set({ type: KeycloakEventType.AuthLogout, args: null });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should not call keycloak.login when Keycloak is not enabled', () => {
    (environment as any).useKeycloak = false;
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    component.loginWithKeycloak();
    expect(keycloakMock.login).not.toHaveBeenCalled();
  });
});
