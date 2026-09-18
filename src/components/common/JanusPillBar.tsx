import React from 'react';
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

export interface JanusPill {
  id: string;
  tab: NavigationTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  dotColor?: string;
  requiresAuth?: boolean;
}

interface JanusPillBarProps {
  className?: string;
}

export const JanusPillBar: React.FC<JanusPillBarProps> = ({
  className = '',
}) => {
  const { activeTab, setActiveTab, hostBookings } = useParking();
  const { user, requireAuth } = useAuth();

  const pendingBookingsCount = hostBookings.filter((b) => b.status === 'pending').length;

  const handleAction = (tab: NavigationTab, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      requireAuth(() => setActiveTab(tab));
      return;
    }
    setActiveTab(tab);
  };

  const pills: JanusPill[] = [
    {
      id: 'pill-home',
      tab: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'pill-search',
      tab: 'search',
      label: 'Tutti i Parcheggi',
      icon: Car,
      badge: 'ZTL',
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
    },
    {
      id: 'pill-bookings',
      tab: 'bookings',
      label: 'Prenotazioni',
      icon: CalendarCheck,
      badge: pendingBookingsCount > 0 ? `${pendingBookingsCount}` : undefined,
      badgeColor: 'bg-amber-400 text-neutral-950 font-black',
      requiresAuth: true,
    },
    {
      id: 'pill-sos',
      tab: 'city-guide',
      label: 'SOS & ZTL Roma',
      icon: ShieldAlert,
      badge: 'LIVE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      dotColor: 'bg-rose-500',
    },
    {
      id: 'pill-publish',
      tab: 'publish',
      label: 'Pubblica Posto',
      icon: PlusCircle,
      requiresAuth: true,
    },
  ];

  return (
    <div 
      id="janus-pill-bar"
      className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {pills.map((pill) => {
          const Icon = pill.icon;
          const isSelected = activeTab === pill.tab;

          // Highlighted active pill (Solid amber, high-contrast, rounded capsule)
          if (isSelected) {
            return (
              <button
                key={pill.id}
                id={pill.id}
                onClick={() => handleAction(pill.tab, pill.requiresAuth)}
                className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/25 active:scale-95 transition-all whitespace-nowrap min-h-[38px]"
              >
                <Icon className="w-4 h-4 text-neutral-950 fill-neutral-950/20 stroke-[2.5]" />
                <span>{pill.label}</span>
                {pill.badge && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-neutral-950 text-amber-400 text-[9px] font-black tracking-wider uppercase">
                    {pill.badge}
                  </span>
                )}
              </button>
            );
          }

          // Sleek dark pill with subtle border and icon
          return (
            <button
              key={pill.id}
              id={pill.id}
              onClick={() => handleAction(pill.tab, pill.requiresAuth)}
              className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all whitespace-nowrap min-h-[38px] shadow-sm"
            >
              <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-300 transition-colors stroke-[2]" />
              <span>{pill.label}</span>

              {pill.badge && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${pill.badgeColor || 'bg-neutral-800 text-neutral-300'}`}>
                  {pill.badge}
                </span>
              )}

              {pill.dotColor && !pill.badge && (
                <span className={`w-2 h-2 rounded-full ${pill.dotColor} animate-pulse`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

