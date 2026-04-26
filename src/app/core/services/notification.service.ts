import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private platformId = inject(PLATFORM_ID);
  private socket?: Socket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  notifications = signal<Notification[]>([]);
  isConnected = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.connect();
    }
  }

  private connect(): void {
    try {
      this.socket = io(environment.apiUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected to backend');
        this.isConnected.set(true);
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        this.isConnected.set(false);
        this.handleReconnect();
      });

      this.socket.on('notification', (data: Notification) => {
        console.log('🔔 Notification received:', data);
        this.notifications.update((list) => [
          ...list,
          {
            ...data,
            timestamp: new Date(data.timestamp),
          },
        ]);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.handleReconnect();
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.socket?.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  /**
   * Teszt értesítés küldése a szervernek
   */
  sendTestNotification(): void {
    if (this.socket?.connected) {
      this.socket.emit('test-notification');
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Értesítés eltávolítása
   */
  removeNotification(id: string): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  /**
   * Összes értesítés törlése
   */
  clearAll(): void {
    this.notifications.set([]);
  }

  /**
   * Kapcsolat bontása (komponens destroy-nál)
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected.set(false);
    }
  }
}
