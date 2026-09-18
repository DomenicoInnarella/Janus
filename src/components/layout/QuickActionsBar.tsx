import React from 'react';
import { 
  Search, 
  MapPin, 
  ShieldAlert, 
  PlusCircle, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Car, 
  Coffee, 
  ShieldCheck, 
  LogOut, 
  Award, 
  Music, 
  Coins, 
  Info,
  CloudRain
} from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';

export interface QuickActionChip {
  id: string;
  label: string; // Max 1-2 parole
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  urgent?: boolean;
}

interface QuickActionsBarProps {
  onOpenCoffee?: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onOpenCoffee }) => {
  const { 
    activeTab, 
    setActiveTab, 
    searchFilters, 
    setSearchFilters 
  } = useParking();
  const { user, signOut, openAuthModal, requireAuth } = useAuth();

  // Genera chip rapide per ogni schermata: etichette rigorosamente di max 1-2 parole
  const getChipsForTab = (): QuickActionChip[] => {
    switch (activeTab) {
      case 'home':
        return [
          {
            id: 'chip-home-search',
            label: 'Parcheggi',
            icon: Car,
            onClick: () => setActiveTab('search'),
          },
          {
            id: 'chip-home-ztl',
            label: 'Varchi ZTL',
            icon: ShieldAlert,
            onClick: () => setActiveTab('city-guide'),
          },
          {
            id: 'chip-home-publish',
            label: 'Pubblica',
            icon: PlusCircle,
            onClick: () => requireAuth(() => setActiveTab('publish')),
          },
          {
            id: 'chip-home-coffee',
            label: 'Offri Caffè',
            icon: Coffee,
            onClick: () => onOpenCoffee?.(),
          },
        ];

      case 'search': {
        const isAllActive = !searchFilters.query && searchFilters.parkingType === 'all' && !searchFilters.verifiedHostOnly;
        return [
          {
            id: 'chip-search-all',
            label: 'Tutti',
            icon: Car,
            active: isAllActive,
            onClick: () => setSearchFilters({ query: '', parkingType: 'all', vehicleSize: 'all', verifiedHostOnly: false }),
          },
          {
            id: 'chip-search-trastevere',
            label: 'Trastevere',
            icon: MapPin,
            active: searchFilters.query.toLowerCase() === 'trastevere',
            onClick: () => setSearchFilters({ ...searchFilters, query: searchFilters.query === 'Trastevere' ? '' : 'Trastevere' }),
          },
          {
            id: 'chip-search-termini',
            label: 'Termini FS',
            icon: MapPin,
            active: searchFilters.query.toLowerCase() === 'termini',
            onClick: () => setSearchFilters({ ...searchFilters, query: searchFilters.query === 'Termini' ? '' : 'Termini' }),
          },
          {
            id: 'chip-search-prati',
            label: 'Prati',
            icon: MapPin,
            active: searchFilters.query.toLowerCase() === 'prati',
            onClick: () => setSearchFilters({ ...searchFilters, query: searchFilters.query === 'Prati' ? '' : 'Prati' }),
          },
          {
            id: 'chip-search-colosseo',
            label: 'Colosseo',
            icon: MapPin,
            active: searchFilters.query.toLowerCase() === 'colosseo',
            onClick: () => setSearchFilters({ ...searchFilters, query: searchFilters.query === 'Colosseo' ? '' : 'Colosseo' }),
          },
          {
            id: 'chip-search-garage',
            label: 'Coperti',
            icon: ShieldCheck,
            active: searchFilters.parkingType === 'garage',
            onClick: () => setSearchFilters({ 
              ...searchFilters, 
              parkingType: searchFilters.parkingType === 'garage' ? 'all' : 'garage' 
            }),
          },
        ];
      }

      case 'bookings':
        return [
          {
            id: 'chip-book-search',
            label: 'Cerca Posto',
            icon: Search,
            onClick: () => setActiveTab('search'),
          },
          {
            id: 'chip-book-ztl',
            label: 'Pass ZTL',
            icon: ShieldAlert,
            onClick: () => setActiveTab('city-guide'),
          },
          {
            id: 'chip-book-publish',
            label: 'Pubblica',
            icon: PlusCircle,
            onClick: () => requireAuth(() => setActiveTab('publish')),
          },
        ];

      case 'city-guide':
        return [
          {
            id: 'chip-city-112',
            label: 'SOS 112',
            icon: PhoneCall,
            urgent: true,
            onClick: () => {
              window.location.href = 'tel:112';
            },
          },
          {
            id: 'chip-city-ztl',
            label: 'Varchi ZTL',
            icon: ShieldAlert,
            onClick: () => {
              const el = document.getElementById('city-ztl-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            id: 'chip-city-meteo',
            label: 'Meteo Roma',
            icon: CloudRain,
            onClick: () => {
              const el = document.getElementById('city-meteo-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            id: 'chip-city-bus',
            label: 'Bus Metro',
            icon: Car,
            onClick: () => {
              const el = document.getElementById('city-transport-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            id: 'chip-city-events',
            label: 'Eventi Salsa',
            icon: Music,
            onClick: () => {
              const el = document.getElementById('city-events-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
        ];

      case 'publish':
        return [
          {
            id: 'chip-pub-guide',
            label: 'Guida Host',
            icon: Info,
            onClick: () => {
              const el = document.getElementById('publish-guide');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
          {
            id: 'chip-pub-ztl',
            label: 'Tariffe ZTL',
            icon: Coins,
            onClick: () => setActiveTab('city-guide'),
          },
          {
            id: 'chip-pub-guarantee',
            label: 'Garanzia 100%',
            icon: ShieldCheck,
            onClick: () => {
              const el = document.getElementById('publish-guarantee');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          },
        ];

      case 'profile':
        return [
          {
            id: 'chip-prof-docs',
            label: 'Documenti CIE',
            icon: Award,
            onClick: () => {
              const btn = document.querySelector('button[data-action="manage-docs"]') as HTMLButtonElement;
              if (btn) btn.click();
            },
          },
          {
            id: 'chip-prof-spots',
            label: 'I Miei Posti',
            icon: Car,
            onClick: () => requireAuth(() => setActiveTab('publish')),
          },
          {
            id: 'chip-prof-auth',
            label: user ? 'Esci' : 'Accedi',
            icon: LogOut,
            onClick: user ? signOut : openAuthModal,
          },
        ];

      default:
        return [];
    }
  };

  const chips = getChipsForTab();

  if (chips.length === 0) return null;

  return (
    <div
      id="quick-actions-bar"
      className="w-full bg-neutral-950/90 backdrop-blur-md px-2 py-1.5 z-30"
    >
      <div 
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap max-w-xl mx-auto px-1 py-0.5"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {chips.map((chip) => {
          const Icon = chip.icon;
          const isSelected = chip.active;

          // Regola usabilità: un solo colore di accento (ambra per attivo, rosso per urgenza), tutto il resto neutro
          let styleClasses = 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700';
          
          if (chip.urgent) {
            styleClasses = 'bg-rose-600 border-rose-500 text-white font-extrabold shadow-sm shadow-rose-600/30';
          } else if (isSelected) {
            styleClasses = 'bg-amber-400 text-neutral-950 border-amber-400 font-extrabold shadow-sm shadow-amber-400/20';
          }

          return (
            <button
              key={chip.id}
              id={chip.id}
              onClick={chip.onClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 shrink-0 min-h-[36px] ${styleClasses}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected || chip.urgent ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
