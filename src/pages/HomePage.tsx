import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  Key, 
  Compass, 
  Users, 
  Coffee, 
  CheckCircle2, 
  Info, 
  Eye, 
  ShieldAlert, 
  Bot,
  Car,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useParking } from '../contexts/ParkingContext';
import { useAuth } from '../contexts/AuthContext';
import { ParkingCard } from '../components/parking/ParkingCard';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { BuyMeCoffeeModal } from '../components/common/BuyMeCoffeeModal';
import { HowItWorksFlow } from '../components/home/HowItWorksFlow';
import { ParkingHighlights } from '../components/home/ParkingHighlights';

const QUICK_NEIGHBORHOODS = [
  'Trastevere',
  'Colosseo / Monti',
  'Prati / Vaticano',
  'Termini',
  'Centro Storico',
  'EUR',
];

export const HomePage: React.FC = () => {
  const { spots, executeSearch, setDetailSpot, setActiveTab, selectedSpot, setSelectedSpot } = useParking();
  const { requireAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery.trim());
  };

  const handleQuickSearch = (zone: string) => {
    setSearchQuery(zone);
    executeSearch(zone);
  };

  const handleShareClick = () => {
    requireAuth(() => {
      setActiveTab('publish');
    });
  };

  const featuredSpots = spots.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 space-y-3 sm:space-y-4 app-content-pb">
      
      {/* 🔍 HERO & BARRA RICERCA PEER-TO-PEER SOPRA LA MAPPA */}
      <div 
        id="home-search-bar"
        className="relative rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3 sm:p-4 shadow-md overflow-hidden"
      >
        <div className="flex flex-col gap-3">
          {/* Hero Header: Peer-to-Peer Parking Messaging */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-neutral-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold tracking-wide uppercase mb-1.5">
                <Car className="w-3 h-3 text-amber-400" />
                <span>Peer-to-Peer Parking Marketplace</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-300 font-medium normal-case">Roma</span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight leading-tight">
                Share Your Space. Make Parking Easier.
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
                Turn private parking spaces into convenient parking.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs self-start sm:self-center shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {spots.length} posti verificati
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ZTL protetta
              </span>
            </div>
          </div>

          {/* Search bar & quick zone shortcuts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-semibold text-neutral-400 shrink-0">Zone:</span>
              {QUICK_NEIGHBORHOODS.slice(0, 4).map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => handleQuickSearch(zone)}
                  className="px-2 py-0.5 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors shrink-0"
                >
                  {zone}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-md flex items-center gap-1.5">
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca via, quartiere o ZTL (es. Trastevere, Termini...)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/80 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-all shrink-0 active:scale-95"
              >
                Cerca
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 💡 OPTIONAL EXPANDABLE HOW IT WORKS GUIDE */}
      {showHowItWorks && (
        <div className="relative">
          <button
            onClick={() => setShowHowItWorks(false)}
            className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 z-20"
            title="Chiudi guida"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <HowItWorksFlow />
        </div>
      )}

      {/* 🗺️ MAPPA PROTAGONISTA (APRI -> GUARDA LA MAPPA -> TROVA PARCHEGGIO) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <h2 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Mappa Unica & Parcheggi Live a Roma</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-[11px] font-semibold text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors min-h-[36px]"
            >
              <Info className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">{showHowItWorks ? 'Nascondi guida' : 'Come funziona?'}</span>
              <span className="xs:hidden">{showHowItWorks ? 'Chiudi' : 'Guida'}</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors min-h-[36px]"
            >
              <span>Elenco Completo ({spots.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mappa Google Maps / Topo / Sat */}
        <InteractiveMap
          spots={spots}
          selectedSpot={selectedSpot}
          onSelectSpot={(s) => setSelectedSpot(s)}
          heightClass="h-[390px] sm:h-[480px] md:h-[530px]"
        />
      </div>

      {/* 🅿️ FIND. PARK. GO. & CITY HIGHLIGHTS */}
      <ParkingHighlights />

      {/* 🚗 SEZIONE CON TUTTI I PARCHEGGI IN EVIDENZA */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Posti Auto Privati & Garages a Roma</span>
            </h3>
            <p className="text-[11px] text-neutral-400">Posti auto coperti, cortili e box privati condivisi da host verificati a Roma</p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors min-h-[36px]"
          >
            <span>Vedi Tutti ({spots.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {featuredSpots.map((spot) => (
            <ParkingCard
              key={spot.id}
              spot={spot}
              onSelect={(s) => setDetailSpot(s)}
            />
          ))}
        </div>
      </div>

      {/* Host Call-to-Action Compact Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            <Users className="w-3 h-3" /> Peer-to-Peer Host Community
          </div>
          <h3 className="text-sm sm:text-base font-black text-white">
            Hai un posto auto o garage privato non utilizzato a Roma?
          </h3>
          <p className="text-[11px] text-neutral-400 max-w-lg leading-relaxed">
            Condividilo nelle ore libere con altri automobilisti e trasforma il tuo spazio privato in guadagno extra.
          </p>
        </div>

        <button
          onClick={handleShareClick}
          id="cta-share-spot-btn"
          className="w-full sm:w-auto min-h-[44px] py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 group active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pubblica il tuo Spazio</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Buy Me Coffee Modal */}
      <BuyMeCoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />

    </div>
  );
};

