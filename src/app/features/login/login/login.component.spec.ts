import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { environment } from '@environments/environment';
import { signal } from '@angular/core';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
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
      imports: [LoginComponent],
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component with authenticated false', () => {
    expect(component).toBeTruthy();
    expect(component.authenticated).toBeFalse();
  });

  it('should call keycloak.login on login()', () => {
    component.login();
    expect(keycloakMock.login).toHaveBeenCalled();
  });

  it('should set authenticated to true on Keycloak Ready event', () => {
    keycloakEventSignal.set({ type: KeycloakEventType.Ready, args: true });
    fixture.detectChanges();

    expect(component.authenticated).toBeTrue();
  });

  it('should set authenticated to false on Keycloak AuthLogout event', () => {
    keycloakEventSignal.set({ type: KeycloakEventType.AuthLogout, args: null });
    expect(component.authenticated).toBeFalse();
  });

  it('should warn if Keycloak is not enabled', () => {
    (environment as any).useKeycloak = false;
    spyOn(console, 'warn');
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    component.login();
    expect(console.warn).toHaveBeenCalledWith('Keycloak nincs engedélyezve ebben a környezetben.');
  });
});
