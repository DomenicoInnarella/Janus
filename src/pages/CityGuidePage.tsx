import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Sun, 
  CloudRain, 
  CloudSun, 
  Bus, 
  Train, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Navigation,
  Compass,
  Info,
  Car,
  Shield
} from 'lucide-react';
import { EMERGENCY_SERVICES, ROMA_ZTL_AREAS } from '../data/eagleData';
import { EmergencyService, ZtlZoneInfo } from '../types';
import { NewsletterSection } from '../components/newsletter/NewsletterSection';

export const CityGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sos' | 'ztl' | 'weather' | 'transit'>('sos');
  const [selectedZtlId, setSelectedZtlId] = useState<string>('all');

  const filteredZtl = selectedZtlId === 'all'
    ? ROMA_ZTL_AREAS
    : ROMA_ZTL_AREAS.filter(z => z.id === selectedZtlId);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-5 app-content-pb">
      
      {/* 🏛️ HEADER HERO */}
      <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-800 p-4 sm:p-6 shadow-xl overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black">
                <ShieldAlert className="w-3.5 h-3.5" /> SOS & ZTL ROMA
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                Viaggia & Parcheggia Sicuro
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Emergenze SOS, Varchi ZTL, Meteo & Connessioni Bus
            </h1>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Tutto il necessario per muoverti e sostare in sicurezza a Roma: numeri di assistenza immediata 24/7, 
              orari dei varchi ZTL con consigli salva-multa, allerte meteo e collegamenti ATAC.
            </p>
          </div>

          <a
            href="tel:112"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95 shrink-0 animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>CHIAMA 112 EMERGENZE</span>
          </a>
        </div>
      </div>

      {/* 🧭 NAVIGATION SUB-TABS */}
      <div className="grid grid-cols-4 gap-2 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 text-xs">
        {[
          { id: 'sos', label: '🆘 SOS & Assistenza', icon: ShieldAlert },
          { id: 'ztl', label: '🛡️ Orari & Varchi ZTL', icon: ShieldCheck },
          { id: 'weather', label: '☀️ Meteo & Allerte', icon: Sun },
          { id: 'transit', label: '🚌 Bus & Metro', icon: Bus },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-2 rounded-xl font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <span className="text-xs sm:text-sm font-black">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🆘 TAB 1: SOS & NUMERI UTILI */}
      {activeTab === 'sos' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Quick SOS Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {EMERGENCY_SERVICES.map(srv => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-lg flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                      {srv.availableHours}
                    </span>
                    <div className="flex gap-1 text-[9px] text-neutral-500 font-semibold">
                      {srv.languages.slice(0, 2).join(', ')}
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-white">{srv.name}</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <a
                  href={`tel:${srv.number.replace(/\s+/g, '')}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>Chiama {srv.number}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Viaggiare Sicuri Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white">
                Consigli di Sicurezza & Viaggiare Sicuri a Roma
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                <p className="font-bold text-amber-300">🚇 Metro & Stazione Termini</p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Tieni lo zaino davanti sul Bus 64 e sulla Metro B. Non accettare aiuti non ufficiali alle macchinette dei biglietti.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                <p className="font-bold text-emerald-300">🚰 Acqua Gratis: I "Nasoni"</p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Ci sono oltre 2.500 fontanelle pubbliche con acqua potabile fresca e purissima in tutta la città. Usa una borraccia riutilizzabile!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                <p className="font-bold text-sky-300">🚕 Taxi Ufficiali</p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Usa solo le vetture bianche con stemma Roma Capitale e tassametro acceso, o chiama il 063570 per tariffe fisse aeroporto (50€ Fiumicino, 31€ Ciampino).
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 🛡️ TAB 2: ORARI & VARCHI ZTL ROMA */}
      {activeTab === 'ztl' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Info Banner */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Guida Salva-Multa ZTL Roma Capitale</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Aggiornato 2026
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed max-w-2xl">
                  I varchi elettronici rilevano la targa tramite telecamere. Se prenoti un posto auto o garage su JANUS all'interno della ZTL, l'autorimessa accredita la targa nei registri della Polizia Locale.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href="tel:0657003"
                className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>Info Mobilità 06 57003</span>
              </a>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Tutte le Zone ZTL' },
              { id: 'ztl-centro-storico', label: '🏛️ Centro Storico' },
              { id: 'ztl-trastevere', label: '🍷 Trastevere' },
              { id: 'ztl-san-lorenzo', label: '🎓 San Lorenzo' },
              { id: 'ztl-testaccio', label: '🍕 Testaccio' },
              { id: 'ztl-fascia-verde', label: '🌿 Fascia Verde' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedZtlId(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  selectedZtlId === c.id
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ZTL Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredZtl.map(zone => (
              <div
                key={zone.id}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-xl space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-amber-400">
                        <Shield className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">{zone.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      {zone.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {zone.description}
                  </p>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-1.5">
                      <span className="text-[11px] text-neutral-400 font-semibold">☀️ Orario Diurno:</span>
                      <span className="text-[11px] font-bold text-amber-300 text-right">{zone.dayHours}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-1.5">
                      <span className="text-[11px] text-neutral-400 font-semibold">🌙 Orario Notturno:</span>
                      <span className="text-[11px] font-bold text-rose-300 text-right">{zone.nightHours}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] text-neutral-400 font-semibold">📅 Giorni Attivi:</span>
                      <span className="text-[11px] font-medium text-neutral-200 text-right">{zone.daysActive}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 leading-relaxed space-y-1">
                    <strong className="text-neutral-300 block font-bold">Esenzioni & Veicoli Ammessi:</strong>
                    <p>{zone.exemptions}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-start gap-2 text-[11px] bg-amber-400/5 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 rounded-b-2xl border-t border-amber-400/15">
                  <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">Come sostare con JANUS:</span>
                    <span className="text-neutral-300 text-[10px] leading-relaxed">{zone.parkingAccessTip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ Box */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Importo Multe ZTL a Roma</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              L'accesso non autorizzato a una ZTL attiva comporta una sanzione amministrativa del Codice della Strada da <strong>83€ a 332€</strong> più spese di notifica e accertamento.
              Assicurati sempre di sostare in un'area coperta o garage con inserimento targa sul portale mobility.
            </p>
          </div>

        </div>
      )}

      {/* ☀️ TAB 3: METEO & ALLERTE */}
      {activeTab === 'weather' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Main Weather Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 border border-amber-400/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Roma Centro • Ora</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">24°C Soleggiato</h2>
              </div>
              <Sun className="w-12 h-12 text-amber-400 animate-spin-slow" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Vento</span>
                <span className="font-bold text-white">12 km/h Ponentino</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Umidità</span>
                <span className="font-bold text-white">48% Ottimale</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Indice UV</span>
                <span className="font-bold text-amber-400">6 (Medio-Alto)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Tramonto</span>
                <span className="font-bold text-white">19:48 Belvedere</span>
              </div>
            </div>

            {/* Protezione Civile Alert Status */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-semibold">Allerta Protezione Civile Roma: <span className="text-white">VERDE (Nessuna criticità meteo in corso)</span></p>
            </div>
          </div>

          {/* 3 Day Outlook */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <div>
                <p className="font-black text-white">Domani</p>
                <p className="text-[11px] text-neutral-400">Sereno e tiepido</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="font-black text-white">25° / 15°</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <div>
                <p className="font-black text-white">Dopodomani</p>
                <p className="text-[11px] text-neutral-400">Poco nuvoloso</p>
              </div>
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-300" />
                <span className="font-black text-white">23° / 14°</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <div>
                <p className="font-black text-white">Fine Settimana</p>
                <p className="text-[11px] text-neutral-400">Perfetto per mare e terrazze</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="font-black text-white">26° / 16°</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 🚌 TAB 4: BUS, METRO & CONNESSIONI */}
      {activeTab === 'transit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Metro A */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                  A
                </span>
                <h3 className="text-sm font-black text-white">Metro A (Rossa)</h3>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Battistini ↔ Anagnina. Ferma a: <strong>Ottaviano (Vaticano), Spagna, Barberini, Termini, San Giovanni</strong>.
              </p>
              <span className="text-[10px] text-rose-400 font-bold block">Frequenza: ogni 3-4 min</span>
            </div>

            {/* Metro B */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-sky-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                  B
                </span>
                <h3 className="text-sm font-black text-white">Metro B / B1 (Blu)</h3>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Laurentina ↔ Rebibbia / Jonio. Ferma a: <strong>Colosseo, Circo Massimo, Piramide (Testaccio), Termini</strong>.
              </p>
              <span className="text-[10px] text-sky-400 font-bold block">Frequenza: ogni 4-5 min</span>
            </div>

            {/* Tram & Metromare */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  T
                </span>
                <h3 className="text-sm font-black text-white">Tram 8 & Metromare Ostia</h3>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Tram 8: <strong>Piazza Venezia ↔ Trastevere</strong>. Metromare: <strong>Piramide ↔ Ostia Lido Mare</strong>.
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block">Biglietto standard BIT 1,50€</span>
            </div>
          </div>

          {/* Contactless Tap & Go Tip */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Pagamento Contactless Tap & Go a Bordo</p>
                <p className="text-[11px] text-neutral-400">
                  Puoi usare direttamente la tua carta di credito, bancomat o smartphone su tutti i tornelli Metro e sui Bus ATAC senza fare la fila!
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 📬 Rome Alerts & Newsletter Section */}
      <div className="pt-2">
        <NewsletterSection source="city_guide" />
      </div>

    </div>
  );
};
