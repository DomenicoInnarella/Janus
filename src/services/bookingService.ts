import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Booking, BookingStatus, ParkingSpot } from '../types';

const BOOKINGS_COLLECTION = 'bookings';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const bookingService = {
  // Generate random 6-character alphanumeric verification code
  generateBookingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'PS-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Create booking request (Driver -> Host)
  async createBookingRequest(
    spot: ParkingSpot,
    guestId: string,
    guestName: string,
    guestPhoto: string | undefined,
    startTime: string,
    endTime: string,
    durationHours: number,
    totalPrice: number
  ): Promise<Booking> {
    const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const bookingCode = this.generateBookingCode();

    const booking: Booking = {
      id: bookingId,
      parkingId: spot.id,
      parkingTitle: spot.title,
      parkingPhoto: spot.photos[0] || '',
      parkingApproxLocation: spot.approximateLocation,
      // Exact address and access instructions will only be stamped upon host acceptance!
      parkingExactAddress: '', 
      hostAccessInstructions: '',
      hostId: spot.ownerId,
      hostName: spot.ownerName,
      hostPhoto: spot.ownerPhoto,
      guestId,
      guestName,
      guestPhoto: guestPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      startTime,
      endTime,
      durationHours,
      totalPrice,
      status: 'pending',
      bookingCode,
      reviewLeft: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, BOOKINGS_COLLECTION, bookingId), booking);

      // Send in-app notification to host
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
        id: notifId,
        userId: spot.ownerId,
        title: 'New Booking Request 🚗',
        message: `${guestName} requested to park at "${spot.title}" (${durationHours}h - €${totalPrice.toFixed(2)})`,
        type: 'booking_request',
        linkId: bookingId,
        read: false,
        createdAt: new Date().toISOString(),
      });

      return booking;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  },

  // Host accepts booking (reveals exact address and private access instructions)
  async acceptBooking(booking: Booking, spot: ParkingSpot): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    try {
      await updateDoc(bookingRef, {
        status: 'accepted',
        parkingExactAddress: spot.exactAddress,
        hostAccessInstructions: spot.accessInstructions || 'Follow host parking guidelines.',
        updatedAt: new Date().toISOString(),
      });

      // Send notification to driver
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
        id: notifId,
        userId: booking.guestId,
        title: 'Booking Accepted! 🎉',
        message: `Your booking for "${booking.parkingTitle}" was accepted. Exact address & access instructions unlocked!`,
        type: 'booking_accepted',
        linkId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${booking.id}`);
    }
  },

  // Host or Driver rejects / cancels booking
  async updateBookingStatus(
    bookingId: string, 
    status: 'rejected' | 'cancelled' | 'completed',
    recipientId?: string,
    messageTitle?: string,
    messageBody?: string
  ): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    try {
      await updateDoc(bookingRef, {
        status,
        updatedAt: new Date().toISOString(),
      });

      if (recipientId && messageTitle && messageBody) {
        const notifId = `notif-${Date.now()}`;
        await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), {
          id: notifId,
          userId: recipientId,
          title: messageTitle,
          message: messageBody,
          type: status === 'rejected' ? 'booking_rejected' : 'booking_cancelled',
          linkId: bookingId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  },

  // Listen to bookings where user is guest (driver)
  subscribeGuestBookings(guestId: string, callback: (bookings: Booking[]) => void) {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('guestId', '==', guestId)
    );

    return onSnapshot(q, (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((d) => list.push(d.data() as Booking));
      // sort latest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.warn('Guest bookings listener fallback:', error);
      callback([]);
    });
  },

  // Listen to bookings where user is host
  subscribeHostBookings(hostId: string, callback: (bookings: Booking[]) => void) {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('hostId', '==', hostId)
    );

    return onSnapshot(q, (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((d) => list.push(d.data() as Booking));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.warn('Host bookings listener fallback:', error);
      callback([]);
    });
  }
};
