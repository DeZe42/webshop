import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ProductsActions } from '../../../core/state/products';
import { ReactiveFormsModule } from '@angular/forms';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, ReactiveFormsModule],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadProducts on init', () => {
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(ProductsActions.loadProducts());
  });

  it('should dispatch addProduct when form is valid', () => {
    component.newProductForm.setValue({
      name: 'Test Laptop',
      price: 1200,
      type: 'laptop',
      description: 'High-end gaming laptop',
      image: 'http://example.com/laptop.png',
    });

    component.addNewProduct();

    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: ProductsActions.addProduct.type,
        product: jasmine.objectContaining({
          name: 'Test Laptop',
          price: 1200,
          type: 'laptop',
        }),
      }),
    );
  });

  it('should not dispatch addProduct when form is invalid', () => {
    component.newProductForm.setValue({
      name: '', // name required → invalid
      price: 1200,
      type: 'laptop',
      description: '',
      image: '',
    });

    component.addNewProduct();

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: ProductsActions.addProduct.type }),
    );
  });
});
