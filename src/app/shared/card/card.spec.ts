import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from './card';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { GtmService } from '../../core/services/gtm.service';
import { CartActions } from '../../core/state/cart';
import { ProductsActions } from '../../core/state/products';
import { Product } from '../../core/state/products/products.reducer';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Card', () => {
  let fixture: ComponentFixture<Card>;
  let component: Card;
  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let gtmSpy: jasmine.SpyObj<GtmService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Laptop',
    price: 999,
    type: 'laptop',
    ramGb: 16,
    cpu: 'Intel i7',
    os: 'Windows 11',
    screenInch: 15.6,
    description: 'A powerful laptop',
    image: 'image.jpg',
    keywords: ['tech', 'laptop'],
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    gtmSpy = jasmine.createSpyObj('GtmService', ['pushEvent']);

    await TestBed.configureTestingModule({
      imports: [Card],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: GtmService, useValue: gtmSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Card);
    component = fixture.componentInstance;

    // Jelezzük a componentnek a signals-t
    (component as any).product = signal(mockProduct);
    (component as any).isDashboard = signal(false);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch addToCart and push GTM event', () => {
    component.addToCart(mockProduct);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      CartActions.addToCart({ item: { ...mockProduct, quantity: 1 } }),
    );

    expect(gtmSpy.pushEvent).toHaveBeenCalledWith('add_to_cart', {
      product_id: mockProduct.id,
      name: mockProduct.name,
      price: mockProduct.price,
    });
  });

  it('should navigate to product detail', () => {
    component.goToDetail(mockProduct);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products', mockProduct.id]);
  });

  it('should dispatch deleteProduct action', () => {
    component.deleteProduct(mockProduct.id);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      ProductsActions.deleteProduct({ id: mockProduct.id }),
    );
  });

  it('should render product info correctly', () => {
    const el = fixture.nativeElement;

    const name = el.querySelector('h3')?.textContent;
    expect(name).toContain(mockProduct.name);

    const price = el.querySelector('p')?.textContent;
    expect(price).toContain(mockProduct.price.toString());

    const img = el.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain(mockProduct.image);
    expect(img.alt).toBe(mockProduct.name);
  });

  it('should display laptop-specific fields', () => {
    const el = fixture.nativeElement;

    expect(el.textContent).toContain(`RAM: ${mockProduct.ramGb} GB`);
    expect(el.textContent).toContain(`CPU: ${mockProduct.cpu}`);
    expect(el.textContent).toContain(`OS: ${mockProduct.os}`);
    expect(el.textContent).toContain(`Screen: ${mockProduct.screenInch}"`);
  });

  it('should render dashboard buttons correctly', () => {
    // A meglévő signal értékét állítjuk, nem cseréljük le
    (component.isDashboard as any).set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement;
    const deleteBtn = el.querySelector('button.bg-red-700');
    expect(deleteBtn).toBeTruthy();

    const addToCartBtn = el.querySelector('button.bg-white');
    expect(addToCartBtn).toBeNull();
  });

  it('should render non-dashboard buttons correctly', () => {
    (component.isDashboard as any).set(false);
    fixture.detectChanges();

    const addToCartBtn = fixture.debugElement.query(By.css('button.bg-white'));
    const detailBtn = fixture.debugElement.query(By.css('button.bg-gray-200'));
    expect(addToCartBtn).toBeTruthy();
    expect(detailBtn).toBeTruthy();

    const deleteBtn = fixture.debugElement.query(By.css('button.bg-red-700'));
    expect(deleteBtn).toBeNull();
  });

  it('should call addToCart when button clicked', () => {
    spyOn(component, 'addToCart');
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button.bg-white'));
    btn.triggerEventHandler('click', null);
    expect(component.addToCart).toHaveBeenCalledWith(mockProduct);
  });
});
