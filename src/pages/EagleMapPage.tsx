import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Star, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Plus, 
  Heart, 
  Clock, 
  Utensils, 
  Eye, 
  Bus, 
  ShieldCheck, 
  Share2, 
  X, 
  Flame,
  Radio,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { EAGLE_ROOFTOPS, EAGLE_LIVE_ALERTS, INITIAL_EAGLE_CHATS } from '../data/eagleData';
import { EagleSpot, EagleAlert, EagleChatSession, TourPlan } from '../types';
import { useParking } from '../contexts/ParkingContext';

export const EagleMapPage: React.FC = () => {
  const { setActiveTab } = useParking();
  const [rooftops] = useState<EagleSpot[]>(EAGLE_ROOFTOPS);
  const [selectedSpot, setSelectedSpot] = useState<EagleSpot | null>(rooftops[0]);
  const [alerts, setAlerts] = useState<EagleAlert[]>(EAGLE_LIVE_ALERTS);
  const [newAlertText, setNewAlertText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rooftop_bar' | 'historic_terrace' | 'sky_restaurant' | 'panoramic_view'>('all');
  
  // Eagle Chat System
  const [chats, setChats] = useState<EagleChatSession[]>(INITIAL_EAGLE_CHATS);
  const [activeChat, setActiveChat] = useState<EagleChatSession | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);

  // Filtered rooftops
  const filteredSpots = selectedCategory === 'all' 
    ? rooftops 
    : rooftops.filter(s => s.category === selectedCategory);

  const handlePostAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertText.trim()) return;

    const newAlert: EagleAlert = {
      id: `alert-${Date.now()}`,
      spotName: selectedSpot ? selectedSpot.name : 'Roma Centro Skyline',
      authorName: 'Tu (Eagle Explorer) 🦅',
      badge: 'Local Eagle',
      content: newAlertText.trim(),
      category: 'tip',
      timestamp: 'Adesso',
      likes: 1,
    };

    setAlerts([newAlert, ...alerts]);
    setNewAlertText('');
  };

  const handleLikeAlert = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, likes: a.likes + 1 } : a));
  };

  const handleStartChatWithEagle = (peerName: string) => {
    const existing = chats.find(c => c.peerName.includes(peerName));
    if (existing) {
      setActiveChat(existing);
    } else {
      const newSession: EagleChatSession = {
        id: `chat-${Date.now()}`,
        title: `Chat con ${peerName}`,
        peerName: `${peerName} 🦅`,
        peerBadge: 'Eagle Community Member',
        lastMessage: 'Chat avviata',
        lastTimestamp: 'Adesso',
        unreadCount: 0,
        messages: [
          {
            id: `m-${Date.now()}`,
            senderId: 'peer',
            senderName: peerName,
            text: `Ciao! Piacere di conoscerti su Eagle Map! Condividiamo consigli su tetti e tour a Roma? 🦅`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]
      };
      setChats([newSession, ...chats]);
      setActiveChat(newSession);
    }
    setShowChatModal(true);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeChat) return;

    const myMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'me' as const,
      senderName: 'Io',
      text: chatMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedSession = {
      ...activeChat,
      lastMessage: myMsg.text,
      lastTimestamp: myMsg.timestamp,
      messages: [...activeChat.messages, myMsg],
    };

    setActiveChat(updatedSession);
    setChats(chats.map(c => c.id === activeChat.id ? updatedSession : c));
    setChatMessageText('');

    // Auto peer answer after 1.5s
    setTimeout(() => {
      const replyMsg = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'peer' as const,
        senderName: activeChat.peerName,
        text: `Ottimo consiglio! Ci vediamo lì o condividiamo il tour sull'app! 🦅🌆`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalSession = {
        ...updatedSession,
        lastMessage: replyMsg.text,
        lastTimestamp: replyMsg.timestamp,
        messages: [...updatedSession.messages, replyMsg],
      };
      setActiveChat(finalSession);
      setChats(prev => prev.map(c => c.id === activeChat.id ? finalSession : c));
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-5 app-content-pb">
      
      {/* 🦅 EAGLE VIEW HERO BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-500/30 p-4 sm:p-6 shadow-2xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black tracking-wide shadow-md">
                🦅 EAGLE MAP ROOFTOP
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                Vista sui Tetti di Roma
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mappa Terrazze, Rooftop Bar & Alert Live
            </h1>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Vedi i locali sui tetti della città con foto reali, menu e prezzi, viste mozzafiato, 
              e comunica in tempo reale con altri Eagles tramite fumetti e chat sicura.
            </p>
          </div>

          {/* Quick Action: Open Eagle Chat */}
          <button
            onClick={() => {
              if (chats.length > 0) setActiveChat(chats[0]);
              setShowChatModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Eagles ({chats.length})</span>
          </button>
        </div>
      </div>

      {/* 🏷️ CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'Tutti i Tetti & Belvedere' },
          { id: 'rooftop_bar', label: '🍸 Rooftop Cocktail Bar' },
          { id: 'historic_terrace', label: '🏛️ Terrazze Storiche' },
          { id: 'sky_restaurant', label: '🍽️ Ristoranti Panoramici' },
          { id: 'panoramic_view', label: '🌅 Belvedere & Punti Aperti' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 🌆 MAIN GRID: EAGLE SPOTS & REAL-TIME ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: ROOFTOP CARDS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>I Migliori Locali sui Tetti ({filteredSpots.length})</span>
            </h2>
            <span className="text-[11px] text-neutral-400">Aggiornato con menu & orari</span>
          </div>

          <div className="space-y-4">
            {filteredSpots.map(spot => {
              const isSelected = selectedSpot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`cursor-pointer rounded-2xl bg-neutral-900 border transition-all overflow-hidden p-4 space-y-3 ${
                    isSelected 
                      ? 'border-amber-400 shadow-xl shadow-amber-400/10 ring-1 ring-amber-400/50' 
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-950">
                    <img 
                      src={spot.photos[0]} 
                      alt={spot.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                        {spot.priceLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md text-emerald-400 border border-emerald-400/30 text-[10px] font-bold">
                        Altitudine: {spot.elevationMeters}m
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase block">
                          {spot.neighborhood}
                        </span>
                        <h3 className="text-base font-black text-white leading-tight">
                          {spot.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 bg-neutral-950/90 px-2 py-1 rounded-lg border border-amber-400/40 text-amber-300 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{spot.rating}</span>
                        <span className="text-[10px] text-neutral-400">({spot.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature View Quote */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-200">
                    <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="font-medium truncate"><span className="text-amber-300 font-bold">Vista:</span> {spot.signatureView}</p>
                  </div>

                  {/* Menu & Details Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                      <span className="flex items-center gap-1 text-white">
                        <Utensils className="w-3 h-3 text-amber-400" /> Menu in Evidenza
                      </span>
                      <span>Orari: {spot.openingHours}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {spot.menuHighlights.slice(0, 2).map((dish, i) => (
                        <div key={i} className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800 flex justify-between items-center">
                          <span className="font-bold text-neutral-200 text-[11px] truncate pr-1">{dish.item}</span>
                          <span className="text-amber-400 font-black text-[11px] shrink-0">{dish.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transit connection */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-1 text-neutral-400 truncate max-w-[70%]">
                      <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{spot.publicTransit}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartChatWithEagle('Eagle Explorer');
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <span>Scrivi a Eagle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME FUMETTI / ALERTS & LIVE CHAT (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Post New Alert Box */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Pubblica un Fumetto / Alert Live 🦅</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In Tempo Reale
              </span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Sei su un tetto, a un concerto o a una serata salsa? Segnala tavoli liberi, atmosfera o consigli agli altri Eagles!
            </p>

            <form onSubmit={handlePostAlert} className="space-y-2">
              <textarea
                value={newAlertText}
                onChange={(e) => setNewAlertText(e.target.value)}
                placeholder="Es: Terrazza Borromini vista pazzesca! C'è un tavolo libero per 2 vicino alla cupola..."
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-500">
                  {selectedSpot ? `Riferito a: ${selectedSpot.name}` : 'Post generale Roma'}
                </span>
                <button
                  type="submit"
                  disabled={!newAlertText.trim()}
                  className="py-1.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-black text-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invia Fumetto</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Alerts Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Fumetti & Segnalazioni Recenti</span>
            </h3>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto smooth-scroll pr-1">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xs font-black text-amber-300">
                        🦅
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{alert.authorName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 font-semibold">
                            {alert.badge}
                          </span>
                        </div>
                        {alert.spotName && (
                          <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-amber-400" />
                            {alert.spotName}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium">{alert.timestamp}</span>
                  </div>

                  {/* Speech Bubble text */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed">
                    {alert.content}
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      onClick={() => handleLikeAlert(alert.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-amber-400 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-400" />
                      <span>{alert.likes} Utili</span>
                    </button>

                    <button
                      onClick={() => handleStartChatWithEagle(alert.authorName.replace('🦅', '').trim())}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Privata</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 💬 EAGLE PRIVATE CHAT MODAL */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[650px]">
            
            {/* Modal Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-sm">
                  🦅
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {activeChat?.peerName || 'Eagle Messenger'}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Chat Protetta (Nessun dato personale esposto)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 smooth-scroll bg-neutral-950/60">
              {activeChat?.messages.map(msg => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500 mb-0.5">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[82%] p-3 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                          : 'bg-neutral-900 border border-neutral-800 text-white rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2 pb-safe">
              <input
                type="text"
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                placeholder="Scrivi un messaggio o chiedi un consiglio sul tour..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!chatMessageText.trim()}
                className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
