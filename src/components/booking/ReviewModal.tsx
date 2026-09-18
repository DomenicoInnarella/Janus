import React, { useState } from 'react';
import { X, Star, CheckCircle2, ShieldCheck, Send, AlertCircle, MapPin, Lock, Car, Camera, Sparkles } from 'lucide-react';
import { Booking } from '../../types';
import { useParking } from '../../contexts/ParkingContext';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose }) => {
  const { submitDetailedReview } = useParking();

  // 5 dimension ratings
  const [locationRating, setLocationRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [accessRating, setAccessRating] = useState(5);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const calculatedOverall = Number(
    ((locationRating + safetyRating + accessRating + accuracyRating + conditionRating) / 5).toFixed(1)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short comment about your parking experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitDetailedReview(booking, {
        overallRating: calculatedOverall,
        locationRating,
        safetyRating,
        accessRating,
        accuracyRating,
        conditionRating,
        comment: comment.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const StarSelector = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void;
    icon: any;
  }) => {
    return (
      <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-neutral-300">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-4 h-4 ${
                  value >= star
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-700'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-bold text-amber-400 ml-1.5 w-4 text-right">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="review-modal-container"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-white text-base">Leave Verified Driver Review</h3>
          </div>
          <button
            id="close-review-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-lg">Review Published!</h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Thank you for contributing to the Janus trust community. Your feedback has been verified and posted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Parking details */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Reviewed parking:</span>
                  <span className="font-bold text-white truncate max-w-[200px] block">{booking.parkingTitle}</span>
                  <span className="text-neutral-500 text-[10px]">Host: {booking.hostName}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Booking
                </span>
              </div>

              {/* Multi-category rating breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Rate your experience by category:</label>
                  <span className="text-xs font-black text-amber-400">
                    Overall: ⭐ {calculatedOverall.toFixed(1)} / 5.0
                  </span>
                </div>

                <div className="space-y-1.5">
                  <StarSelector label="📍 Location & Convenience" value={locationRating} onChange={setLocationRating} icon={MapPin} />
                  <StarSelector label="🔐 Safety & Security" value={safetyRating} onChange={setSafetyRating} icon={Lock} />
                  <StarSelector label="🚗 Ease of Access & Gate" value={accessRating} onChange={setAccessRating} icon={Car} />
                  <StarSelector label="📸 Listing Accuracy" value={accuracyRating} onChange={setAccuracyRating} icon={Camera} />
                  <StarSelector label="🧹 Cleanliness & Condition" value={conditionRating} onChange={setConditionRating} icon={Sparkles} />
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Written Feedback & Review Comments
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about gate access, space dimensions, security, and host communication..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Publishing review...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish 5-Star Verified Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
