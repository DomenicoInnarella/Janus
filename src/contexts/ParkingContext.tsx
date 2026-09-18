import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ParkingSpot, 
  Booking, 
  Review, 
  Report, 
  ReportReason, 
  NotificationItem, 
  NavigationTab, 
  SearchFilters,
  MapQuickFilter,
  LeavingSoonSpot,
  LeavingReservation,
  FreeParkingSpot,
  VehicleSize
} from '../types';
import { parkingService } from '../services/parkingService';
import { bookingService } from '../services/bookingService';
import { reviewService, CreateReviewParams } from '../services/reviewService';
import { reportService } from '../services/reportService';
import { notificationService } from '../services/notificationService';
import { 
  subscribeToLeavingSpots, 
  createLeavingSpot, 
  reserveLeavingSpot, 
  cancelLeavingSpot, 
  cancelLeavingReservation,
  getUserActiveLeavingReservations 
} from '../services/leavingSpotService';
import { 
  subscribeToFreeParkingSpots, 
  createFreeParkingSpot, 
  updateFreeParkingSpot, 
  deleteFreeParkingSpot,
  reportCommunitySpotStatus
} from '../services/freeParkingService';
import { useAuth } from './AuthContext';

interface DetailedReviewInput {
  overallRating: number;
  locationRating?: number;
  safetyRating?: number;
  accessRating?: number;
  accuracyRating?: number;
  conditionRating?: number;
  comment: string;
}

interface ParkingContextType {
  // Navigation & Spot discovery
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  spots: ParkingSpot[];
  filteredSpots: ParkingSpot[];
  loadingSpots: boolean;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  selectedSpot: ParkingSpot | null;
  setSelectedSpot: (s: ParkingSpot | null) => void;
  detailSpot: ParkingSpot | null;
  setDetailSpot: (s: ParkingSpot | null) => void;

  // Bookings
  guestBookings: Booking[];
  hostBookings: Booking[];
  loadingBookings: boolean;
  bookingSpot: ParkingSpot | null;
  setBookingSpot: (s: ParkingSpot | null) => void;
  activeBookingSuccess: Booking | null;
  setActiveBookingSuccess: (b: Booking | null) => void;

  // Reviews & Reports Modals
  reviewingBooking: Booking | null;
  setReviewingBooking: (b: Booking | null) => void;
  reportingSpot: ParkingSpot | null;
  setReportingSpot: (s: ParkingSpot | null) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => Promise<void>;

  // Contact Us & Admin Panel Modals
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  openContactModal: (defaultSubject?: string) => void;
  contactModalDefaultSubject: string;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // 🌐 User Geolocation & Distance Helper
  userLocation: { latitude: number; longitude: number } | null;
  requestUserLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  calculateDistanceKm: (latitude: number, longitude: number) => number | null;
  formatDistance: (latitude: number, longitude: number) => string;

  // 🗺️ Unified Map Quick Filters
  mapQuickFilter: MapQuickFilter;
  setMapQuickFilter: (filter: MapQuickFilter) => void;

  // 🚗 "Sto liberando il posto" & Leaving spots
  leavingSpots: LeavingSoonSpot[];
  activeLeavingReservations: LeavingReservation[];
  isLeavingSoonModalOpen: boolean;
  setIsLeavingSoonModalOpen: (open: boolean) => void;
  selectedLeavingSpot: LeavingSoonSpot | null;
  setSelectedLeavingSpot: (s: LeavingSoonSpot | null) => void;
  reportLeavingSoon: (params: {
    address: string;
    approximateLocation: string;
    latitude: number;
    longitude: number;
    departureMinutes: number;
    vehicleSize?: VehicleSize;
    notes?: string;
  }) => Promise<LeavingSoonSpot>;
  reserveLeavingSoonSpot: (spotId: string) => Promise<{ success: boolean; error?: string }>;
  cancelLeavingSignal: (spotId: string) => Promise<void>;
  cancelLeavingReservationAction: (spotId: string, reservationId: string) => Promise<void>;

  // 🅿️ Verified Free Parking
  freeSpots: FreeParkingSpot[];
  selectedFreeSpot: FreeParkingSpot | null;
  setSelectedFreeSpot: (s: FreeParkingSpot | null) => void;
  addFreeParkingSpot: (data: Omit<FreeParkingSpot, 'id' | 'createdAt' | 'updatedAt' | 'isFree'>) => Promise<FreeParkingSpot>;
  updateFreeParkingSpotAction: (spotId: string, updates: Partial<FreeParkingSpot>) => Promise<void>;
  deleteFreeParkingSpotAction: (spotId: string) => Promise<void>;
  reportFreeSpotStatus: (spotId: string, status: 'available' | 'full') => Promise<void>;

  // Core Actions
  executeSearch: (q?: string) => void;
  requestBooking: (spot: ParkingSpot, startTime: string, endTime: string, durationHours: number, totalPrice: number) => Promise<Booking>;
  acceptBookingRequest: (booking: Booking) => Promise<void>;
  rejectBookingRequest: (bookingId: string, guestId?: string) => Promise<void>;
  cancelBookingRequest: (bookingId: string) => Promise<void>;
  submitReview: (booking: Booking, rating: number, comment: string) => Promise<void>;
  submitDetailedReview: (booking: Booking, input: DetailedReviewInput) => Promise<void>;
  submitReport: (spot: ParkingSpot, reason: ReportReason, description: string) => Promise<void>;
  publishSpot: (spotData: Omit<ParkingSpot, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'completedBookings'>, photoFiles: File[]) => Promise<ParkingSpot>;
  toggleSpotStatus: (spotId: string) => Promise<void>;
  deleteSpot: (spotId: string) => Promise<void>;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  parkingType: 'all',
  vehicleSize: 'all',
  maxPrice: 0,
  verifiedHostOnly: false,
};

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, requireAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState<boolean>(true);
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  
  // Selected map pin & detail sheet
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [detailSpot, setDetailSpot] = useState<ParkingSpot | null>(null);

  // 🗺️ Unified Map Quick Filter ('all' | 'available' | 'leaving_soon' | 'private' | 'free')
  const [mapQuickFilter, setMapQuickFilter] = useState<MapQuickFilter>('all');

  // 🚗 "Sto liberando il posto" & Leaving Soon spots
  const [leavingSpots, setLeavingSpots] = useState<LeavingSoonSpot[]>([]);
  const [isLeavingSoonModalOpen, setIsLeavingSoonModalOpen] = useState(false);
  const [selectedLeavingSpot, setSelectedLeavingSpot] = useState<LeavingSoonSpot | null>(null);
  const [activeLeavingReservations, setActiveLeavingReservations] = useState<LeavingReservation[]>([]);

  // 🅿️ Verified Free Parking
  const [freeSpots, setFreeSpots] = useState<FreeParkingSpot[]>([]);
  const [selectedFreeSpot, setSelectedFreeSpot] = useState<FreeParkingSpot | null>(null);

  // Booking Flow
  const [bookingSpot, setBookingSpot] = useState<ParkingSpot | null>(null);
  const [activeBookingSuccess, setActiveBookingSuccess] = useState<Booking | null>(null);
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  // Reviews & Reports
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [reportingSpot, setReportingSpot] = useState<ParkingSpot | null>(null);

  // Contact Modal & Admin Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalDefaultSubject, setContactModalDefaultSubject] = useState('Informazioni generali');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 🌐 Geolocation & Distance Calculation
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const requestUserLocation = useCallback(async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLocation(coords);
          resolve(coords);
        },
        (err) => {
          console.warn('Geolocation request failed or permission denied:', err);
          resolve(null);
        },
        { timeout: 9000, enableHighAccuracy: true }
      );
    });
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  const calculateDistanceKm = useCallback((lat: number, lon: number): number | null => {
    if (!userLocation) return null;
    const R = 6371; // Earth radius in km
    const dLat = (lat - userLocation.latitude) * (Math.PI / 180);
    const dLon = (lon - userLocation.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLocation]);

  const formatDistance = useCallback((lat: number, lon: number): string => {
    const km = calculateDistanceKm(lat, lon);
    if (km === null) return '';
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }, [calculateDistanceKm]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  const openContactModal = (defaultSubject: string = 'Informazioni generali') => {
    setContactModalDefaultSubject(defaultSubject);
    setIsContactModalOpen(true);
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Subscribe to real-time parking spots
  useEffect(() => {
    setLoadingSpots(true);
    const unsubscribe = parkingService.subscribeToSpots((updatedSpots) => {
      setSpots(updatedSpots);
      setLoadingSpots(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time "In uscita" leaving spots
  useEffect(() => {
    const unsubLeaving = subscribeToLeavingSpots((spots) => {
      setLeavingSpots(spots);
      if (user) {
        setActiveLeavingReservations(getUserActiveLeavingReservations(user.uid));
      }
    });
    return () => unsubLeaving();
  }, [user]);

  // Subscribe to real-time verified free parking spots
  useEffect(() => {
    const unsubFree = subscribeToFreeParkingSpots((spots) => {
      setFreeSpots(spots);
    });
    return () => unsubFree();
  }, []);

  // Subscribe to bookings for authenticated user
  useEffect(() => {
    if (!user) {
      setGuestBookings([]);
      setHostBookings([]);
      setNotifications([]);
      return;
    }

    setLoadingBookings(true);
    const unsubGuest = bookingService.subscribeGuestBookings(user.uid, (list) => {
      setGuestBookings(list);
      setLoadingBookings(false);
    });

    const unsubHost = bookingService.subscribeHostBookings(user.uid, (list) => {
      setHostBookings(list);
      setLoadingBookings(false);
    });

    const unsubNotifs = notificationService.subscribeUserNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubGuest();
      unsubHost();
      unsubNotifs();
    };
  }, [user]);

  // Filtered spots derived from active filters
  const filteredSpots = parkingService.filterSpots(spots, filters);

  const executeSearch = (q?: string) => {
    if (q !== undefined) {
      setFilters((prev) => ({ ...prev, query: q }));
    }
    setActiveTab('search');
  };

  const requestBooking = async (
    spot: ParkingSpot,
    startTime: string,
    endTime: string,
    durationHours: number,
    totalPrice: number
  ): Promise<Booking> => {
    if (!user) throw new Error('User authentication required for booking');

    const booking = await bookingService.createBookingRequest(
      spot,
      user.uid,
      user.displayName || 'Driver',
      user.photoURL,
      startTime,
      endTime,
      durationHours,
      totalPrice
    );

    // Notify server admin endpoint of booking completion (persisted & emailed to admin)
    try {
      fetch('/api/booking-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          parkingTitle: spot.title,
          parkingApproxLocation: spot.approximateLocation,
          guestName: user.displayName || 'Ospite JANUS',
          guestEmail: user.email || undefined,
          guestPhone: user.phoneNumber || undefined,
          hostName: spot.ownerName,
          startTime,
          endTime,
          durationHours,
          totalPrice
        })
      }).catch((e) => console.warn('Booking notify err:', e));
    } catch {
      // non-blocking
    }

    setActiveBookingSuccess(booking);
    setBookingSpot(null);
    setDetailSpot(null);
    return booking;
  };

  const acceptBookingRequest = async (booking: Booking) => {
    const spot = spots.find((s) => s.id === booking.parkingId);
    if (!spot) return;
    await bookingService.acceptBooking(booking, spot);
  };

  const rejectBookingRequest = async (bookingId: string, guestId?: string) => {
    await bookingService.updateBookingStatus(
      bookingId,
      'rejected',
      guestId,
      'Booking Request Declined',
      'The host was unable to accept this reservation request.'
    );
  };

  const cancelBookingRequest = async (bookingId: string) => {
    await bookingService.updateBookingStatus(bookingId, 'cancelled');
  };

  const submitReview = async (booking: Booking, rating: number, comment: string) => {
    if (!user) return;
    await reviewService.createReview({
      bookingId: booking.id,
      parkingId: booking.parkingId,
      hostId: booking.hostId,
      guestId: user.uid,
      guestName: user.displayName || 'Driver',
      guestPhoto: user.photoURL,
      overallRating: rating,
      comment
    });
    setReviewingBooking(null);
  };

  const submitDetailedReview = async (booking: Booking, input: DetailedReviewInput) => {
    if (!user) return;
    await reviewService.createReview({
      bookingId: booking.id,
      parkingId: booking.parkingId,
      hostId: booking.hostId,
      guestId: user.uid,
      guestName: user.displayName || 'Driver',
      guestPhoto: user.photoURL,
      overallRating: input.overallRating,
      locationRating: input.locationRating,
      safetyRating: input.safetyRating,
      accessRating: input.accessRating,
      accuracyRating: input.accuracyRating,
      conditionRating: input.conditionRating,
      comment: input.comment,
    });
    setReviewingBooking(null);
  };

  const submitReport = async (spot: ParkingSpot, reason: ReportReason, description: string) => {
    if (!user) return;
    await reportService.submitReport(
      spot.id,
      spot.title,
      user.uid,
      user.email,
      reason,
      description
    );
    setReportingSpot(null);
  };

  const publishSpot = async (
    spotData: Omit<ParkingSpot, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'completedBookings'>,
    photoFiles: File[]
  ): Promise<ParkingSpot> => {
    if (!user) throw new Error('Authentication required to publish');

    const spotId = `spot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const photoUrls: string[] = [];

    // Upload photo files to Firebase Storage
    for (let i = 0; i < photoFiles.length; i++) {
      const url = await parkingService.uploadParkingImage(spotId, photoFiles[i], i);
      photoUrls.push(url);
    }

    // If no uploads, use fallback sample photos
    if (photoUrls.length < 2) {
      photoUrls.push(
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
      );
    }

    const newSpot: ParkingSpot = {
      ...spotData,
      id: spotId,
      ownerId: user.uid,
      ownerName: user.displayName || 'Janus Host',
      ownerPhoto: user.photoURL,
      ownerRating: user.rating || 5.0,
      ownerBookingsCount: user.completedBookings || 0,
      ownerHostStatus: user.hostStatus || 'new_host',
      photos: photoUrls,
      rating: 5.0,
      reviewCount: 0,
      completedBookings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await parkingService.createParkingSpot(newSpot);
    setActiveTab('home');
    return saved;
  };

  const toggleSpotStatus = async (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (!spot) return;
    const newStatus = spot.status === 'active' ? 'paused' : 'active';
    await parkingService.updateParkingSpot(spotId, { status: newStatus });
  };

  const deleteSpot = async (spotId: string) => {
    await parkingService.deleteParkingSpot(spotId);
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  // 🚗 "Sto liberando il posto" actions
  const reportLeavingSoon = async (params: {
    address: string;
    approximateLocation: string;
    latitude: number;
    longitude: number;
    departureMinutes: number;
    vehicleSize?: VehicleSize;
    notes?: string;
  }): Promise<LeavingSoonSpot> => {
    if (!user) throw new Error('Devi aver effettuato l\'accesso per segnalare che stai liberando un posto.');

    const newSpot = await createLeavingSpot({
      userId: user.uid,
      userName: user.displayName || 'Automobilista JANUS',
      userPhoto: user.photoURL,
      title: `Posto in uscita tra ${params.departureMinutes} min`,
      address: params.address,
      approximateLocation: params.approximateLocation,
      latitude: params.latitude,
      longitude: params.longitude,
      departureMinutes: params.departureMinutes,
      vehicleSize: params.vehicleSize,
      notes: params.notes,
    });

    showToast(`Segnalazione attiva: il posto sarà visibile sulla mappa per ${params.departureMinutes} minuti!`);
    return newSpot;
  };

  const reserveLeavingSoonSpot = async (spotId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) throw new Error('Devi aver effettuato l\'accesso per riservare questo posto.');

    const result = await reserveLeavingSpot({
      spotId,
      reservingUser: {
        uid: user.uid,
        displayName: user.displayName || 'Automobilista JANUS',
        photoURL: user.photoURL,
      }
    });

    if (result.success) {
      setActiveLeavingReservations(getUserActiveLeavingReservations(user.uid));
      showToast('Posto riservato con successo! Raggiungi la posizione indicata.');
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Impossibile riservare il posto.' };
    }
  };

  const cancelLeavingSignal = async (spotId: string): Promise<void> => {
    if (!user) return;
    await cancelLeavingSpot(spotId, user.uid);
    showToast('Segnalazione posto cancellata.');
  };

  const cancelLeavingReservationAction = async (spotId: string, reservationId: string): Promise<void> => {
    if (!user) return;
    await cancelLeavingReservation(spotId, reservationId, user.uid);
    setActiveLeavingReservations(getUserActiveLeavingReservations(user.uid));
    showToast('Prenotazione posto in uscita annullata.');
  };

  // 🅿️ Verified Free Parking actions
  const addFreeParkingSpot = async (data: Omit<FreeParkingSpot, 'id' | 'createdAt' | 'updatedAt' | 'isFree'>): Promise<FreeParkingSpot> => {
    const created = await createFreeParkingSpot(data);
    showToast('Parcheggio gratuito aggiunto e verificato con successo!');
    return created;
  };

  const updateFreeParkingSpotAction = async (spotId: string, updates: Partial<FreeParkingSpot>): Promise<void> => {
    await updateFreeParkingSpot(spotId, updates);
    showToast('Dati parcheggio gratuito aggiornati.');
  };

  const deleteFreeParkingSpotAction = async (spotId: string): Promise<void> => {
    await deleteFreeParkingSpot(spotId);
    showToast('Parcheggio gratuito rimosso.');
  };

  const reportFreeSpotStatus = async (spotId: string, status: 'available' | 'full'): Promise<void> => {
    await reportCommunitySpotStatus(spotId, status);
    if (status === 'available') {
      showToast('Grazie! Hai confermato che il posto è libero.');
    } else {
      showToast('Grazie della segnalazione! Aggiornato lo stato a occupato.');
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <ParkingContext.Provider
      value={{
        activeTab,
        setActiveTab,
        spots,
        filteredSpots,
        loadingSpots,
        filters,
        setFilters,
        searchFilters: filters,
        setSearchFilters: setFilters,
        selectedSpot,
        setSelectedSpot,
        detailSpot,
        setDetailSpot,
        userLocation,
        requestUserLocation,
        calculateDistanceKm,
        formatDistance,
        mapQuickFilter,
        setMapQuickFilter,
        leavingSpots,
        activeLeavingReservations,
        isLeavingSoonModalOpen,
        setIsLeavingSoonModalOpen,
        selectedLeavingSpot,
        setSelectedLeavingSpot,
        reportLeavingSoon,
        reserveLeavingSoonSpot,
        cancelLeavingSignal,
        cancelLeavingReservationAction,
        freeSpots,
        selectedFreeSpot,
        setSelectedFreeSpot,
        addFreeParkingSpot,
        updateFreeParkingSpotAction,
        deleteFreeParkingSpotAction,
        reportFreeSpotStatus,
        guestBookings,
        hostBookings,
        loadingBookings,
        bookingSpot,
        setBookingSpot,
        activeBookingSuccess,
        setActiveBookingSuccess,
        reviewingBooking,
        setReviewingBooking,
        reportingSpot,
        setReportingSpot,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        isContactModalOpen,
        setIsContactModalOpen,
        openContactModal,
        contactModalDefaultSubject,
        isAdminModalOpen,
        setIsAdminModalOpen,
        toastMessage,
        showToast,
        executeSearch,
        requestBooking,
        acceptBookingRequest,
        rejectBookingRequest,
        cancelBookingRequest,
        submitReview,
        submitDetailedReview,
        submitReport,
        publishSpot,
        toggleSpotStatus,
        deleteSpot,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
