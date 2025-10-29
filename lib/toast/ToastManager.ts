/**
 * Toast Manager - Singleton + Observer Pattern
 * Manages toast lifecycle and notifies observers of changes
 */

import { Toast, ToastOptions, IToastObserver } from './types';
import { ToastFactory } from './ToastFactory';

export class ToastManager {
  private static instance: ToastManager;
  private toasts: Toast[] = [];
  private observers: IToastObserver[] = [];
  private factory: ToastFactory;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.factory = ToastFactory.getInstance();
  }

  /**
   * Singleton pattern - ensures only one manager instance exists
   */
  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * Observer pattern - Subscribe to toast changes
   */
  public subscribe(observer: IToastObserver): () => void {
    this.observers.push(observer);

    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all observers of state changes
   */
  private notify(): void {
    this.observers.forEach(observer => observer.update([...this.toasts]));
  }

  /**
   * Add a new toast
   */
  public addToast(message: string, options?: ToastOptions): string {
    const toast = this.factory.createToast(message, options);
    this.toasts.push(toast);
    this.notify();

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
      this.timers.set(toast.id, timer);
    }

    return toast.id;
  }

  /**
   * Convenience methods for different toast types
   */
  public success(message: string, duration?: number): string {
    return this.addToast(message, { type: 'success', duration });
  }

  public error(message: string, duration?: number): string {
    return this.addToast(message, { type: 'error', duration: duration || 5000 });
  }

  public info(message: string, duration?: number): string {
    return this.addToast(message, { type: 'info', duration });
  }

  public warning(message: string, duration?: number): string {
    return this.addToast(message, { type: 'warning', duration });
  }

  /**
   * Remove a specific toast
   */
  public removeToast(id: string): void {
    // Clear timer if exists
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    // Remove toast
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  /**
   * Remove all toasts
   */
  public clearAll(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Clear all toasts
    this.toasts = [];
    this.notify();
  }

  /**
   * Get all current toasts
   */
  public getToasts(): Toast[] {
    return [...this.toasts];
  }

  /**
   * Get toast count
   */
  public getCount(): number {
    return this.toasts.length;
  }
}

/**
 * Export singleton instance for easy access
 */
export const toastManager = ToastManager.getInstance();
