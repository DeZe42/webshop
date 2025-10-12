import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ProductsActions, ProductsSelectors } from '../../../core/state/products';
import { Store } from '@ngrx/store';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Card } from '../../../shared/card/card';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [FormsModule, ReactiveFormsModule, Card],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private _store = inject(Store);
  private _cdr = inject(ChangeDetectorRef);
  products = this._store.selectSignal(ProductsSelectors.selectAllProducts);

  newProductForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl(0, [Validators.required, Validators.min(1)]),
    type: new FormControl('accessory', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    image: new FormControl('', [Validators.required]),
  });

  public ngOnInit(): void {
    this._store.dispatch(ProductsActions.loadProducts());
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.newProductForm.patchValue({ image: reader.result as string });
        this._cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  public addNewProduct(): void {
    if (this.newProductForm.valid) {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: this.newProductForm.value.name!,
        price: this.newProductForm.value.price!,
        type: this.newProductForm.value.type as Product['type'],
        ramGb: 0,
        cpu: '',
        os: '',
        screenInch: 0,
        description: this.newProductForm.value.description!,
        image: this.newProductForm.value.image!,
        keywords: [],
      };
      this._store.dispatch(ProductsActions.addProduct({ product: newProduct }));
      this.newProductForm.reset({ type: 'accessory', price: 0 });
    }
  }

  get form() {
    return this.newProductForm.controls;
  }
}
