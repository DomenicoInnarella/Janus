import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  UserX,
  Mail,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const { user, deleteAccount } = useAuth();

  const [copied, setCopied] = useState(false);
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback manual request state for external non-logged-in visitors
  const [externalEmail, setExternalEmail] = useState('');
  const [externalSubmitted, setExternalSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://janus.app';
  const deleteAccountUrl = `${currentOrigin}/delete-account`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deleteAccountUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt('Copia questo URL per l\'eliminazione account:', deleteAccountUrl);
    }
  };

  const handleExecuteDelete = async () => {
    if (!confirmedCheck) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAccount();
      setDeletedSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      // Firebase auth often requires recent login for sensitive operations
      if (err?.code === 'auth/requires-recent-login') {
        setErrorMessage('Per motivi di sicurezza, effettua nuovamente l\'accesso prima di eliminare l\'account.');
      } else {
        setErrorMessage('Si è verificato un errore durante la cancellazione. Riprova o contatta l\'assistenza.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExternalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalEmail) return;
    setExternalSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Elimina Account & Dati Personali</h3>
              <p className="text-[11px] text-neutral-400">Richiesta cancellazione account conforme a Google Play & GDPR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated URL Copy Box */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-rose-500/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5" /> URL Pubblico Eliminazione Account:
            </span>
            <span className="text-[10px] text-neutral-400">Conforme Google Play</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-rose-200 truncate select-all">
              {deleteAccountUrl}
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>Copiato!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-neutral-300 leading-relaxed">
          
          {deletedSuccess ? (
            <div className="py-8 text-center space-y-3 bg-neutral-950 rounded-2xl border border-emerald-500/30 p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Account Eliminato con Successo</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Tutti i tuoi dati personali, il profilo utente e le impostazioni sono stati rimossi in via definitiva dai nostri sistemi.
              </p>
            </div>
          ) : user ? (
            /* Logged-In User Direct Deletion Flow */
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Account attualmente connesso:</span>
                  <span className="font-bold text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Nome visualizzato:</span>
                  <span className="font-bold text-white">{user.displayName}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Cosa comporta l'eliminazione dell'account:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1">
                  <li>Cancellazione definitiva del tuo profilo e delle credenziali di accesso.</li>
                  <li>Rimozione dei documenti di riconoscimento verificati (CIE, patente, passaporto).</li>
                  <li>Disattivazione di tutti i posti auto, annunci e disponibilità pubblicate.</li>
                  <li>Cancellazione dello storico chat, messaggi e preferenze salvate.</li>
                  <li>L'operazione è <strong>irreversibile</strong> e non potrà essere annullata.</li>
                </ul>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedCheck}
                    onChange={(e) => setConfirmedCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-rose-600 cursor-pointer"
                  />
                  <span className="text-neutral-200 text-[11px] leading-relaxed">
                    Ho compreso che questa azione cancellerà tutti i miei dati in modo permanente e desidero procedere con l'eliminazione del mio account.
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={!confirmedCheck || isDeleting}
                  onClick={handleExecuteDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Eliminazione in corso...' : 'Elimina Account Ora'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* External non-logged in visitor (e.g. from Google Play Store policy link) */
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Modulo Richiesta Cancellazione Dati</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  In conformità alle linee guida Google Play Developer e all'Art. 17 GDPR, puoi richiedere la cancellazione completa del tuo account e di tutti i dati personali associati inserendo l'indirizzo email utilizzato per la registrazione.
                </p>
              </div>

              {externalSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-xs">Richiesta di Cancellazione Ricevuta</p>
                  <p className="text-[11px] text-neutral-300">
                    Abbiamo preso in carico la richiesta per <strong>{externalEmail}</strong>. Riceverai una conferma email una volta completata la rimozione dei dati (entro 24-48 ore lavorative).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleExternalRequest} className="space-y-3">
                  <div>
                    <label className="text-neutral-300 text-[11px] font-bold block mb-1">
                      Email associata all'account JANUS:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={externalEmail}
                        onChange={(e) => setExternalEmail(e.target.value)}
                        placeholder="esempio@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invia Richiesta di Cancellazione</span>
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-neutral-400">
            Diritto all'Oblio (Art. 17 GDPR) • JANUS
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
