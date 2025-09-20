import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CartActions, CartSelectors } from '../../../core/state/cart';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let store: MockStore;

  const mockItems = [
    { id: '1', name: 'Laptop A', price: 1000, quantity: 2 },
    { id: '2', name: 'Phone B', price: 500, quantity: 1 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: CartSelectors.selectCartItems, value: mockItems },
            { selector: CartSelectors.selectCartTotal, value: 2500 },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const itemElements = compiled.querySelectorAll('h3');
    expect(itemElements.length).toBe(mockItems.length);
    expect(itemElements[0].textContent).toContain('Laptop A');
    expect(itemElements[1].textContent).toContain('Phone B');
  });

  it('should display total', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const totalEl = compiled.querySelector('p.text-xl');
    expect(totalEl?.textContent).toContain('2500');
  });

  it('should dispatch removeFromCart on remove', () => {
    const spy = spyOn(store, 'dispatch');
    component.remove('1');
    expect(spy).toHaveBeenCalledWith(CartActions.removeFromCart({ id: '1' }));
  });

  it('should dispatch clearCart on clear', () => {
    const spy = spyOn(store, 'dispatch');
    component.clear();
    expect(spy).toHaveBeenCalledWith(CartActions.clearCart());
  });
});
