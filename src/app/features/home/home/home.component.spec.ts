import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title', () => {
    const title = element.querySelector('h1')!;
    expect(title.textContent).toContain('Üdvözöl a Webshop!');
  });

  it('should render description paragraph', () => {
    const paragraph = element.querySelector('p')!;
    expect(paragraph.textContent).toContain('Nézd meg a legújabb termékeinket');
  });

  it('should render 3 feature cards', () => {
    const cards = element.querySelectorAll('.bg-orange-500');
    expect(cards.length).toBe(3);

    expect(cards[0].textContent).toContain('Gyors vásárlás');
    expect(cards[1].textContent).toContain('Különböző termékek');
    expect(cards[2].textContent).toContain('Biztonságos fizetés');
  });
});
