'use client';

/**
 * Toast Item Component
 * Individual toast with animations and styling
 */

import { useEffect, useState } from 'react';
import { Toast, ToastType } from '@/lib/toast/types';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  success: {
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-zinc-900',
    borderColor: 'border-emerald-500',
    textColor: 'text-white',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: <XCircle size={20} />,
    bgColor: 'bg-zinc-900',
    borderColor: 'border-red-500',
    textColor: 'text-white',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bgColor: 'bg-zinc-900',
    borderColor: 'border-yellow-500',
    textColor: 'text-white',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: <Info size={20} />,
    bgColor: 'bg-zinc-900',
    borderColor: 'border-blue-500',
    textColor: 'text-white',
    iconColor: 'text-blue-500',
  },
};

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[toast.type];

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4
        ${config.bgColor} ${config.borderColor}
        shadow-lg min-w-[300px] max-w-[400px]
        transition-all duration-300 ease-in-out
        ${isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-slide-in'
        }
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        {config.icon}
      </div>

      {/* Message */}
      <div className={`flex-1 ${config.textColor} text-sm`}>
        {toast.message}
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
