import React, { useState } from 'react';
import { Shield, Lock, Star, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

export const TrustPhilosophyBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      id="trust-philosophy-banner"
      className="w-full bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      {/* Subtle Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">Trust-First Parking Marketplace</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">
                Guaranteed
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed max-w-2xl">
              «Janus does not promise that fraud is impossible. Janus builds a system where <span className="text-amber-400 font-semibold">trust is a core feature</span> of the product.»
            </p>
          </div>
        </div>

        <button
          id="toggle-trust-details-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          aria-label="Toggle trust details"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable 3 Trust Pillars */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Host Reputation</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Every host displays real completed bookings count, verified profile badges, and transparent ratings.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
              <Lock className="w-4 h-4" />
              <span>Privacy-Protected Address</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Exact street numbers and private access codes are safely locked until the host confirms your reservation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Star className="w-4 h-4" />
              <span>100% Real Reviews</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Only drivers with completed, verified bookings can review, ensuring spam-free feedback.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
