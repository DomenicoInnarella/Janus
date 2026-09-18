import React from 'react';
import { X, Bell, CheckCircle2, Clock, XCircle, Star, ShieldAlert } from 'lucide-react';
import { useParking } from '../../contexts/ParkingContext';
import { NotificationItem } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, setActiveTab } = useParking();

  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking_accepted':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'booking_rejected':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'review_received':
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'report_submitted':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'booking_request':
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.type.startsWith('booking')) {
      setActiveTab('bookings');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="notifications-modal-container"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Notifications</h3>
              <p className="text-xs text-neutral-400">Updates on your bookings and spaces</p>
            </div>
          </div>
          <button
            id="close-notifications-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-neutral-800/60">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Bell className="w-10 h-10 text-neutral-600 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-neutral-300 font-medium text-sm">No notifications yet</p>
              <p className="text-neutral-500 text-xs mt-1">
                You'll receive real-time updates when someone books your spot or accepts your request.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                id={`notification-item-${n.id}`}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all flex gap-3.5 items-start ${
                  n.read ? 'hover:bg-neutral-800/40 opacity-75' : 'bg-neutral-800/30 hover:bg-neutral-800/60 border border-neutral-700/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-neutral-800 border border-neutral-700/60 shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
