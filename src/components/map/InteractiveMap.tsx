import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Navigation, 
  Plus, 
  Minus, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Crosshair, 
  Maximize2,
  Check,
  Compass,
  Globe,
  Map,
  Car,
  Clock,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { ParkingSpot, MapQuickFilter, LeavingSoonSpot, FreeParkingSpot } from '../../types';
import { useParking } from '../../contexts/ParkingContext';
import { LeavingSoonModal } from '../parking/LeavingSoonModal';
import { LeavingDetailModal } from '../parking/LeavingDetailModal';
import { FreeParkingDetailModal } from '../parking/FreeParkingDetailModal';
import { GOOGLE_PLACES_API_KEY } from '../../services/googlePlaces';

export type MapLayerType = 'google' | 'topographic' | 'satellite';

interface InteractiveMapProps {
  spots: ParkingSpot[];
  selectedSpot?: ParkingSpot | null;
  onSelectSpot?: (spot: ParkingSpot | null) => void;
  heightClass?: string;
}

const TILE_LAYERS: Record<MapLayerType, { 
  url: string; 
  attribution: string; 
  maxZoom: number; 
  label: string; 
  icon: string;
  subdomains?: string | string[];
}> = {
  google: {
    label: 'Google Maps',
    icon: '🗺️',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>',
    maxZoom: 20,
  },
  topographic: {
    label: 'Topografica',
    icon: '🧭',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satellite: {
    label: 'Satellite',
    icon: '🛰️',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>',
    maxZoom: 20,
  },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  heightClass = 'h-[400px] sm:h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  const { 
    mapQuickFilter, 
    setMapQuickFilter, 
    leavingSpots, 
    freeSpots,
    isLeavingSoonModalOpen,
    setIsLeavingSoonModalOpen,
    selectedLeavingSpot,
    setSelectedLeavingSpot,
    selectedFreeSpot,
    setSelectedFreeSpot,
    formatDistance,
    selectedSpot: contextSelectedSpot,
    setSelectedSpot,
    setDetailSpot
  } = useParking();

  const activeSelectedSpot = selectedSpot !== undefined ? selectedSpot : contextSelectedSpot;

  const [detailLeavingSpot, setDetailLeavingSpot] = useState<LeavingSoonSpot | null>(null);
  const [detailFreeSpot, setDetailFreeSpot] = useState<FreeParkingSpot | null>(null);

  // Default to Google Maps as requested
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize Map with Google Maps as default
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Rome coordinates
    const initialLat = 41.8985;
    const initialLng = 12.4850;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Initial tile layer (Google Maps standard)
    const initialLayerConfig = TILE_LAYERS['google'];
    const tileLayer = L.tileLayer(initialLayerConfig.url, {
      attribution: initialLayerConfig.attribution,
      maxZoom: initialLayerConfig.maxZoom,
      subdomains: initialLayerConfig.subdomains || '0123',
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size after layout renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layer when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const layerConfig = TILE_LAYERS[activeLayer];
    const newTileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || '0123',
    }).addTo(map);

    // Keep tiles beneath markers
    newTileLayer.bringToBack();
    currentTileLayerRef.current = newTileLayer;
  }, [activeLayer]);

  // Render & Update Markers for all 3 Parking Types
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    if (circleLayerRef.current) {
      mapInstanceRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // 1. Render Private Parking Spots
    const showPrivate = mapQuickFilter === 'all' || mapQuickFilter === 'available' || mapQuickFilter === 'private';
    if (showPrivate) {
      const filteredPrivates = mapQuickFilter === 'available' 
        ? spots.filter((s) => s.status === 'active')
        : spots;

      filteredPrivates.forEach((spot) => {
        const isSelected = activeSelectedSpot?.id === spot.id;

        const customIcon = L.divIcon({
          className: 'custom-parking-marker-wrapper',
          html: `
            <div class="relative cursor-pointer select-none group transition-transform duration-200 ${
              isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
            }">
              ${
                isSelected
                  ? '<div class="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping pointer-events-none"></div>'
                  : ''
              }
              <div class="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xl border transition-all ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 ring-4 ring-amber-400/30'
                  : 'bg-neutral-900 text-amber-300 border-amber-500/50 hover:bg-neutral-800'
              }">
                <span>€${(spot.pricePerHour ?? 0).toFixed(2)}</span>
                ${
                  spot.ownerHostStatus === 'super_host'
                    ? '<span class="text-[10px]">✨</span>'
                    : ''
                }
              </div>
              <div class="w-2 h-2 bg-amber-400 rotate-45 mx-auto -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [60, 32],
          iconAnchor: [30, 30],
        });

        const marker = L.marker([spot.latitude, spot.longitude], {
          icon: customIcon,
        });

        marker.on('click', () => {
          setSelectedFreeSpot(null);
          setSelectedLeavingSpot(null);
          setSelectedSpot(spot);
          if (onSelectSpot) {
            onSelectSpot(spot);
          }
        });

        markersGroup.addLayer(marker);
      });
    }

    // 2. Render Verified Free Parking Spots (Green)
    const showFree = mapQuickFilter === 'all' || mapQuickFilter === 'available' || mapQuickFilter === 'free';
    if (showFree) {
      freeSpots.forEach((freeSpot) => {
        const isSelected = selectedFreeSpot?.id === freeSpot.id;

        const freeIcon = L.divIcon({
          className: 'custom-free-marker-wrapper',
          html: `
            <div class="relative cursor-pointer select-none group transition-transform duration-200 ${
              isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
            }">
              ${
                isSelected
                  ? '<div class="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping pointer-events-none"></div>'
                  : ''
              }
              <div class="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xl border transition-all ${
                isSelected
                  ? 'bg-emerald-400 text-neutral-950 border-emerald-300 ring-4 ring-emerald-400/30'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
              }">
                <span class="text-[10px]">🅿️</span>
                <span>GRATIS</span>
              </div>
              <div class="w-2 h-2 bg-emerald-400 rotate-45 mx-auto -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [70, 32],
          iconAnchor: [35, 30],
        });

        const marker = L.marker([freeSpot.latitude, freeSpot.longitude], {
          icon: freeIcon,
        });

        marker.on('click', () => {
          setSelectedSpot(null);
          if (onSelectSpot) {
            onSelectSpot(null);
          }
          setSelectedLeavingSpot(null);
          setSelectedFreeSpot(freeSpot);
        });

        markersGroup.addLayer(marker);
      });
    }

    // 3. Render "In Uscita" Live Spots (Pulsing Orange)
    const showLeaving = mapQuickFilter === 'all' || mapQuickFilter === 'leaving_soon';
    if (showLeaving) {
      leavingSpots.forEach((leavingSpot) => {
        const isSelected = selectedLeavingSpot?.id === leavingSpot.id;
        const isReserved = leavingSpot.status === 'reserved';

        const leavingIcon = L.divIcon({
          className: 'custom-leaving-marker-wrapper',
          html: `
            <div class="relative cursor-pointer select-none group transition-transform duration-200 ${
              isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-30'
            }">
              <div class="absolute -inset-2 rounded-full ${
                isReserved ? 'bg-amber-600/30' : 'bg-orange-500/40 animate-ping'
              } pointer-events-none"></div>
              
              <div class="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xl border transition-all ${
                isSelected
                  ? 'bg-orange-500 text-neutral-950 border-orange-300 ring-4 ring-orange-500/40'
                  : isReserved
                  ? 'bg-neutral-900 text-amber-400 border-amber-500/80'
                  : 'bg-orange-500 text-neutral-950 border-orange-400 animate-pulse'
              }">
                <span class="text-[11px]">🚗</span>
                <span>${isReserved ? 'Riservato' : `In uscita • ${leavingSpot.departureMinutes}m`}</span>
              </div>
              <div class="w-2 h-2 ${isReserved ? 'bg-amber-500' : 'bg-orange-500'} rotate-45 mx-auto -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [110, 32],
          iconAnchor: [55, 30],
        });

        const marker = L.marker([leavingSpot.latitude, leavingSpot.longitude], {
          icon: leavingIcon,
        });

        marker.on('click', () => {
          setSelectedSpot(null);
          if (onSelectSpot) {
            onSelectSpot(null);
          }
          setSelectedFreeSpot(null);
          setSelectedLeavingSpot(leavingSpot);
        });

        markersGroup.addLayer(marker);
      });
    }

    // If a spot is selected, add privacy radius circle and pan to it
    if (activeSelectedSpot && activeSelectedSpot.id && mapInstanceRef.current) {
      const circle = L.circle([activeSelectedSpot.latitude, activeSelectedSpot.longitude], {
        radius: 200, // 200 meters privacy perimeter
        color: '#f59e0b',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#fbbf24',
        fillOpacity: 0.15,
      }).addTo(mapInstanceRef.current);

      circleLayerRef.current = circle;

      mapInstanceRef.current.setView(
        [activeSelectedSpot.latitude, activeSelectedSpot.longitude],
        Math.max(mapInstanceRef.current.getZoom(), 15),
        { animate: true }
      );
    } else if (selectedFreeSpot && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedFreeSpot.latitude, selectedFreeSpot.longitude],
        Math.max(mapInstanceRef.current.getZoom(), 15),
        { animate: true }
      );
    } else if (selectedLeavingSpot && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedLeavingSpot.latitude, selectedLeavingSpot.longitude],
        Math.max(mapInstanceRef.current.getZoom(), 15),
        { animate: true }
      );
    }
  }, [spots, leavingSpots, freeSpots, mapQuickFilter, activeSelectedSpot, selectedFreeSpot, selectedLeavingSpot, onSelectSpot, setSelectedSpot, setSelectedFreeSpot, setSelectedLeavingSpot]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || spots.length === 0) return;
    const bounds = L.latLngBounds(spots.map((s) => [s.latitude, s.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalizzazione non supportata');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true });

          // Add user position indicator pulse
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.9,
            weight: 3,
          })
            .addTo(mapInstanceRef.current)
            .bindPopup('<b>La tua Posizione</b>')
            .openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err);
        // Fallback to center Rome
        mapInstanceRef.current?.setView([41.8985, 12.4850], 14, { animate: true });
      },
      { timeout: 8000 }
    );
  };

  return (
    <div 
      id="interactive-map-container"
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 select-none`}
    >
      {/* Real Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
        style={{ background: '#f1f5f9' }}
      />

      {/* TOP BAR CONTROLS: 3-Layer Selector & Privacy Guarantee */}
      <div className="absolute top-3 inset-x-3 z-30 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Privacy + Layer Switcher + Sto Liberando il Posto CTA */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Privacy Pill */}
          <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-[11px] text-neutral-200 shadow-xl">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold hidden xs:inline">Zone approssimative per privacy</span>
            <span className="font-semibold xs:hidden">Zone privacy</span>
          </div>

          {/* Sto Liberando il Posto Action CTA */}
          <button
            id="map-leaving-soon-cta-btn"
            type="button"
            onClick={() => setIsLeavingSoonModalOpen(true)}
            className="pointer-events-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 px-3 py-1.5 rounded-2xl font-black text-xs shadow-xl flex items-center gap-1.5 transition-transform active:scale-95 border border-amber-300"
            title="Segnala che stai liberando il tuo posto auto"
          >
            <Car className="w-4 h-4 shrink-0" />
            <span>Sto liberando il posto</span>
          </button>

          {/* 3 Map Levels Selector (Google Maps [Default] | Topografica | Satellite) */}
          <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-800 p-1 rounded-2xl shadow-xl flex items-center gap-1">
            {(['google', 'topographic', 'satellite'] as MapLayerType[]).map((layerKey) => {
              const config = TILE_LAYERS[layerKey];
              const isActive = activeLayer === layerKey;
              return (
                <button
                  key={layerKey}
                  id={`map-layer-${layerKey}-btn`}
                  type="button"
                  onClick={() => setActiveLayer(layerKey)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 shadow-md scale-105'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                  }`}
                  title={`Passa a visualizzazione ${config.label}`}
                >
                  <span>{config.icon}</span>
                  <span className="text-[11px]">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Four Primary Quick Filters + Free filter pill */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 pointer-events-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-800/90 p-1 rounded-2xl shadow-xl w-fit max-w-full">
          {[
            { id: 'all', label: 'Tutti', icon: '📍', count: spots.length + freeSpots.length + leavingSpots.length },
            { id: 'available', label: 'Liberi', icon: '🟢', count: freeSpots.length + spots.filter(s => s.status === 'active').length },
            { id: 'leaving_soon', label: 'In uscita', icon: '🚗', count: leavingSpots.filter(s => s.status === 'leaving_soon').length, isLive: true },
            { id: 'private', label: 'Privati', icon: '🔒', count: spots.length },
            { id: 'free', label: 'Gratuiti', icon: '🅿️', count: freeSpots.length },
          ].map((tab) => {
            const isSelected = mapQuickFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`map-quick-filter-${tab.id}-btn`}
                type="button"
                onClick={() => setMapQuickFilter(tab.id as MapQuickFilter)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.isLive && tab.count > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* BOTTOM-RIGHT NAVIGATION CONTROLS */}
      <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 p-1.5 rounded-2xl shadow-2xl">
        <button
          id="map-locate-me-btn"
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-2 rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          title="La mia posizione attuale"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        <button
          id="map-fit-bounds-btn"
          type="button"
          onClick={handleFitBounds}
          className="p-2 rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
          title="Mostra tutti i parcheggi disponibili"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-neutral-800 my-0.5" />

        <button
          id="map-zoom-in-btn"
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out-btn"
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM FLOATING CARD: SELECTED PRIVATE SPOT */}
      {activeSelectedSpot && activeSelectedSpot.id && (
        <div 
          id="map-selected-private-card"
          className="absolute bottom-3 left-3 right-16 sm:right-auto sm:max-w-sm z-30 bg-neutral-950/95 backdrop-blur-md border border-amber-500/50 p-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-neutral-100"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950">
                🔒 Privato
              </span>
              {formatDistance(activeSelectedSpot.latitude, activeSelectedSpot.longitude) && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-amber-300 border border-amber-500/30">
                  📍 {formatDistance(activeSelectedSpot.latitude, activeSelectedSpot.longitude)} da te
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSpot(null);
                if (onSelectSpot) {
                  onSelectSpot(null);
                }
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Chiudi anteprima"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 my-2.5">
            <img
              src={activeSelectedSpot.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80'}
              alt={activeSelectedSpot.title}
              className="w-12 h-12 rounded-xl object-cover object-center border border-neutral-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold text-white truncate">{activeSelectedSpot.title}</h5>
              <p className="text-[11px] text-neutral-400 truncate">{activeSelectedSpot.approximateLocation}</p>
              <div className="text-xs font-black text-amber-400 mt-0.5">
                €{(activeSelectedSpot.pricePerHour ?? 0).toFixed(2)}/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeSelectedSpot.latitude},${activeSelectedSpot.longitude}`, '_blank');
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Indicazioni</span>
            </button>
            <button
              type="button"
              onClick={() => setDetailSpot(activeSelectedSpot)}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-1 transition-colors active:scale-95"
            >
              <span>Dettagli</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CARD: SELECTED VERIFIED FREE SPOT */}
      {selectedFreeSpot && (
        <div 
          id="map-selected-free-card"
          className="absolute bottom-3 left-3 right-16 sm:right-auto sm:max-w-sm z-30 bg-neutral-950/95 backdrop-blur-md border border-emerald-500/50 p-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-neutral-100"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-neutral-950">
                🅿️ 100% Gratis
              </span>
              {formatDistance(selectedFreeSpot.latitude, selectedFreeSpot.longitude) && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-emerald-300 border border-emerald-500/30">
                  📍 {formatDistance(selectedFreeSpot.latitude, selectedFreeSpot.longitude)} da te
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                selectedFreeSpot.currentStatus === 'full' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {selectedFreeSpot.currentStatus === 'full' ? '🔴 Segnalato Pieno' : '🟢 Libero Disponibile'}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFreeSpot(null);
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Chiudi anteprima"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2.5">
            <h5 className="text-xs font-bold text-white truncate">{selectedFreeSpot.name}</h5>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{selectedFreeSpot.address}</p>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Fonte: <strong className="text-neutral-300">{selectedFreeSpot.source}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedFreeSpot.latitude},${selectedFreeSpot.longitude}`, '_blank');
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Indicazioni</span>
            </button>
            <button
              type="button"
              onClick={() => setDetailFreeSpot(selectedFreeSpot)}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-1 transition-colors active:scale-95"
            >
              <span>Dettagli & Segnala</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CARD: SELECTED IN USCITA LIVE SPOT */}
      {selectedLeavingSpot && (
        <div 
          id="map-selected-leaving-card"
          className="absolute bottom-3 left-3 right-16 sm:right-auto sm:max-w-sm z-30 bg-neutral-950/95 backdrop-blur-md border border-orange-500/60 p-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-neutral-100"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500 text-neutral-950 flex items-center gap-1">
                <Car className="w-3 h-3 animate-pulse" />
                <span>In Uscita</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40">
                Tra {selectedLeavingSpot.departureMinutes} min
              </span>
              {formatDistance(selectedLeavingSpot.latitude, selectedLeavingSpot.longitude) && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-orange-300 border border-orange-500/30">
                  📍 {formatDistance(selectedLeavingSpot.latitude, selectedLeavingSpot.longitude)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLeavingSpot(null);
              }}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Chiudi anteprima"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2.5">
            <h5 className="text-xs font-bold text-white truncate">{selectedLeavingSpot.title}</h5>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{selectedLeavingSpot.address}</p>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLeavingSpot.latitude},${selectedLeavingSpot.longitude}`, '_blank');
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              <span>Indicazioni</span>
            </button>
            <button
              type="button"
              onClick={() => setDetailLeavingSpot(selectedLeavingSpot)}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-300 hover:to-amber-300 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-1 transition-colors active:scale-95 shadow-md"
            >
              <span>Riserva Posto</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals for Unified Experience */}
      <LeavingSoonModal 
        isOpen={isLeavingSoonModalOpen} 
        onClose={() => setIsLeavingSoonModalOpen(false)} 
      />

      <LeavingDetailModal 
        spot={detailLeavingSpot} 
        onClose={() => setDetailLeavingSpot(null)} 
      />

      <FreeParkingDetailModal 
        spot={detailFreeSpot} 
        onClose={() => setDetailFreeSpot(null)} 
      />
    </div>
  );
};
