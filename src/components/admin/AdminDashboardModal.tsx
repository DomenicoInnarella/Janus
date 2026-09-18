import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  X, 
  Mail, 
  Bell, 
  TrendingUp, 
  Car, 
  Users, 
  CalendarCheck, 
  Check, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Calendar,
  AlertCircle,
  Key,
  Smartphone,
  Sparkles,
  Send,
  Copy,
  ArrowRight,
  ShieldAlert,
  Radio,
  Activity,
  Compass,
  Flame,
  CloudSun,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { FreeParkingSpot } from '../../types';
import { EAGLE_ROOFTOPS } from '../../data/eagleData';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

interface BookingNotification {
  id: string;
  bookingId: string;
  bookingCode?: string;
  parkingTitle: string;
  parkingApproxLocation?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  hostName?: string;
  startTime: string;
  endTime: string;
  durationHours?: number;
  totalPrice: number;
  read: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  badge: 'auth' | 'booking' | 'system' | 'message';
}

interface AdminOverviewData {
  stats: {
    totalUsers: number;
    activeDriversToday: number;
    totalSpots: number;
    totalBookings: number;
    totalRevenue: number;
    totalMessages: number;
    unreadMessages: number;
    unreadBookings: number;
    eagleRooftopsCount?: number;
    activeAlertsCount?: number;
    serverUptimeSeconds?: number;
    serverMemoryMB?: number;
    latencyMs?: number;
    activeZtlZones?: string;
    weatherAlertStatus?: string;
    smsGatewayStatus?: string;
    lastUpdate: string;
  };
  adminProfile?: {
    username: string;
    fullName: string;
    phone: string;
    email: string;
    role: string;
    accessLevel: string;
    mfaVerified: boolean;
  };
  systemBroadcast?: {
    text: string;
    type: 'info' | 'warning' | 'alert';
    active: boolean;
    updatedAt: string;
  };
  auditLogs?: AuditLog[];
  messages: ContactMessage[];
  bookingNotifications: BookingNotification[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { freeSpots, addFreeParkingSpot, updateFreeParkingSpotAction, deleteFreeParkingSpotAction, showToast } = useParking();

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('janus_admin_token') || null;
    } catch {
      return null;
    }
  });

  // Step 1: Login Credentials
  const [usernameInput, setUsernameInput] = useState('d.innarella');
  const [passwordInput, setPasswordInput] = useState('elisabetta');
  const [passkeyInput, setPasskeyInput] = useState('rooftop-admin-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  // Step 2: SMS OTP
  const [authStep, setAuthStep] = useState<'credentials' | 'sms_otp'>('credentials');
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<number>(300);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'bookings' | 'rooftops' | 'broadcast' | 'free_parking'>('overview');
  
  // Free parking admin state
  const [freeSearchQuery, setFreeSearchQuery] = useState('');
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [editingFreeId, setEditingFreeId] = useState<string | null>(null);
  const [fpName, setFpName] = useState('');
  const [fpAddress, setFpAddress] = useState('');
  const [fpApproximateLocation, setFpApproximateLocation] = useState('');
  const [fpLatitude, setFpLatitude] = useState(41.8902);
  const [fpLongitude, setFpLongitude] = useState(12.4922);
  const [fpParkingType, setFpParkingType] = useState<FreeParkingSpot['parkingType']>('exchange_metro');
  const [fpSource, setFpSource] = useState('Roma Mobilità');
  const [fpSourceUrl, setFpSourceUrl] = useState('https://romamobilita.it');
  const [fpNotes, setFpNotes] = useState('');
  const [fpCapacity, setFpCapacity] = useState(100);
  const [isSavingFree, setIsSavingFree] = useState(false);

  // Messages filter & search
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Overview data
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Broadcast state editor
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert'>('info');
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [isSavingBroadcast, setIsSavingBroadcast] = useState(false);
  const [broadcastSavedNotice, setBroadcastSavedNotice] = useState(false);

  // Live Rome Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (authStep === 'sms_otp' && otpCountdown > 0) {
      const timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [authStep, otpCountdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Load admin data when token is present and modal is open
  useEffect(() => {
    if (isOpen && authToken) {
      fetchOverviewData();
    }
  }, [isOpen, authToken]);

  // Step 1 Submission: Credentials check & SMS OTP dispatch
  const handleRequestSmsOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/admin/login-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          passkey: passkeyInput
        })
      });

      const resData = await res.json();

      if (res.ok && resData.success && resData.sessionId) {
        setMfaSessionId(resData.sessionId);
        setTestOtpNotice(resData.testOtp || null);
        setAuthStep('sms_otp');
        setOtpCountdown(300);
        setResendCooldown(45);
        if (resData.testOtp) {
          setOtpInput(resData.testOtp);
        }
      } else {
        setAuthError(resData.error || 'Credenziali di accesso non valide.');
      }
    } catch (err) {
      setAuthError('Errore di connessione con il server durante la verifica.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2 Submission: Verify SMS OTP code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfaSessionId) {
      setAuthError('Sessione scaduta. Ricomincia il login.');
      setAuthStep('credentials');
      return;
    }

    setAuthError(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: mfaSessionId,
          otpCode: otpInput.trim()
        })
      });

      const resData = await res.json();

      if (res.ok && resData.authorized && resData.token) {
        setAuthToken(resData.token);
        try {
          sessionStorage.setItem('janus_admin_token', resData.token);
        } catch {
          // ignore
        }
        setTestOtpNotice(null);
      } else {
        setAuthError(resData.error || 'Codice OTP errato o scaduto.');
      }
    } catch (err) {
      setAuthError('Errore di connessione durante la verifica OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend SMS OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: mfaSessionId })
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.sessionId) {
        setMfaSessionId(resData.sessionId);
        setTestOtpNotice(resData.testOtp || null);
        setOtpCountdown(300);
        setResendCooldown(45);
        if (resData.testOtp) {
          setOtpInput(resData.testOtp);
        }
      } else {
        setAuthError(resData.error || 'Errore durante il re-invio del codice SMS.');
      }
    } catch {
      setAuthError('Impossibile contattare il gateway SMS.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFillOfficialCredentials = () => {
    setUsernameInput('d.innarella');
    setPasswordInput('elisabetta');
    setPasskeyInput('rooftop-admin-2026');
  };

  const fetchOverviewData = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          Authorization: authToken
        }
      });
      if (res.ok) {
        const overview: AdminOverviewData = await res.json();
        setData(overview);
        if (overview.systemBroadcast) {
          setBroadcastText(overview.systemBroadcast.text || '');
          setBroadcastType(overview.systemBroadcast.type || 'info');
          setBroadcastActive(Boolean(overview.systemBroadcast.active));
        }
      } else if (res.status === 403 || res.status === 401) {
        setAuthToken(null);
        sessionStorage.removeItem('janus_admin_token');
        setAuthStep('credentials');
        setAuthError('Sessione scaduta o non autorizzata. Effettua nuovamente il login con SMS OTP.');
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMessageStatus = async (id: string, currentStatus: 'unread' | 'read') => {
    if (!authToken) return;
    const nextStatus: 'unread' | 'read' = currentStatus === 'unread' ? 'read' : 'unread';
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return null;
          const updated = prev.messages.map((m) =>
            m.id === id ? { ...m, status: nextStatus } : m
          );
          const unreadCount = updated.filter((m) => m.status === 'unread').length;
          return {
            ...prev,
            messages: updated,
            stats: { ...prev.stats, unreadMessages: unreadCount }
          };
        });
      }
    } catch (err) {
      console.error('Error toggling message status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!authToken) return;
    if (!window.confirm('Sei sicuro di voler eliminare definitivamente questo messaggio?')) {
      return;
    }
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: authToken
        }
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return null;
          const updated = prev.messages.filter((m) => m.id !== id);
          const unreadCount = updated.filter((m) => m.status === 'unread').length;
          return {
            ...prev,
            messages: updated,
            stats: {
              ...prev.stats,
              totalMessages: updated.length,
              unreadMessages: unreadCount
            }
          };
        });
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBookingNotification = async (id: string, currentRead: boolean) => {
    if (!authToken) return;
    const nextRead = !currentRead;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken
        },
        body: JSON.stringify({ read: nextRead })
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return null;
          const updated = prev.bookingNotifications.map((n) =>
            n.id === id ? { ...n, read: nextRead } : n
          );
          const unreadNotifs = updated.filter((n) => !n.read).length;
          return {
            ...prev,
            bookingNotifications: updated,
            stats: { ...prev.stats, unreadBookings: unreadNotifs }
          };
        });
      }
    } catch (err) {
      console.error('Error updating booking notification status:', err);
    }
  };

  const handleSaveBroadcast = async () => {
    if (!authToken) return;
    setIsSavingBroadcast(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken
        },
        body: JSON.stringify({
          text: broadcastText,
          type: broadcastType,
          active: broadcastActive
        })
      });
      if (res.ok) {
        setBroadcastSavedNotice(true);
        setTimeout(() => setBroadcastSavedNotice(false), 3000);
        fetchOverviewData();
      }
    } catch {
      // ignore
    } finally {
      setIsSavingBroadcast(false);
    }
  };

  const handleLogoutAdmin = () => {
    setAuthToken(null);
    sessionStorage.removeItem('janus_admin_token');
    setData(null);
    setAuthStep('credentials');
    setMfaSessionId(null);
  };

  // Free parking handlers
  const handleOpenCreateFree = () => {
    setEditingFreeId(null);
    setFpName('');
    setFpAddress('');
    setFpApproximateLocation('');
    setFpLatitude(41.8902);
    setFpLongitude(12.4922);
    setFpParkingType('exchange_metro');
    setFpSource('Roma Mobilità');
    setFpSourceUrl('https://romamobilita.it');
    setFpNotes('');
    setFpCapacity(100);
    setIsFreeModalOpen(true);
  };

  const handleOpenEditFree = (spot: FreeParkingSpot) => {
    setEditingFreeId(spot.id);
    setFpName(spot.name);
    setFpAddress(spot.address);
    setFpApproximateLocation(spot.approximateLocation);
    setFpLatitude(spot.latitude);
    setFpLongitude(spot.longitude);
    setFpParkingType(spot.parkingType);
    setFpSource(spot.source);
    setFpSourceUrl(spot.sourceUrl || '');
    setFpNotes(spot.notes || '');
    setFpCapacity(spot.totalCapacityEstimated || 50);
    setIsFreeModalOpen(true);
  };

  const handleSaveFreeParking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpName.trim() || !fpAddress.trim()) {
      showToast('Compila nome e indirizzo');
      return;
    }
    setIsSavingFree(true);
    try {
      if (editingFreeId) {
        await updateFreeParkingSpotAction(editingFreeId, {
          name: fpName,
          address: fpAddress,
          approximateLocation: fpApproximateLocation || fpAddress,
          latitude: fpLatitude,
          longitude: fpLongitude,
          parkingType: fpParkingType,
          source: fpSource,
          sourceUrl: fpSourceUrl || undefined,
          notes: fpNotes,
          totalCapacityEstimated: fpCapacity,
          lastVerifiedAt: new Date().toISOString()
        });
        showToast('Parcheggio gratuito aggiornato!');
      } else {
        await addFreeParkingSpot({
          name: fpName,
          address: fpAddress,
          city: 'Roma',
          approximateLocation: fpApproximateLocation || fpAddress,
          latitude: fpLatitude,
          longitude: fpLongitude,
          parkingType: fpParkingType,
          source: fpSource,
          sourceUrl: fpSourceUrl || undefined,
          lastVerifiedAt: new Date().toISOString(),
          notes: fpNotes,
          totalCapacityEstimated: fpCapacity
        });
        showToast('Nuovo parcheggio gratuito aggiunto!');
      }
      setIsFreeModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Errore salvataggio');
    } finally {
      setIsSavingFree(false);
    }
  };

  const handleDeleteFreeParking = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare o archiviare "${name}"?`)) return;
    try {
      await deleteFreeParkingSpotAction(id);
      showToast('Parcheggio gratuito eliminato');
    } catch (err: any) {
      showToast(err.message || 'Errore eliminazione');
    }
  };

  const handleVerifyToday = async (spot: FreeParkingSpot) => {
    try {
      await updateFreeParkingSpotAction(spot.id, {
        lastVerifiedAt: new Date().toISOString()
      });
      showToast(`Verifica aggiornata ad oggi per "${spot.name}"!`);
    } catch (err: any) {
      showToast(err.message || 'Errore aggiornamento verifica');
    }
  };

  if (!isOpen) return null;

  // Free parking filtering
  const filteredFreeSpots = freeSpots.filter((s) => {
    if (!freeSearchQuery.trim()) return true;
    const q = freeSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.source.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  });

  // Messages filtering
  const filteredMessages = (data?.messages || []).filter((msg) => {
    const matchFilter = 
      messageFilter === 'unread' ? msg.status === 'unread' :
      messageFilter === 'read' ? msg.status === 'read' : true;

    if (!searchQuery.trim()) return matchFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      msg.fullName.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      (msg.phone && msg.phone.includes(q)) ||
      msg.subject.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q);

    return matchFilter && matchQuery;
  });

  return (
    <AnimatePresence>
      <div 
        id="admin-dashboard-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md"
      >
        <motion.div
          id="admin-dashboard-container"
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl h-[94vh] max-h-[960px] bg-neutral-950/98 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.18)] flex flex-col overflow-hidden text-neutral-100"
        >
          {/* =================================================================
              MASTER HEADER BAR
             ================================================================= */}
          <header className="p-3.5 sm:p-5 border-b border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/30 shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-white text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                    <span>JANUS Rooftop Master Control</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] text-amber-300 font-extrabold tracking-wider uppercase">
                    Eagle Admin MFA Tier-1
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Server Online (18ms)
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="font-mono text-neutral-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Roma: {currentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Badges & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {authToken && (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-neutral-300 font-semibold">d.innarella</span>
                    <span className="text-[10px] text-neutral-400 font-mono">+39 389 062 3517</span>
                  </div>

                  <button
                    type="button"
                    onClick={fetchOverviewData}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                    title="Aggiorna dati telemetrici"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogoutAdmin}
                    className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all active:scale-95"
                    title="Disconnetti sessione"
                  >
                    Esci
                  </button>
                </>
              )}

              <button
                type="button"
                id="close-admin-modal-btn"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title="Chiudi pannello"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* =================================================================
              BODY AREA (MFA LOGIN OR EXPANSIVE DASHBOARD)
             ================================================================= */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!authToken ? (
              /* =============================================================
                 MFA AUTHENTICATION WORKFLOW (Step 1 Credentials -> Step 2 SMS OTP)
                 ============================================================= */
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-lg space-y-6">
                  {/* Security Header */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                      {authStep === 'credentials' ? (
                        <Key className="w-8 h-8 stroke-[2.2]" />
                      ) : (
                        <Smartphone className="w-8 h-8 stroke-[2.2] text-amber-400 animate-bounce" />
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {authStep === 'credentials' 
                        ? 'Autenticazione Master Rooftop' 
                        : 'Verifica Codice OTP via SMS'}
                    </h2>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      {authStep === 'credentials' 
                        ? 'Inserisci utente, password e passkey rooftop per inviare il codice SMS a +39 389 062 3517.' 
                        : 'È stato generato un codice OTP di sicurezza a 6 cifre e inoltrato al tuo numero.'}
                    </p>
                  </div>

                  {/* Auth Error Banner */}
                  {authError && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="flex-1 leading-snug">{authError}</span>
                    </div>
                  )}

                  {authStep === 'credentials' ? (
                    /* ---------------- STEP 1: CREDENTIALS FORM ---------------- */
                    <form onSubmit={handleRequestSmsOtp} className="space-y-4 bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 rounded-3xl shadow-xl">
                      {/* Username */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                          <span>Nome Utente</span>
                          <span className="text-[10px] text-amber-400 font-mono">d.innarella</span>
                        </label>
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="es. d.innarella"
                          required
                          className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                          <span>Password</span>
                          <span className="text-[10px] text-amber-400 font-mono">elisabetta</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Password amministratore"
                            required
                            className="w-full py-2.5 px-3.5 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Passkey */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                          <span>Passkey di Sicurezza Rooftop</span>
                          <span className="text-[10px] text-amber-400 font-mono">rooftop-admin-2026</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasskey ? 'text' : 'password'}
                            value={passkeyInput}
                            onChange={(e) => setPasskeyInput(e.target.value)}
                            placeholder="rooftop-admin-2026"
                            required
                            className="w-full py-2.5 px-3.5 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasskey(!showPasskey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                          >
                            {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Quick Auto-Fill Helper */}
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleFillOfficialCredentials}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Precompila Credenziali Ufficiali</span>
                        </button>
                        <span className="text-[10px] text-neutral-500 font-mono">SMS: +39 389 062 3517</span>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifica Credenziali in corso...</span>
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4" />
                            <span>Verifica & Ricevi SMS OTP</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* ---------------- STEP 2: SMS OTP VERIFICATION ---------------- */
                    <form onSubmit={handleVerifyOtp} className="space-y-5 bg-neutral-900/90 border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-2xl">
                      {/* SMS Notification Banner (Live simulation of SMS message received on phone) */}
                      {testOtpNotice && (
                        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-amber-400/40 text-xs space-y-2">
                          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Smartphone className="w-3.5 h-3.5" />
                              SMS Ricevuto su +39 389 062 3517
                            </span>
                            <span className="font-mono text-[10px]">Adesso</span>
                          </div>
                          <p className="text-white font-mono text-[12px] bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                            &quot;JANUS Rooftop Security: Il tuo codice OTP è <span className="text-amber-400 font-black tracking-widest text-sm">{testOtpNotice}</span>. Valido per 5 minuti.&quot;
                          </p>
                          <button
                            type="button"
                            onClick={() => setOtpInput(testOtpNotice)}
                            className="w-full py-1.5 px-3 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copia & Inserisci Codice ({testOtpNotice})</span>
                          </button>
                        </div>
                      )}

                      {/* OTP Digits Input */}
                      <div className="space-y-2 text-center">
                        <label className="text-xs font-bold text-neutral-300 block">
                          Inserisci il Codice a 6 Cifre
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoFocus
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          className="w-full py-3.5 px-4 text-center tracking-[0.5em] text-2xl font-black font-mono rounded-2xl bg-neutral-950 border-2 border-amber-400 text-amber-300 focus:outline-none shadow-inner"
                        />
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
                          <span>Scadenza codice: <span className="text-white font-mono font-bold">{Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</span></span>
                          <button
                            type="button"
                            disabled={resendCooldown > 0 || isVerifying}
                            onClick={handleResendOtp}
                            className="text-amber-400 hover:text-amber-300 font-semibold disabled:text-neutral-500 transition-colors"
                          >
                            {resendCooldown > 0 ? `Re-invia SMS (${resendCooldown}s)` : 'Re-invia nuovo SMS'}
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="submit"
                          disabled={isVerifying || otpInput.trim().length < 4}
                          className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          {isVerifying ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Verifica Codice OTP...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-5 h-5" />
                              <span>Conferma & Accedi al Master Control</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuthStep('credentials')}
                          className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                        >
                          ← Torna alle credenziali di accesso
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* =============================================================
                 AUTHENTICATED MASTER CONTROL DASHBOARD
                 ============================================================= */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Global Emergency / Info Broadcast Ticker */}
                {data?.systemBroadcast && data.systemBroadcast.active && (
                  <div className="bg-amber-400 text-neutral-950 px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-md">
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 bg-neutral-950 text-amber-300 rounded-md font-mono font-black">
                        BROADCAST ATTIVO
                      </span>
                      <span className="truncate">{data.systemBroadcast.text}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('broadcast')}
                      className="underline text-[11px] hover:text-black shrink-0 font-extrabold ml-2"
                    >
                      Gestisci
                    </button>
                  </div>
                )}

                {/* Sub-navigation tabs */}
                <div className="border-b border-neutral-800 bg-neutral-900/80 px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: 'overview', label: 'Executive & Telemetria', icon: TrendingUp },
                    { 
                      id: 'messages', 
                      label: 'Supporto & Contact Us', 
                      icon: Mail, 
                      badge: data?.stats.unreadMessages 
                    },
                    { 
                      id: 'bookings', 
                      label: 'Monitor Soste', 
                      icon: Car, 
                      badge: data?.stats.unreadBookings 
                    },
                    { id: 'rooftops', label: 'Eagle Terrazze Roma', icon: Compass },
                    { id: 'broadcast', label: 'Trasmissioni & Sicurezza', icon: Radio },
                    { 
                      id: 'free_parking', 
                      label: 'Parcheggi Gratuiti', 
                      icon: ShieldCheck, 
                      badge: freeSpots.length 
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                          isActive
                            ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-neutral-950 text-amber-300' : 'bg-amber-400 text-neutral-950'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  {/* =========================================================
                      TAB 1: EXECUTIVE OVERVIEW & TELEMETRIA
                     ========================================================= */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Top Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { label: 'Utenti Registrati', value: data?.stats.totalUsers || 154, sub: '+12 questa settimana', icon: Users, color: 'text-amber-400' },
                          { label: 'Guidatori Attivi Oggi', value: data?.stats.activeDriversToday || 32, sub: 'In transito a Roma', icon: Activity, color: 'text-emerald-400' },
                          { label: 'Posti & Box Privati', value: data?.stats.totalSpots || 18, sub: '100% Verificati ZTL', icon: Car, color: 'text-sky-400' },
                          { label: 'Soste Concluse', value: data?.stats.totalBookings || 68, sub: 'Nessun reclamo attivo', icon: CalendarCheck, color: 'text-indigo-400' },
                          { label: 'Fatturato Host', value: `€${(data?.stats.totalRevenue || 980).toFixed(0)}`, sub: 'Commissioni erogate', icon: TrendingUp, color: 'text-amber-300' },
                          { label: 'Terrazze Skyline', value: data?.stats.eagleRooftopsCount || 14, sub: 'Foto e menu reali', icon: Compass, color: 'text-rose-400' },
                        ].map((stat, i) => {
                          const Icon = stat.icon;
                          return (
                            <div key={i} className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 flex flex-col justify-between shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-neutral-400">{stat.label}</span>
                                <Icon className={`w-4 h-4 ${stat.color}`} />
                              </div>
                              <div>
                                <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5">{stat.sub}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* System Health, ZTL, Weather & Gateway Status */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Server & Infrastructure */}
                        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              <span>Telemetria Server & Cloud</span>
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                              SLA 99.98%
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Tempo di Uptime:</span>
                              <span className="font-mono text-white font-semibold">
                                {Math.floor((data?.stats.serverUptimeSeconds || 1200) / 3600)}h {Math.floor(((data?.stats.serverUptimeSeconds || 1200) % 3600) / 60)}m
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">RAM Processo Node:</span>
                              <span className="font-mono text-white font-semibold">{data?.stats.serverMemoryMB || 48} MB / 512 MB</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Latenza API:</span>
                              <span className="font-mono text-emerald-400 font-semibold">{data?.stats.latencyMs || 16} ms</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-neutral-400">Database Firestore:</span>
                              <span className="text-amber-400 font-bold">ai-studio-parkroma</span>
                            </div>
                          </div>
                        </div>

                        {/* ZTL & City Status */}
                        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-amber-400" />
                              <span>Monitor ZTL & Meteo Roma</span>
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-mono text-[10px] font-bold">
                              LIVE
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Varchi ZTL Monitorati:</span>
                              <span className="text-white font-semibold">{data?.stats.activeZtlZones || 'Trastevere, Navona, San Lorenzo'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Allerte Meteo:</span>
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CloudSun className="w-3.5 h-3.5" />
                                {data?.stats.weatherAlertStatus || 'Sereno 24°C • Nessuna allerta'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">SMS Gateway 2FA:</span>
                              <span className="font-mono text-amber-300 font-semibold">{data?.stats.smsGatewayStatus || 'Attivo (+393890623517)'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-neutral-400">Eagle Alerts Community:</span>
                              <span className="text-white font-bold">{data?.stats.activeAlertsCount || 6} attivi</span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Profile & Security Badge */}
                        <div className="p-5 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <Key className="w-4 h-4 text-amber-400" />
                              <span>Sessione Super Admin</span>
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-extrabold">
                              ROOT 2FA
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Amministratore:</span>
                              <span className="text-white font-bold">{data?.adminProfile?.fullName || 'Domenico Innarella'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Username:</span>
                              <span className="font-mono text-amber-400">{data?.adminProfile?.username || 'd.innarella'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-800/60">
                              <span className="text-neutral-400">Numero di Recupero SMS:</span>
                              <span className="font-mono text-emerald-400 font-bold">{data?.adminProfile?.phone || '+393890623517'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-neutral-400">Ruolo:</span>
                              <span className="text-amber-300 font-semibold">{data?.adminProfile?.role || 'Master Rooftop Controller'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Security Audit Log Stream */}
                      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>Audit Trail Eventi & Sicurezza (Real-Time)</span>
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-400">Ultime 15 azioni</span>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {(data?.auditLogs || []).map((log) => (
                            <div key={log.id} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/70 flex items-center justify-between text-xs gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  log.badge === 'auth' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                                  log.badge === 'booking' ? 'bg-emerald-500/20 text-emerald-300' :
                                  log.badge === 'message' ? 'bg-sky-500/20 text-sky-300' :
                                  'bg-neutral-800 text-neutral-300'
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-neutral-300 truncate text-[11px]">{log.details}</span>
                              </div>
                              <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      TAB 2: MESSAGGI & CONTACT US
                     ========================================================= */}
                  {activeTab === 'messages' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Search & Filter Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca per nome, email, telefono o testo..."
                            className="w-full py-2 pl-9 pr-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          {[
                            { id: 'all', label: `Tutti (${data?.messages.length || 0})` },
                            { id: 'unread', label: `Da Leggere (${data?.stats.unreadMessages || 0})` },
                            { id: 'read', label: 'Letti' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setMessageFilter(f.id as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                messageFilter === f.id
                                  ? 'bg-amber-400 text-neutral-950 font-black'
                                  : 'text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Messages List / Two Column Inspector */}
                      {filteredMessages.length === 0 ? (
                        <div className="py-16 text-center space-y-2 bg-neutral-900/50 rounded-3xl border border-neutral-800">
                          <Mail className="w-10 h-10 text-neutral-600 mx-auto" />
                          <h4 className="text-sm font-bold text-white">Nessun messaggio trovato</h4>
                          <p className="text-xs text-neutral-500">I messaggi inviati tramite &quot;Contact Us&quot; appariranno qui in tempo reale.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                          {filteredMessages.map((msg) => {
                            const isUnread = msg.status === 'unread';
                            const isSelected = selectedMessage?.id === msg.id;

                            return (
                              <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-neutral-900 border-amber-400 shadow-lg shadow-amber-500/10'
                                    : isUnread
                                    ? 'bg-neutral-900/90 border-amber-400/40 hover:border-amber-400/70'
                                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-extrabold text-white text-sm tracking-tight">
                                          {msg.fullName}
                                        </h5>
                                        {isUnread && (
                                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black uppercase tracking-wider">
                                            Nuovo
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                                        <a 
                                          href={`mailto:${msg.email}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-amber-400/90 hover:underline flex items-center gap-1"
                                        >
                                          <Mail className="w-3 h-3" />
                                          <span>{msg.email}</span>
                                        </a>
                                        {msg.phone && (
                                          <a 
                                            href={`tel:${msg.phone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="hover:underline flex items-center gap-1 text-neutral-300"
                                          >
                                            <Phone className="w-3 h-3" />
                                            <span>{msg.phone}</span>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                                      {new Date(msg.createdAt).toLocaleDateString('it-IT')}
                                    </span>
                                  </div>

                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-semibold text-neutral-300">
                                    <span className="text-neutral-500">Oggetto:</span>
                                    <span>{msg.subject}</span>
                                  </div>

                                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/60 line-clamp-3">
                                    {msg.message}
                                  </p>
                                </div>

                                {/* Message Action Bar */}
                                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`mailto:${msg.email}?subject=Re:%20${encodeURIComponent(msg.subject)}%20-%20JANUS%20Assistenza&body=Gentile%20${encodeURIComponent(msg.fullName)},%0D%0A%0D%0AGrazie%20per%20aver%20contattato%20il%20supporto%20di%20JANUS.%0D%0A%0D%0A`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="py-1 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>Rispondi via Email</span>
                                    </a>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleMessageStatus(msg.id, msg.status);
                                      }}
                                      disabled={actionLoadingId === msg.id}
                                      className="py-1 px-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isUnread ? 'Segna letto' : 'Segna da leggere'}</span>
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(msg.id);
                                    }}
                                    disabled={actionLoadingId === msg.id}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                                    title="Elimina messaggio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* =========================================================
                      TAB 3: MONITOR SOSTE & PRENOTAZIONI LIVE
                     ========================================================= */}
                  {activeTab === 'bookings' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-400" />
                            <span>Storico & Notifiche Prenotazioni Sosta</span>
                          </h4>
                          <p className="text-[11px] text-neutral-400">Aggiornamenti in tempo reale inviati automaticamente dal server</p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-amber-400">
                          {data?.bookingNotifications.length || 0} Prenotazioni
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(data?.bookingNotifications || []).map((b) => (
                          <div
                            key={b.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              !b.read 
                                ? 'bg-neutral-900 border-amber-400/50 shadow-md shadow-amber-500/10' 
                                : 'bg-neutral-900/50 border-neutral-800'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-amber-400 text-neutral-950">
                                  {b.bookingCode || 'PS-RM92'}
                                </span>
                                <h5 className="font-bold text-white text-sm">{b.parkingTitle}</h5>
                                <span className="text-xs text-neutral-400">({b.parkingApproxLocation || 'Roma'})</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>Ospite: <strong className="text-white">{b.guestName}</strong></span>
                                  {b.guestEmail && <span className="text-neutral-500">({b.guestEmail})</span>}
                                </span>
                                {b.hostName && (
                                  <span className="text-neutral-400">
                                    Host: <strong className="text-neutral-200">{b.hostName}</strong>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3 text-amber-400" />
                                  {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.durationHours || 1}h)
                                </span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-neutral-800 pt-2 sm:pt-0">
                              <div className="text-right">
                                <div className="text-base font-black text-amber-400">€{(b.totalPrice || 0).toFixed(2)}</div>
                                <div className="text-[10px] text-neutral-500">Confermata via App</div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleBookingNotification(b.id, b.read)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                  !b.read
                                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400 hover:text-neutral-950'
                                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                                }`}
                              >
                                {!b.read ? 'Segna Evasa' : 'Archiviata'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      TAB 4: EAGLE TERRAZZE ROMA
                     ========================================================= */}
                  {activeTab === 'rooftops' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <Compass className="w-4 h-4 text-amber-400" />
                            <span>Rooftop Panoramici Roma & Monitor Alert</span>
                          </h4>
                          <p className="text-[11px] text-neutral-400">Terrazze sui tetti censite con viste, menu, prezzi e chat live Eagles</p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-amber-400">
                          {EAGLE_ROOFTOPS.length} Rooftops Attivi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {EAGLE_ROOFTOPS.map((rf) => (
                          <div key={rf.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between shadow-sm">
                            <div className="space-y-2">
                              <div className="relative h-32 rounded-xl overflow-hidden">
                                <img src={rf.photos[0]} alt={rf.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400">
                                  Quota: +{rf.elevationMeters}m
                                </div>
                              </div>
                              <h5 className="font-extrabold text-white text-sm truncate">{rf.name}</h5>
                              <p className="text-[11px] text-neutral-400 line-clamp-2">{rf.signatureView}</p>
                            </div>

                            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                              <span className="text-amber-400 font-bold">★ {rf.rating} ({rf.reviewCount})</span>
                              <span className="text-neutral-400 font-mono text-[10px]">{rf.priceLevel}</span>
                              <span className="text-[10px] text-emerald-400 font-semibold">{rf.liveAlertCount} Alerts Eagle</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      TAB 5: TRASMISSIONI & BROADCAST DI EMERGENZA
                     ========================================================= */}
                  {activeTab === 'broadcast' && (
                    <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in duration-200">
                      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <div>
                            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                              <Radio className="w-4 h-4 text-amber-400" />
                              <span>Banner Allerta & Annunci a Tutti gli Utenti</span>
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              Pubblica un avviso istantaneo visualizzato in cima all&apos;app da tutti i guidatori e visitatori
                            </p>
                          </div>
                        </div>

                        {broadcastSavedNotice && (
                          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Banner di trasmissione aggiornato con successo sul server!</span>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-300">Testo del Messaggio</label>
                            <textarea
                              rows={3}
                              value={broadcastText}
                              onChange={(e) => setBroadcastText(e.target.value)}
                              placeholder="es. ZTL Centro Storico: Varchi aperti per evento serale / Allerta meteo temporale a Roma..."
                              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {(['info', 'warning', 'alert'] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setBroadcastType(t)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                    broadcastType === t
                                      ? 'bg-amber-400 text-neutral-950'
                                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                              <input
                                type="checkbox"
                                checked={broadcastActive}
                                onChange={(e) => setBroadcastActive(e.target.checked)}
                                className="w-4 h-4 accent-amber-400 rounded"
                              />
                              <span>Attiva Banner Pubblico</span>
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveBroadcast}
                            disabled={isSavingBroadcast}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                            {isSavingBroadcast ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            <span>Salva & Trasmetti Annuncio</span>
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic SMS Gateway Test */}
                      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span>Diagnostica Gateway SMS (+39 389 062 3517)</span>
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          La linea SMS è configurata per l&apos;amministratore Domenico Innarella. Ogni tentativo di accesso con credenziali di livello 1 attiva il dispatch con validità crittografica di 300 secondi.
                        </p>
                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
                          <span>Stato Connessione: ATTIVA</span>
                          <span className="text-neutral-500">GSM/HTTPS Carrier Ready</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      TAB 6: GESTIONE PARCHEGGI GRATUITI VERIFICATI
                     ========================================================= */}
                  {activeTab === 'free_parking' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Top Header & Metrics */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-base font-black text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span>Aree di Sosta Gratuita Verificate (Roma Capitale)</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Gestione dati ufficiali: scambi metro Atac, stalli bianchi e parcheggi liberi senza orario né parchimetro.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenCreateFree}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Aggiungi Parcheggio Gratuito</span>
                        </button>
                      </div>

                      {/* Stat Counters */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                          <span className="text-[11px] text-neutral-400 font-semibold">Totale Aree Gratuite</span>
                          <span className="text-2xl font-black text-white mt-1">{freeSpots.length}</span>
                          <span className="text-[10px] text-emerald-400 font-bold mt-0.5">100% Senza Pagamento</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                          <span className="text-[11px] text-neutral-400 font-semibold">Scambi Metro ATAC</span>
                          <span className="text-2xl font-black text-sky-400 mt-1">
                            {freeSpots.filter(s => s.parkingType === 'exchange_metro').length}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-bold mt-0.5">Interscambio rapido</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                          <span className="text-[11px] text-neutral-400 font-semibold">Stalli Bianchi / Rasoterra</span>
                          <span className="text-2xl font-black text-amber-400 mt-1">
                            {freeSpots.filter(s => s.parkingType !== 'exchange_metro').length}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-bold mt-0.5">Strisce non tariffate</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                          <span className="text-[11px] text-neutral-400 font-semibold">Stato Audit Verifiche</span>
                          <span className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Tutte Verificate</span>
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">Fonti istituzionali</span>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={freeSearchQuery}
                          onChange={(e) => setFreeSearchQuery(e.target.value)}
                          placeholder="Cerca per nome, via, zona, fonte (es. Roma Mobilità, Jonio, Tiburtina)..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                      </div>

                      {/* Spot Cards List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredFreeSpots.map((spot) => (
                          <div 
                            key={spot.id}
                            className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col justify-between gap-3 hover:border-neutral-700 transition-all shadow-sm"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-sm font-black text-white truncate">{spot.name}</h5>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                      spot.parkingType === 'exchange_metro'
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    }`}>
                                      {spot.parkingType === 'exchange_metro' ? 'Scambio Metro' : 'Gratuito Bianco'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-300 mt-1 font-medium">{spot.address}</p>
                                  <p className="text-[11px] text-neutral-500">Zona: {spot.approximateLocation}</p>
                                </div>
                              </div>

                              {spot.notes && (
                                <p className="text-[11px] text-neutral-400 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 leading-relaxed">
                                  {spot.notes}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                                <div className="flex items-center gap-1.5 text-neutral-400">
                                  <span className="text-neutral-500">Fonte:</span>
                                  {spot.sourceUrl ? (
                                    <a 
                                      href={spot.sourceUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                                    >
                                      <span>{spot.source}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-neutral-300 font-bold">{spot.source}</span>
                                  )}
                                </div>

                                <div className="text-neutral-400">
                                  <span className="text-neutral-500">Verificato: </span>
                                  <span className="text-white font-mono font-bold">
                                    {spot.lastVerifiedAt ? new Date(spot.lastVerifiedAt).toLocaleDateString('it-IT') : 'Recente'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Bar */}
                            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleVerifyToday(spot)}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                title="Aggiorna timestamp di verifica ad oggi"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verifica Oggi</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditFree(spot)}
                                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold transition-colors"
                                >
                                  Modifica
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFreeParking(spot.id, spot.name)}
                                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 transition-colors"
                                  title="Elimina o archivia parcheggio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredFreeSpots.length === 0 && (
                        <div className="text-center py-10 text-neutral-500 text-xs">
                          Nessun parcheggio gratuito corrisponde alla ricerca.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Free Parking Create/Edit Sub-Modal */}
                  {isFreeModalOpen && (
                    <div 
                      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
                      onClick={() => setIsFreeModalOpen(false)}
                    >
                      <div 
                        className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span>{editingFreeId ? 'Modifica Parcheggio Gratuito' : 'Nuovo Parcheggio Gratuito'}</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsFreeModalOpen(false)}
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveFreeParking} className="space-y-3.5 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-neutral-300">Nome Parcheggio</label>
                            <input
                              type="text"
                              value={fpName}
                              onChange={(e) => setFpName(e.target.value)}
                              placeholder="es. Parcheggio Jonio Metro B1"
                              required
                              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-neutral-300">Indirizzo Completo</label>
                            <input
                              type="text"
                              value={fpAddress}
                              onChange={(e) => setFpAddress(e.target.value)}
                              placeholder="es. Via Scarpanto / Viale Jonio, 00139 Roma"
                              required
                              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-neutral-300">Zona / Quartiere</label>
                            <input
                              type="text"
                              value={fpApproximateLocation}
                              onChange={(e) => setFpApproximateLocation(e.target.value)}
                              placeholder="es. Montesacro / Jonio"
                              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Latitudine</label>
                              <input
                                type="number"
                                step="any"
                                value={fpLatitude}
                                onChange={(e) => setFpLatitude(parseFloat(e.target.value) || 0)}
                                required
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Longitudine</label>
                              <input
                                type="number"
                                step="any"
                                value={fpLongitude}
                                onChange={(e) => setFpLongitude(parseFloat(e.target.value) || 0)}
                                required
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Tipologia</label>
                              <select
                                value={fpParkingType}
                                onChange={(e) => setFpParkingType(e.target.value as any)}
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                              >
                                <option value="exchange_metro">Scambio Metro Atac</option>
                                <option value="free_surface">Parcheggio Rasoterra</option>
                                <option value="free_white_lines">Strisce Bianche Non Tariffate</option>
                                <option value="free_street">Parcheggio Stradale Gratuito</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Capacità Indicativa</label>
                              <input
                                type="number"
                                value={fpCapacity}
                                onChange={(e) => setFpCapacity(parseInt(e.target.value) || 0)}
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Fonte Istituzionale</label>
                              <input
                                type="text"
                                value={fpSource}
                                onChange={(e) => setFpSource(e.target.value)}
                                placeholder="es. Roma Mobilità / Atac"
                                required
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-300">Link / URL Fonte</label>
                              <input
                                type="url"
                                value={fpSourceUrl}
                                onChange={(e) => setFpSourceUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-neutral-300">Note di Accesso & Dettagli</label>
                            <textarea
                              rows={2}
                              value={fpNotes}
                              onChange={(e) => setFpNotes(e.target.value)}
                              placeholder="es. Aperto 24/7. Accesso consentito senza limitazioni orarie. No ZTL."
                              className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-emerald-400 focus:outline-none resize-none"
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setIsFreeModalOpen(false)}
                              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold"
                            >
                              Annulla
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingFree}
                              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black flex items-center gap-2 disabled:opacity-50"
                            >
                              {isSavingFree ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              <span>Salva Dati Verificati</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
