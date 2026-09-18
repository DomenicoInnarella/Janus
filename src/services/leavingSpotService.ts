import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeavingSoonSpot, LeavingReservation, VehicleSize } from '../types';

const LEAVING_SPOTS_STORAGE_KEY = 'janus_leaving_spots_v1';
const LEAVING_RESERVATIONS_STORAGE_KEY = 'janus_leaving_reservations_v1';

// Seed initial realistic leaving soon spots in Rome so the live map is immediately active
const INITIAL_LEAVING_SPOTS: LeavingSoonSpot[] = [
  {
    id: 'leave-trastevere-01',
    userId: 'driver-seed-101',
    userName: 'Gianluca M.',
    userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    title: 'Posto su strisce bianche in partenza',
    address: 'Piazza Trilussa / Lungotevere Raffaello Sanzio, Roma',
    approximateLocation: 'Trastevere',
    latitude: 41.8902,
    longitude: 12.4705,
    city: 'Roma',
    departureMinutes: 8,
    availableAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    vehicleSize: 'sedan',
    notes: 'Fiat 500 Grigia metallizzata davanti al bar. Metto la freccia e libero tra circa 8 minuti.',
    status: 'leaving_soon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'leave-prati-02',
    userId: 'driver-seed-102',
    userName: 'Elena B.',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'Stalli liberi vicino Metro Ottaviano',
    address: 'Via Ottaviano 42, 00192 Roma RM',
    approximateLocation: 'Prati / San Pietro',
    latitude: 41.9080,
    longitude: 12.4578,
    city: 'Roma',
    departureMinutes: 12,
    availableAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    vehicleSize: 'compact',
    notes: 'Toyota Yaris bianca. Finito lo shopping, sto salendo in macchina.',
    status: 'leaving_soon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function getStoredLeavingSpots(): LeavingSoonSpot[] {
  try {
    const raw = localStorage.getItem(LEAVING_SPOTS_STORAGE_KEY);
    if (raw) {
      const parsed: LeavingSoonSpot[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read leaving spots from localStorage', e);
  }
  return INITIAL_LEAVING_SPOTS;
}

function saveStoredLeavingSpots(spots: LeavingSoonSpot[]) {
  try {
    localStorage.setItem(LEAVING_SPOTS_STORAGE_KEY, JSON.stringify(spots));
  } catch (e) {
    console.warn('Could not save leaving spots to localStorage', e);
  }
}

function getStoredReservations(): LeavingReservation[] {
  try {
    const raw = localStorage.getItem(LEAVING_RESERVATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read reservations from localStorage', e);
  }
  return [];
}

function saveStoredReservations(reservations: LeavingReservation[]) {
  try {
    localStorage.setItem(LEAVING_RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.warn('Could not save reservations to localStorage', e);
  }
}

// Check whether a spot is currently unexpired
export function isLeavingSpotActive(spot: LeavingSoonSpot): boolean {
  if (spot.status === 'expired' || spot.status === 'cancelled' || spot.status === 'completed') {
    return false;
  }
  const expiryTime = new Date(spot.expiresAt).getTime();
  return expiryTime > Date.now();
}

// Subscribe to real-time leaving spots with automatic expiration filtering
export function subscribeToLeavingSpots(callback: (spots: LeavingSoonSpot[]) => void): () => void {
  const deliverActive = (list: LeavingSoonSpot[]) => {
    // Filter active and update expired ones
    const active = list.filter(isLeavingSpotActive);
    callback(active);
  };

  deliverActive(getStoredLeavingSpots());

  if (!db) {
    return () => {};
  }

  try {
    const q = collection(db, 'leavingSpots');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteSpots = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as LeavingSoonSpot[];

          const combined = new Map<string, LeavingSoonSpot>();
          for (const s of getStoredLeavingSpots()) {
            combined.set(s.id, s);
          }
          for (const s of remoteSpots) {
            combined.set(s.id, s);
          }
          const all = Array.from(combined.values());
          saveStoredLeavingSpots(all);
          deliverActive(all);
        } else {
          deliverActive(getStoredLeavingSpots());
        }
      },
      (error) => {
        console.warn('Firestore leavingSpots subscription error, fallback to local storage:', error);
        deliverActive(getStoredLeavingSpots());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to listen to leavingSpots collection:', err);
    return () => {};
  }
}

// 🚗 1. Driver reports: "Sto liberando il posto"
export async function createLeavingSpot(params: {
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  address: string;
  approximateLocation: string;
  latitude: number;
  longitude: number;
  departureMinutes: number;
  vehicleSize?: VehicleSize;
  notes?: string;
}): Promise<LeavingSoonSpot> {
  const now = Date.now();
  const availableAt = new Date(now + params.departureMinutes * 60 * 1000).toISOString();
  // Valid for departure time + 25 minutes grace period before automatically expiring
  const expiresAt = new Date(now + (params.departureMinutes + 25) * 60 * 1000).toISOString();

  const newSpot: LeavingSoonSpot = {
    id: `leave-${now}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    userName: params.userName || 'Automobilista JANUS',
    userPhoto: params.userPhoto,
    title: params.title || `Posto libero tra ${params.departureMinutes} min`,
    address: params.address,
    approximateLocation: params.approximateLocation || 'Roma',
    latitude: params.latitude,
    longitude: params.longitude,
    city: 'Roma',
    departureMinutes: params.departureMinutes,
    availableAt,
    expiresAt,
    vehicleSize: params.vehicleSize || 'sedan',
    notes: params.notes,
    status: 'leaving_soon',
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };

  const stored = getStoredLeavingSpots();
  saveStoredLeavingSpots([newSpot, ...stored]);

  if (db) {
    try {
      await setDoc(doc(db, 'leavingSpots', newSpot.id), newSpot);
    } catch (err) {
      console.warn('Firestore setDoc failed for leavingSpot, preserved locally:', err);
    }
  }

  return newSpot;
}

// 🤝 2. Driver reserves leaving space — TRANSACTION-PROTECTED TO PREVENT RACE CONDITIONS
export async function reserveLeavingSpot(params: {
  spotId: string;
  reservingUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
}): Promise<{ success: boolean; spot: LeavingSoonSpot; reservation: LeavingReservation; error?: string }> {
  const { spotId, reservingUser } = params;

  // Concurrency-safe atomic transaction via Firestore if available
  if (db) {
    try {
      const spotRef = doc(db, 'leavingSpots', spotId);
      const reservationId = `res-leave-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const resRef = doc(db, 'leavingReservations', reservationId);

      const result = await runTransaction(db, async (transaction) => {
        const spotDoc = await transaction.get(spotRef);
        
        if (!spotDoc.exists()) {
          throw new Error('POSTO_NON_TROVATO');
        }

        const data = spotDoc.data() as LeavingSoonSpot;

        // Check 1: User cannot reserve their own leaving spot
        if (data.userId === reservingUser.uid) {
          throw new Error('NON_PUOI_RISERVARE_IL_TUO_POSTO');
        }

        // Check 2: Concurrency protection — must strictly be in 'leaving_soon' state
        if (data.status !== 'leaving_soon') {
          throw new Error('POSTO_GIA_RISERVATO');
        }

        // Check 3: Must not be expired
        if (new Date(data.expiresAt).getTime() <= Date.now()) {
          throw new Error('POSTO_SCADUTO');
        }

        const nowIso = new Date().toISOString();
        const updatedSpotData: Partial<LeavingSoonSpot> = {
          status: 'reserved',
          reservedByUserId: reservingUser.uid,
          reservedByUserName: reservingUser.displayName || 'Automobilista JANUS',
          reservedByUserPhoto: reservingUser.photoURL,
          reservedAt: nowIso,
          reservationId,
          updatedAt: nowIso,
        };

        const newReservation: LeavingReservation = {
          id: reservationId,
          leavingSpotId: spotId,
          spotTitle: data.title,
          spotAddress: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          departingUserId: data.userId,
          departingUserName: data.userName,
          reservingUserId: reservingUser.uid,
          reservingUserName: reservingUser.displayName || 'Automobilista JANUS',
          reservingUserPhoto: reservingUser.photoURL,
          status: 'confirmed',
          availableAt: data.availableAt,
          expiresAt: data.expiresAt,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        // Atomically update spot and record reservation
        transaction.update(spotRef, updatedSpotData);
        transaction.set(resRef, newReservation);

        return {
          spot: { ...data, ...updatedSpotData } as LeavingSoonSpot,
          reservation: newReservation
        };
      });

      // Synchronize local cache
      const stored = getStoredLeavingSpots();
      const idx = stored.findIndex((s) => s.id === spotId);
      if (idx !== -1) {
        stored[idx] = result.spot;
        saveStoredLeavingSpots(stored);
      }
      const storedRes = getStoredReservations();
      saveStoredReservations([result.reservation, ...storedRes]);

      return { success: true, spot: result.spot, reservation: result.reservation };
    } catch (err: any) {
      console.warn('Firestore transaction error in reserveLeavingSpot:', err);
      if (err.message === 'POSTO_GIA_RISERVATO') {
        return {
          success: false,
          spot: null as any,
          reservation: null as any,
          error: 'Ci dispiace! Questo posto è stato appena riservato da un altro automobilista.'
        };
      }
      if (err.message === 'POSTO_SCADUTO') {
        return {
          success: false,
          spot: null as any,
          reservation: null as any,
          error: 'Il tempo di disponibilità per questo posto è scaduto.'
        };
      }
      if (err.message === 'NON_PUOI_RISERVARE_IL_TUO_POSTO') {
        return {
          success: false,
          spot: null as any,
          reservation: null as any,
          error: 'Non puoi riservare un posto segnalato da te stesso.'
        };
      }
    }
  }

  // Fallback atomic local reservation check
  const spots = getStoredLeavingSpots();
  const target = spots.find((s) => s.id === spotId);

  if (!target) {
    return { success: false, spot: null as any, reservation: null as any, error: 'Posto non trovato.' };
  }
  if (target.userId === reservingUser.uid) {
    return { success: false, spot: null as any, reservation: null as any, error: 'Non puoi riservare il tuo stesso posto.' };
  }
  if (target.status !== 'leaving_soon') {
    return { success: false, spot: null as any, reservation: null as any, error: 'Questo posto è già stato riservato da un altro utente.' };
  }
  if (new Date(target.expiresAt).getTime() <= Date.now()) {
    return { success: false, spot: null as any, reservation: null as any, error: 'La finestra temporale per questo posto è scaduta.' };
  }

  const nowIso = new Date().toISOString();
  const reservationId = `res-leave-${Date.now()}`;
  target.status = 'reserved';
  target.reservedByUserId = reservingUser.uid;
  target.reservedByUserName = reservingUser.displayName || 'Automobilista JANUS';
  target.reservedByUserPhoto = reservingUser.photoURL;
  target.reservedAt = nowIso;
  target.reservationId = reservationId;
  target.updatedAt = nowIso;

  saveStoredLeavingSpots(spots);

  const reservation: LeavingReservation = {
    id: reservationId,
    leavingSpotId: spotId,
    spotTitle: target.title,
    spotAddress: target.address,
    latitude: target.latitude,
    longitude: target.longitude,
    departingUserId: target.userId,
    departingUserName: target.userName,
    reservingUserId: reservingUser.uid,
    reservingUserName: reservingUser.displayName || 'Automobilista JANUS',
    reservingUserPhoto: reservingUser.photoURL,
    status: 'confirmed',
    availableAt: target.availableAt,
    expiresAt: target.expiresAt,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const storedRes = getStoredReservations();
  saveStoredReservations([reservation, ...storedRes]);

  return { success: true, spot: target, reservation };
}

// 🚫 3. Cancel leaving spot (by departing driver)
export async function cancelLeavingSpot(spotId: string, userId: string): Promise<boolean> {
  const spots = getStoredLeavingSpots();
  const idx = spots.findIndex((s) => s.id === spotId);
  if (idx === -1) return false;

  if (spots[idx].userId !== userId) {
    console.warn('Unauthorized attempt to cancel leaving spot');
    return false;
  }

  spots[idx].status = 'cancelled';
  spots[idx].updatedAt = new Date().toISOString();
  saveStoredLeavingSpots(spots);

  if (db) {
    try {
      await updateDoc(doc(db, 'leavingSpots', spotId), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update cancelled status in Firestore:', err);
    }
  }

  return true;
}

// ↩️ 4. Cancel reservation (by reserving driver)
export async function cancelLeavingReservation(spotId: string, reservationId: string, userId: string): Promise<boolean> {
  const spots = getStoredLeavingSpots();
  const idx = spots.findIndex((s) => s.id === spotId);
  if (idx !== -1 && spots[idx].reservedByUserId === userId) {
    // If time is still valid, return spot to 'leaving_soon' so another driver can get it
    const isStillActive = new Date(spots[idx].expiresAt).getTime() > Date.now();
    spots[idx].status = isStillActive ? 'leaving_soon' : 'expired';
    spots[idx].reservedByUserId = undefined;
    spots[idx].reservedByUserName = undefined;
    spots[idx].reservedByUserPhoto = undefined;
    spots[idx].reservedAt = undefined;
    spots[idx].reservationId = undefined;
    spots[idx].updatedAt = new Date().toISOString();
    saveStoredLeavingSpots(spots);

    if (db) {
      try {
        await updateDoc(doc(db, 'leavingSpots', spotId), {
          status: isStillActive ? 'leaving_soon' : 'expired',
          reservedByUserId: null,
          reservedByUserName: null,
          reservedByUserPhoto: null,
          reservedAt: null,
          reservationId: null,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not release spot in Firestore:', err);
      }
    }
  }

  const reservations = getStoredReservations();
  const rIdx = reservations.findIndex((r) => r.id === reservationId && r.reservingUserId === userId);
  if (rIdx !== -1) {
    reservations[rIdx].status = 'cancelled';
    reservations[rIdx].updatedAt = new Date().toISOString();
    saveStoredReservations(reservations);

    if (db) {
      try {
        await updateDoc(doc(db, 'leavingReservations', reservationId), {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not cancel reservation in Firestore:', err);
      }
    }
  }

  return true;
}

// Active user reservation lookup
export function getUserActiveLeavingReservations(userId: string): LeavingReservation[] {
  const all = getStoredReservations();
  return all.filter((r) => r.reservingUserId === userId && r.status === 'confirmed' && new Date(r.expiresAt).getTime() > Date.now());
}
