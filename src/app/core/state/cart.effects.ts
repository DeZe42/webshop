import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class CartEffects {
  constructor(private actions$: Actions) {}
  // ide jöhet pl. cross-tab persist vagy API sync
}
