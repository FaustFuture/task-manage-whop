'use client';

/**
 * Toast Context - React integration with Toast Manager
 * Provides toast functionality to React components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Toast, ToastOptions, IToastObserver } from '@/lib/toast/types';
import { toastManager } from '@/lib/toast/ToastManager';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Observer implementation for React integration
 */
class ToastContextObserver implements IToastObserver {
  constructor(private updateCallback: (toasts: Toast[]) => void) {}

  update(toasts: Toast[]): void {
    this.updateCallback(toasts);
  }
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Create observer and subscribe to toast manager
    const observer = new ToastContextObserver(setToasts);
    const unsubscribe = toastManager.subscribe(observer);

    // Initialize with current toasts
    setToasts(toastManager.getToasts());

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const value: ToastContextValue = {
    toasts,
    addToast: (message, options) => toastManager.addToast(message, options),
    removeToast: (id) => toastManager.removeToast(id),
    success: (message, duration) => toastManager.success(message, duration),
    error: (message, duration) => toastManager.error(message, duration),
    info: (message, duration) => toastManager.info(message, duration),
    warning: (message, duration) => toastManager.warning(message, duration),
    clearAll: () => toastManager.clearAll(),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to use toast functionality
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Standalone toast functions that work outside React components
 * Useful for API routes, utility functions, etc.
 */
export const toast = {
  success: (message: string, duration?: number) => toastManager.success(message, duration),
  error: (message: string, duration?: number) => toastManager.error(message, duration),
  info: (message: string, duration?: number) => toastManager.info(message, duration),
  warning: (message: string, duration?: number) => toastManager.warning(message, duration),
  add: (message: string, options?: ToastOptions) => toastManager.addToast(message, options),
  remove: (id: string) => toastManager.removeToast(id),
  clear: () => toastManager.clearAll(),
};
