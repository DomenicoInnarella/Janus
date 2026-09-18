import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType, compressImage } from '../lib/firebase';
import { ParkingSpot, ParkingStatus, SearchFilters } from '../types';
import { INITIAL_PARKING_SPOTS } from '../lib/mockData';

const PARKING_COLLECTION = 'parkingSpots';

export const parkingService = {
  // Listen to active parking spots in real-time
  subscribeToSpots(callback: (spots: ParkingSpot[]) => void) {
    const q = query(
      collection(db, PARKING_COLLECTION),
      where('status', 'in', ['active', 'pending_review'])
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty initially, seed local spots and notify
          callback(INITIAL_PARKING_SPOTS);
          return;
        }
        const spots: ParkingSpot[] = [];
        snapshot.forEach((docSnap) => {
          spots.push(docSnap.data() as ParkingSpot);
        });
        callback(spots);
      },
      (error) => {
        console.warn('Firestore subscription fallback to initial spots:', error);
        callback(INITIAL_PARKING_SPOTS);
      }
    );
  },

  // Get all spots (Promise)
  async getAllSpots(): Promise<ParkingSpot[]> {
    try {
      const snapshot = await getDocs(collection(db, PARKING_COLLECTION));
      if (snapshot.empty) {
        return INITIAL_PARKING_SPOTS;
      }
      const spots: ParkingSpot[] = [];
      snapshot.forEach((d) => spots.push(d.data() as ParkingSpot));
      return spots;
    } catch (error) {
      console.warn('Fetch spots error, using defaults:', error);
      return INITIAL_PARKING_SPOTS;
    }
  },

  // Get spot by ID
  async getSpotById(spotId: string): Promise<ParkingSpot | null> {
    try {
      const docRef = doc(db, PARKING_COLLECTION, spotId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ParkingSpot;
      }
      const found = INITIAL_PARKING_SPOTS.find((s) => s.id === spotId);
      return found || null;
    } catch (error) {
      const found = INITIAL_PARKING_SPOTS.find((s) => s.id === spotId);
      return found || null;
    }
  },

  // Upload image to Firebase Storage
  async uploadParkingImage(parkingId: string, file: File, index: number): Promise<string> {
    try {
      const compressedBlob = await compressImage(file, 1200, 0.85);
      const storageRef = ref(storage, `parking-images/${parkingId}/image-${index + 1}.jpg`);
      await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.warn('Firebase storage upload fallback to local URL:', error);
      return URL.createObjectURL(file);
    }
  },

  // Publish new parking spot
  async createParkingSpot(spot: ParkingSpot): Promise<ParkingSpot> {
    const spotRef = doc(db, PARKING_COLLECTION, spot.id);
    try {
      await setDoc(spotRef, spot);
      return spot;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${PARKING_COLLECTION}/${spot.id}`);
    }
  },

  // Update parking spot details
  async updateParkingSpot(spotId: string, updates: Partial<ParkingSpot>): Promise<void> {
    const spotRef = doc(db, PARKING_COLLECTION, spotId);
    try {
      await updateDoc(spotRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${PARKING_COLLECTION}/${spotId}`);
    }
  },

  // Delete/Deactivate spot
  async deleteParkingSpot(spotId: string): Promise<void> {
    const spotRef = doc(db, PARKING_COLLECTION, spotId);
    try {
      await deleteDoc(spotRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PARKING_COLLECTION}/${spotId}`);
    }
  },

  // Filter spots helper
  filterSpots(spots: ParkingSpot[], filters: SearchFilters): ParkingSpot[] {
    return spots.filter((spot) => {
      if (spot.status !== 'active') return false;

      // Query text match
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesTitle = spot.title.toLowerCase().includes(q);
        const matchesLoc = spot.approximateLocation.toLowerCase().includes(q);
        const matchesDesc = spot.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
      }

      // Parking Type
      if (filters.parkingType && filters.parkingType !== 'all') {
        if (spot.parkingType !== filters.parkingType) return false;
      }

      // Vehicle Size
      if (filters.vehicleSize && filters.vehicleSize !== 'all') {
        if (spot.vehicleSize !== 'all' && spot.vehicleSize !== filters.vehicleSize) return false;
      }

      // Max Price
      if (filters.maxPrice && filters.maxPrice > 0) {
        if (spot.pricePerHour > filters.maxPrice) return false;
      }

      // Verified host only
      if (filters.verifiedHostOnly) {
        if (spot.ownerHostStatus === 'new_host') return false;
      }

      return true;
    });
  }
};
