import React, { useState } from 'react';
import { 
  Home, 
  Car, 
  CalendarCheck, 
  ShieldAlert, 
  PlusCircle 
} from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationTab } from '../../types';
import { QuickActionsBar } from './QuickActionsBar';
import { BuyMeCoffeeModal } from '../common/BuyMeCoffeeModal';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, hostBookings } = useParking();
  const { user, requireAuth } = useAuth();
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);

  const pendingBookingsCount = hostBookings.filter((b) => b.status === 'pending').length;

  const handleTabClick = (tab: NavigationTab) => {
    if (tab === 'publish') {
      requireAuth(() => setActiveTab('publish'));
      return;
    }
    if (tab === 'bookings' && !user) {
      requireAuth(() => setActiveTab('bookings'));
      return;
    }
    setActiveTab(tab);
  };

  // Massimo 5 voci fisse, sintesi 1-2 parole
  const navItems: { 
    id: string;
    tab: NavigationTab; 
    label: string; 
    icon: React.FC<{ className?: string }>; 
    badge?: number;
  }[] = [
    { id: 'nav-home', tab: 'home', label: 'Home', icon: Home },
    { id: 'nav-search', tab: 'search', label: 'Parcheggi', icon: Car },
    { id: 'nav-publish', tab: 'publish', label: 'Pubblica', icon: PlusCircle },
    { 
      id: 'nav-bookings', 
      tab: 'bookings', 
      label: 'Prenotazioni', 
      icon: CalendarCheck, 
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined 
    },
    { id: 'nav-sos', tab: 'city-guide', label: 'SOS & ZTL', icon: ShieldAlert },
  ];

  return (
    <>
      <div 
        id="app-bottom-bar-container"
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-col pointer-events-auto bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 shadow-2xl transition-all"
      >
        {/* LIVELLO SUPERIORE: riga orizzontale scorrevole di chip pillola per azioni rapide / filtri */}
        <div className="border-b border-neutral-900/80">
          <QuickActionsBar onOpenCoffee={() => setIsCoffeeOpen(true)} />
        </div>

        {/* LIVELLO INFERIORE: tab bar principale, massimo 5 voci fisse, icona sopra + etichetta sotto, distribuite uniformemente */}
        <nav
          id="main-bottom-navigation-bar"
          className="w-full px-1.5 pt-1.5 pb-safe"
        >
          <div className="flex items-center justify-around max-w-xl mx-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => handleTabClick(item.tab)}
                  className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-150 active:scale-95 min-h-[50px]"
                >
                  {/* Icona sopra: unico colore d'accento ambra per attivo, neutro per gli altri */}
                  <div 
                    className={`relative flex items-center justify-center px-3 py-1 rounded-full transition-all ${
                      isActive 
                        ? 'bg-amber-400/15 text-amber-400' 
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon 
                      className={`w-5 h-5 transition-transform ${
                        isActive 
                          ? 'stroke-[2.5] text-amber-400 scale-105' 
                          : 'stroke-[1.8] text-neutral-400'
                      }`} 
                    />

                    {/* Numeric Badge (es. richieste sosta in attesa) */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-amber-400 text-[8px] font-black text-neutral-950 flex items-center justify-center shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Etichetta sotto: max 1-2 parole */}
                  <span 
                    className={`text-[10px] sm:text-[11px] mt-1 tracking-tight leading-none truncate max-w-[65px] ${
                      isActive ? 'text-amber-400 font-extrabold' : 'text-neutral-400 font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Buy Me a Coffee Modal */}
      <BuyMeCoffeeModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
    </>
  );
};
