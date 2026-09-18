import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { VehicleSize } from '../../types';

interface LeavingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeavingSoonModal: React.FC<LeavingSoonModalProps> = ({ isOpen, onClose }) => {
  const { reportLeavingSoon } = useParking();
  const { user, requireAuth } = useAuth();

  const [address, setAddress] = useState('');
  const [approximateLocation, setApproximateLocation] = useState('Trastevere, Roma');
  const [latitude, setLatitude] = useState(41.8902);
  const [longitude, setLongitude] = useState(12.4705);
  const [departureMinutes, setDepartureMinutes] = useState(10);
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('sedan');
  const [notes, setNotes] = useState('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [locateSuccess, setLocateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Auto-detect location on open if available
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSubmittedSuccess(false);
      if (!address) {
        handleLocateCurrentPosition();
      }
    }
  }, [isOpen]);

  const handleLocateCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocalizzazione non supportata dal browser.');
      return;
    }
    setIsLocating(true);
    setLocateSuccess(false);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocateSuccess(true);
        if (!address) {
          setAddress(`Posizione GPS rilevata (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setApproximateLocation('Roma Centro');
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err);
        // Default to Rome coordinates
        setLatitude(41.8902);
        setLongitude(12.4705);
        if (!address) {
          setAddress('Piazza Trilussa, Trastevere, Roma');
          setApproximateLocation('Trastevere');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requireAuth(() => {});
      return;
    }

    if (!address.trim()) {
      setError('Inserisci la via o piazza dove stai lasciando il posto.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await reportLeavingSoon({
        address: address.trim(),
        approximateLocation: approximateLocation.trim() || 'Roma',
        latitude,
        longitude,
        departureMinutes,
        vehicleSize,
        notes: notes.trim() || undefined,
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmittedSuccess(false);
      }, 1800);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Errore durante la pubblicazione del posto.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="leaving-soon-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div 
        id="leaving-soon-modal-card"
        className="relative w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-neutral-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          id="leaving-soon-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-400/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-white">Posto segnalato con successo!</h3>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              Il tuo posto è ora visibile agli automobilisti della community JANUS con un conto alla rovescia di <span className="font-bold text-amber-400">{departureMinutes} minuti</span>.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-neutral-950">
                    Live Community
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-0.5">Sto liberando il posto</h2>
                <p className="text-xs text-neutral-400">
                  Segnala agli altri guidatori che lascerai il tuo posto a breve
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Departure time buttons */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Tra quanti minuti parti?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((mins) => {
                    const isSelected = departureMinutes === mins;
                    return (
                      <button
                        key={mins}
                        id={`departure-mins-${mins}-btn`}
                        type="button"
                        onClick={() => setDepartureMinutes(mins)}
                        className={`py-2.5 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-lg scale-102 ring-2 ring-amber-400/40'
                            : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/80 hover:border-amber-400/50'
                        }`}
                      >
                        <span className="text-base font-black leading-none">{mins}</span>
                        <span className="text-[10px] font-semibold opacity-90">minuti</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Location & GPS detection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Dove si trova l'auto?
                  </label>
                  <button
                    type="button"
                    onClick={handleLocateCurrentPosition}
                    disabled={isLocating}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Rilevamento GPS...' : locateSuccess ? 'GPS Rilevato ✓' : 'Rileva GPS'}</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-400 pointer-events-none" />
                  <input
                    id="leaving-spot-address-input"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Es. Via del Corso 124 / Piazza Trilussa"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
              </div>

              {/* Neighborhood / Area */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Quartiere o Zona (Roma)
                </label>
                <input
                  id="leaving-spot-location-input"
                  type="text"
                  value={approximateLocation}
                  onChange={(e) => setApproximateLocation(e.target.value)}
                  placeholder="Es. Trastevere, Prati, Termini, San Lorenzo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              {/* 3. Vehicle Size */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Dimensione del posto / veicolo attuale
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'compact', label: 'Compatta', desc: 'Es. Smart, 500' },
                    { id: 'sedan', label: 'Standard', desc: 'Berlina/Station' },
                    { id: 'suv', label: 'Grande / SUV', desc: 'SUV o furgoncino' },
                    { id: 'motorcycle', label: 'Moto', desc: 'Stalli scooter' }
                  ].map((v) => {
                    const isSelected = vehicleSize === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleSize(v.id as VehicleSize)}
                        className={`p-2 rounded-2xl text-center border transition-all ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-neutral-800/60 border-neutral-700/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{v.label}</div>
                        <div className="text-[10px] text-neutral-400 leading-tight mt-0.5">{v.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Dettagli utili per chi arriva (opzionale)
                </label>
                <textarea
                  id="leaving-spot-notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Ford Fiesta argento metallizzato, strisce bianche gratuite di fronte all'edicola..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none"
                />
              </div>

              {/* Informative community note */}
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-start gap-2 text-[11px] text-neutral-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Questo posto apparirà nella sezione <strong className="text-amber-300">"In uscita"</strong> della mappa con scadenza automatica. Quando un guidatore lo riserva, riceverai una conferma.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  id="submit-leaving-spot-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Pubblicazione in corso...</span>
                  ) : (
                    <>
                      <Car className="w-4 h-4" />
                      <span>Pubblica Posto In Uscita</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
