import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterModule } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { environment } from '@environments/environment';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let keycloakMock: any;
  let keycloakSignalMock: jasmine.Spy;

  beforeEach(async () => {
    keycloakMock = { logout: jasmine.createSpy('logout') };
    keycloakSignalMock = jasmine.createSpy('keycloakSignal');

    (environment as any).useKeycloak = true;

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterModule.forRoot([])],
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
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
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    expect(component.authenticated()).toBeFalse();
  });

  it('should call keycloak.logout on logout()', () => {
    component.logout();
    expect(keycloakMock.logout).toHaveBeenCalledWith({ redirectUri: window.location.href });
  });
});
