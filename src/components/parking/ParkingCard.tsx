import React from 'react';
import { Star, MapPin, Shield, Car, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { ParkingSpot } from '../../types';
import { TrustBadge } from '../common/TrustBadge';

interface ParkingCardProps {
  spot: ParkingSpot;
  onSelect: (spot: ParkingSpot) => void;
  selected?: boolean;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({ spot, onSelect, selected }) => {
  const getParkingTypeLabel = (type: ParkingSpot['parkingType']) => {
    switch (type) {
      case 'garage': return 'Underground Garage';
      case 'box': return 'Private Lockbox';
      case 'driveway': return 'Private Driveway';
      case 'covered': return 'Covered Courtyard';
      case 'indoor': return 'Indoor Space';
      case 'open': default: return 'Open Courtyard';
    }
  };

  const getVehicleSizeLabel = (size: ParkingSpot['vehicleSize']) => {
    switch (size) {
      case 'compact': return 'Compact / City Car';
      case 'sedan': return 'Sedan / Hatchback';
      case 'suv': return 'SUV / Large Car';
      case 'van': return 'Van / Minibus';
      case 'motorcycle': return 'Motorcycle';
      case 'all': default: return 'All Vehicles';
    }
  };

  return (
    <div
      id={`parking-card-${spot.id}`}
      onClick={() => onSelect(spot)}
      className={`group cursor-pointer rounded-2xl bg-neutral-900 border transition-all duration-200 overflow-hidden flex flex-col ${
        selected
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl shadow-amber-500/10'
          : 'border-neutral-800 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      {/* Image Thumbnail & Overlays */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
        <img
          src={spot.photos[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'}
          alt={spot.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-neutral-950/90 backdrop-blur-md border border-neutral-700/80 px-2.5 py-1 rounded-xl shadow-md">
          <span className="text-amber-400 font-extrabold text-sm">€{(spot.pricePerHour ?? 0).toFixed(2)}</span>
          <span className="text-neutral-400 text-[10px] ml-0.5">/hr</span>
        </div>

        {/* Space Type Badge */}
        <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 px-2 py-0.5 rounded-lg text-[11px] text-neutral-200 font-medium">
          {getParkingTypeLabel(spot.parkingType)}
        </div>

        {/* Status indicator if not active */}
        {spot.status !== 'active' && (
          <div className="absolute top-3 left-3 bg-rose-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
            {spot.status.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Approximate Location */}
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            <span className="truncate">{spot.approximateLocation}</span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-white text-sm leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
            {spot.title}
          </h4>

          {/* Vehicle Compatibility & Access */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-neutral-800/80 px-2 py-0.5 rounded-md text-neutral-300">
              <Car className="w-3 h-3 text-neutral-400" />
              {getVehicleSizeLabel(spot.vehicleSize)}
            </span>
          </div>
        </div>

        {/* Host Trust Footer */}
        <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          {/* Host Info & Trust Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={spot.ownerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={spot.ownerName}
              className="w-6 h-6 rounded-full object-cover object-center border border-neutral-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs text-neutral-200 truncate font-medium">{spot.ownerName}</div>
            </div>
          </div>

          {/* Host status badge + Rating */}
          <div className="flex items-center gap-1.5 shrink-0">
            <TrustBadge status={spot.ownerHostStatus} size="sm" />
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{(spot.rating ?? 5.0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
