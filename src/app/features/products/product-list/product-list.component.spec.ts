import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsSelectors } from '../../../core/state/products';
import { CartActions } from '../../../core/state/cart';
import { Product } from '../../../core/state/products/products.reducer';
import { SeoService } from '../../../core/services/seo.service';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let store: MockStore;
  let router: Router;
  let seoService: SeoService;

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
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: ProductsSelectors.selectAllProducts, value: mockProducts }],
        }),
        {
          provide: SeoService,
          useValue: { setMeta: jasmine.createSpy('setMeta') },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    seoService = TestBed.inject(SeoService);
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call SEO service on init', () => {
    component.ngOnInit();
    expect(seoService.setMeta).toHaveBeenCalledWith({
      title: 'Webshop – Termékek',
      description:
        'Böngéssz a Webshop termékei között – laptopok, telefonok, tabletek és kiegészítők.',
      keywords: 'webshop, laptop, telefon, tablet, kiegészítők',
      siteName: 'My Angular Webshop',
      image: '/assets/default-list-image.png',
      themeColor: '#ffffff',
    });
  });

  it('should filter products by searchTerm', () => {
    component.updateSearch('Laptop');
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Laptop Pro 14');
  });

  it('should filter products by selectedCategory', () => {
    component.updateCategory('laptop');
    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].type).toBe('laptop');
  });

  it('should dispatch addToCart when addToCart is called', () => {
    const spy = spyOn(store, 'dispatch');
    const product = mockProducts[0];
    component.addToCart(product);
    expect(spy).toHaveBeenCalledWith(CartActions.addToCart({ item: { ...product, quantity: 1 } }));
  });

  it('should navigate to product detail on goToDetail', () => {
    const spy = spyOn(router, 'navigate');
    const product = mockProducts[0];
    component.goToDetail(product);
    expect(spy).toHaveBeenCalledWith(['/products', product.id]);
  });
});
