import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsActions, ProductsSelectors } from '../../../core/state/products';
import { CartActions } from '../../../core/state/cart';
import { Product } from '../../../core/state/products/products.reducer';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let store: MockStore;
  let router: Router;

  const mockProducts: Product[] = [
    { id: '1', name: 'Laptop A', price: 1000, type: 'laptop', ramGb: 16, cpu: 'i7', screenSizeInch: 15, os: 'Windows', screenInch: 15 },
    { id: '2', name: 'Phone B', price: 500, type: 'phone', ramGb: 8, cpu: 'Snapdragon', screenSizeInch: 6, os: 'Android', screenInch: 6 },
    { id: '3', name: 'Tablet C', price: 800, type: 'tablet', ramGb: 8, cpu: 'Apple M1', screenSizeInch: 12, os: 'iPadOS', screenInch: 12 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ProductsSelectors.selectAllProducts, value: mockProducts }
          ]
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadProducts on init', () => {
    const spy = spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(ProductsActions.loadProducts());
  });

  it('should filter products by searchTerm', () => {
    component.updateSearch('Laptop');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Laptop A');
  });

  it('should filter products by selectedCategory', () => {
    component.updateCategory('phone');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].type).toBe('phone');
  });

  it('should dispatch addToCart when addToCart is called', () => {
    const spy = spyOn(store, 'dispatch');
    const product = mockProducts[0];
    component.addToCart(product);
    expect(spy).toHaveBeenCalledWith(CartActions.addToCart({ item: { ...product, quantity: 1 } }));
  });

  it('should navigate to product detail on goToDetail', () => {
    const spy = spyOn(router, 'navigate');
    const product = mockProducts[1];
    component.goToDetail(product);
    expect(spy).toHaveBeenCalledWith(['/products', product.id]);
  });
});
