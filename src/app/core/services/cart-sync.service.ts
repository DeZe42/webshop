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
  private lastSent = '';

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.channel = new BroadcastChannel('cart_channel');

    // --- Kosár visszatöltése localStorage-ből betöltéskor ---
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      try {
        const items: CartItem[] = JSON.parse(saved);
        items.forEach((item) => this.store.dispatch(CartActions.addToCart({ item })));
      } catch (err) {
        console.error('Failed to parse saved cart from localStorage', err);
      }
    }

    // --- Másik böngészőfülből érkező üzenetek kezelése ---
    this.channel.onmessage = (event) => {
      const incoming = event.data;

      // Defensive check: biztosítja, hogy a bejövő adat tényleg Product tömb
      if (!Array.isArray(incoming) || !incoming.every(isProduct)) {
        console.warn('Invalid broadcast message received', incoming);
        return;
      }

      const typedItems: CartItem[] = incoming.map((p: Product) => ({ ...p, quantity: 1 }));

      // Jelenlegi és bejövő kosár összehasonlítása, hogy ne frissítsen feleslegesen
      const current = this.store.selectSignal(CartSelectors.selectCartItems)();
      const currentIds = current.map((i) => i.id + i.quantity).join(',');
      const incomingIds = typedItems.map((i) => i.id + i.quantity).join(',');

      // Csak akkor írja felül, ha változott a tartalom
      if (currentIds !== incomingIds) {
        this.store.dispatch(CartActions.clearCart());
        typedItems.forEach((item) => this.store.dispatch(CartActions.addToCart({ item })));
      }
    };

    // --- Reaktív effect: ha változik a store állapota, frissíti a localStorage-t és broadcastolja más tabokra ---
    effect(() => {
      const items = this.store.selectSignal(CartSelectors.selectCartItems)();
      const currentIds = items.map((i) => i.id + i.quantity).join(',');

      // Csak akkor küld frissítést, ha ténylegesen változott az állapot
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
