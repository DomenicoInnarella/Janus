import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  MapPin, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  X, 
  Lock, 
  Layers, 
  Share2, 
  Navigation,
  ShieldCheck,
  Send,
  Zap,
  Compass
} from 'lucide-react';
import { JanusSplashGraphic } from '../common/JanusSplashGraphic';

export interface JanusOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  initialStep?: number;
  canSkip?: boolean;
}

export const JanusOnboardingModal: React.FC<JanusOnboardingModalProps> = ({
  isOpen,
  onClose,
  onFinish,
  initialStep = 0,
  canSkip = false,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [maxReachedStep, setMaxReachedStep] = useState(initialStep);
  const [interactiveFilter, setInteractiveFilter] = useState<'all' | 'free' | 'leaving' | 'private'>('all');
  const [shareStepSim, setShareStepSim] = useState<'departing' | 'broadcast' | 'available'>('departing');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      setMaxReachedStep(initialStep);
    }
  }, [isOpen, initialStep]);

  // Auto-cycle the 3-phase transition on Screen 4 every 3.5s for seamless visual demonstration
  useEffect(() => {
    if (!isOpen || currentStep !== 3) return;
    const timer = setInterval(() => {
      setShareStepSim((prev) => {
        if (prev === 'departing') return 'broadcast';
        if (prev === 'broadcast') return 'available';
        return 'departing';
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => {
        const next = prev + 1;
        setMaxReachedStep((m) => Math.max(m, next));
        return next;
      });
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDotClick = (idx: number) => {
    // If canSkip is true, allow any dot; if mandatory first-run, allow only steps already reached
    if (canSkip || idx <= maxReachedStep) {
      setCurrentStep(idx);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="janus-onboarding-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-xl select-none overflow-hidden"
      >
        <motion.div
          key="onboarding-dialog-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-lg h-[92vh] max-h-[720px] rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col justify-between overflow-hidden text-white"
          style={{
            background: 'radial-gradient(circle at 50% 15%, #1a1403 0%, #0c0c0c 55%, #050505 100%)',
          }}
        >
          {/* TOP BAR: Logo badge, step indicator & Skip/Close button */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-neutral-850 z-20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
                PR
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wider text-amber-300">JANUS</span>
                <span className="text-[10px] text-neutral-400 font-medium">Guida Rapida • {currentStep + 1} di {totalSteps}</span>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800">
              {Array.from({ length: totalSteps }).map((_, idx) => {
                const isClickable = canSkip || idx <= maxReachedStep;
                return (
                  <button
                    key={idx}
                    disabled={!isClickable}
                    onClick={() => handleDotClick(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep 
                        ? 'w-5 bg-amber-400 shadow-xs shadow-amber-400/50' 
                        : idx < currentStep 
                          ? 'w-2 bg-amber-400/40' 
                          : 'w-1.5 bg-neutral-700'
                    } ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    aria-label={`Vai al passaggio ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Top Right Action: Skip if allowed, or Non-skippable badge on first run */}
            {canSkip ? (
              <button
                type="button"
                id="onboarding-skip-btn"
                onClick={onClose}
                className="text-xs font-bold text-neutral-400 hover:text-amber-300 px-2.5 py-1 rounded-full hover:bg-neutral-900 transition-colors flex items-center gap-1 active:scale-95"
              >
                <span>Chiudi</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-black uppercase tracking-wider text-amber-400">
                <span>1° Avvio</span>
              </div>
            )}
          </div>

          {/* MAIN SLIDE CONTENT AREA (Animated slide transitions) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* ========================================================================= */}
              {/* SCHERMATA 1: "Parcheggiare a Roma. Più semplice."                        */}
              {/* ========================================================================= */}
              {currentStep === 0 && (
                <motion.div
                  key="step-0-intro"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center space-y-4 my-auto"
                >
                  {/* Hero Graphic: Colosseo & Vintage Car Graphic */}
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-neutral-800 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-400/10">
                    <JanusSplashGraphic className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-30" />
                  </div>

                  {/* Core Value Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>TROVA • PRENOTA • CONDIVIDI</span>
                  </div>

                  {/* Headline & Subtitle */}
                  <div className="space-y-1.5 max-w-sm">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Parcheggiare a Roma. <span className="text-amber-400">Più semplice.</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                      Basta ore al volante a vuoto tra Trastevere, Centro e Termini. Janus è la community che connette chi cerca, chi lascia il posto e chi condivide spazi privati protetti.
                    </p>
                  </div>

                  {/* 3 Quick Value Highlights */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-xs pt-1">
                    <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
                      <Search className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-[11px] font-bold text-white leading-tight">Trova subito</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Mappa live</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
                      <Clock className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-[11px] font-bold text-white leading-tight">In Uscita</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Posti in arrivo</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-[11px] font-bold text-white leading-tight">Privati & Free</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">ZTL sicuri</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* SCHERMATA 2: "Qualcuno sta liberando il posto?"                           */}
              {/* ========================================================================= */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1-leaving-seeker"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center space-y-4 my-auto"
                >
                  {/* Dynamic Visual Simulation: Street Scene with Leaving Marker */}
                  <div className="relative w-full max-w-sm p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl overflow-hidden text-left">
                    {/* Background Mini Street Grid Simulation */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Street Header Tag */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                          Intercetta chi sta partendo
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                        Roma • Trastevere
                      </span>
                    </div>

                    {/* Live Spot Card in Departure */}
                    <div className="my-3 p-3 rounded-2xl bg-neutral-950 border border-orange-500/40 shadow-lg relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                            <Car className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">Piazza Trilussa</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-orange-500/20 text-orange-300 font-bold rounded-md">
                                In uscita
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Fiat 500 in partenza verso le 18:40
                            </p>
                          </div>
                        </div>

                        {/* Live Timer Pill */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-extrabold text-orange-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 8 min
                          </span>
                          <span className="text-[9px] text-neutral-400">alla partenza</span>
                        </div>
                      </div>

                      {/* Distance & Action Bar */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-850 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-neutral-300 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-amber-400" />
                          <span>180m da te • 2 min a piedi</span>
                        </span>
                        <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                          Riserva Posto →
                        </span>
                      </div>
                    </div>

                    {/* Community note */}
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      💡 Quando un automobilista segnala la partenza, il posto compare sulla mappa in arancione. Puoi intercettarlo prima che il parcheggio sia conteso.
                    </p>
                  </div>

                  {/* Text Section */}
                  <div className="space-y-1.5 max-w-sm">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Qualcuno sta liberando il posto?
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                      Intercetta chi sta lasciando l'auto in tempo reale. Vedi quanti minuti mancano alla partenza e arriva giusto in tempo.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* SCHERMATA 3 (NUOVA): "Trova il posto giusto"                              */}
              {/* Mostra: Mappa di Roma, marker parcheggio, differenti stati dei posti,     */}
              {/* distinzione tra posti liberi, in uscita e privati                         */}
              {/* ========================================================================= */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2-find-spot"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center space-y-3.5 my-auto"
                >
                  {/* REAL MAP & FILTERS INTERACTIVE MOCKUP */}
                  <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl p-3 overflow-hidden text-left">
                    
                    {/* Top Layer & Filter Simulator: The actual Janus filter tabs */}
                    <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-neutral-800">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                        {[
                          { id: 'all', label: 'Tutti', icon: '📍', badge: '14' },
                          { id: 'free', label: 'Liberi', icon: '🟢', badge: '6' },
                          { id: 'leaving', label: 'In uscita', icon: '🚗', badge: '3', pulse: true },
                          { id: 'private', label: 'Privati', icon: '🔒', badge: '5' },
                        ].map((filterTab) => {
                          const isSel = interactiveFilter === filterTab.id;
                          return (
                            <button
                              key={filterTab.id}
                              type="button"
                              onClick={() => setInteractiveFilter(filterTab.id as any)}
                              className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isSel 
                                  ? 'bg-amber-400 text-neutral-950 shadow-sm' 
                                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
                              }`}
                            >
                              <span>{filterTab.icon}</span>
                              <span>{filterTab.label}</span>
                              {filterTab.pulse && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="shrink-0 text-[10px] font-bold text-neutral-400 px-2 py-0.5 rounded-lg bg-neutral-800/80">
                        🗺️ Roma
                      </div>
                    </div>

                    {/* Visual Vector Rome Map Surface with 3 Distinct Spot Markers */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 my-2">
                      {/* Stylized Map Backdrop: Tiber River curve & city grid lines */}
                      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 320 180">
                        {/* River Tiber */}
                        <path
                          d="M 60 -10 C 80 40, 110 70, 95 110 C 85 140, 120 170, 150 200"
                          fill="none"
                          stroke="#1e3a8a"
                          strokeWidth="18"
                          strokeLinecap="round"
                        />
                        {/* Rome Street Grid */}
                        <line x1="20" y1="50" x2="300" y2="50" stroke="#333" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="40" y1="110" x2="300" y2="110" stroke="#333" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="160" y1="10" x2="160" y2="170" stroke="#333" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="240" y1="20" x2="240" y2="170" stroke="#333" strokeWidth="2" strokeDasharray="6 4" />
                        <circle cx="210" cy="80" r="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
                        <text x="210" y="83" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.7">Colosseo</text>
                      </svg>

                      {/* 1. POSTO PRIVATO MARKER (Ambra/Oro con tariffa) */}
                      {(interactiveFilter === 'all' || interactiveFilter === 'private') && (
                        <div 
                          className="absolute top-5 right-8 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                          onClick={() => setInteractiveFilter('private')}
                        >
                          <div className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] shadow-lg shadow-amber-400/30 flex items-center gap-1 border border-amber-300">
                            <Lock className="w-2.5 h-2.5" />
                            <span>€2.50/h</span>
                          </div>
                          <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1 shadow-sm" />
                          <span className="text-[9px] font-bold text-amber-300 bg-neutral-900/90 px-1.5 rounded-md mt-0.5 border border-neutral-700">
                            Box Prati
                          </span>
                        </div>
                      )}

                      {/* 2. POSTO LIBERO / GRATUITO MARKER (Verde Smeraldo) */}
                      {(interactiveFilter === 'all' || interactiveFilter === 'free') && (
                        <div 
                          className="absolute bottom-6 left-12 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                          onClick={() => setInteractiveFilter('free')}
                        >
                          <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px] shadow-lg shadow-emerald-500/30 flex items-center gap-1 border border-emerald-300">
                            <span>🅿️</span>
                            <span>GRATIS</span>
                          </div>
                          <div className="w-2 h-2 bg-emerald-500 rotate-45 -mt-1 shadow-sm" />
                          <span className="text-[9px] font-bold text-emerald-300 bg-neutral-900/90 px-1.5 rounded-md mt-0.5 border border-neutral-700">
                            Trastevere
                          </span>
                        </div>
                      )}

                      {/* 3. POSTO IN USCITA MARKER (Arancione Pulsante con conto alla rovescia) */}
                      {(interactiveFilter === 'all' || interactiveFilter === 'leaving') && (
                        <div 
                          className="absolute top-16 left-32 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                          onClick={() => setInteractiveFilter('leaving')}
                        >
                          {/* Pulsing ring indicator */}
                          <div className="relative">
                            <span className="absolute -inset-1 rounded-full bg-orange-500/40 animate-ping" />
                            <div className="relative px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] shadow-lg shadow-orange-500/40 flex items-center gap-1 border border-orange-300">
                              <Car className="w-3 h-3" />
                              <span>5m</span>
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-orange-500 rotate-45 -mt-1 shadow-sm" />
                          <span className="text-[9px] font-bold text-orange-300 bg-neutral-900/90 px-1.5 rounded-md mt-0.5 border border-neutral-700">
                            Centro • In uscita
                          </span>
                        </div>
                      )}

                      {/* User Location Pulse */}
                      <div className="absolute bottom-4 right-14 flex items-center gap-1">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border border-white"></span>
                        </span>
                        <span className="text-[9px] text-blue-300 font-bold bg-neutral-950/80 px-1 rounded">Tu</span>
                      </div>
                    </div>

                    {/* Distinct Parking States Legend (3 states clearly explained) */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-white leading-none">Liberi</p>
                          <p className="text-[8px] text-neutral-400">Gratuiti/Scambio</p>
                        </div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-white leading-none">In uscita</p>
                          <p className="text-[8px] text-neutral-400">Partono tra poco</p>
                        </div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-white leading-none">Privati</p>
                          <p className="text-[8px] text-neutral-400">Box & posti orari</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Text Section */}
                  <div className="space-y-1.5 max-w-sm">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Trova il posto giusto
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                      Usa la mappa per vedere i parcheggi disponibili e scopri cosa c'è vicino a te. Apri la mappa e guarda dove puoi parcheggiare.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* SCHERMATA 4 (NUOVA): "Un posto si libera? Condividilo."                    */}
              {/* Mostra: auto che lascia il parcheggio, indicazione "Sto liberando il      */}
              {/* posto", altro utente su mappa, transizione "in uscita" -> "disponibile"   */}
              {/* ========================================================================= */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3-share-spot"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center space-y-3.5 my-auto"
                >
                  {/* Dynamic Visual Lifecycle: Departure -> Map Broadcast -> Available */}
                  <div className="relative w-full max-w-sm p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl text-left overflow-hidden">
                    
                    {/* Header with Interactive Phase Switcher */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>La magia di "Sto Liberando"</span>
                      </span>

                      {/* Phase selector tabs */}
                      <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => setShareStepSim('departing')}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                            shareStepSim === 'departing' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
                          }`}
                        >
                          1. Chi parte
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareStepSim('broadcast')}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                            shareStepSim === 'broadcast' ? 'bg-orange-500 text-white' : 'text-neutral-400'
                          }`}
                        >
                          2. Su mappa
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareStepSim('available')}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                            shareStepSim === 'available' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400'
                          }`}
                        >
                          3. Libero
                        </button>
                      </div>
                    </div>

                    {/* Central Stage: Animated Representation based on current phase */}
                    <div className="py-3">
                      {shareStepSim === 'departing' && (
                        <motion.div
                          key="phase-departing"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2.5"
                        >
                          {/* Visual: Car preparing to leave */}
                          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                                <Car className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Stai per salire in auto</p>
                                <p className="text-[10px] text-neutral-400">Via Crescenzio, Prati • Tra 10 min</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                              Partenza
                            </span>
                          </div>

                          {/* The Real Action Button from Janus Map */}
                          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black text-xs flex items-center justify-between shadow-lg shadow-amber-400/20">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4" />
                              <span>Sto liberando il posto</span>
                            </div>
                            <span className="text-[10px] bg-neutral-950 text-white px-2 py-0.5 rounded-lg font-bold">
                              1 Tap • GPS attivo
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {shareStepSim === 'broadcast' && (
                        <motion.div
                          key="phase-broadcast"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2.5"
                        >
                          {/* Visual: Marker appearing live on map for nearby drivers */}
                          <div className="p-3 rounded-2xl bg-neutral-950 border border-orange-500/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <span className="absolute -inset-1 rounded-full bg-orange-400/40 animate-ping" />
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 relative">
                                  <Navigation className="w-5 h-5 animate-pulse" />
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Altro utente vede il segnale</p>
                                <p className="text-[10px] text-orange-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Posto in uscita • 10m
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-300 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                              In arrivo 📍
                            </span>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-300">
                            <span>Chi cerca riceve la notifica e imposta la rotta</span>
                            <span className="text-amber-400 font-bold">Zero attese</span>
                          </div>
                        </motion.div>
                      )}

                      {shareStepSim === 'available' && (
                        <motion.div
                          key="phase-available"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2.5"
                        >
                          {/* Visual: Transition from "In uscita" -> "Posto disponibile" */}
                          <div className="p-3 rounded-2xl bg-neutral-950 border border-emerald-500/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] line-through text-neutral-500">In uscita</span>
                                  <span className="text-xs text-emerald-400">➔</span>
                                  <span className="text-xs font-black text-emerald-400">Disponibile ORA</span>
                                </div>
                                <p className="text-[10px] text-neutral-400">L'auto è partita, il nuovo guidatore parcheggia</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                              Successo 🎉
                            </span>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-300">
                            <span>Posto occupato all'istante senza doppie file</span>
                            <span className="text-emerald-400 font-bold">+1 Karma</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Community Value Footnote */}
                    <div className="pt-2 border-t border-neutral-850 flex items-center gap-2 text-[11px] text-neutral-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Chi lascia un posto aiuta la città. Chi cerca parcheggio lo intercetta.</span>
                    </div>

                  </div>

                  {/* Text Section */}
                  <div className="space-y-1.5 max-w-sm">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Un posto si libera? <span className="text-amber-400">Condividilo.</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                      Stai per lasciare il parcheggio? Segnala il posto e permetti a un altro automobilista di trovarlo.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* SCHERMATA 5: "Il tuo posto. La tua scelta."                               */}
              {/* Sintesi finale + CTA "Trova parcheggio" per andare alla mappa principale  */}
              {/* ========================================================================= */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4-final-summary"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center space-y-3.5 my-auto"
                >
                  {/* Clean Summary Diagram: The 3 Core Pillars */}
                  <div className="w-full max-w-sm space-y-2">
                    
                    {/* Pillar 1: TROVA */}
                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white">1. TROVA</h4>
                          <span className="text-[10px] text-amber-400 font-bold">Mappa Interattiva</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Visualizza subito posti gratuiti verificati, spazi privati e zone di sosta su mappa di Roma.
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2: PRENOTA & ARRIVA */}
                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white">2. PRENOTA / ARRIVA</h4>
                          <span className="text-[10px] text-emerald-400 font-bold">Accesso Diretto</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Naviga con GPS, blocca un posto privato custodito o intercetta l'auto che sta partendo.
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3: CONDIVIDI */}
                    <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white">3. CONDIVIDI</h4>
                          <span className="text-[10px] text-orange-400 font-bold">Community P2P</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Tocca "Sto liberando il posto" quando vai via o pubblica il tuo garage per guadagnare.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-900/60 px-3 py-1.5 rounded-full border border-neutral-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Host verificati CIE • Varchi ZTL protetti • Zero commissioni</span>
                  </div>

                  {/* Text Section */}
                  <div className="space-y-1 max-w-sm pt-1">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Il tuo posto. <span className="text-amber-400">La tua scelta.</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                      Scegli se trovare subito un posto libero, prenotare uno spazio privato custodito o condividere quando parti.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM NAVIGATION ACTIONS (Back / Continua / Trova Parcheggio) */}
          <div className="p-4 sm:p-5 border-t border-neutral-850 bg-neutral-950/90 flex items-center justify-between gap-3 z-20">
            {/* Back Button (Only visible if step > 0) */}
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-800 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Indietro</span>
              </button>
            ) : (
              <div className="w-20" />
            )}

            {/* Primary CTA (Continua on 1-4, Trova Parcheggio on 5) */}
            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                id="onboarding-next-btn"
                onClick={handleNext}
                className="flex-1 max-w-[240px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm shadow-xl shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Continua</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="onboarding-final-cta-btn"
                onClick={onFinish}
                className="flex-1 max-w-[280px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm shadow-xl shadow-amber-400/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Trova parcheggio</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
