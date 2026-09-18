import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nessun parcheggio trovato',
  description = 'Prova ad ampliare la zona o modificare gli orari.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 text-center my-auto">
      <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
        {icon || <SearchX className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-neutral-100 tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-400 mt-1 max-w-xs leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors min-h-[44px] shadow-md"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
