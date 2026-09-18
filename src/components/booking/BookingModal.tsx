import React, { useState } from 'react';
import { X, Calendar, Clock, Lock, ShieldCheck, ArrowRight, AlertCircle, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import { ParkingSpot } from '../../types';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';

interface BookingModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ spot, onClose }) => {
  const { requestBooking } = useParking();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'apple_pay' | 'google_pay'>('stripe_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!spot) return null;

  // Calculate duration and price
  const calculateDurationAndPrice = () => {
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      const diffHours = Math.max(1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
      const total = diffHours * spot.pricePerHour;
      const janusFee = Number((total * 0.15).toFixed(2)); // 15% platform commission
      const hostPayout = Number((total - janusFee).toFixed(2)); // 85% immediate host payout
      return { 
        diffHours, 
        total: Math.max(spot.pricePerHour, total),
        janusFee,
        hostPayout
      };
    } catch {
      const fallbackTotal = spot.pricePerHour * 2;
      return { 
        diffHours: 2, 
        total: fallbackTotal,
        janusFee: Number((fallbackTotal * 0.15).toFixed(2)),
        hostPayout: Number((fallbackTotal * 0.85).toFixed(2))
      };
    }
  };

  const { diffHours, total, janusFee, hostPayout } = calculateDurationAndPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      setError('Departure time must be after arrival time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(`${date}T${endTime}:00`).toISOString();
      await requestBooking(spot, startIso, endIso, diffHours, total);
      onClose();
    } catch (err) {
      setError('Failed to send booking request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="booking-modal-container"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Request Parking & Payment</h3>
          </div>
          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 smooth-scroll pb-safe">
          
          {/* Target Spot Preview */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
            <img
              src={spot.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80'}
              alt={spot.title}
              className="w-14 h-14 rounded-xl object-cover object-center border border-neutral-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{spot.title}</h4>
              <p className="text-[11px] text-neutral-400 truncate">{spot.approximateLocation}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-amber-400 font-extrabold">€{(spot.pricePerHour ?? 0).toFixed(2)}/hr</span>
                <span className="text-[10px] text-neutral-400 font-medium">Host: {spot.ownerName}</span>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Date</label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Time Picker Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Arrival Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Departure Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector (Stripe) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">Payment Platform (Secured via Stripe)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe_card')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'stripe_card'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-400 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-400 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('google_pay')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'google_pay'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-400 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Google Pay</span>
              </button>
            </div>
          </div>

          {/* Transparent Price & Fee Breakdown */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Parking Subtotal ({diffHours} hrs @ €{(spot.pricePerHour ?? 0).toFixed(2)})</span>
              <span className="text-white font-semibold">€{total.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-neutral-400">
              <span>Janus Service & Protection (15%)</span>
              <span className="text-neutral-300 font-medium">€{janusFee.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400/90 text-[11px] pt-1">
              <span>⚡ Immediate Host Payout (Stripe Connect)</span>
              <span className="font-bold">€{hostPayout.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between font-bold">
              <span className="text-white text-sm">Total Driver Charge</span>
              <span className="text-amber-400 text-lg">€{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Privacy & Trust Guarantee */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-neutral-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your card is authorized securely. Payment is processed upon booking acceptance, unlocking the private gate code and exact street address.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing with Stripe...</span>
            ) : (
              <>
                <span>Confirm & Pay €{total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
