import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetail } from './product-detail';
import { Store } from '@ngrx/store';
import { SeoService } from '../../../core/services/seo.service';
import { ActivatedRoute } from '@angular/router';
import { CartActions } from '../../../core/state/cart';
import { signal } from '@angular/core';
import { Product } from '../../../core/models/product.model';

describe('ProductDetail', () => {
  let fixture: ComponentFixture<ProductDetail>;
  let component: ProductDetail;
  let storeSpy: jasmine.SpyObj<Store>;
  let seoSpy: jasmine.SpyObj<SeoService>;

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
    seoSpy = jasmine.createSpyObj('SeoService', ['setMeta']);

    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: SeoService, useValue: seoSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { product: mockProduct } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set product signal from route snapshot', () => {
    expect(component.product()).toEqual(mockProduct);
  });

  it('should call seoService.setMeta on init', () => {
    expect(seoSpy.setMeta).toHaveBeenCalledWith({
      title: mockProduct.name,
      description: mockProduct.description,
      image: mockProduct.image,
      siteName: 'My Angular Webshop',
      keywords: mockProduct.keywords.join(', '),
      themeColor: '#ffffff',
    });
  });

  it('should dispatch addToCart action', () => {
    component.addToCart();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      CartActions.addToCart({ item: { ...mockProduct, quantity: 1 } }),
    );
  });

  it('should not dispatch addToCart if product is null', () => {
    (component as any).product = signal(null);
    component.addToCart();
    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ item: jasmine.anything() }),
    );
  });
});
