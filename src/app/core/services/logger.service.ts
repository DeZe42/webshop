import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(...args: any[]) {
    this._safeConsole('log', ...args);
  }
  warn(...args: any[]) {
    this._safeConsole('warn', ...args);
  }
  error(...args: any[]) {
    this._safeConsole('error', ...args);
  }

  private _safeConsole(method: 'log' | 'warn' | 'error', ...args: any[]) {
    // SSR safe
    if (typeof window !== 'undefined' && console && (console as any)[method]) {
      (console as any)[method](...args);
    } else {
      // server-side: still record somewhere or no-op
      // here csak no-op, de később be lehet kötni pl. remote logger-be
    }
  }
}
