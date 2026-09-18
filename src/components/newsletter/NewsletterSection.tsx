import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BellRing, 
  ShieldCheck, 
  X, 
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { newsletterService } from '../../services/newsletterService';
import { useAuth } from '../../contexts/AuthContext';
import { NewsletterSubscriber } from '../../types';

interface NewsletterSectionProps {
  source?: string;
  compact?: boolean;
  onSubscribed?: (email: string) => void;
}

type SubscriptionStatus = 
  | 'idle' 
  | 'subscribing' 
  | 'subscribed' 
  | 'error_subscribing' 
  | 'unsubscribing' 
  | 'unsubscribed' 
  | 'error_unsubscribing';

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  source = 'profile',
  compact = false,
  onSubscribed
}) => {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [subscriberData, setSubscriberData] = useState<NewsletterSubscriber | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Initialize and check existing subscription state
  useEffect(() => {
    let isMounted = true;

    const checkExisting = async () => {
      // 1. Check local cache first for fast display
      const cached = newsletterService.getLocalCachedSubscription();
      if (cached && isMounted) {
        setSubscriberData(cached);
        if (cached.status === 'subscribed') {
          setStatus('subscribed');
          setEmailInput(cached.email);
        }
      }

      // 2. If user is authenticated and has email, check Firestore
      const targetEmail = user?.email || cached?.email;
      if (targetEmail) {
        try {
          const remote = await newsletterService.getSubscription(targetEmail);
          if (isMounted && remote) {
            setSubscriberData(remote);
            if (remote.status === 'subscribed') {
              setStatus('subscribed');
              setEmailInput(remote.email);
            } else if (remote.status === 'unsubscribed') {
              setStatus('unsubscribed');
            }
          }
        } catch {
          // Handled gracefully in service
        }
      } else if (!cached && user?.email) {
        setEmailInput(user.email);
      }
    };

    checkExisting();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Subscribe Handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = emailInput.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Inserisci un indirizzo email valido.');
      setStatus('error_subscribing');
      return;
    }

    setStatus('subscribing');
    try {
      const result = await newsletterService.subscribe(email, user?.uid, source);
      setSubscriberData(result);
      setStatus('subscribed');
      setIsEditingEmail(false);
      setSuccessMessage('Ti sei iscritto con successo agli aggiornamenti di Roma!');
      if (onSubscribed) onSubscribed(email);
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setStatus('error_subscribing');
      setErrorMessage('Impossibile completare l’iscrizione. Controlla la connessione e riprova.');
    }
  };

  // Unsubscribe Handler
  const handleUnsubscribe = async () => {
    const targetEmail = subscriberData?.email || emailInput.trim();
    if (!targetEmail) return;

    setStatus('unsubscribing');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await newsletterService.unsubscribe(targetEmail);
      setSubscriberData(result);
      setStatus('unsubscribed');
      setIsEditingEmail(false);
      setSuccessMessage('Ti sei disiscritto con successo. Non riceverai ulteriori notifiche.');
    } catch (err) {
      console.error('Newsletter unsubscribe error:', err);
      setStatus('error_unsubscribing');
      setErrorMessage('Errore durante la disiscrizione. Riprova più tardi.');
    }
  };

  return (
    <div 
      id={`newsletter-section-${source}`}
      className={`rounded-3xl border transition-all duration-300 ${
        compact
          ? 'p-4 bg-neutral-900/90 border-neutral-800'
          : 'p-6 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-950 border-neutral-800/90 shadow-xl'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-400/20">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Newsletter & Allerte Roma</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Opzionale
              </span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              ZTL Roma, allerte meteo, orari varchi e nuovi parcheggi disponibili.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SUBSCRIBED / UNSUBSCRIBING STATE */}
        {(status === 'subscribed' || status === 'unsubscribing') && !isEditingEmail ? (
          <motion.div
            key="subscribed-state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300">Iscrizione Attiva</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">
                      Ricevi Notifiche
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 mt-1 font-mono break-all font-medium">
                    {subscriberData?.email || emailInput}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Riceverai tips per muoverti a Roma, sconti parcheggio e aggiornamenti sui tetti Eagle.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Edit email or Unsubscribe */}
            <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingEmail(true);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Modifica email</span>
              </button>

              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={status === 'unsubscribing'}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-1 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
              >
                {status === 'unsubscribing' ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancellazione...
                  </span>
                ) : (
                  'Disiscriviti dalla newsletter'
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* IDLE / FORM STATE / EDITING */
          <motion.div
            key="input-form-state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-3"
          >
            {/* Status Feedback Banners */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {status === 'unsubscribed' && !successMessage && (
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
                <span>Stato attuale: <strong>Non iscritto</strong></span>
                <span className="text-amber-400 text-[11px] font-semibold">Puoi reiscriverti in qualsiasi momento</span>
              </div>
            )}

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id={`newsletter-email-input-${source}`}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Inserisci la tua email (es. nome@email.com)"
                  disabled={status === 'subscribing'}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white placeholder-neutral-500 text-xs sm:text-sm transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={status === 'subscribing' || !emailInput.trim()}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 hover:brightness-105 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {status === 'subscribing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                      <span>Iscrizione in corso...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-neutral-950" />
                      <span>{isEditingEmail ? 'Aggiorna Email Newsletter' : 'Iscriviti Gratuitamente'}</span>
                    </>
                  )}
                </button>

                {isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setErrorMessage(null);
                    }}
                    className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>Niente spam. Puoi disiscriverti con 1 tap in qualsiasi momento.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
