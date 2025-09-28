import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CartSelectors, CartActions } from '../../../core/state/cart';
import { CartState } from '../../../core/state/cart/cart.reducer';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let store: MockStore;

  const initialState: CartState = {
    items: [
      {
        id: '1',
        name: 'Test Laptop',
        price: 1000,
        type: 'laptop',
        ramGb: 16,
        cpu: 'Intel i7',
        os: 'Windows 11',
        screenInch: 15.6,
        description: 'A powerful laptop',
        image: 'image.jpg',
        keywords: ['tech', 'laptop'],
        quantity: 2,
      },
      {
        id: '2',
        name: 'Phone',
        price: 500,
        type: 'laptop',
        ramGb: 16,
        cpu: 'Intel i7',
        os: 'Windows 11',
        screenInch: 15.6,
        description: 'A powerful laptop',
        image: 'image.jpg',
        keywords: ['tech', 'laptop'],
        quantity: 1,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(CartSelectors.selectCartItems, initialState.items);
    store.overrideSelector(CartSelectors.selectCartTotal, 2500);

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should select items from store', () => {
    const items = component.items();
    expect(items.length).toBe(2);
    expect(items[0].name).toBe('Test Laptop');
    expect(items[1].name).toBe('Phone');
  });

  it('should select total from store', () => {
    const total = component.total();
    expect(total).toBe(2500);
  });

  it('should dispatch removeFromCart action', () => {
    const spy = spyOn(store, 'dispatch');
    component.remove('1');
    expect(spy).toHaveBeenCalledWith(CartActions.removeFromCart({ id: '1' }));
  });

  it('should dispatch clearCart action', () => {
    const spy = spyOn(store, 'dispatch');
    component.clear();
    expect(spy).toHaveBeenCalledWith(CartActions.clearCart());
  });

  it('should render items correctly in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const itemTitles = compiled.querySelectorAll('h3');
    expect(itemTitles.length).toBe(2);
    expect(itemTitles[0].textContent).toContain('Laptop');
    expect(itemTitles[1].textContent).toContain('Phone');

    const subtotalTexts = compiled.querySelectorAll('p.font-semibold');
    expect(subtotalTexts[0].textContent).toContain('2000');
    expect(subtotalTexts[1].textContent).toContain('500');
  });

  it('should render total correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const totalEl = compiled.querySelector('p.text-xl.font-bold');
    expect(totalEl?.textContent).toContain('2500');
  });
});
