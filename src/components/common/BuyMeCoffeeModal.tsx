import React, { useState } from 'react';
import { X, Coffee, Heart, Sparkles, ExternalLink, ShieldCheck, Gift, Check, Car, Zap } from 'lucide-react';

interface BuyMeCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoffeeOption {
  id: string;
  emoji: string;
  title: string;
  amount: number;
  description: string;
  tag?: string;
}

const COFFEE_OPTIONS: CoffeeOption[] = [
  {
    id: 'espresso',
    emoji: '☕',
    title: 'Un Espresso al Volo',
    amount: 1.50,
    description: 'La carica rapida per fixare bug all\'alba',
  },
  {
    id: 'parking_hour',
    emoji: '🅿️',
    title: 'Regala 1 Ora di Parcheggio',
    amount: 2.50,
    description: 'Il sogno di ogni automobilista a Roma',
    tag: 'Più Popolare 🔥',
  },
  {
    id: 'breakfast',
    emoji: '🥐',
    title: 'Cappuccino & Cornetto',
    amount: 5.00,
    description: 'Colazione completa anti-stress da traffico',
  },
  {
    id: 'pizza',
    emoji: '🍕',
    title: 'Pizza & Birra per il Dev',
    amount: 10.00,
    description: 'Carburante essenziale per rilasciare nuove feature',
    tag: 'Consigliato 🍕',
  },
  {
    id: 'super_sponsor',
    emoji: '🚀',
    title: 'Super Sponsor Janus',
    amount: 20.00,
    description: 'Mecenate della mobilità libera e dei parcheggi facili',
  },
];

const FUN_QUOTES = [
  '«A Roma si dice: chi trova un parcheggio trova un tesoro!» 🏛️',
  '«Ogni caffè offerto allontana un vigile con il blocchetto delle multe.» 👮‍♂️',
  '«Sviluppato con passione, caffeina e zero doppie file.» ⚡',
  '«Grazie al tuo supporto manteniamo le mappe chiare e i server veloci!» 🚀',
];

export const BuyMeCoffeeModal: React.FC<BuyMeCoffeeModalProps> = ({ isOpen, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string>('parking_hour');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [randomQuote] = useState(() => FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)]);

  if (!isOpen) return null;

  const currentSelection = COFFEE_OPTIONS.find((o) => o.id === selectedOption);
  const finalAmount = customAmount ? parseFloat(customAmount) || 2.50 : (currentSelection?.amount || 2.50);

  const handleProceedToBuyMeCoffee = () => {
    const baseUrl = 'https://buymeacoffee.com/casy92';
    window.open(baseUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="buy-me-coffee-modal"
        className="w-full max-w-lg bg-neutral-900 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Coffee className="w-5 sm:w-6 h-5 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-xl tracking-tight">
                  Offri un Caffè ☕
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                  Supporta
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Supporta lo sviluppo di Janus!
              </p>
            </div>
          </div>

          <button
            id="close-coffee-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 smooth-scroll pb-safe">
          {/* Fun Quote Box */}
          <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center gap-3 text-xs text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="italic font-medium">{randomQuote}</p>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Scegli come supportare:
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {COFFEE_OPTIONS.map((opt) => {
                const isSelected = selectedOption === opt.id && !customAmount;
                return (
                  <div
                    key={opt.id}
                    id={`coffee-option-${opt.id}`}
                    onClick={() => {
                      setSelectedOption(opt.id);
                      setCustomAmount('');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{opt.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm truncate">
                            {opt.title}
                          </span>
                          {opt.tag && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 shrink-0">
                              {opt.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-amber-400 text-sm sm:text-base">
                        €{opt.amount.toFixed(2)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-amber-400 border-amber-400 text-neutral-950'
                            : 'border-neutral-700 bg-neutral-900 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Field */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-coffee-amount" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Oppure inserisci un importo personalizzato (€):</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">€</span>
              <input
                id="custom-coffee-amount"
                type="number"
                min="1"
                step="0.5"
                placeholder="Es. 7.50"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedOption('custom');
                }}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-amber-400 placeholder:text-neutral-600"
              />
            </div>
          </div>

          {/* Transparent Developer Note */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Creatore: casy92
            </span>
            <span className="text-amber-400 font-semibold">100% reinvestito nell'app</span>
          </div>

          {/* CTA Link Button */}
          <a
            id="proceed-buymeacoffee-btn"
            href="https://buymeacoffee.com/casy92"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Coffee className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Offri €{finalAmount.toFixed(2)} su BuyMeACoffee</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
