import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { Signal, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

type KeycloakEvent = {
  type: KeycloakEventType;
  args?: unknown;
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockKeycloak: { login: jasmine.Spy };
  let mockSignal: Signal<KeycloakEvent>;

  beforeEach(async () => {
    mockKeycloak = jasmine.createSpyObj<Keycloak>('Keycloak', ['login']);
    mockSignal = signal({ type: KeycloakEventType.Ready, args: true });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: () => mockSignal },
        { provide: Keycloak, useValue: mockKeycloak },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
