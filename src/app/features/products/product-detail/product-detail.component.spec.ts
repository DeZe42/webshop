import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { CartActions } from '../../../core/state/cart';
import { Product } from '../../../core/state/products/products.reducer';
import { ProductsSelectors } from '../../../core/state/products';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let store: MockStore;

  const mockProducts: Product[] = [
    {
      id: 'p001',
      name: 'Laptop Pro 14',
      price: 1299,
      type: 'laptop',
      ramGb: 16,
      cpu: 'Intel i7',
      screenInch: 14,
      os: 'Windows',
      description:
        'High-performance Laptop Pro 14 with Intel i7 CPU, 16GB RAM and 14-inch display.',
      image: '/images/laptop-001.jpg',
      keywords: ['laptop', 'Intel', 'Windows', 'webshop'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: ProductsSelectors.selectAllProducts, value: mockProducts }],
        }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { product: mockProducts[0] } } },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should select the correct product based on resolver data', () => {
    const product = component.product();
    expect(product).toBeDefined();
    expect(product?.id).toBe('p001');
    expect(product?.name).toBe('Laptop Pro 14');
  });

  it('should dispatch addToCart with correct payload', () => {
    const spy = spyOn(store, 'dispatch');
    component.addToCart();
    const product = component.product()!;
    expect(spy).toHaveBeenCalledWith(CartActions.addToCart({ item: { ...product, quantity: 1 } }));
  });
});
