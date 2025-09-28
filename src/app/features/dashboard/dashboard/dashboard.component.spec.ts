import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ProductsActions, ProductsSelectors } from '../../../core/state/products';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  const initialState = {
    products: {
      products: [],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, DashboardComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(ProductsSelectors.selectAllProducts, []);

    dispatchSpy = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadProducts on init', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(ProductsActions.loadProducts());
  });

  it('should make form invalid when empty', () => {
    component.newProductForm.reset();
    expect(component.newProductForm.invalid).toBeTrue();
  });

  it('should validate name control (required + minlength)', () => {
    const name = component.form.name;
    name.setValue('');
    expect(name.hasError('required')).toBeTrue();

    name.setValue('ab');
    expect(name.hasError('minlength')).toBeTrue();

    name.setValue('abc');
    expect(name.valid).toBeTrue();
  });

  it('should validate price control (required + min)', () => {
    const price = component.form.price;
    price.setValue(null);
    expect(price.hasError('required')).toBeTrue();

    price.setValue(0);
    expect(price.hasError('min')).toBeTrue();

    price.setValue(10);
    expect(price.valid).toBeTrue();
  });

  it('should validate type control (required)', () => {
    const type = component.form.type;
    type.setValue('');
    expect(type.hasError('required')).toBeTrue();

    type.setValue('laptop');
    expect(type.valid).toBeTrue();
  });

  it('should validate description control (required + minlength)', () => {
    const description = component.form.description;
    description.setValue('');
    expect(description.hasError('required')).toBeTrue();

    description.setValue('short');
    expect(description.hasError('minlength')).toBeTrue();

    description.setValue('valid description here');
    expect(description.valid).toBeTrue();
  });

  it('should validate image control (required)', () => {
    const image = component.form.image;
    image.setValue('');
    expect(image.hasError('required')).toBeTrue();

    image.setValue('data:image/png;base64,xxx');
    expect(image.valid).toBeTrue();
  });

  it('should dispatch addProduct when form is valid', () => {
    component.newProductForm.setValue({
      name: 'Test product',
      price: 100,
      type: 'laptop',
      description: 'This is a valid description',
      image: 'data:image/png;base64,xxx',
    });

    component.addNewProduct();

    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: ProductsActions.addProduct.type,
        product: jasmine.objectContaining({
          name: 'Test product',
          price: 100,
          type: 'laptop',
        }),
      }),
    );
  });

  it('should reset form after successful add', () => {
    component.newProductForm.setValue({
      name: 'Test product',
      price: 100,
      type: 'laptop',
      description: 'This is a valid description',
      image: 'data:image/png;base64,xxx',
    });

    component.addNewProduct();

    expect(component.form.type.value).toBe('accessory');
    expect(component.form.price.value).toBe(0);
    expect(component.form.name.value).toBeNull();
    expect(component.form.description.value).toBeNull();
    expect(component.form.image.value).toBeNull();
  });

  it('should not dispatch addProduct if form is invalid', () => {
    component.form.name.setValue('');
    component.addNewProduct();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: ProductsActions.addProduct.type }),
    );
  });
});
