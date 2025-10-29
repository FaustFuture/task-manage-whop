/**
 * Toast Types and Interfaces
 * Following SOLID principles and design patterns
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  position?: ToastPosition;
  createdAt: number;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

/**
 * Observer pattern - Toast listener interface
 */
export interface IToastObserver {
  update(toasts: Toast[]): void;
}

/**
 * Strategy pattern - Toast display strategy interface
 */
export interface IToastStrategy {
  show(toast: Toast): void;
  hide(toastId: string): void;
}

/**
 * Factory pattern - Toast factory interface
 */
export interface IToastFactory {
  createToast(message: string, options?: ToastOptions): Toast;
}
