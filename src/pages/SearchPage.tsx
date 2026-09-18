import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Map, 
  List, 
  ShieldCheck, 
  Car, 
  X, 
  MapPin, 
  Sparkles,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';
import { useParking } from '../contexts/ParkingContext';
import { ParkingCard } from '../components/parking/ParkingCard';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { ParkingType, VehicleSize } from '../types';

const ROME_ZONES = [
  { id: '', label: 'Tutte le zone' },
  { id: 'Trastevere', label: 'Trastevere' },
  { id: 'Termini', label: 'Termini' },
  { id: 'Prati', label: 'Prati / Vaticano' },
  { id: 'Colosseo', label: 'Colosseo / Monti' },
  { id: 'Centro Storico', label: 'Centro Storico' },
  { id: 'Testaccio', label: 'Testaccio / Ostiense' },
  { id: 'EUR', label: 'EUR' },
  { id: 'Parioli', label: 'Parioli / Flaminio' },
];

export const SearchPage: React.FC = () => {
  const { 
    filteredSpots, 
    filters, 
    setFilters, 
    selectedSpot, 
    setSelectedSpot, 
    setDetailSpot,
    spots
  } = useParking();

  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'default'>('default');

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
  };

  const handleZoneSelect = (zone: string) => {
    setFilters((prev) => ({ ...prev, query: zone }));
  };

  const handleTypeFilter = (type: ParkingType | 'all') => {
    setFilters((prev) => ({ ...prev, parkingType: type }));
  };

  const handleVehicleFilter = (size: VehicleSize | 'all') => {
    setFilters((prev) => ({ ...prev, vehicleSize: size }));
  };

  const handleVerifiedToggle = () => {
    setFilters((prev) => ({ ...prev, verifiedHostOnly: !prev.verifiedHostOnly }));
  };

  // Sorting
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    if (sortBy === 'price_asc') return a.pricePerHour - b.pricePerHour;
    if (sortBy === 'price_desc') return b.pricePerHour - a.pricePerHour;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 app-content-pb">
      
      {/* 🏛️ HEADER SECTION */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-800/90 p-3.5 sm:p-5 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[11px] font-black">
                <Car className="w-3.5 h-3.5" /> TUTTI I PARCHEGGI
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                {spots.length} Posti Auto a Roma
              </span>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex sm:hidden rounded-xl bg-neutral-950 border border-neutral-800 p-0.5">
              <button
                onClick={() => setViewMode('both')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'both' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                Tutto
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'list' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'map' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
                }`}
              >
                Mappa
              </button>
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Cerca e Prenota Parcheggio a Roma
          </h1>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Trova garages custoditi, posti auto coperti e cancelli privati nelle zone a traffico limitato (ZTL), 
            vicino a stazioni, monumenti e aeroporti con pagamento protetto Stripe.
          </p>

          {/* Search Bar Input */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus-within:border-amber-400/80 shadow-sm transition-all">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={filters.query}
                onChange={handleQueryChange}
                placeholder="Cerca via, zona o quartiere (es. Trastevere, Termini, Prati...)"
                className="w-full bg-transparent text-white text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none"
              />
              {filters.query && (
                <button
                  onClick={() => setFilters((p) => ({ ...p, query: '' }))}
                  className="p-1 rounded-md text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                filters.parkingType !== 'all' || filters.vehicleSize !== 'all' || filters.verifiedHostOnly
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-black'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Filtri</span>
            </button>
          </div>

          {/* Quick Zone Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
            {ROME_ZONES.map((zone) => {
              const isSelected = (!zone.id && !filters.query) || (zone.id && filters.query.toLowerCase().includes(zone.id.toLowerCase()));
              return (
                <button
                  key={zone.label}
                  type="button"
                  onClick={() => handleZoneSelect(zone.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 min-h-[36px] flex items-center ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-sm'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  {zone.label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Expandable Advanced Filters Drawer */}
      {showFiltersDrawer && (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 animate-in fade-in duration-200 shadow-xl">
          
          {/* Tipologia Posto */}
          <div>
            <span className="text-[11px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Tipologia Posto</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'Tutte le tipologie' },
                { key: 'garage', label: 'Garage Sotterraneo' },
                { key: 'box', label: 'Box Privato Chiuso' },
                { key: 'driveway', label: 'Passo Carrabile' },
                { key: 'covered', label: 'Posto Coperto' },
                { key: 'open', label: 'Cortile Aperto' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTypeFilter(t.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                    filters.parkingType === t.key
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensioni Veicolo */}
          <div>
            <span className="text-[11px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Dimensione Veicolo</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'Qualsiasi Veicolo' },
                { key: 'compact', label: 'City Car / Compatta' },
                { key: 'sedan', label: 'Berlina' },
                { key: 'suv', label: 'SUV / Grande' },
                { key: 'van', label: 'Furgone / Van' },
                { key: 'motorcycle', label: 'Moto / Scooter' },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => handleVehicleFilter(v.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                    filters.vehicleSize === v.key
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordinamento & Super Host */}
          <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-bold">Ordina per:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-amber-400 min-h-[36px]"
              >
                <option value="default">In evidenza</option>
                <option value="price_asc">Prezzo: dal più basso</option>
                <option value="price_desc">Prezzo: dal più alto</option>
                <option value="rating">Valutazione più alta</option>
              </select>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2 text-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Solo Super Host Verificati</span>
              </div>
              <button
                onClick={handleVerifiedToggle}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  filters.verifiedHostOnly ? 'bg-amber-400' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-neutral-950 transition-transform ${
                    filters.verifiedHostOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Main Grid / Map Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Map Column */}
        <div className={`lg:col-span-6 xl:col-span-7 sticky top-16 h-fit ${viewMode === 'list' ? 'hidden sm:block' : 'block'}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Posizioni Parcheggi sulla Mappa</span>
              </span>
              <span className="text-neutral-400">{sortedSpots.length} disponibili</span>
            </div>

            <InteractiveMap
              spots={sortedSpots}
              selectedSpot={selectedSpot}
              onSelectSpot={(s) => {
                setSelectedSpot(s);
              }}
              heightClass="h-[340px] sm:h-[480px]"
            />
          </div>
        </div>

        {/* Parking Spots List Column */}
        <div className={`lg:col-span-6 xl:col-span-5 space-y-3.5 ${viewMode === 'map' ? 'hidden sm:block' : 'block'}`}>
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span className="font-semibold text-white">
              {sortedSpots.length} {sortedSpots.length === 1 ? 'parcheggio trovato' : 'parcheggi trovati'}
            </span>
            {selectedSpot && (
              <span className="text-amber-400 font-bold">Selezionato sulla mappa</span>
            )}
          </div>

          {sortedSpots.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
              <Car className="w-10 h-10 text-neutral-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">Nessun parcheggio trovato per questi criteri</h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Prova a selezionare una zona differente o a resettare i filtri di ricerca.
              </p>
              <button
                onClick={() => {
                  setFilters({ query: '', parkingType: 'all', vehicleSize: 'all', maxPrice: 0, verifiedHostOnly: false });
                  setSortBy('default');
                }}
                className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors min-h-[44px]"
              >
                Resetta Tutti i Filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {sortedSpots.map((spot) => (
                <ParkingCard
                  key={spot.id}
                  spot={spot}
                  selected={selectedSpot?.id === spot.id}
                  onSelect={(s) => {
                    setSelectedSpot(s);
                    setDetailSpot(s);
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

