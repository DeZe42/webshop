import { Component, inject, OnInit } from '@angular/core';
import { ProductsActions, ProductsSelectors } from '../../../core/state/products';
import { Store } from '@ngrx/store';
import { Product } from '../../../core/state/products/products.reducer';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardComponent } from '../../../shared/card/card.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [FormsModule, ReactiveFormsModule, CardComponent],
})
export class DashboardComponent implements OnInit {
  private _store = inject(Store);
  products = this._store.selectSignal(ProductsSelectors.selectAllProducts);
  newProductForm = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    type: new FormControl('accessory', Validators.required),
    description: new FormControl(''),
    image: new FormControl(''),
  });

  public ngOnInit(): void {
    this._store.dispatch(ProductsActions.loadProducts());
  }

  addNewProduct() {
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
}
