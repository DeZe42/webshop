import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { TranslatePipe } from '@ngx-translate/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  imports: [FormsModule, ReactiveFormsModule, Card, TranslatePipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private _store = inject(Store);
  private _cdr = inject(ChangeDetectorRef);
  private _sanitizer = inject(DomSanitizer);
  private _destroyRef = inject(DestroyRef);
  protected notificationService = inject(NotificationService);

  products = this._store.selectSignal(ProductsSelectors.selectAllProducts);
  loading = this._store.selectSignal(ProductsSelectors.selectProductsLoading);
  error = this._store.selectSignal(ProductsSelectors.selectProductsError);

  newProductForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl(0, [Validators.required, Validators.min(1)]),
    type: new FormControl('accessory', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    image: new FormControl('', [Validators.required]),
    keywords: new FormControl(''),
    ramGb: new FormControl<number | null>(null),
    cpu: new FormControl(''),
    os: new FormControl(''),
    screenInch: new FormControl<number | null>(null),
    compatibleWith: new FormControl(''),
  });

  get isTechProduct(): boolean {
    const t = this.form.type.value;
    return t === 'laptop' || t === 'phone' || t === 'tablet';
  }

  get isAccessory(): boolean {
    return this.form.type.value === 'accessory';
  }

  public ngOnInit(): void {
    this._store.dispatch(ProductsActions.loadProducts());
    this.form.type.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._updateTechValidators();
      this._cdr.markForCheck();
    });
  }

  private _updateTechValidators(): void {
    const techControls = [this.form.ramGb, this.form.cpu, this.form.os, this.form.screenInch];
    if (this.isTechProduct) {
      this.form.ramGb.setValidators([Validators.required, Validators.min(1)]);
      this.form.cpu.setValidators([Validators.required]);
      this.form.os.setValidators([Validators.required]);
      this.form.screenInch.setValidators([Validators.required, Validators.min(1)]);
    } else {
      techControls.forEach((c) => {
        c.clearValidators();
        c.reset();
      });
    }
    techControls.forEach((c) => c.updateValueAndValidity());
    if (!this.isTechProduct) {
      this.form.compatibleWith.reset();
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.newProductForm.patchValue({ image: reader.result as string });
        this.form.image.markAsTouched();
        this._cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  public addNewProduct(): void {
    if (this.newProductForm.valid) {
      const v = this.newProductForm.value;
      const keywords = v.keywords
        ? v.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : [];
      const type = v.type as Product['type'];

      let product: Partial<Product>;

      if (type === 'laptop' || type === 'phone' || type === 'tablet') {
        product = {
          name: v.name!,
          price: v.price!,
          type,
          description: v.description!,
          image: v.image!,
          keywords,
          ramGb: v.ramGb!,
          cpu: v.cpu!,
          os: v.os!,
          screenInch: v.screenInch!,
        };
      } else {
        product = {
          name: v.name!,
          price: v.price!,
          type: 'accessory',
          description: v.description!,
          image: v.image!,
          keywords,
          ...(v.compatibleWith ? { compatibleWith: v.compatibleWith } : {}),
        };
      }

      this._store.dispatch(ProductsActions.createProduct({ product }));
      this.newProductForm.reset({ type: 'accessory', price: 0 });
    }
  }

  get form() {
    return this.newProductForm.controls;
  }

  get safeImageSrc(): SafeUrl | null {
    const value = this.form.image.value;
    return value ? this._sanitizer.bypassSecurityTrustUrl(value) : null;
  }

  typeBgClass(type: 'info' | 'success' | 'warning' | 'error'): string {
    const map = {
      success: 'bg-green-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    return map[type];
  }

  typeIcon(type: 'info' | 'success' | 'warning' | 'error'): string {
    const map = { success: '✓', info: 'i', warning: '!', error: '✕' };
    return map[type];
  }
}
