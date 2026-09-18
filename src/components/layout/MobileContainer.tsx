import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '../common/Toast';
import { useParking } from '../../contexts/ParkingContext';

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toastMessage } = useParking();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-100 selection:bg-amber-400 selection:text-black antialiased">
      {/* Universal Trust-First Header */}
      <Header />

      {/* Main Responsive Web Content Area */}
      <main className="flex-1 w-full relative flex flex-col">
        {children}
      </main>

      {/* Bottom Navigation for Mobile Screens */}
      <BottomNav />

      {/* Floating Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};
