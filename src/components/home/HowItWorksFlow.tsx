import React from 'react';
import { 
  Car, 
  Eye, 
  PlusCircle, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { NavigationTab } from '../../types';

interface StepItem {
  id: string;
  tab: NavigationTab;
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: React.FC<{ className?: string }>;
  accentColor: 'amber' | 'gold' | 'emerald' | 'rose';
  tag: string;
}

export const HowItWorksFlow: React.FC = () => {
  const { setActiveTab } = useParking();

  const steps: StepItem[] = [
    {
      id: 'step-parking',
      tab: 'search',
      badge: 'Sosta Protetta',
      title: 'Trova & Prenota Parcheggio',
      description: 'Scegli un posto auto o box verificato a Trastevere, Termini, Prati o Centro. Evita multe ZTL con tariffe orarie chiare.',
      actionLabel: 'Cerca Posti Auto',
      icon: Car,
      accentColor: 'amber',
      tag: 'Zero Stress ZTL',
    },
    {
      id: 'step-rooftop',
      tab: 'eagle-map',
      badge: 'Eagle Rooftops',
      title: 'Sali sui Tetti Panoramici',
      description: 'Scopri terrazze esclusive con vista sui monumenti, consulta menu, aperitivi e avvia una chat privata con altri Eagles.',
      actionLabel: 'Esplora i Tetti',
      icon: Eye,
      accentColor: 'gold',
      tag: 'Vista Cupola',
    },
    {
      id: 'step-publish',
      tab: 'publish',
      badge: 'Ospita & Guadagna',
      title: 'Condividi il tuo Posto Auto',
      description: 'Hai un posto o box auto libero a Roma? Condividilo in modo sicuro con host verificati e trasforma lo spazio in guadagno extra.',
      actionLabel: 'Pubblica Posto',
      icon: PlusCircle,
      accentColor: 'emerald',
      tag: 'Guadagno Extra',
    },
    {
      id: 'step-safety',
      tab: 'city-guide',
      badge: 'SOS & Mobilità',
      title: 'Muoviti Informato & Protetto',
      description: 'Controlla lo stato dei varchi ZTL in tempo reale, orari metro/bus ATAC, allerte meteo e numeri di assistenza rapida 112.',
      actionLabel: 'Consulta Guida & SOS',
      icon: ShieldAlert,
      accentColor: 'rose',
      tag: 'Assistenza 24/7',
    },
  ];

  return (
    <section 
      id="how-it-works-flow"
      className="w-full rounded-3xl bg-gradient-to-b from-neutral-900/90 via-neutral-900/70 to-neutral-950/90 border border-neutral-800/80 p-4 sm:p-6 shadow-xl transition-all"
    >
      {/* Header with Title and Value Proposition (No numbered badge!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-neutral-800/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-[11px] font-bold tracking-wide uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Come Funziona Janus</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Tutto ciò di cui hai bisogno per vivere la Città Eterna
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Dalla sosta custodita alle terrazze panoramiche, in semplici passaggi interattivi.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nessuna commissione nascosta
          </span>
        </div>
      </div>

      {/* Fluid Interactive Steps Grid (NO numbers like 1, 2, 3!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          // Color themes per stage
          let borderHover = 'hover:border-amber-400/70';
          let iconBg = 'bg-amber-400/15 text-amber-400 border-amber-400/30';
          let tagBadge = 'bg-amber-400/10 text-amber-300 border-amber-400/20';

          if (step.accentColor === 'gold') {
            borderHover = 'hover:border-amber-300/70';
            iconBg = 'bg-amber-300/15 text-amber-300 border-amber-300/30';
            tagBadge = 'bg-amber-300/10 text-amber-200 border-amber-300/20';
          } else if (step.accentColor === 'emerald') {
            borderHover = 'hover:border-emerald-400/70';
            iconBg = 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
            tagBadge = 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
          } else if (step.accentColor === 'rose') {
            borderHover = 'hover:border-rose-400/70';
            iconBg = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            tagBadge = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
          }

          return (
            <div
              key={step.id}
              onClick={() => setActiveTab(step.tab)}
              className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-800/80 ${borderHover} transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-md`}
            >
              {/* Top: Icon + Flow Pill */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagBadge}`}>
                    {step.tag}
                  </span>
                </div>

                {/* Sub-label & Title */}
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-0.5">
                  {step.badge}
                </span>
                <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>

              {/* Bottom Interactive CTA link */}
              <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Security Note */}
      <div className="mt-4 pt-3 border-t border-neutral-800/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Posti verificati con verifica CIE/Patente • Indirizzo protetto fino a prenotazione confermata</span>
        </div>
        <button
          onClick={() => setActiveTab('city-guide')}
          className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
        >
          <span>Guida Turistica & Orari ZTL</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </section>
  );
};
