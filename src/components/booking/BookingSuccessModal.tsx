import React from 'react';
import { CheckCircle2, Clock, MapPin, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { Booking } from '../../types';
import { useParking } from '../../contexts/ParkingContext';

interface BookingSuccessModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ booking, onClose }) => {
  const { setActiveTab } = useParking();

  if (!booking) return null;

  const handleGoToBookings = () => {
    onClose();
    setActiveTab('bookings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="booking-success-container"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5"
      >
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto text-neutral-950 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Booking Request Sent!</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Host <span className="text-white font-medium">{booking.hostName}</span> has been notified and will review your request shortly.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-neutral-500">Booking Ref:</span>
            <span className="font-mono font-bold text-amber-400">{booking.bookingCode}</span>
          </div>

          <div className="flex items-center justify-between text-neutral-300">
            <span>Parking Space:</span>
            <span className="font-medium text-white truncate max-w-[180px]">{booking.parkingTitle}</span>
          </div>

          <div className="flex items-center justify-between text-neutral-300">
            <span>Total Estimated:</span>
            <span className="font-bold text-amber-400">€{(booking.totalPrice ?? 0).toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-neutral-300">
            <span>Status:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" /> Pending Host Approval
            </span>
          </div>
        </div>

        {/* Trust Hint */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            As soon as host <span className="text-white font-medium">{booking.hostName}</span> accepts, your exact street address, GPS route, and private gate instructions will unlock instantly in your Bookings tab.
          </p>
        </div>

        {/* Action Button */}
        <button
          id="view-in-bookings-btn"
          onClick={handleGoToBookings}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>View in My Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
