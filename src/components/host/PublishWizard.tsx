import React, { useState } from 'react';
import { 
  MapPin, 
  Camera, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Car,
  Key,
  Clock,
  Ruler,
  Cctv,
  Lightbulb,
  Radio
} from 'lucide-react';
import { ParkingType, VehicleSize, AccessType, AccessDifficulty, ParkingSpot } from '../../types';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';

export const PublishWizard: React.FC = () => {
  const { publishSpot, setActiveTab } = useParking();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  // Step 1: Location
  const [exactAddress, setExactAddress] = useState('');
  const [approximateLocation, setApproximateLocation] = useState('');
  const [latitude, setLatitude] = useState(41.8905);
  const [longitude, setLongitude] = useState(12.4850);

  // Step 2: Photos (Required 2 photos)
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 3: Details & Specs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parkingType, setParkingType] = useState<ParkingType>('garage');
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('sedan');
  const [accessType, setAccessType] = useState<AccessType>('automatic_gate');
  const [accessDifficulty, setAccessDifficulty] = useState<AccessDifficulty>('easy');
  const [accessNotes, setAccessNotes] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  
  // Dimensions
  const [maxLength, setMaxLength] = useState<number>(4.9);
  const [maxWidth, setMaxWidth] = useState<number>(2.2);
  const [maxHeight, setMaxHeight] = useState<number>(2.1);

  // Security features
  const [securityFeatures, setSecurityFeatures] = useState<string[]>([
    'closed_garage',
    'automatic_gate',
    'video_surveillance',
    'well_lit',
    'controlled_access'
  ]);

  // Step 4: Price & Schedule
  const [pricePerHour, setPricePerHour] = useState<number>(2.5);
  const [pricePerDay, setPricePerDay] = useState<number>(18);
  const [availability, setAvailability] = useState('Mon - Sun, 08:00 - 22:00');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const toggleSecurityFeature = (feat: string) => {
    setSecurityFeatures((prev) => 
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  // Handle Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...photoFiles, ...newFiles].slice(0, 4);
      setPhotoFiles(updatedFiles);

      const previews = updatedFiles.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedFiles = photoFiles.filter((_, i) => i !== index);
    setPhotoFiles(updatedFiles);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(updatedPreviews);
  };

  // Step Navigations
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!exactAddress.trim() || !approximateLocation.trim()) {
        setError('Please provide both the exact address and the approximate public neighborhood.');
        return;
      }
    }
    if (step === 2) {
      if (photoFiles.length < 2 && photoPreviews.length < 2) {
        setError('Please upload at least 2 photos (1 of the space, 1 of the entrance/gate).');
        return;
      }
    }
    if (step === 3) {
      if (!title.trim() || !description.trim()) {
        setError('Please provide a title and detailed description.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must confirm that you have the right to make this space available.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await publishSpot(
        {
          ownerId: user?.uid || 'guest-host',
          ownerName: user?.displayName || 'Janus Host',
          ownerPhoto: user?.photoURL,
          ownerRating: user?.rating || 5.0,
          ownerBookingsCount: user?.completedBookings || 0,
          ownerHostStatus: user?.hostStatus || 'new_host',
          title: title.trim(),
          description: description.trim(),
          latitude,
          longitude,
          approximateLocation: approximateLocation.trim(),
          exactAddress: exactAddress.trim(),
          accessInstructions: accessInstructions.trim(),
          pricePerHour: Number(pricePerHour),
          pricePerDay: Number(pricePerDay) || undefined,
          parkingType,
          vehicleSize,
          supportedVehicles: ['small_car', 'standard_car', 'suv'],
          maxLength: Number(maxLength) || undefined,
          maxWidth: Number(maxWidth) || undefined,
          maxHeight: Number(maxHeight) || undefined,
          securityFeatures,
          accessType,
          accessDifficulty,
          accessNotes: accessNotes.trim() || undefined,
          availability: availability.trim(),
          photos: photoPreviews,
          status: 'active',
          averageLocationRating: 5.0,
          averageSafetyRating: 5.0,
          averageAccessRating: 4.8,
          averageAccuracyRating: 5.0,
          averageConditionRating: 4.9,
        },
        photoFiles
      );

      setActiveTab('home');
    } catch (err) {
      console.error(err);
      setError('Failed to publish parking space. Please check all fields and retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 app-content-pb">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Share Your Parking Space</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Turn your unused parking slot, driveway, or garage into trusted earnings.
        </p>
      </div>

      {/* 4 Steps Stepper Indicator */}
      <div className="flex items-center justify-between mb-8 px-2 max-w-md mx-auto">
        {[
          { num: 1, label: 'Location' },
          { num: 2, label: 'Photos' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Pricing' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20'
                    : step > s.num
                    ? 'bg-emerald-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : s.num}
              </div>
              <span className="text-[10px] font-medium text-neutral-400 mt-1.5">{s.label}</span>
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${
                  step > idx + 1 ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        
        {/* STEP 1: Location */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>Step 1 — Parking Space Location</span>
            </div>

            {/* Privacy Promise Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-white">Privacy Guarantee:</strong> Your exact street address will NEVER be visible on the public map. Only confirmed drivers receive it after you accept their booking.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Exact Street Address (Private, for confirmed guests)
              </label>
              <input
                type="text"
                value={exactAddress}
                onChange={(e) => {
                  setExactAddress(e.target.value);
                  if (!approximateLocation && e.target.value.includes(',')) {
                    setApproximateLocation(e.target.value.split(',')[0]);
                  }
                }}
                placeholder="e.g. Via della Lungara 128, 00165 Roma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Public Approximate Neighborhood / Zone
              </label>
              <input
                type="text"
                value={approximateLocation}
                onChange={(e) => setApproximateLocation(e.target.value)}
                placeholder="e.g. Trastevere, Rome (or Centro Storico, Prati...)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                required
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                This public label is what drivers see while browsing.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Photos */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Camera className="w-4 h-4" />
              <span>Step 2 — Space & Entrance Photos (Min 2 required)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                To build trust and prevent fraud, <strong className="text-white">at least 2 photos</strong> are required: 1 showing the parking space slot and 1 showing the entrance/gate from the street.
              </p>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-neutral-700 hover:border-amber-400/70 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-950/60 text-center">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-bold text-white">Click or drag photos to upload</span>
              <span className="text-[11px] text-neutral-500 mt-1">JPEG or PNG (up to 4 photos)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {/* Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-[16/10] rounded-xl overflow-hidden border border-neutral-800 group">
                    <img src={src} alt="Upload preview" className="w-full h-full object-cover object-center" />
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      {i === 0 ? '🅿️ Slot View' : '🚪 Gate View'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors opacity-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Details & Compatibility */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <FileText className="w-4 h-4" />
              <span>Step 3 — Space Details & Specifications</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Listing Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious Garage in Trastevere with Automated Gate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Space Type</label>
                <select
                  value={parkingType}
                  onChange={(e) => setParkingType(e.target.value as ParkingType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="garage">Underground Garage</option>
                  <option value="box">Closed Box Garage</option>
                  <option value="covered">Covered Courtyard</option>
                  <option value="underground">Underground Multipass</option>
                  <option value="courtyard">Private Courtyard</option>
                  <option value="driveway">Private Driveway</option>
                  <option value="outdoor">Outdoor Space</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Access Method</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value as AccessType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="automatic_gate">Automatic Gate Sensor</option>
                  <option value="remote">Remote / Buzzer</option>
                  <option value="key_code">Keypad Code</option>
                  <option value="key_lockbox">Smart Lockbox</option>
                  <option value="host_meeting">Host Greeting in Person</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Access Difficulty</label>
                <select
                  value={accessDifficulty}
                  onChange={(e) => setAccessDifficulty(e.target.value as AccessDifficulty)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="easy">🟢 Easy Access</option>
                  <option value="moderate">🟡 Moderate Access</option>
                  <option value="difficult">🟠 Difficult Access</option>
                </select>
              </div>
            </div>

            {/* Vehicle Dimensions */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span>Max Dimensions & Clearances (meters)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Max Length (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseFloat(e.target.value) || 4.9)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Max Width (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseFloat(e.target.value) || 2.2)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Height Clearance (m)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(parseFloat(e.target.value) || 2.1)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Security Features Checkbox Badges */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Security Features:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'closed_garage', label: '🔒 Closed Garage' },
                  { key: 'automatic_gate', label: '🚧 Automatic Gate' },
                  { key: 'video_surveillance', label: '📹 CCTV Video' },
                  { key: 'well_lit', label: '💡 Well-Lit Area' },
                  { key: 'guarded', label: '👮 24/7 Guarded' },
                  { key: 'controlled_access', label: '🔑 Controlled Key' }
                ].map((feat) => {
                  const active = securityFeatures.includes(feat.key);
                  return (
                    <button
                      key={feat.key}
                      type="button"
                      onClick={() => toggleSecurityFeature(feat.key)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-amber-400/15 border-amber-400 text-amber-400 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {feat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Description (Features, lighting, security, landmarks)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your space, security features, height clearance, and nearby attractions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Access Notes & Hints (Visible on listing)
              </label>
              <input
                type="text"
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. Narrow entrance archway, proceed slowly with wide SUVs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Private Access Instructions (Revealed ONLY to accepted guests)
              </label>
              <textarea
                rows={2}
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                placeholder="e.g. Gate code #4492, park in spot G-12 on the left side..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Pricing & Declaration */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Step 4 — Hourly Rate & Host Declaration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Price per Hour (€)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">€</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(parseFloat(e.target.value) || 2.0)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Daily Max Rate (€)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">€</span>
                  <input
                    type="number"
                    step="1"
                    min="5"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(parseFloat(e.target.value) || 18)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Availability Schedule</label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. Mon - Sun, 08:00 - 22:00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Mandatory Trust Declaration */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="agree-declaration-checkbox"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <label htmlFor="agree-declaration-checkbox" className="text-xs text-neutral-200 cursor-pointer leading-relaxed">
                  <strong className="text-amber-400 block mb-0.5">Mandatory Host Declaration & Data Veridicity:</strong>
                  «I confirm that I have the legitimate legal right to make this parking space available to other users and agree to provide accurate access, truthful descriptions, and fair treatment. The 15% Janus service fee applies automatically upon completed booking payouts.»
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !agreedToTerms}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing listing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish My Space</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
