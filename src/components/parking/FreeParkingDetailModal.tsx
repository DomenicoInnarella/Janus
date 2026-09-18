import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  X, 
  Calendar, 
  CheckCircle,
  Info,
  Car,
  ThumbsUp,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { FreeParkingSpot } from '../../types';
import { useParking } from '../../contexts/ParkingContext';

interface FreeParkingDetailModalProps {
  spot: FreeParkingSpot | null;
  onClose: () => void;
}

export const FreeParkingDetailModal: React.FC<FreeParkingDetailModalProps> = ({ spot, onClose }) => {
  const { formatDistance, reportFreeSpotStatus } = useParking();
  const [submittingStatus, setSubmittingStatus] = useState<boolean>(false);
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  if (!spot || !spot.id) return null;

  const handleOpenNavigation = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStatusVote = async (status: 'available' | 'full') => {
    try {
      setSubmittingStatus(true);
      await reportFreeSpotStatus(spot.id, status);
      setReportFeedback(status === 'available' ? 'Hai confermato che il posto è libero! 🎉' : 'Segnalato come occupato/esaurito. 👍');
      setTimeout(() => setReportFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to report free spot status:', err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const getTypeName = (type: FreeParkingSpot['parkingType']) => {
    switch (type) {
      case 'exchange_metro':
        return 'Parcheggio di Scambio Metro';
      case 'free_white_lines':
        return 'Stalli Bianchi Gratuiti';
      case 'free_street':
        return 'Area Libera Stradale';
      case 'free_surface':
      default:
        return 'Parcheggio Pubblico Gratuito';
    }
  };

  const isFull = spot.currentStatus === 'full';
  const confirmations = spot.confirmationsCount || 0;
  const reliability = spot.reliabilityScore || 85;

  return (
    <div 
      id="free-parking-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div 
        id="free-parking-detail-modal-card"
        className="relative w-full max-w-md bg-neutral-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="free-parking-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verified Badge & Distance */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500 text-neutral-950 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Verificato Ufficiale</span>
          </span>
          <span className="text-xs font-semibold text-neutral-400">
            {spot.approximateLocation}
          </span>
          {formatDistance(spot.latitude, spot.longitude) && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              📍 a {formatDistance(spot.latitude, spot.longitude)}
            </span>
          )}
        </div>

        {/* Free Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between mb-4 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-emerald-300/80 uppercase tracking-wider">
                Tariffa di sosta
              </div>
              <div className="text-xl font-black text-emerald-400">
                100% GRATIS
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold bg-neutral-800 text-emerald-300 border border-emerald-500/30">
              {getTypeName(spot.parkingType)}
            </span>
          </div>
        </div>

        {/* Community Status & Live Feedback */}
        <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-xs font-bold text-neutral-200">
                {isFull ? 'Segnalato Occupato / Pieno' : 'Disponibilità Attiva'}
              </span>
            </div>
            <div className="text-[10px] font-semibold text-neutral-400">
              Affidabilità dati: <span className="text-emerald-400 font-bold">{reliability}%</span>
            </div>
          </div>

          {confirmations > 0 && (
            <p className="text-[11px] text-neutral-400 mt-1">
              Confermato da <strong className="text-neutral-200">{confirmations}</strong> automobilisti della community.
            </p>
          )}

          {reportFeedback ? (
            <div className="mt-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
              {reportFeedback}
            </div>
          ) : (
            <div className="mt-3 pt-2.5 border-t border-neutral-700/60 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-neutral-400 shrink-0">Sei sul posto?</span>
              <button
                type="button"
                disabled={submittingStatus}
                onClick={() => handleStatusVote('available')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Libero</span>
              </button>
              <button
                type="button"
                disabled={submittingStatus}
                onClick={() => handleStatusVote('full')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pieno</span>
              </button>
            </div>
          )}
        </div>

        {/* Name & Address */}
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-white leading-tight">
            {spot.name}
          </h3>
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-neutral-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{spot.address}</span>
          </div>
        </div>

        {/* Official Source & Verification Date */}
        <div className="p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/70 space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Fonte istituzionale:</span>
            <span className="font-bold text-neutral-200">{spot.source}</span>
          </div>
          {spot.sourceUrl && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Verifica ufficiale:</span>
              <a 
                href={spot.sourceUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Consulta portale</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-neutral-700/50 pt-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ultima verifica:</span>
            </span>
            <span className="text-emerald-300 font-bold">{spot.lastVerifiedAt}</span>
          </div>
        </div>

        {/* Useful notes */}
        {spot.notes && (
          <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/50 text-xs text-neutral-300 mb-5 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{spot.notes}</p>
          </div>
        )}

        {/* Navigation Action Button */}
        <button
          id="navigate-to-free-spot-btn"
          type="button"
          onClick={handleOpenNavigation}
          className="w-full py-3.5 rounded-2xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>Avvia Navigazione verso il Parcheggio</span>
        </button>
      </div>
    </div>
  );
};
