import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Car, 
  Key, 
  Clock, 
  Lock, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  UserCheck,
  Calendar,
  Share2,
  Maximize2,
  AlertTriangle,
  Building2,
  Warehouse,
  Home,
  Check,
  Camera,
  Cctv,
  Lightbulb,
  Radio,
  Navigation,
  Info,
  Maximize,
  Ruler
} from 'lucide-react';
import { ParkingSpot, Review, SupportedVehicleType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { TrustBadge } from '../common/TrustBadge';
import { reviewService } from '../../services/reviewService';

interface ParkingDetailModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
}

export const ParkingDetailModal: React.FC<ParkingDetailModalProps> = ({ spot, onClose }) => {
  const { user, requireAuth } = useAuth();
  const { setBookingSpot, setReportingSpot, formatDistance } = useParking();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState<SupportedVehicleType>('standard_car');

  useEffect(() => {
    if (!spot || !spot.id) return;
    setActivePhotoIdx(0);
    setLoadingReviews(true);

    const unsub = reviewService.subscribeSpotReviews(spot.id, (list) => {
      setReviews(list);
      setLoadingReviews(false);
    });

    return () => unsub();
  }, [spot]);

  if (!spot || !spot.id) return null;

  const photos = spot.photos && spot.photos.length > 0 
    ? spot.photos 
    : ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'];

  const handleStartBooking = () => {
    requireAuth(() => {
      setBookingSpot(spot);
    });
  };

  const handleOpenReport = () => {
    requireAuth(() => {
      setReportingSpot(spot);
    });
  };

  // Parking type display
  const getParkingTypeInfo = (type: ParkingSpot['parkingType']) => {
    switch (type) {
      case 'underground':
        return { label: 'Underground parking', icon: Building2, desc: 'Secure subterranean parking facility' };
      case 'garage':
        return { label: 'Private garage', icon: Warehouse, desc: 'Dedicated indoor garage parking' };
      case 'box':
        return { label: 'Closed garage / box', icon: Lock, desc: 'Independent locked garage box' };
      case 'covered':
        return { label: 'Covered parking', icon: Warehouse, desc: 'Protected covered space' };
      case 'courtyard':
        return { label: 'Private courtyard', icon: Home, desc: 'Gated residential courtyard' };
      case 'driveway':
        return { label: 'Private driveway', icon: Home, desc: 'Paved private driveway' };
      case 'outdoor':
      case 'open':
      default:
        return { label: 'Outdoor parking space', icon: Car, desc: 'Secure designated open-air parking' };
    }
  };

  // Access method display
  const getAccessInfo = (access: ParkingSpot['accessType']) => {
    switch (access) {
      case 'automatic_gate':
        return { label: 'Automatic gate', desc: 'Remote sensor or automatic recognition' };
      case 'manual_gate':
        return { label: 'Manual gate', desc: 'Manual unlock at entrance' };
      case 'key_code':
        return { label: 'Access code', desc: 'Keypad digital pincode' };
      case 'key_required':
        return { label: 'Key required', desc: 'Physical key provided via lockbox' };
      case 'phone_access':
        return { label: 'Phone-controlled access', desc: 'Opened via phone call / buzzer' };
      case 'host_meeting':
        return { label: 'Host assistance required', desc: 'Host meets you upon arrival' };
      case 'remote':
        return { label: 'Remote buzzer', desc: 'Electronic remote or interphone' };
      case 'key_lockbox':
        return { label: 'Smart lockbox', desc: 'Code-protected lockbox' };
      case 'open_access':
      default:
        return { label: 'Open access', desc: 'Direct open entrance' };
    }
  };

  // Access difficulty badge
  const getDifficultyBadge = (diff?: ParkingSpot['accessDifficulty']) => {
    switch (diff) {
      case 'moderate':
        return { label: 'Moderate access', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'difficult':
        return { label: 'Difficult access', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
      case 'easy':
      default:
        return { label: 'Easy access', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  // Security features mapping
  const getSecurityFeatureLabel = (feature: string) => {
    switch (feature) {
      case 'closed_garage':
        return { icon: Lock, label: 'Closed garage' };
      case 'automatic_gate':
        return { icon: Radio, label: 'Automatic gate' };
      case 'video_surveillance':
        return { icon: Cctv, label: 'Video surveillance (CCTV)' };
      case 'well_lit':
        return { icon: Lightbulb, label: 'Well-lit area' };
      case 'guarded':
        return { icon: ShieldCheck, label: 'Guarded / monitored 24/7' };
      case 'controlled_access':
      default:
        return { icon: Key, label: 'Controlled access' };
    }
  };

  const parkingTypeDetails = getParkingTypeInfo(spot.parkingType);
  const accessDetails = getAccessInfo(spot.accessType);
  const difficultyBadge = getDifficultyBadge(spot.accessDifficulty);

  // Supported vehicle list
  const supportedList: { type: SupportedVehicleType; label: string }[] = [
    { type: 'small_car', label: 'Small car' },
    { type: 'standard_car', label: 'Standard car' },
    { type: 'suv', label: 'SUV' },
    { type: 'large_van', label: 'Large vehicle / Van' },
    { type: 'motorcycle', label: 'Motorcycle' }
  ];

  const isVehicleSupported = (type: SupportedVehicleType) => {
    if (spot.supportedVehicles && spot.supportedVehicles.length > 0) {
      return spot.supportedVehicles.includes(type);
    }
    // Fallback logic
    if (spot.vehicleSize === 'all') return true;
    if (spot.vehicleSize === 'van') return true;
    if (spot.vehicleSize === 'suv') return type !== 'large_van';
    if (spot.vehicleSize === 'sedan') return type === 'small_car' || type === 'standard_car' || type === 'motorcycle';
    if (spot.vehicleSize === 'compact') return type === 'small_car' || type === 'motorcycle';
    return true;
  };

  // Rating qualitative label
  const getRatingDescriptor = (rating: number) => {
    if (rating >= 4.8) return 'Excellent';
    if (rating >= 4.5) return 'Very Good';
    if (rating >= 4.0) return 'Good';
    if (rating >= 3.0) return 'Average';
    return 'Fair';
  };

  // Location ratings calculations
  const totalVerifiedBookings = spot.completedBookings || spot.reviewCount || 1;
  const avgLocation = spot.averageLocationRating || 4.9;
  const avgSafety = spot.averageSafetyRating || 4.8;
  const avgAccess = spot.averageAccessRating || 4.6;
  const avgAccuracy = spot.averageAccuracyRating || 4.9;
  const avgCondition = spot.averageConditionRating || 4.7;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        id="parking-detail-modal-container"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]"
      >
        {/* Navigation Top Header */}
        <div className="sticky top-0 z-20 px-4 sm:px-5 py-3.5 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-neutral-800 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {spot.isOfficialGuarded && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official Guarded
              </span>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: spot.title, url: window.location.href });
                }
              }}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors active:scale-95"
              title="Share space"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="close-detail-modal-btn"
              onClick={onClose}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 smooth-scroll">
          
          {/* 📸 LARGE PHOTO CAROUSEL */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-inner">
            <img
              src={photos[activePhotoIdx] || photos[0]}
              alt={`Photo ${activePhotoIdx + 1} of ${spot.title || 'Parking Spot'}`}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{activePhotoIdx + 1} / {photos.length}</span>
            </div>

            {/* Photo Label (Space vs Entrance vs Dimensions) */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-amber-400 border border-amber-400/20">
              {activePhotoIdx === 0 
                ? '🅿️ Parking Space' 
                : activePhotoIdx === 1 
                ? '🚪 Entrance & Gate' 
                : '📐 Space & Access'}
            </div>

            {/* Expand / Lightbox Button */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Full screen photos"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Carousel Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/95 transition-all opacity-90 group-hover:opacity-100 shadow-lg border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/95 transition-all opacity-90 group-hover:opacity-100 shadow-lg border border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* MAIN HEADER & OVERALL RATING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{spot.approximateLocation}</span>
                {formatDistance(spot.latitude, spot.longitude) && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 border border-amber-400/20 text-amber-300">
                    📍 {formatDistance(spot.latitude, spot.longitude)} da te
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank')}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Ottieni indicazioni</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {spot.title}
            </h1>

            {/* Overall Rating & Verified Host */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-neutral-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-xl">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-extrabold text-amber-400">{(spot.rating ?? 5.0).toFixed(1)}</span>
                  <span className="text-xs font-semibold text-neutral-300">{getRatingDescriptor(spot.rating)}</span>
                </div>
                <span className="text-xs text-neutral-400">
                  Based on <strong className="text-neutral-200">{totalVerifiedBookings} verified bookings</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <TrustBadge status={spot.ownerHostStatus} size="sm" />
              </div>
            </div>
          </div>

          {/* 💰 PRICE SECTION */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">€{(spot.pricePerHour ?? 0).toFixed(2)}</span>
                <span className="text-xs text-neutral-400 font-medium">/ hour</span>
              </div>
            </div>

            {spot.pricePerDay && (
              <div className="text-right border-l border-neutral-800 pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">Daily rate</span>
                <span className="text-sm font-bold text-neutral-200">€{(spot.pricePerDay ?? 0).toFixed(2)} / day</span>
              </div>
            )}
          </div>

          {/* 🚗 VEHICLE COMPATIBILITY */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Car className="w-4 h-4 text-amber-400" />
                <span>VEHICLE COMPATIBILITY</span>
              </div>
              <span className="text-[11px] text-neutral-400">Suitable for:</span>
            </div>

            {/* Checkmark List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {supportedList.map((item) => {
                const supported = isVehicleSupported(item.type);
                return (
                  <div 
                    key={item.type}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      supported 
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-200' 
                        : 'bg-neutral-900/40 border-neutral-800/40 text-neutral-500'
                    }`}
                  >
                    {supported ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <span className="font-medium">{item.label}</span>
                    {!supported && <span className="text-[10px] text-orange-400/90 ml-auto">May not fit</span>}
                  </div>
                );
              })}
            </div>

            {/* Optional Dimensions */}
            {(spot.maxLength || spot.maxWidth || spot.maxHeight) && (
              <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" /> Max Dimensions:
                </span>
                {spot.maxLength && (
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
                    Length: <strong>{spot.maxLength}m</strong>
                  </span>
                )}
                {spot.maxWidth && (
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
                    Width: <strong>{spot.maxWidth}m</strong>
                  </span>
                )}
                {spot.maxHeight && (
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
                    Height clearance: <strong>{spot.maxHeight}m</strong>
                  </span>
                )}
              </div>
            )}

            {/* Compatibility Quick Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🟢 Your vehicle is compatible with this parking space dimensions.</span>
            </div>
          </div>

          {/* 🏠 PARKING TYPE */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              PARKING TYPE
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                <parkingTypeDetails.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{parkingTypeDetails.label}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{parkingTypeDetails.desc}</p>
              </div>
            </div>
          </div>

          {/* 🔐 SAFETY & SECURITY */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                SAFETY & SECURITY
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">Host-provided info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(spot.securityFeatures && spot.securityFeatures.length > 0 
                ? spot.securityFeatures 
                : ['closed_garage', 'automatic_gate', 'video_surveillance', 'well_lit', 'controlled_access']
              ).map((featKey) => {
                const feat = getSecurityFeatureLabel(featKey);
                const Icon = feat.icon;
                return (
                  <div key={featKey} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔑 ACCESS INFORMATION */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                ACCESS
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${difficultyBadge.color}`}>
                {difficultyBadge.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{accessDetails.label}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{accessDetails.desc}</p>
              </div>
            </div>

            {spot.accessNotes && (
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed"><strong className="text-white">Host note:</strong> {spot.accessNotes}</p>
              </div>
            )}
          </div>

          {/* 📍 LOCATION & PRIVACY MAP */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                LOCATION & PRIVACY
              </span>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {spot.approximateLocation}
              </span>
            </div>

            {/* Mini Map Canvas with Privacy Circle */}
            <div className="relative aspect-[16/8] w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
              {/* Stylized dark map placeholder background */}
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              
              {/* Privacy radius zone */}
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-amber-400/60 bg-amber-400/10 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/40">
                  <MapPin className="w-5 h-5 fill-neutral-950" />
                </div>
              </div>

              <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-medium text-neutral-300 border border-neutral-800">
                Approximate Zone (~300m radius)
              </div>
            </div>

            {/* Privacy Guard Notice */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-200">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-white">Exact address & access pass:</strong> For security, the exact street number and gate keycodes will be revealed directly in your booking confirmation once host <span className="text-white font-medium">{spot.ownerName}</span> accepts.
              </p>
            </div>
          </div>

          {/* ⭐ DETAILED MULTI-DIMENSION RATINGS */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-white">RATINGS & PERFORMANCE</span>
              </div>
              <span className="text-xs font-extrabold text-amber-400">{(spot.rating ?? 5.0).toFixed(1)} / 5.0</span>
            </div>

            {/* 5 Rating Dimension Categories */}
            <div className="space-y-2.5">
              {[
                { label: '📍 Location', value: avgLocation },
                { label: '🔐 Safety', value: avgSafety },
                { label: '🚗 Ease of Access', value: avgAccess },
                { label: '📸 Accuracy', value: avgAccuracy },
                { label: '🧹 Condition', value: avgCondition },
              ].map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-medium">{dim.label}</span>
                    <span className="text-neutral-200 font-bold">{dim.value.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      style={{ width: `${(dim.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-500">
                Ratings calculated strictly from verified driver checkouts.
              </span>
            </div>
          </div>

          {/* 💬 VERIFIED REVIEWS */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">REVIEWS</span>
                <span className="text-xs text-neutral-400">({reviews.length})</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
              </span>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400 space-y-1">
                  <p className="font-semibold text-neutral-300">No public reviews yet</p>
                  <p>Book this space to be the first driver to leave verified feedback!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.guestPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.guestName}
                          className="w-7 h-7 rounded-full object-cover object-center border border-amber-500/30"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{rev.guestName}</span>
                          <span className="text-[10px] text-neutral-500 block">
                            {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-400">
                          {(rev.overallRating || rev.rating || 5).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/60">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Verified booking
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* About & Description */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">About this Space</h4>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {spot.description}
            </p>
          </div>

          {/* Report Problem Link */}
          <div className="pt-2 text-center pb-4">
            <button
              id="report-listing-btn"
              onClick={handleOpenReport}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-400 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report an issue with this parking listing</span>
            </button>
          </div>

        </div>

        {/* Sticky Bottom Booking Bar */}
        <div className="sticky bottom-0 p-4 sm:p-5 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between gap-4 pb-safe">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Hourly rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400">€{(spot.pricePerHour ?? 0).toFixed(2)}</span>
              <span className="text-xs text-neutral-400">/ hr</span>
            </div>
          </div>

          <button
            id="request-booking-btn"
            onClick={handleStartBooking}
            className="flex-1 max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
          >
            <Calendar className="w-4 h-4" />
            <span>REQUEST BOOKING</span>
          </button>
        </div>

      </div>

      {/* Full-Screen Lightbox Modal for Photos */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={photos[activePhotoIdx] || photos[0]}
              alt={`Full view ${activePhotoIdx + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                  className="absolute left-2 p-3 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 p-3 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto max-w-md py-2">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setActivePhotoIdx(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  activePhotoIdx === i ? 'border-amber-400 scale-105' : 'border-neutral-700 opacity-60'
                }`}
              >
                <img src={src} alt="thumbnail" className="w-full h-full object-cover object-center" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
