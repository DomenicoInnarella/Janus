import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Send, CheckCircle2, AlertCircle, Phone, User, Tag, FileText, Trash2, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

const DEFAULT_SAMPLE_MESSAGE = 
`Salve team di JANUS,

Vi contatto per richiedere maggiori informazioni in merito ai servizi della piattaforma.
In particolare vorrei sapere dettagli su disponibilità, tariffe e procedure di sosta a Roma.

Resto a disposizione per qualsiasi chiarimento.
Grazie cordialmente.`;

const SUBJECT_OPTIONS = [
  'Informazioni generali',
  'Problema tecnico',
  'Prenotazione',
  'Collaborazioni',
  'Altro'
];

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Informazioni generali'
}) => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [customSubject, setCustomSubject] = useState('');
  const [message, setMessage] = useState(DEFAULT_SAMPLE_MESSAGE);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (user?.displayName && !fullName) setFullName(user.displayName);
      if (user?.email && !email) setEmail(user.email);
      if (user?.phoneNumber && !phone) setPhone(user.phoneNumber);
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClearMessage = () => {
    setMessage('');
  };

  const handleResetSampleMessage = () => {
    setMessage(DEFAULT_SAMPLE_MESSAGE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!fullName.trim()) {
      setErrorMessage('Inserisci il tuo nome e cognome.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Inserisci un indirizzo email valido per poter ricevere risposta.');
      return;
    }

    if (subject === 'Altro' && !customSubject.trim()) {
      setErrorMessage('Specifica l\'oggetto personalizzato per la tua richiesta.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Il messaggio non può essere vuoto.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject,
          customSubject: subject === 'Altro' ? customSubject.trim() : undefined,
          message: message.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'invio della richiesta.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Si è verificato un errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="contact-us-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
      >
        <motion.div
          id="contact-us-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Contact Us
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Scrivici per supporto, informazioni o richieste speciali su Roma
                </p>
              </div>
            </div>

            <button
              id="close-contact-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors active:scale-95"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 px-4 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-lg font-bold text-white">Messaggio Inviato!</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Grazie <span className="font-semibold text-white">{fullName}</span>, abbiamo ricevuto la tua richiesta.
                    Riceverai una risposta dettagliata all'indirizzo email <span className="font-semibold text-amber-400">{email}</span> nel più breve tempo possibile.
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-amber-400/20"
                  >
                    Torna alla navigazione
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome e Cognome */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nome e Cognome *</span>
                  </label>
                  <input
                    id="contact-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Es. Marco Rossi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Grid: Email & Telefono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email mittente *</span>
                    </label>
                    <input
                      id="contact-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tua.email@esempio.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Ti risponderemo a questo indirizzo
                    </span>
                  </div>

                  {/* Telefono */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Telefono <span className="text-neutral-400 font-normal">(opzionale)</span></span>
                    </label>
                    <input
                      id="contact-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+39 347 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Oggetto con menu a tendina */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Oggetto della richiesta *</span>
                  </label>
                  <select
                    id="contact-subject-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-neutral-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Se seleziona "Altro", campo testo libero per oggetto personalizzato */}
                {subject === 'Altro' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1"
                  >
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">
                      Specifica il motivo / oggetto personalizzato *
                    </label>
                    <input
                      id="contact-custom-subject-input"
                      type="text"
                      required={subject === 'Altro'}
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Es. Richiesta convenzione hotel o navette"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/50 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </motion.div>
                )}

                {/* Corpo del messaggio con testo preimpostato/di esempio modificabile o cancellabile */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Messaggio *</span>
                    </label>

                    {/* Bottoni rapidi per cancellare o ripristinare esempio */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearMessage}
                        className="text-[10px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800"
                        title="Cancella tutto il testo per scrivere da zero"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Svuota</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetSampleMessage}
                        className="text-[10px] text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800"
                        title="Ripristina testo di esempio"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Esempio</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="contact-message-body"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi qui il tuo messaggio o modifica il testo di esempio..."
                    className="w-full px-3.5 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs leading-relaxed placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none font-normal"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Suggerimento: puoi modificare liberamente il testo sopra oppure cliccare su "Svuota" per inserire la tua richiesta.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    {isSubmitting ? (
                      <span>Invio in corso...</span>
                    ) : (
                      <>
                        <span>Invia Richiesta</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
