import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { signal } from '@angular/core';
import { Card } from '../../../shared/card/card';
import { CartActions } from '../../../core/state/cart';
import { By } from '@angular/platform-browser';
import { Product } from '../../../core/models/product.model';

describe('ProductList', () => {
  let fixture: ComponentFixture<ProductList>;
  let component: ProductList;
  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Laptop One',
      price: 1000,
      type: 'laptop',
      ramGb: 16,
      cpu: 'i7',
      os: 'Windows',
      screenInch: 15,
      description: '',
      image: 'laptop1.jpg',
      keywords: [],
    },
    {
      id: '2',
      name: 'Phone One',
      price: 500,
      type: 'phone',
      ramGb: 4,
      cpu: '',
      os: 'Android',
      screenInch: 6,
      description: '',
      image: 'phone1.jpg',
      keywords: [],
    },
  ];

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'selectSignal']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    seoSpy = jasmine.createSpyObj('SeoService', ['setMeta']);

    storeSpy.selectSignal.and.returnValue(signal(mockProducts));

    await TestBed.configureTestingModule({
      imports: [ProductList, Card],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SeoService, useValue: seoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set SEO meta on init', () => {
    component.ngOnInit();
    expect(seoSpy.setMeta).toHaveBeenCalled();
  });

  it('should filter products by search term', () => {
    component.updateSearch('Laptop');
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(Card));
    expect(cards.length).toBe(1);
    const cardComponentInstance = cards[0].componentInstance as Card;
    expect(cardComponentInstance.product()).toEqual(mockProducts[0]);
  });

  it('should filter products by category', () => {
    component.updateCategory('phone');
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(Card));
    expect(cards.length).toBe(1);
    const cardComponentInstance = cards[0].componentInstance as Card;
    expect(cardComponentInstance.product()).toEqual(mockProducts[1]);
  });

  it('should update searchTerm signal when input changes', () => {
    component.updateSearch('Test');
    expect(component.searchTerm()).toBe('Test');
  });

  it('should update selectedCategory signal when select changes', () => {
    component.updateCategory('tablet');
    expect(component.selectedCategory()).toBe('tablet');
  });

  it('should dispatch addToCart action', () => {
    component.addToCart(mockProducts[0]);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      CartActions.addToCart({ item: { ...mockProducts[0], quantity: 1 } }),
    );
  });

  it('should navigate to product detail', () => {
    component.goToDetail(mockProducts[1]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products', mockProducts[1].id]);
  });
});
