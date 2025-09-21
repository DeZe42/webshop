import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { CardComponent } from './card.component';
import { Product } from '../../core/state/products/products.reducer';
import { CartActions } from '../../core/state/cart';
import { ProductsActions } from '../../core/state/products';
import { ComponentRef } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let componentRef: ComponentRef<CardComponent>;
  let fixture: ComponentFixture<CardComponent>;
  let store: MockStore;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: '1',
    name: 'Laptop Test',
    price: 1000,
    type: 'laptop',
    ramGb: 16,
    cpu: 'i7',
    os: 'Windows',
    screenInch: 15.6,
    description: 'Test laptop',
    image: 'test.jpg',
    keywords: ['gaming', 'ultrabook'],
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [provideMockStore(), { provide: Router, useValue: routerSpy }],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('product', mockProduct);
    componentRef.setInput('isDashboard', false);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch addToCart action when addToCart is called', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    component.addToCart(mockProduct);

    expect(dispatchSpy).toHaveBeenCalledWith(
      CartActions.addToCart({ item: { ...mockProduct, quantity: 1 } }),
    );
  });

  it('should navigate to product detail when goToDetail is called', () => {
    component.goToDetail(mockProduct);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products', mockProduct.id]);
  });

  it('should dispatch deleteProduct action when deleteProduct is called', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    component.deleteProduct(mockProduct.id);

    expect(dispatchSpy).toHaveBeenCalledWith(ProductsActions.deleteProduct({ id: mockProduct.id }));
  });

  it('should render product name, price, and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockProduct.name);
    expect(compiled.textContent).toContain(mockProduct.price.toString());
    expect(compiled.textContent).toContain(mockProduct.description);
  });
});
