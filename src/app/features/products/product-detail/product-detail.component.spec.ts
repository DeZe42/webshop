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
    { id: '1', name: 'Laptop A', price: 1000, type: 'laptop', ramGb: 16, cpu: 'i7', screenSizeInch: 15, os: 'Windows', screenInch: 15 },
    { id: '2', name: 'Phone B', price: 500, type: 'phone', ramGb: 8, cpu: 'Snapdragon', screenSizeInch: 6, os: 'Android', screenInch: 6 },
    { id: '3', name: 'Tablet C', price: 800, type: 'tablet', ramGb: 8, cpu: 'Apple M1', screenSizeInch: 12, os: 'iPadOS', screenInch: 12 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ProductsSelectors.selectAllProducts, value: mockProducts }
          ]
        }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should select the correct product based on ID', () => {
    const product = component.product();
    expect(product).toBeDefined();
    expect(product?.id).toBe('1');
    expect(product?.name).toBe('Laptop A');
  });

  it('should dispatch addToCart with correct payload', () => {
    const spy = spyOn(store, 'dispatch');
    component.addToCart();
    const product = mockProducts[0];
    expect(spy).toHaveBeenCalledWith(CartActions.addToCart({ item: { ...product, quantity: 1 } }));
  });
});
