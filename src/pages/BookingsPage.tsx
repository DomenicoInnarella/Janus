import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  MapPin, 
  Navigation, 
  Key, 
  Star, 
  ShieldCheck, 
  User, 
  PlusCircle, 
  Power, 
  Trash2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useParking } from '../contexts/ParkingContext';
import { useAuth } from '../contexts/AuthContext';
import { Booking, ParkingSpot } from '../types';

export const BookingsPage: React.FC = () => {
  const { 
    guestBookings, 
    hostBookings, 
    spots, 
    acceptBookingRequest, 
    rejectBookingRequest, 
    cancelBookingRequest, 
    setReviewingBooking,
    toggleSpotStatus,
    deleteSpot,
    setActiveTab,
    setDetailSpot
  } = useParking();

  const { user } = useAuth();
  const [activeTab, setActiveTabMode] = useState<'driver' | 'host'>('driver');

  // Filter spots belonging to the logged-in user
  const mySpots = spots.filter((s) => s.ownerId === user?.uid);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> Accepted & Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> Pending Host Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3" /> Declined
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 app-content-pb">
      
      {/* Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Bookings & Reservations</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage your driver trips and incoming host requests</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1 self-start">
          <button
            id="tab-driver-bookings"
            onClick={() => setActiveTabMode('driver')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'driver'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🚗 My Driver Trips ({guestBookings.length})
          </button>
          <button
            id="tab-host-bookings"
            onClick={() => setActiveTabMode('host')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'host'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🏠 Host Dashboard ({hostBookings.length})
          </button>
        </div>
      </div>

      {/* DRIVER TAB */}
      {activeTab === 'driver' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {guestBookings.length === 0 ? (
            <div className="p-10 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
              <CalendarCheck className="w-12 h-12 text-neutral-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No bookings yet</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Find a parking spot near your destination and book with peace of mind.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs shadow-md transition-all"
              >
                Explore Parking Spaces
              </button>
            </div>
          ) : (
            guestBookings.map((b) => {
              const isAccepted = b.status === 'accepted' || b.status === 'completed';

              return (
                <div
                  key={b.id}
                  id={`guest-booking-${b.id}`}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg space-y-4"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.parkingPhoto || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=200&q=80'}
                        alt={b.parkingTitle}
                        className="w-10 h-10 rounded-xl object-cover object-center border border-neutral-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{b.parkingTitle}</h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span>Ref: <strong className="font-mono text-amber-400">{b.bookingCode}</strong></span>
                          <span>•</span>
                          <span>Host: {b.hostName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {getStatusBadge(b.status)}
                    </div>
                  </div>

                  {/* Timing & Pricing */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Start Time</span>
                      <span className="text-white font-medium">
                        {new Date(b.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">End Time</span>
                      <span className="text-white font-medium">
                        {new Date(b.endTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 col-span-2 sm:col-span-1">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Total Price</span>
                      <span className="text-amber-400 font-bold text-sm">€{(b.totalPrice ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* PRIVACY UNLOCKED SECTION (Shown only when accepted or completed) */}
                  {isAccepted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Booking Confirmed — Location & Access Unlocked</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Exact Address */}
                        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                            Exact Street Address
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{b.parkingExactAddress || b.parkingApproxLocation}</span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.parkingExactAddress || b.parkingApproxLocation)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
                              title="Navigate with Google Maps"
                            >
                              <Navigation className="w-4 h-4" />
                            </a>
                          </div>
                        </div>

                        {/* Access Instructions */}
                        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                            Gate & Entry Instructions
                          </span>
                          <div className="flex items-center gap-2 text-neutral-200">
                            <Key className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-medium">{b.hostAccessInstructions || 'Follow parking signage.'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-400">
                      <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>Exact street address and gate instructions will be revealed once host accepts.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {b.status === 'pending' && (
                      <button
                        onClick={() => cancelBookingRequest(b.id)}
                        className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}

                    {b.status === 'completed' && !b.reviewLeft && (
                      <button
                        onClick={() => setReviewingBooking(b)}
                        className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Write Verified Review</span>
                      </button>
                    )}

                    {b.reviewLeft && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Review submitted
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* HOST TAB */}
      {activeTab === 'host' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Section 1: Incoming Booking Requests */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Incoming Reservation Requests ({hostBookings.filter((b) => b.status === 'pending').length})</span>
            </h3>

            {hostBookings.filter((b) => b.status === 'pending').length === 0 ? (
              <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                No pending requests right now. When a driver books your spot, it will appear here for your approval.
              </div>
            ) : (
              hostBookings
                .filter((b) => b.status === 'pending')
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.guestPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={b.guestName}
                          className="w-10 h-10 rounded-full object-cover object-center border border-neutral-700 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{b.guestName}</h4>
                          <p className="text-xs text-neutral-400">wants to park at "{b.parkingTitle}"</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-amber-400">€{(b.totalPrice ?? 0).toFixed(2)}</span>
                        <span className="text-[10px] text-neutral-500 block">{b.durationHours}h duration</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                      <span>Schedule: {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="font-mono text-amber-400 font-bold">{b.bookingCode}</span>
                    </div>

                    {/* Host Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => rejectBookingRequest(b.id, b.guestId)}
                        className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptBookingRequest(b)}
                        className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Reveal Address</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Section 2: My Published Parking Spaces */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">My Published Spaces ({mySpots.length})</h3>
              <button
                onClick={() => setActiveTab('publish')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Another Space</span>
              </button>
            </div>

            {mySpots.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
                <PlusCircle className="w-10 h-10 text-neutral-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">You haven't listed a parking space yet</h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Earn money by sharing your empty driveway, garage, or courtyard with trusted drivers.
                </p>
                <button
                  onClick={() => setActiveTab('publish')}
                  className="py-2.5 px-5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Share Space Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={spot.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80'}
                        alt={spot.title}
                        className="w-14 h-14 rounded-xl object-cover object-center border border-neutral-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${spot.status === 'active' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                          <span className="text-[11px] font-bold uppercase text-neutral-400">{spot.status}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm truncate mt-0.5">{spot.title}</h4>
                        <span className="text-xs text-amber-400 font-bold">€{(spot.pricePerHour ?? 0).toFixed(2)}/hr</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleSpotStatus(spot.id)}
                        className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{spot.status === 'active' ? 'Pause' : 'Activate'}</span>
                      </button>

                      <button
                        onClick={() => setDetailSpot(spot)}
                        className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Listing</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
