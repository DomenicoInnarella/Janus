import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  const isError = message.toLowerCase().includes('errore') || message.toLowerCase().includes('impossibile') || message.toLowerCase().includes('storto');

  return (
    <div
      id="android-toast-snackbar"
      className="absolute bottom-20 left-4 right-4 z-50 flex items-center justify-between px-4 py-3 bg-neutral-900 border border-neutral-700 text-white rounded-2xl shadow-xl animate-fade-in text-sm font-medium"
    >
      <div className="flex items-center space-x-2.5">
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
        )}
        <span className="text-neutral-100 text-xs font-semibold">{message}</span>
      </div>
    </div>
  );
};
