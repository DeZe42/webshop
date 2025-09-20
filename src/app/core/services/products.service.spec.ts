import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Product } from '../state/products/products.reducer';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    { id: '1', name: 'Laptop A', price: 1000, type: 'laptop', ramGb: 16, cpu: 'i7', screenSizeInch: 15, os: 'Windows', screenInch: 15 },
    { id: '2', name: 'Phone B', price: 500, type: 'phone', ramGb: 8, cpu: 'Snapdragon', screenSizeInch: 6, os: 'Android', screenInch: 6 },
    { id: '3', name: 'Tablet C', price: 800, type: 'tablet', ramGb: 8, cpu: 'Apple M1', screenSizeInch: 12, os: 'iPadOS', screenInch: 12 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products via HttpClient', (done) => {
    service.fetchAll().subscribe(products => {
      expect(products).toEqual(mockProducts);
      done();
    });

    const req = httpMock.expectOne('/products.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should return empty array on HTTP error', (done) => {
    service.fetchAll().subscribe(products => {
      expect(products).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('/products.json');
    req.error(new ErrorEvent('Network error'));
  });
});
