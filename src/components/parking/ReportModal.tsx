import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { ParkingSpot, ReportReason } from '../../types';
import { useParking } from '../../contexts/ParkingContext';

interface ReportModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'fake_photos', label: 'Fake or Misleading Photos', desc: 'Photos do not match the real location or are taken from the internet' },
  { value: 'does_not_exist', label: 'Parking Space Does Not Exist', desc: 'Physical spot cannot be found at the indicated location' },
  { value: 'host_not_owner', label: 'Host Not Authorized / Impersonation', desc: 'Host does not own or have rights to share this space' },
  { value: 'wrong_location', label: 'Wrong Approximate Location', desc: 'Neighborhood or zone is incorrect' },
  { value: 'space_unavailable', label: 'Consistently Unavailable / Blocked', desc: 'Spot is occupied by others or cannot be accessed' },
  { value: 'suspicious_activity', label: 'Suspicious or Fraudulent Activity', desc: 'Host asks for external off-platform payments or contacts' },
  { value: 'other', label: 'Other Trust Concern', desc: 'Any other safety or quality issue' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ spot, onClose }) => {
  const { submitReport } = useParking();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('fake_photos');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!spot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details explaining why you are reporting this listing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitReport(spot, selectedReason, description.trim());
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="report-modal-container"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Report Parking Listing</h3>
          </div>
          <button
            id="close-report-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-lg">Report Submitted</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Thank you for helping protect the Janus community. Our safety team will investigate this listing immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <span className="text-neutral-400 block mb-0.5">Reporting listing:</span>
                <span className="font-semibold text-white">{spot.title}</span>
                <span className="text-neutral-500 block text-[11px] mt-0.5">{spot.approximateLocation}</span>
              </div>

              {/* Reasons Selection */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  What is the issue with this space?
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === r.value
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="mt-1 accent-amber-400"
                      />
                      <div>
                        <div className="text-xs font-semibold">{r.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Detailed Explanation (Required)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what you observed or experienced..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting report...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Fraud / Trust Report</span>
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
