import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Review, ParkingSpot } from '../types';
import { INITIAL_REVIEWS } from '../lib/mockData';

const REVIEWS_COLLECTION = 'reviews';
const PARKING_COLLECTION = 'parkingSpots';
const USERS_COLLECTION = 'users';
const BOOKINGS_COLLECTION = 'bookings';

export interface CreateReviewParams {
  bookingId: string;
  parkingId: string;
  hostId: string;
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  overallRating: number;
  locationRating?: number;
  safetyRating?: number;
  accessRating?: number;
  accuracyRating?: number;
  conditionRating?: number;
  comment: string;
}

export const reviewService = {
  // Listen to reviews for a parking spot
  subscribeSpotReviews(parkingId: string, callback: (reviews: Review[]) => void) {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('parkingId', '==', parkingId)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const fallbacks = INITIAL_REVIEWS.filter((r) => r.parkingId === parkingId);
        callback(fallbacks);
        return;
      }
      const list: Review[] = [];
      snapshot.forEach((d) => list.push(d.data() as Review));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.warn('Reviews snapshot fallback:', error);
      const fallbacks = INITIAL_REVIEWS.filter((r) => r.parkingId === parkingId);
      callback(fallbacks);
    });
  },

  // Create detailed multi-category review for completed booking
  async createReview(params: CreateReviewParams): Promise<Review> {
    const reviewId = `rev-${Date.now()}`;

    const newReview: Review = {
      id: reviewId,
      bookingId: params.bookingId,
      parkingId: params.parkingId,
      hostId: params.hostId,
      guestId: params.guestId,
      guestName: params.guestName,
      guestPhoto: params.guestPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      overallRating: params.overallRating,
      rating: params.overallRating,
      locationRating: params.locationRating ?? params.overallRating,
      safetyRating: params.safetyRating ?? params.overallRating,
      accessRating: params.accessRating ?? params.overallRating,
      accuracyRating: params.accuracyRating ?? params.overallRating,
      conditionRating: params.conditionRating ?? params.overallRating,
      comment: params.comment,
      verifiedBooking: true, // Tied strictly to completed booking
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), newReview);

      // Mark booking as reviewLeft: true
      await updateDoc(doc(db, BOOKINGS_COLLECTION, params.bookingId), {
        reviewLeft: true,
      });

      // Update spot average rating
      try {
        const spotRef = doc(db, PARKING_COLLECTION, params.parkingId);
        const spotSnap = await getDoc(spotRef);
        if (spotSnap.exists()) {
          const currentData = spotSnap.data() as ParkingSpot;
          const currentCount = currentData.reviewCount || 0;
          const currentRating = currentData.rating || 5.0;
          const newCount = currentCount + 1;
          const updatedAvg = Number(((currentRating * currentCount + params.overallRating) / newCount).toFixed(1));

          await updateDoc(spotRef, {
            rating: updatedAvg,
            reviewCount: newCount,
            averageLocationRating: params.locationRating || currentData.averageLocationRating,
            averageSafetyRating: params.safetyRating || currentData.averageSafetyRating,
            averageAccessRating: params.accessRating || currentData.averageAccessRating,
            averageAccuracyRating: params.accuracyRating || currentData.averageAccuracyRating,
            averageConditionRating: params.conditionRating || currentData.averageConditionRating,
          });
        }
      } catch (err) {
        console.warn('Could not update spot rating aggregation:', err);
      }

      return newReview;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewId}`);
    }
  }
};
