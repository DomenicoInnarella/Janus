export type HostStatus = 'new_host' | 'verified_host' | 'trusted_host' | 'super_host';
export type VerificationStatus = 'unverified' | 'verified' | 'trusted' | 'super_host';

export type ParkingType = 
  | 'outdoor' 
  | 'covered' 
  | 'garage' 
  | 'underground' 
  | 'courtyard' 
  | 'box' 
  | 'driveway' 
  | 'indoor' 
  | 'open';

export type SupportedVehicleType = 'small_car' | 'standard_car' | 'suv' | 'large_van' | 'motorcycle';
export type VehicleSize = 'compact' | 'sedan' | 'suv' | 'van' | 'motorcycle' | 'all';

export type SecurityFeature = 
  | 'closed_garage' 
  | 'automatic_gate' 
  | 'video_surveillance' 
  | 'well_lit' 
  | 'guarded' 
  | 'controlled_access';

export type AccessType = 
  | 'open_access' 
  | 'automatic_gate' 
  | 'manual_gate' 
  | 'key_required' 
  | 'key_code' 
  | 'phone_access' 
  | 'host_meeting' 
  | 'remote' 
  | 'key_lockbox';

export type AccessDifficulty = 'easy' | 'moderate' | 'difficult';

export type ParkingStatus = 'active' | 'pending_review' | 'suspended' | 'rejected' | 'paused';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export type ReportReason =
  | 'does_not_exist'
  | 'wrong_location'
  | 'host_not_owner'
  | 'fake_photos'
  | 'space_unavailable'
  | 'misleading_info'
  | 'suspicious_activity'
  | 'other';

export type ReportStatus = 'pending_review' | 'investigating' | 'resolved' | 'dismissed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  verificationStatus: VerificationStatus;
  hostStatus: HostStatus;
  
  // Verification details
  emailVerified?: boolean;
  documentVerified?: boolean;
  idDocumentType?: 'id_card' | 'passport' | 'drivers_license';
  idDocumentNumber?: string;
  truthDeclarationSigned?: boolean;
  truthDeclarationDate?: string;
  
  createdAt: string;
}

export interface ParkingSpot {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto?: string;
  ownerRating: number;
  ownerBookingsCount: number;
  ownerHostStatus: HostStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  approximateLocation: string; // e.g. "Trastevere, Rome"
  exactAddress: string; // Revealed ONLY when booking is accepted
  accessInstructions?: string; // Revealed ONLY when booking is accepted
  pricePerHour: number;
  pricePerDay?: number;
  
  // Categorical details & compatibility
  parkingType: ParkingType;
  vehicleSize: VehicleSize;
  supportedVehicles?: SupportedVehicleType[];
  maxLength?: number; // meters e.g. 5.0
  maxWidth?: number;  // meters e.g. 2.2
  maxHeight?: number; // meters e.g. 2.1
  
  // Safety & Access
  securityFeatures?: string[];
  accessType: AccessType;
  accessDifficulty?: AccessDifficulty;
  accessNotes?: string;
  
  availability: string; // e.g. "Mon-Sun, 08:00 - 20:00"
  photos: string[]; // At least 2 photos (parking space & entrance/gate)
  status: ParkingStatus;
  
  // Detailed Multi-Dimensional Ratings
  rating: number; // Overall average
  reviewCount: number;
  completedBookings: number;
  averageLocationRating?: number;
  averageSafetyRating?: number;
  averageAccessRating?: number;
  averageAccuracyRating?: number;
  averageConditionRating?: number;
  
  isOfficialGuarded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  parkingId: string;
  parkingTitle: string;
  parkingPhoto?: string;
  parkingApproxLocation: string;
  parkingExactAddress?: string; // Revealed after accepted
  hostAccessInstructions?: string; // Revealed after accepted
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  
  // Stripe and Host Payout Breakdown (15% platform fee)
  payoutToHost?: number;
  platformFee?: number;
  paymentMethod?: 'stripe_card' | 'apple_pay' | 'google_pay';
  stripePaymentId?: string;
  
  status: BookingStatus;
  bookingCode: string;
  reviewLeft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  parkingId: string;
  hostId: string;
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  
  // Multi-Category Rating (1 to 5 stars)
  overallRating: number;
  rating?: number; // fallback alias for overall
  locationRating?: number;
  safetyRating?: number;
  accessRating?: number;
  accuracyRating?: number;
  conditionRating?: number;
  
  comment: string;
  verifiedBooking: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  parkingId: string;
  parkingTitle: string;
  reporterId: string;
  reporterEmail?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'booking_cancelled' | 'review_received' | 'report_submitted' | 'system';
  linkId?: string;
  read: boolean;
  createdAt: string;
}

export type NavigationTab = 
  | 'home' 
  | 'search' 
  | 'eagle-map' 
  | 'city-guide' 
  | 'publish' 
  | 'bookings' 
  | 'profile';

export interface SearchFilters {
  query: string;
  parkingType?: ParkingType | 'all';
  vehicleSize?: VehicleSize | 'all';
  maxPrice?: number;
  verifiedHostOnly?: boolean;
  guardedOnly?: boolean;
}

// 🦅 EAGLE VIEW & ROOFTOP SPOTS
export interface EagleSpot {
  id: string;
  name: string;
  tagline: string;
  category: 'rooftop_bar' | 'panoramic_view' | 'sky_restaurant' | 'historic_terrace' | 'lounge';
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  rating: number;
  reviewCount: number;
  priceLevel: '€' | '€€' | '€€€' | '€€€€';
  photos: string[];
  signatureView: string; // e.g. "Vista diretta su Cupola di San Pietro e Castel Sant'Angelo"
  menuHighlights: {
    item: string;
    description: string;
    price: string;
  }[];
  dressCode?: string;
  reservationRecommended?: boolean;
  openingHours: string;
  publicTransit: string; // Bus & Metro connection
  liveAlertCount: number;
}

export interface EagleAlert {
  id: string;
  spotId?: string;
  spotName?: string;
  authorName: string;
  authorAvatar?: string;
  badge: 'Local Eagle' | 'Travel Eagle' | 'Top Explorer';
  content: string;
  category: 'sunset' | 'free_table' | 'atmosphere' | 'tip' | 'weather';
  timestamp: string;
  likes: number;
}

export interface EagleChatSession {
  id: string;
  title: string;
  peerName: string;
  peerAvatar?: string;
  peerBadge: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: {
    id: string;
    senderId: 'me' | 'peer';
    senderName: string;
    text: string;
    timestamp: string;
    sharedTour?: TourPlan;
  }[];
}

// 🧭 TOUR BUILDER & BUDGET
export type TourCategory = 
  | 'churches'
  | 'salsa_bachata'
  | 'rock_jazz'
  | 'painting_art'
  | 'beaches'
  | 'gym_spa'
  | 'food_wine'
  | 'panoramic_views';

export interface TourStop {
  id: string;
  title: string;
  category: TourCategory;
  description: string;
  estimatedCost: number; // 0 for free
  durationMinutes: number;
  address: string;
  transitTip: string; // Bus/Metro connection
  photoUrl: string;
  tips: string;
}

export interface TourPlan {
  id: string;
  title: string;
  budgetType: 'free' | 'low_budget' | 'medium_budget' | 'premium';
  budgetAmount: number;
  duration: 'half_day' | 'full_day' | 'evening_night';
  selectedCategories: TourCategory[];
  totalEstimatedCost: number;
  stops: TourStop[];
  transitSummary: string;
  summaryAdvice: string;
  createdAt: string;
}

// 🆘 SOS & CITY GUIDE & ZTL
export interface EmergencyService {
  id: string;
  name: string;
  number: string;
  description: string;
  category: 'emergency' | 'police' | 'medical' | 'transport' | 'tourist_info';
  availableHours: string;
  languages: string[];
}

export interface ZtlZoneInfo {
  id: string;
  name: string;
  badge: string;
  dayHours: string;
  nightHours: string;
  daysActive: string;
  exemptions: string;
  description: string;
  parkingAccessTip: string;
  color: string;
}

export interface CityEventItem {
  id: string;
  title: string;
  category: 'salsa_bachata' | 'rock_jazz' | 'painting_art' | 'beach_party' | 'cultural';
  venueName: string;
  neighborhood: string;
  date: string;
  time: string;
  price: string;
  photoUrl: string;
  description: string;
  busMetroConnection: string;
}

// 📬 NEWSLETTER & CITY ALERTS
export interface NewsletterSubscriber {
  id: string;
  email: string;
  userId?: string | null;
  status: 'subscribed' | 'unsubscribed';
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

// 🗺️ UNIFIED MAP QUICK FILTERS
export type MapQuickFilter = 'all' | 'available' | 'leaving_soon' | 'private' | 'free';

// 🚗 REAL-TIME "STO LIBERANDO IL POSTO" AVAILABILITY
export type LeavingSpotStatus = 'leaving_soon' | 'reserved' | 'completed' | 'expired' | 'cancelled';

export interface LeavingSoonSpot {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string; // e.g. "Roma"
  approximateLocation: string; // e.g. "Trastevere", "Prati", "Termini"
  departureMinutes: number; // 5, 10, 15, 20, 30
  availableAt: string; // ISO string when space is estimated to be free
  expiresAt: string; // ISO string after which space expires from map
  vehicleSize?: VehicleSize;
  notes?: string;
  status: LeavingSpotStatus;
  reservedByUserId?: string;
  reservedByUserName?: string;
  reservedByUserPhoto?: string;
  reservedAt?: string;
  reservationId?: string;
  createdAt: string;
  updatedAt: string;
}

// 🤝 RESERVATION OF A LEAVING SPACE
export type LeavingReservationStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'completed';

export interface LeavingReservation {
  id: string;
  leavingSpotId: string;
  spotTitle: string;
  spotAddress: string;
  latitude: number;
  longitude: number;
  departingUserId: string;
  departingUserName: string;
  reservingUserId: string;
  reservingUserName: string;
  reservingUserPhoto?: string;
  status: LeavingReservationStatus;
  availableAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// 🅿️ VERIFIED FREE PARKING ("PARCHEGGI GRATUITI")
export type FreeParkingStatus = 'available' | 'full' | 'unverified' | 'outdated';

export interface FreeParkingSpot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  parkingType: 'free_surface' | 'free_street' | 'exchange_metro' | 'free_white_lines';
  city: string; // "Roma"
  approximateLocation: string; // e.g. "Prati / Clodio", "Ponte Milvio"
  availabilityInfo?: string; // e.g. "Libero h24", "Stalli bianchi non tariffati"
  source: string; // e.g. "Roma Mobilità / Roma Capitale"
  sourceUrl?: string; // e.g. "https://romamobilita.it"
  notes?: string;
  lastVerifiedAt: string; // ISO date string
  isFree: true;
  totalCapacityEstimated?: number;
  currentStatus?: FreeParkingStatus;
  confirmationsCount?: number;
  lastCommunityReportAt?: string;
  reliabilityScore?: number; // 0 - 100%
  createdAt: string;
  updatedAt: string;
}

