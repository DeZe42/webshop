import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  const mockKeycloakSignal = signal({ type: 'Init', args: null });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: () => mockKeycloakSignal(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initially not be authenticated', () => {
    expect(component.authenticated()).toBe(false);
  });

  it('should show login link if not authenticated', () => {
    const loginLink = fixture.debugElement
      .queryAll(By.css('a'))
      .find((el) => el.nativeElement.textContent.includes('Bejelentkezés'));
    expect(loginLink).toBeTruthy();
  });

  it('should reset authenticated signal on AuthLogout event', () => {
    mockKeycloakSignal.set({ type: KeycloakEventType.AuthLogout, args: null });
    fixture.detectChanges();

    expect(component.authenticated()).toBe(false);

    const loginLink = fixture.debugElement
      .queryAll(By.css('a'))
      .find((el) => el.nativeElement.textContent.includes('Bejelentkezés'));
    expect(loginLink).toBeTruthy();
  });
});
