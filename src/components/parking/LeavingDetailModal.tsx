import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Navigation, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Share2,
  ExternalLink
} from 'lucide-react';
import { LeavingSoonSpot } from '../../types';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';

interface LeavingDetailModalProps {
  spot: LeavingSoonSpot | null;
  onClose: () => void;
}

export const LeavingDetailModal: React.FC<LeavingDetailModalProps> = ({ spot, onClose }) => {
  const { reserveLeavingSoonSpot, cancelLeavingReservationAction, formatDistance } = useParking();
  const { user, requireAuth } = useAuth();

  const [timeRemainingText, setTimeRemainingText] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Real-time countdown calculation
  useEffect(() => {
    if (!spot || !spot.id) return;

    const updateCountdown = () => {
      const now = Date.now();
      const availTime = new Date(spot.availableAt).getTime();
      const expTime = new Date(spot.expiresAt).getTime();

      if (now > expTime) {
        setIsExpired(true);
        setTimeRemainingText('Disponibilità scaduta');
        return;
      }

      setIsExpired(false);
      const diffMs = availTime - now;

      if (diffMs <= 0) {
        setTimeRemainingText('Libero adesso!');
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeRemainingText(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [spot]);

  if (!spot || !spot.id) return null;

  const isOwnSpot = user?.uid === spot.userId;
  const isReservedByMe = user?.uid === spot.reservedByUserId;
  const isReservedByOther = spot.status === 'reserved' && !isReservedByMe;

  const handleReserve = async () => {
    if (!user) {
      requireAuth(() => {});
      return;
    }

    if (isOwnSpot) {
      setReserveError('Non puoi riservare un posto segnalato da te stesso.');
      return;
    }

    try {
      setIsReserving(true);
      setReserveError(null);

      const result = await reserveLeavingSoonSpot(spot.id);
      setIsReserving(false);

      if (result.success) {
        setReserveSuccess(true);
      } else {
        setReserveError(result.error || 'Impossibile riservare questo posto.');
      }
    } catch (err: any) {
      setIsReserving(false);
      setReserveError(err.message || 'Errore di connessione.');
    }
  };

  const handleOpenNavigation = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="leaving-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div 
        id="leaving-detail-modal-card"
        className="relative w-full max-w-md bg-neutral-900 border border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="leaving-detail-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Badge & Countdown Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-neutral-950">
            In Uscita Live
          </span>
          <span className="text-xs font-semibold text-neutral-400">
            {spot.approximateLocation}
          </span>
          {formatDistance(spot.latitude, spot.longitude) && (
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              📍 a {formatDistance(spot.latitude, spot.longitude)}
            </span>
          )}
        </div>

        {/* Big Countdown Card */}
        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-amber-500/30 flex items-center justify-between mb-4 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Tempo alla partenza
              </div>
              <div className="text-xl font-black text-amber-300">
                {timeRemainingText || `${spot.departureMinutes} min`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-neutral-800 text-amber-400 border border-amber-400/30">
              Gratuito
            </span>
          </div>
        </div>

        {/* Title & Exact / Approximate Address */}
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-white leading-tight">
            {spot.title}
          </h3>
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-neutral-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{spot.address}</span>
          </div>
        </div>

        {/* Departing Driver Card */}
        <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3 mb-4">
          {spot.userPhoto ? (
            <img 
              src={spot.userPhoto} 
              alt={spot.userName} 
              className="w-10 h-10 rounded-full object-cover object-center border border-amber-400/40"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{spot.userName}</div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" />
              <span>Veicolo: {spot.vehicleSize === 'compact' ? 'Compatta' : spot.vehicleSize === 'suv' ? 'SUV' : 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Notes for arriving driver */}
        {spot.notes && (
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 mb-4">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-1 text-amber-300">
              Indicazioni dell'automobilista:
            </div>
            <p className="italic text-neutral-200">"{spot.notes}"</p>
          </div>
        )}

        {/* Error alert */}
        {reserveError && (
          <div className="p-3 mb-4 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{reserveError}</span>
          </div>
        )}

        {/* Success Alert */}
        {(reserveSuccess || isReservedByMe) && (
          <div className="p-3.5 mb-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300">Posto riservato per te! 🎉</div>
              <div className="text-[11px] text-emerald-200/90 mt-0.5">
                Raggiungi la posizione. L'automobilista ti aspetterà per liberare lo spazio.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isReservedByMe ? (
            <div className="flex flex-col gap-2">
              <button
                id="navigate-to-reserved-spot-btn"
                type="button"
                onClick={handleOpenNavigation}
                className="w-full py-3 rounded-2xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Avvia Navigazione verso il Posto</span>
              </button>
              {spot.reservationId && (
                <button
                  type="button"
                  onClick={() => {
                    if (user && spot.reservationId) {
                      cancelLeavingReservationAction(spot.id, spot.reservationId);
                      onClose();
                    }
                  }}
                  className="w-full py-2 rounded-2xl text-xs font-bold text-neutral-400 hover:text-red-300 transition-colors"
                >
                  Annulla prenotazione
                </button>
              )}
            </div>
          ) : isReservedByOther ? (
            <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-center text-xs text-neutral-400 font-semibold">
              Questo posto è già stato riservato da un altro guidatore.
            </div>
          ) : isOwnSpot ? (
            <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-center text-xs text-amber-300 font-semibold">
              Questo è il posto che stai liberando. Gli altri guidatori lo vedono sulla mappa.
            </div>
          ) : isExpired ? (
            <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-center text-xs text-neutral-400 font-semibold">
              La finestra di disponibilità per questo posto è scaduta.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="reserve-leaving-spot-action-btn"
                type="button"
                disabled={isReserving}
                onClick={handleReserve}
                className="flex-1 py-3 rounded-2xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isReserving ? (
                  <span>Verifica disponibilità...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Riserva Questo Posto</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleOpenNavigation}
                className="p-3 rounded-2xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 transition-colors"
                title="Apri su Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
