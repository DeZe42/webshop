import { Injectable, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { effect } from '@angular/core';
import { CartActions, CartSelectors } from '../state/cart';
import { CartItem } from '../state/cart/cart.reducer';
import { isProduct } from '../utils/type-guards';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartSyncService implements OnDestroy {
  private store = inject(Store);
  private platformId = inject(PLATFORM_ID);
  private channel?: BroadcastChannel;
  private lastSent = ''; //test

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return; // SSR-safe

    this.channel = new BroadcastChannel('cart_channel');

    // --- Load from localStorage on init ---
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      try {
        const items: CartItem[] = JSON.parse(saved);
        items.forEach((item) => this.store.dispatch(CartActions.addToCart({ item })));
      } catch (err) {
        console.error('Failed to parse saved cart from localStorage', err);
      }
    }

    // --- BroadcastChannel: listen to other tabs ---
    this.channel.onmessage = (event) => {
      const incoming = event.data;

      // Defensive check: ensure it's an array of Products
      if (!Array.isArray(incoming) || !incoming.every(isProduct)) {
        console.warn('Invalid broadcast message received', incoming);
        return;
      }

      const typedItems: CartItem[] = incoming.map((p: Product) => ({ ...p, quantity: 1 }));

      const current = this.store.selectSignal(CartSelectors.selectCartItems)();
      const currentIds = current.map((i) => i.id + i.quantity).join(',');
      const incomingIds = typedItems.map((i) => i.id + i.quantity).join(',');

      if (currentIds !== incomingIds) {
        this.store.dispatch(CartActions.clearCart());
        typedItems.forEach((item) => this.store.dispatch(CartActions.addToCart({ item })));
      }
    };

    // --- Effect: listen to store changes, update localStorage + broadcast ---
    effect(() => {
      const items = this.store.selectSignal(CartSelectors.selectCartItems)();
      const currentIds = items.map((i) => i.id + i.quantity).join(',');

      if (currentIds !== this.lastSent) {
        this.channel?.postMessage(items);
        localStorage.setItem('cart_items', JSON.stringify(items));
        this.lastSent = currentIds;
      }
    });
  }

  ngOnDestroy() {
    this.channel?.close();
  }
}
