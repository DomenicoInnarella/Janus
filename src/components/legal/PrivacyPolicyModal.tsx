import React, { useState } from 'react';
import { Shield, Copy, Check, ExternalLink, X, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://janus.app';
  // Both standard and query-based URLs
  const privacyUrl = `${currentOrigin}/privacy`;
  const shareableQueryUrl = `${currentOrigin}/?legal=privacy`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(privacyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      prompt('Copia questo URL per la Privacy Policy:', privacyUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Informativa sulla Privacy & Cookie</h3>
              <p className="text-[11px] text-neutral-400">Conforme al GDPR UE 2016/679 & Google Play Developer Policy</p>
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
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-amber-400/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> URL Pubblico Privacy Policy (Google Play & Web):
            </span>
            <span className="text-[10px] text-neutral-400">Pronto da incollare</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-amber-200 truncate select-all">
              {privacyUrl}
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
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

        {/* Scrollable Privacy Policy Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-neutral-300 leading-relaxed">
          
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-sm">1. Titolare del Trattamento</h4>
            <p className="text-[11px] text-neutral-400">
              Il titolare del trattamento dei dati per l'applicazione JANUS è il Team di Gestione JANUS («Titolare»). Per qualunque comunicazione o richiesta relativa alla riservatezza dei dati è possibile contattare l'indirizzo di assistenza integrato nell'applicazione.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-sm">2. Tipologia di Dati Trattati</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400">
              <li><strong>Dati di Autenticazione e Profilo:</strong> Nome, cognome, indirizzo email, immagine del profilo forniti durante la registrazione o tramite Google Sign-In.</li>
              <li><strong>Dati di Verifica Host & Driver:</strong> Tipologia e codice documento di riconoscimento (CIE, Passaporto o Patente), sottoscrizione di veridicità dei dati inseriti.</li>
              <li><strong>Dati del Parcheggio Condiviso:</strong> Indirizzo, tipologia di posto auto (coperto, scoperto, garage), coordinate cartografiche, tariffe orarie e giornaliere.</li>
              <li><strong>Dati di Pagamento:</strong> I pagamenti e gli accrediti sono gestiti direttamente tramite il circuito sicuro certificato PCI-DSS <strong>Stripe Inc.</strong>. Nessun dato di carta di credito o conto corrente bancario viene salvato sui nostri server.</li>
              <li><strong>Dati di Posizione Geografica:</strong> Utilizzati unicamente previo consenso dell'utente per individuare i posti auto più vicini alla posizione attuale.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-sm">3. Finalità del Trattamento</h4>
            <p className="text-[11px] text-neutral-400">
              I dati sono trattati per: (a) Consentire l'erogazione del marketplace peer-to-peer di parcheggi; (b) Gestire prenotazioni e comunicazioni tra guidatori e host; (c) Elaborare i pagamenti e versare i corrispettivi netti agli host; (d) Prevenire frodi e garantire la conformità al Codice della Strada e varchi ZTL; (e) Adempiere ad obblighi fiscali e di legge.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-sm">4. Conservazione e Sicurezza dei Dati</h4>
            <p className="text-[11px] text-neutral-400">
              I dati sono protetti da crittografia HTTPS/TLS in transito e crittografia AES-256 a riposo su infrastrutture cloud conformi agli standard internazionali ISO/IEC 27001 e SOC 2. I dati personali rimangono archiviati unicamente per il tempo necessario all'erogazione del servizio o fino alla richiesta di cancellazione da parte dell'utente.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <h4 className="font-bold text-white text-sm">5. Diritti dell'Utente (Art. 15-22 GDPR)</h4>
            <p className="text-[11px] text-neutral-400">
              L'utente ha diritto in qualunque momento di: accedere ai propri dati, richiederne la rettifica, opporsi al trattamento, richiedere la portabilità dei dati o richiederne la cancellazione totale e definitiva («Diritto all'Oblio») tramite l'apposita procedura di <strong>Elimina Account</strong> disponibile nelle impostazioni del profilo.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-neutral-400">
            Versione Informativa: Settembre 2026 • Roma Capitale
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
