import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider } from './contexts/AuthContext';
import { ParkingProvider, useParking } from './contexts/ParkingContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PublishPage } from './pages/PublishPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EagleMapPage } from './pages/EagleMapPage';
import { CityGuidePage } from './pages/CityGuidePage';
import { ParkingDetailModal } from './components/parking/ParkingDetailModal';
import { BookingModal } from './components/booking/BookingModal';
import { BookingSuccessModal } from './components/booking/BookingSuccessModal';
import { ReviewModal } from './components/booking/ReviewModal';
import { ReportModal } from './components/parking/ReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { SplashScreen } from './components/common/SplashScreen';
import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import { DeleteAccountModal } from './components/legal/DeleteAccountModal';
import { ContactUsModal } from './components/contact/ContactUsModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { JanusOnboardingModal } from './components/onboarding/JanusOnboardingModal';
import { discoveryService, FeatureDiscoveryItem } from './services/discoveryService';
import { FeatureDiscoveryBanner } from './components/common/FeatureDiscoveryBanner';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    detailSpot,
    setDetailSpot,
    bookingSpot,
    setBookingSpot,
    activeBookingSuccess,
    setActiveBookingSuccess,
    reviewingBooking,
    setReviewingBooking,
    reportingSpot,
    setReportingSpot,
    isContactModalOpen,
    setIsContactModalOpen,
    contactModalDefaultSubject,
    isAdminModalOpen,
    setIsAdminModalOpen,
    mapQuickFilter,
    setMapQuickFilter,
    isLeavingSoonModalOpen,
    setIsLeavingSoonModalOpen,
    filters,
  } = useParking();

  // Direct URL support for Google Play compliance: /privacy and /delete-account
  const [legalModal, setLegalModal] = useState<'privacy' | 'delete-account' | null>(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const legalParam = searchParams.get('legal')?.toLowerCase();

    if (pathname.includes('privacy') || legalParam === 'privacy') {
      return 'privacy';
    }
    if (pathname.includes('delete-account') || pathname.includes('delete') || legalParam === 'delete-account' || legalParam === 'delete') {
      return 'delete-account';
    }
    return null;
  });

  const handleCloseLegalModal = () => {
    setLegalModal(null);
    try {
      if (window.location.pathname !== '/' || window.location.search.includes('legal=')) {
        window.history.replaceState({}, '', '/');
      }
    } catch {
      // ignore
    }
  };

  // Splash screen state: display for ~2.2 seconds on initial load
  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('splash')) {
        return true;
      }
      return !sessionStorage.getItem('janus_splash_shown');
    } catch {
      return true;
    }
  });

  const handleSplashComplete = useCallback(() => {
    try {
      sessionStorage.setItem('janus_splash_shown', 'true');
    } catch {
      // ignore
    }
    setShowSplash(false);
  }, []);

  // Allow replaying splash screen on demand (e.g. from settings / profile)
  useEffect(() => {
    const handleReplay = () => setShowSplash(true);
    window.addEventListener('replay_splash', handleReplay);
    return () => window.removeEventListener('replay_splash', handleReplay);
  }, []);

  // 📖 Janus 5-Screen Interactive Onboarding state
  const [isReplayingOnboarding, setIsReplayingOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('onboarding') === 'true' || searchParams.get('intro') === 'true') {
          return true;
        }
        return discoveryService.isFirstRun();
      }
      return false;
    } catch {
      return false;
    }
  });

  const handleFinishOnboarding = useCallback(() => {
    discoveryService.markOnboardingCompleted();
    setShowOnboarding(false);
    setIsReplayingOnboarding(false);
    // Portare direttamente alla schermata principale/mappa
    setActiveTab('home');
    // Ensure viewport scrolls to the top where map is located
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [setActiveTab]);

  const handleCloseReplayOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setIsReplayingOnboarding(false);
  }, []);

  useEffect(() => {
    const handleReplayOnboarding = () => {
      setIsReplayingOnboarding(true);
      setShowOnboarding(true);
    };
    window.addEventListener('replay_onboarding', handleReplayOnboarding);
    return () => window.removeEventListener('replay_onboarding', handleReplayOnboarding);
  }, []);

  // 💡 Feature Discovery State & Non-Intrusive Contextual Controller
  const [activeDiscovery, setActiveDiscovery] = useState<FeatureDiscoveryItem | null>(null);

  // Track natural feature usage so we never propose features the user has already discovered
  useEffect(() => {
    if (mapQuickFilter === 'leaving_soon') {
      discoveryService.trackFeatureUsed('leaving_soon');
    } else if (mapQuickFilter === 'free') {
      discoveryService.trackFeatureUsed('free_parking');
    } else if (mapQuickFilter === 'private') {
      discoveryService.trackFeatureUsed('private_parking');
    }
  }, [mapQuickFilter]);

  useEffect(() => {
    if (isLeavingSoonModalOpen) {
      discoveryService.trackFeatureUsed('report_leaving');
    }
  }, [isLeavingSoonModalOpen]);

  useEffect(() => {
    if (bookingSpot) {
      discoveryService.trackFeatureUsed('private_parking');
    }
  }, [bookingSpot]);

  // Evaluate candidate discovery item strictly at quiet moments (home/search, no modals open, no typing)
  useEffect(() => {
    const isBusyWithFlow = 
      showSplash || 
      showOnboarding || 
      Boolean(bookingSpot) || 
      Boolean(activeBookingSuccess) || 
      isLeavingSoonModalOpen || 
      Boolean(reportingSpot) || 
      Boolean(reviewingBooking) || 
      Boolean(detailSpot) || 
      isContactModalOpen || 
      isAdminModalOpen || 
      Boolean(legalModal) ||
      (filters.query && filters.query.trim().length > 0);

    if (isBusyWithFlow) {
      if (activeDiscovery) {
        setActiveDiscovery(null);
      }
      return;
    }

    if (activeTab !== 'home' && activeTab !== 'search') {
      return;
    }

    const eligible = discoveryService.getNextEligibleDiscovery();
    if (eligible) {
      const timer = setTimeout(() => {
        setActiveDiscovery(eligible);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    showSplash,
    showOnboarding,
    bookingSpot,
    activeBookingSuccess,
    isLeavingSoonModalOpen,
    reportingSpot,
    reviewingBooking,
    detailSpot,
    isContactModalOpen,
    isAdminModalOpen,
    legalModal,
    filters.query,
    activeTab,
    activeDiscovery,
  ]);

  const handleDiscoveryAction = useCallback((item: FeatureDiscoveryItem) => {
    discoveryService.recordDiscoveryShown(item.id);
    discoveryService.trackFeatureUsed(item.targetFeatureKey);
    setActiveDiscovery(null);

    if (item.actionType === 'filter_leaving') {
      setMapQuickFilter('leaving_soon');
      setActiveTab('home');
    } else if (item.actionType === 'filter_free') {
      setMapQuickFilter('free');
      setActiveTab('home');
    } else if (item.actionType === 'filter_private') {
      setMapQuickFilter('private');
      setActiveTab('home');
    } else if (item.actionType === 'open_leaving_modal') {
      setIsLeavingSoonModalOpen(true);
    } else if (item.actionType === 'open_map') {
      setActiveTab('home');
    }
  }, [setMapQuickFilter, setActiveTab, setIsLeavingSoonModalOpen]);

  const handleDismissDiscovery = useCallback(() => {
    if (activeDiscovery) {
      discoveryService.recordDiscoveryShown(activeDiscovery.id);
    }
    setActiveDiscovery(null);
  }, [activeDiscovery]);

  // Dev test event listener to easily verify Day 1 / 14-day discovery
  useEffect(() => {
    const handleTestTrigger = () => {
      const candidate = discoveryService.getNextEligibleDiscovery({ isDevOverride: true });
      if (candidate) {
        setActiveDiscovery(candidate);
      }
    };
    window.addEventListener('test_trigger_discovery', handleTestTrigger);
    return () => window.removeEventListener('test_trigger_discovery', handleTestTrigger);
  }, []);

  // 📱 Android Hardware Back Button Integration (Safe on Web & Capacitor Native)
  useEffect(() => {
    if (!Capacitor.isPluginAvailable('App')) {
      return;
    }

    let isSubscribed = true;
    let listenerHandle: PluginListenerHandle | null = null;

    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (showSplash) {
        handleSplashComplete();
      } else if (showOnboarding) {
        setShowOnboarding(false);
      } else if (reportingSpot) {
        setReportingSpot(null);
      } else if (reviewingBooking) {
        setReviewingBooking(null);
      } else if (activeBookingSuccess) {
        setActiveBookingSuccess(null);
      } else if (bookingSpot) {
        setBookingSpot(null);
      } else if (detailSpot) {
        setDetailSpot(null);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      } else if (canGoBack) {
        window.history.back();
      } else {
        try {
          CapApp.exitApp();
        } catch {
          // ignore web fallback
        }
      }
    }).then((handle) => {
      if (!isSubscribed) {
        handle.remove();
      } else {
        listenerHandle = handle;
      }
    }).catch((err) => {
      console.warn('Capacitor backButton registration skipped:', err);
    });

    return () => {
      isSubscribed = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [
    showSplash,
    showOnboarding,
    activeTab,
    detailSpot,
    bookingSpot,
    activeBookingSuccess,
    reviewingBooking,
    reportingSpot,
    setDetailSpot,
    setBookingSpot,
    setActiveBookingSuccess,
    setReviewingBooking,
    setReportingSpot,
    setActiveTab,
    handleSplashComplete,
  ]);

  // Instant scroll-to-top on tab switch to prevent layout stutter / scroll locks
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <>
      {/* 🦅 Animated Splash Screen Entrance (4.5s) */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} durationMs={4500} />
      )}

      {/* 📖 Janus 5-Screen Interactive Visual Onboarding */}
      <JanusOnboardingModal
        isOpen={showOnboarding && !showSplash}
        canSkip={isReplayingOnboarding}
        onClose={handleCloseReplayOnboarding}
        onFinish={handleFinishOnboarding}
      />

      {/* 💡 Non-intrusive Progressive Feature Discovery Banner */}
      <FeatureDiscoveryBanner
        discovery={activeDiscovery}
        onAction={handleDiscoveryAction}
        onDismiss={handleDismissDiscovery}
      />

      <MobileContainer>
        {/* Instantaneous lag-free page rendering without dual-mount animation stutter */}
        <div key={activeTab} className="w-full flex-1 flex flex-col">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'search' && <SearchPage />}
          {activeTab === 'eagle-map' && <EagleMapPage />}
          {activeTab === 'city-guide' && <CityGuidePage />}
          {activeTab === 'publish' && <PublishPage />}
          {activeTab === 'bookings' && <BookingsPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>

        {/* Parking Detail Modal */}
        {detailSpot && detailSpot.id && (
          <ParkingDetailModal
            spot={detailSpot}
            onClose={() => setDetailSpot(null)}
          />
        )}

        {/* Booking Checkout Modal */}
        {bookingSpot && (
          <BookingModal
            spot={bookingSpot}
            onClose={() => setBookingSpot(null)}
          />
        )}

        {/* Booking Success Confirmation */}
        {activeBookingSuccess && (
          <BookingSuccessModal
            booking={activeBookingSuccess}
            onClose={() => setActiveBookingSuccess(null)}
          />
        )}

        {/* Verified Review Modal */}
        {reviewingBooking && (
          <ReviewModal
            booking={reviewingBooking}
            onClose={() => setReviewingBooking(null)}
          />
        )}

        {/* Report Fraud / Listing Concern Modal */}
        {reportingSpot && (
          <ReportModal
            spot={reportingSpot}
            onClose={() => setReportingSpot(null)}
          />
        )}

        {/* Global Auth Modal */}
        <AuthModal />

        {/* Global Legal Modals (Direct URL Access) */}
        <PrivacyPolicyModal
          isOpen={legalModal === 'privacy'}
          onClose={handleCloseLegalModal}
        />

        <DeleteAccountModal
          isOpen={legalModal === 'delete-account'}
          onClose={handleCloseLegalModal}
        />

        {/* Contact Us Modal (Top Bar Single Entry Point) */}
        <ContactUsModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          defaultSubject={contactModalDefaultSubject}
        />

        {/* Admin & Notifications Dashboard */}
        <AdminDashboardModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />
      </MobileContainer>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <AppContent />
      </ParkingProvider>
    </AuthProvider>
  );
}
