/**
 * Toast Factory - Factory Design Pattern
 * Creates toast instances with default configurations
 */

import { Toast, ToastOptions, IToastFactory, ToastType } from './types';

export class ToastFactory implements IToastFactory {
  private static instance: ToastFactory;
  private defaultDuration = 3000;
  private defaultPosition: 'top-right' = 'top-right';

  private constructor() {}

  /**
   * Singleton pattern - ensures only one factory instance exists
   */
  public static getInstance(): ToastFactory {
    if (!ToastFactory.instance) {
      ToastFactory.instance = new ToastFactory();
    }
    return ToastFactory.instance;
  }

  /**
   * Creates a new toast with specified options
   */
  public createToast(message: string, options?: ToastOptions): Toast {
    return {
      id: this.generateId(),
      type: options?.type || 'info',
      message,
      duration: options?.duration || this.defaultDuration,
      position: options?.position || this.defaultPosition,
      createdAt: Date.now(),
    };
  }

  /**
   * Factory methods for specific toast types
   */
  public createSuccessToast(message: string, duration?: number): Toast {
    return this.createToast(message, { type: 'success', duration });
  }

  public createErrorToast(message: string, duration?: number): Toast {
    return this.createToast(message, { type: 'error', duration: duration || 5000 });
  }

  public createInfoToast(message: string, duration?: number): Toast {
    return this.createToast(message, { type: 'info', duration });
  }

  public createWarningToast(message: string, duration?: number): Toast {
    return this.createToast(message, { type: 'warning', duration });
  }

  /**
   * Generates unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configure default settings
   */
  public setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  public setDefaultPosition(position: 'top-right'): void {
    this.defaultPosition = position;
  }
}
