import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
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
    const cards = element.querySelectorAll('.bg-gray-900');
    expect(cards.length).toBe(3);

    expect(cards[0].textContent).toContain('Gyors vásárlás');
    expect(cards[1].textContent).toContain('Különböző termékek');
    expect(cards[2].textContent).toContain('Biztonságos fizetés');
  });
});
