import React, { useState } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  User, 
  MapPin, 
  Car, 
  CalendarCheck, 
  PlusCircle,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { NavigationTab } from '../../types';

export const Header: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { activeTab, setActiveTab, openContactModal } = useParking();
  const [language, setLanguage] = useState<'IT' | 'EN'>('IT');

  const toggleLanguage = () => {
    const nextLang = language === 'IT' ? 'EN' : 'IT';
    setLanguage(nextLang);
  };

  // Indicatore di contesto corrente: icona + testo breve (1-2 parole)
  const getContextIndicator = () => {
    switch (activeTab) {
      case 'home':
        return { icon: MapPin, text: 'Roma ZTL' };
      case 'search':
        return { icon: Car, text: 'Parcheggi' };
      case 'bookings':
        return { icon: CalendarCheck, text: 'Prenotazioni' };
      case 'city-guide':
        return { icon: ShieldAlert, text: 'SOS & ZTL' };
      case 'publish':
        return { icon: PlusCircle, text: 'Pubblica' };
      case 'profile':
        return { icon: User, text: 'Account' };
      default:
        return { icon: MapPin, text: 'Roma' };
    }
  };

  const context = getContextIndicator();
  const ContextIcon = context.icon;

  return (
    <header 
      id="app-header" 
      className="sticky top-0 z-40 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-3 sm:px-6 py-2 pt-safe shadow-md transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Sinistra: Logo/Nome del brand + Indicatore di contesto corrente (icona + testo breve) */}
        <div 
          id="brand-logo-container"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
        >
          {/* Logo icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-black text-neutral-950 text-base">
            🚗
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nome del brand */}
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              JANUS
            </span>

            {/* Indicatore di contesto corrente (icona + testo breve max 1-2 parole) */}
            <div 
              id="header-context-indicator"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] font-semibold text-neutral-300 transition-colors"
            >
              <ContextIcon className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate max-w-[75px] xs:max-w-none">{context.text}</span>
            </div>
          </div>
        </div>

        {/* Destra: Elementi in stile pill/badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Contact Us — Punto di accesso principale (pillola coerente con gli altri pulsanti della top bar) */}
          <button
            id="header-contact-us-btn"
            onClick={() => openContactModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/40 hover:border-amber-400 bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 hover:text-white text-xs font-bold transition-all min-h-[36px] active:scale-95 shrink-0 shadow-sm"
            title="Contatta JANUS"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Contact Us</span>
          </button>

          {/* 1. Selettore secondario (lingua) — Stile neutro / outline */}
          <button
            id="header-lang-selector"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-700 hover:border-neutral-500 bg-neutral-900/40 text-neutral-300 hover:text-white text-xs font-semibold transition-all min-h-[36px] active:scale-95"
            title="Cambia lingua (IT / EN)"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>{language}</span>
          </button>

          {/* 2. Azione ad alta urgenza (emergenza/aiuto) — Colore di accento acceso, ben distinguibile */}
          <button
            id="header-sos-action"
            onClick={() => setActiveTab('city-guide')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 font-extrabold text-xs shadow-sm shadow-rose-600/30 transition-all min-h-[36px] active:scale-95 shrink-0"
            title="Emergenza SOS 112 e Assistenza Roma"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS 112</span>
          </button>

          {/* 3. Azione principale utente (accesso/account) — Pulsante pieno con icona */}
          {user ? (
            <button
              id="header-user-account"
              onClick={() => setActiveTab('profile')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-sm shadow-amber-400/20 transition-all min-h-[36px] active:scale-95 shrink-0"
              title="Il tuo Account"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-4 h-4 rounded-full object-cover border border-neutral-900"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[70px]">Account</span>
            </button>
          ) : (
            <button
              id="header-user-login"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-sm shadow-amber-400/20 transition-all min-h-[36px] active:scale-95 shrink-0"
              title="Accedi al tuo account"
            >
              <User className="w-3.5 h-3.5" />
              <span>Accedi</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};

