import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Product } from '../state/products/products.reducer';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService],
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
    service.getAll().subscribe((products) => {
      expect(products).toEqual(mockProducts);
      done();
    });

    const req = httpMock.expectOne('/products.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should return empty array on HTTP error', (done) => {
    service.getAll().subscribe((products) => {
      expect(products).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('/products.json');
    req.error(new ErrorEvent('Network error'));
  });
});
