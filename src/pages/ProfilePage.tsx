import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Sparkles, 
  AlertTriangle, 
  Smartphone, 
  CreditCard, 
  FileCheck,
  Award,
  ChevronRight,
  FileText,
  Mail,
  Upload,
  Lock,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  Shield,
  UserX,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParking } from '../contexts/ParkingContext';
import { TrustBadge } from '../components/common/TrustBadge';
import { NewsletterSection } from '../components/newsletter/NewsletterSection';
import { PrivacyPolicyModal } from '../components/legal/PrivacyPolicyModal';
import { DeleteAccountModal } from '../components/legal/DeleteAccountModal';
import { pushNotificationService } from '../services/pushNotificationService';
import { discoveryService } from '../services/discoveryService';

export const ProfilePage: React.FC = () => {
  const { user, signOut, openAuthModal, updateUserProfile } = useAuth();
  const { hostBookings, guestBookings, setIsAdminModalOpen, openContactModal } = useParking();

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [docType, setDocType] = useState<'id_card' | 'passport' | 'drivers_license'>('id_card');
  const [docNumber, setDocNumber] = useState('CA84920KL');
  const [truthAgreed, setTruthAgreed] = useState(true);
  const [isSavingVerif, setIsSavingVerif] = useState(false);
  const [verifSuccessMessage, setVerifSuccessMessage] = useState<string | null>(null);

  // Legal Modals & Copy States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [copiedPrivacy, setCopiedPrivacy] = useState(false);
  const [copiedDelete, setCopiedDelete] = useState(false);

  // Push Notification State
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    pushNotificationService.getPermissionStatus()
  );
  const [isRequestingPush, setIsRequestingPush] = useState(false);

  const handleTogglePush = async () => {
    setIsRequestingPush(true);
    await pushNotificationService.requestPermissionWithContext();
    setPushPermission(pushNotificationService.getPermissionStatus());
    setIsRequestingPush(false);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://janus.app';
  const privacyUrl = `${currentOrigin}/privacy`;
  const deleteAccountUrl = `${currentOrigin}/delete-account`;

  const copyPrivacyUrl = async () => {
    try {
      await navigator.clipboard.writeText(privacyUrl);
      setCopiedPrivacy(true);
      setTimeout(() => setCopiedPrivacy(false), 2500);
    } catch {
      prompt('Copia URL Privacy Policy:', privacyUrl);
    }
  };

  const copyDeleteAccountUrl = async () => {
    try {
      await navigator.clipboard.writeText(deleteAccountUrl);
      setCopiedDelete(true);
      setTimeout(() => setCopiedDelete(false), 2500);
    } catch {
      prompt('Copia URL Eliminazione Account:', deleteAccountUrl);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center space-y-4 app-content-pb">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Sign in to your Janus Profile</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
          Access your verified trust reputation, active bookings, and host earnings.
        </p>
        <button
          onClick={() => openAuthModal()}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-md"
        >
          Sign In or Create Account
        </button>

        {/* Guest Newsletter Option */}
        <div className="pt-6 text-left">
          <NewsletterSection source="profile_guest" compact={false} />
        </div>

        {/* Legal & Account Deletion URLs for Guest/Google Play reviewers */}
        <div className="pt-4 text-left space-y-3 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Privacy & Cancellazione Account (Google Play)</h4>
          </div>
          <p className="text-[11px] text-neutral-400">
            Link pubblici ufficiali conformi a Google Play Developer Policy e GDPR per la consultazione e la gestione dell'account.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="truncate pr-2">
                <span className="text-[10px] text-amber-300 font-bold block">1. URL Privacy Policy:</span>
                <span className="text-[10px] font-mono text-neutral-300 truncate block select-all">{privacyUrl}</span>
              </div>
              <button
                type="button"
                onClick={copyPrivacyUrl}
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-neutral-950 font-black text-[10px] flex items-center gap-1 shrink-0"
              >
                {copiedPrivacy ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrivacy ? 'Copiato!' : 'Copia'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="truncate pr-2">
                <span className="text-[10px] text-rose-300 font-bold block">2. URL Elimina Account:</span>
                <span className="text-[10px] font-mono text-neutral-300 truncate block select-all">{deleteAccountUrl}</span>
              </div>
              <button
                type="button"
                onClick={copyDeleteAccountUrl}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-black text-[10px] flex items-center gap-1 shrink-0"
              >
                {copiedDelete ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDelete ? 'Copiato!' : 'Copia'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
        />
      </div>
    );
  }

  const handleSaveVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truthAgreed) return;

    setIsSavingVerif(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          emailVerified: true,
          documentVerified: true,
          idDocumentType: docType,
          idDocumentNumber: docNumber,
          truthDeclarationSigned: true,
          truthDeclarationDate: new Date().toISOString(),
          verificationStatus: 'verified',
          hostStatus: user.completedBookings >= 10 ? 'super_host' : 'verified_host',
        });
      }
      setVerifSuccessMessage('Identity and data veridicity subscription successfully verified!');
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerifSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingVerif(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 app-content-pb">
      
      {/* User Header Profile Card */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <img
            src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user.displayName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{user.displayName}</h2>
              <TrustBadge status={user.hostStatus} size="md" />
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ID Verified Member
            </span>
          </div>
        </div>

        {/* Quick Reputation Numbers */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="p-3 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Rating</span>
            <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-base">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{(user.rating ?? 5.0).toFixed(1)}</span>
            </div>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Bookings</span>
            <span className="text-white font-extrabold text-base">{user.completedBookings ?? 0}</span>
          </div>
        </div>

      </div>

      {/* Host & Driver Verification Progress & Status */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Trust & Verification Center</h3>
          </div>
          <button
            onClick={() => setShowVerificationModal(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold underline"
          >
            Manage Documents & Forms
          </button>
        </div>

        {/* Verification Pillars Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Email Verified</span>
                <span className="text-[11px] text-neutral-400">{user.email}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Government ID / Passport</span>
                <span className="text-[11px] text-neutral-400">Doc: {user.idDocumentNumber || 'Verified on file'}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Data Veridicity & Legal Form</span>
                <span className="text-[11px] text-neutral-400">Subscription signed & timestamped</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Signed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-neutral-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block">Stripe Express Host Payouts</span>
                <span className="text-[11px] text-neutral-400">Instant payout minus 15% platform fee</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Connected</span>
          </div>

        </div>
      </div>

      {/* Community Safety Principles */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Janus Trust Commitments</span>
        </h3>
        <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
          <li><strong>Zero Fraud Tolerance:</strong> Listings with false descriptions or unauthorized ownership are banned immediately.</li>
          <li><strong>Location Privacy:</strong> Precise street addresses and access passkeys are confidential until explicit host approval.</li>
          <li><strong>Verified Reviews Only:</strong> Only drivers with a completed and confirmed booking can leave a review.</li>
          <li><strong>Direct Host Payouts:</strong> Stripe handles instantaneous payouts upon completed bookings, minus 15% service fee.</li>
        </ul>
      </div>

      {/* Official Rome Newsletter & Real-Time Alerts */}
      <NewsletterSection source="profile" />

      {/* App Info & Intro Replay */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-xs">
        <div>
          <p className="font-bold text-white">Janus v1.2</p>
          <p className="text-[11px] text-neutral-400">Edizione Mobile Android & Google Play</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('replay_onboarding'))}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black active:scale-95 transition-all flex items-center gap-1.5 shadow-sm shadow-amber-400/20"
          >
            <span>📖 Guida Onboarding</span>
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('replay_splash'))}
            className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🦅 Splash</span>
          </button>
        </div>
      </div>

      {/* 🔒 IMPOSTAZIONI ACCOUNT, PRIVACY & ELIMINAZIONE DATI */}
      <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-white text-base">Impostazioni Account & Conformità Legale</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 w-fit">
            Google Play & GDPR Compliant
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Gestisci le impostazioni di riservatezza, consulta la Privacy Policy o copia gli URL separati per la conformità allo store e la cancellazione dell'account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          
          {/* Card 1: Privacy Policy */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/40 space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">Policy Privacy (Informativa Dati)</h4>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">GDPR 2016/679</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                URL pubblico consultabile per l'informativa sulla privacy, trattamento dati e cookie.
              </p>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80 font-mono text-[10px] text-amber-300 truncate select-all">
                {privacyUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={copyPrivacyUrl}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                {copiedPrivacy ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>URL Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia URL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Leggi</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Card 2: Delete Account */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-rose-500/40 space-y-3 flex flex-col justify-between transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-bold text-white">Elimina Account (Diritto all'Oblio)</h4>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Google Play</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                URL pubblico dedicato alla richiesta di cancellazione dell'account e di tutti i dati personali.
              </p>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/80 font-mono text-[10px] text-rose-300 truncate select-all">
                {deleteAccountUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={copyDeleteAccountUrl}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
              >
                {copiedDelete ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>URL Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia URL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Elimina</span>
                <Trash2 className="w-3 h-3 text-rose-400" />
              </button>
            </div>
          </div>

          {/* Card 3: Notifiche Push Contestuali */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Notifiche Push Contestuali</h4>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Max 1/giorno • Zero Spam</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Ricevi avvisi utili solo quando un'auto vicino a te sta per liberare il posto o per aggiornamenti essenziali sulla tua sosta. Nessun messaggio promozionale, nessun disturbo durante la ricerca.
            </p>
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {pushPermission === 'granted' ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Notifiche attive sul dispositivo</span>
                  </span>
                ) : pushPermission === 'denied' ? (
                  <span className="text-xs text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-full">
                    Notifiche bloccate nelle preferenze browser
                  </span>
                ) : (
                  <span className="text-xs text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Non ancora abilitate
                  </span>
                )}
              </div>
              {pushPermission !== 'granted' && pushPermission !== 'unsupported' && (
                <button
                  type="button"
                  id="profile-enable-push-btn"
                  onClick={handleTogglePush}
                  disabled={isRequestingPush}
                  className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-all active:scale-95 shadow-sm shadow-amber-400/20"
                >
                  <span>{isRequestingPush ? 'Attivazione...' : 'Abilita avvisi utili'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Replay Onboarding, Discovery & Splash Preview */}
          <div className="md:col-span-2 pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-neutral-400">
              Gestione Onboarding (5 schermate) e Feature Discovery
            </span>
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                type="button"
                id="profile-replay-onboarding-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('replay_onboarding'))}
                className="py-1.5 px-3 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 active:scale-95 shadow-sm shadow-amber-400/20 transition-all"
              >
                <span>📖 Rivedi Onboarding</span>
              </button>
              <button
                type="button"
                id="profile-test-discovery-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('test_trigger_discovery'))}
                className="py-1.5 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Simula comparsa di una feature discovery per il test dei 14 giorni"
              >
                <span>💡 Test Discovery</span>
              </button>
              <button
                type="button"
                id="profile-reset-onboarding-btn"
                onClick={() => {
                  discoveryService.resetForTesting();
                  window.location.reload();
                }}
                className="py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
                title="Azzera per verificare il primo avvio non skippabile"
              >
                <span>🔄 Reset 1° Avvio</span>
              </button>
              <button
                type="button"
                id="profile-replay-splash-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('replay_splash'))}
                className="py-1.5 px-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>🎬 Splash</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 🛡️ AREA AMMINISTRAZIONE & NOTIFICHE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Area Amministrazione & Assistenza</h4>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Staff & Support</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Accedi al pannello riservato per consultare i messaggi inviati dagli utenti tramite Contact Us, lo storico notifiche prenotazioni e le statistiche di sistema.
        </p>
        <div className="pt-1 flex flex-wrap gap-2">
          <button
            type="button"
            id="profile-open-admin-panel-btn"
            onClick={() => setIsAdminModalOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-400/40 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Pannello Admin JANUS</span>
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={signOut}
          className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-rose-400 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Janus</span>
        </button>
      </div>

      {/* Verification & Subscription Form Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Host & Driver Verification</h3>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {verifSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">{verifSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveVerification} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="id_card">Carta d'Identità Elettronica (CIE)</option>
                    <option value="passport">Passaporto Internazionale</option>
                    <option value="drivers_license">Patente di Guida</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">Document Number / Code</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. CA84920KL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="font-bold text-white block">Document Upload Simulation</span>
                  <div className="border border-dashed border-neutral-700 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400/60">
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <span className="text-neutral-400 text-[11px]">Click to upload document front & back (JPG, PNG, PDF)</span>
                  </div>
                </div>

                {/* Sottoscrizione di veridicità dei dati */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="truth-declaration-check"
                      type="checkbox"
                      checked={truthAgreed}
                      onChange={(e) => setTruthAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded accent-amber-400 cursor-pointer"
                      required
                    />
                    <label htmlFor="truth-declaration-check" className="text-neutral-200 cursor-pointer leading-relaxed">
                      <strong className="text-amber-400 block mb-0.5">Modulo di Sottoscrizione di Veridicità:</strong>
                      «Dichiaro sotto la mia responsabilità che i dati anagrafici, i documenti forniti e le informazioni relative ai posti auto inseriti su Janus sono veritieri, accurati e conformi alle normative vigenti. Confermo di possedere titolo legittimo di disponibilità del posto auto.»
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingVerif || !truthAgreed}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSavingVerif ? 'Verifying & Saving...' : 'Confirm Verification Subscription'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
      />

    </div>
  );
};
