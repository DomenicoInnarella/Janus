import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { FeatureDiscoveryItem } from '../../services/discoveryService';

interface FeatureDiscoveryBannerProps {
  discovery: FeatureDiscoveryItem | null;
  onAction: (discovery: FeatureDiscoveryItem) => void;
  onDismiss: () => void;
}

export const FeatureDiscoveryBanner: React.FC<FeatureDiscoveryBannerProps> = ({
  discovery,
  onAction,
  onDismiss,
}) => {
  if (!discovery) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={discovery.id}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        id={`discovery-banner-${discovery.id}`}
        className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-40"
      >
        <div className="p-3.5 rounded-2xl bg-neutral-900/95 border border-amber-400/40 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
          {/* Header with pill and dismiss */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-xs">
                <Sparkles className="w-3 h-3" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                {discovery.badge}
              </span>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              id="discovery-dismiss-btn"
              aria-label="Chiudi suggerimento"
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title and Short Description */}
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white leading-snug flex items-center gap-1.5">
              <span>{discovery.title}</span>
            </h4>
            <p className="text-[11px] text-neutral-300 leading-relaxed line-clamp-2">
              {discovery.subtitle}
            </p>
          </div>

          {/* Action button */}
          <div className="flex items-center justify-end pt-1 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={() => onAction(discovery)}
              id="discovery-action-btn"
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-extrabold flex items-center gap-1 active:scale-95 transition-all shadow-sm shadow-amber-400/20"
            >
              <span>{discovery.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
