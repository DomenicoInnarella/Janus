import React from 'react';
import { ArrowRight, Search, MapPin, PlusCircle } from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';

export const ParkingHighlights: React.FC = () => {
  const { setActiveTab } = useParking();
  const { requireAuth } = useAuth();

  const handleScrollToMap = () => {
    const mapEl = document.getElementById('map-container');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section 
      id="parking-highlights-section" 
      aria-label="Find Park Go Highlights"
      className="w-full my-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Card 1: Find. Park. Go. */}
        <div 
          id="highlight-find-park-go"
          onClick={() => setActiveTab('search')}
          className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/75 hover:bg-neutral-900 border border-neutral-800/90 hover:border-amber-400/40 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Parking">
                🅿️
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 group-hover:text-amber-400 transition-colors">
                <Search className="w-3 h-3" />
                <span>Search</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Find. Park. Go.
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Find available parking near your destination — fast and easy.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Trova Posto</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 2: Your City, One Map */}
        <div 
          id="highlight-your-city-map"
          onClick={handleScrollToMap}
          className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/75 hover:bg-neutral-900 border border-neutral-800/90 hover:border-amber-400/40 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Map Pin">
                📍
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 group-hover:text-amber-400 transition-colors">
                <MapPin className="w-3 h-3" />
                <span>Live Map</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Your City, One Map
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Discover parking spaces around you and reserve your spot before you arrive.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Guarda Mappa</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 3: Got a Free Spot? */}
        <div 
          id="highlight-got-free-spot"
          onClick={() => requireAuth(() => setActiveTab('publish'))}
          className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-900/75 hover:bg-neutral-900 border border-neutral-800/90 hover:border-amber-400/40 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Money Bag">
                💰
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 group-hover:text-amber-400 transition-colors">
                <PlusCircle className="w-3 h-3" />
                <span>Earn</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Got a Free Spot?
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Share your parking space and turn empty space into extra income.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Condividi & Guadagna</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </section>
  );
};
