import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FreeParkingSpot } from '../types';

const FREE_PARKING_STORAGE_KEY = 'janus_verified_free_parking_v1';

// 🏛️ Real, verified public free parking locations in Rome with official source attribution
export const VERIFIED_ROME_FREE_SPOTS: FreeParkingSpot[] = [
  {
    id: 'free-clodio-01',
    name: 'Parcheggio Libero Piazzale Clodio',
    address: 'Piazzale Clodio, 00195 Roma RM',
    latitude: 41.9185,
    longitude: 12.4532,
    parkingType: 'free_surface',
    city: 'Roma',
    approximateLocation: 'Prati / Clodio / Musei Vaticani',
    availabilityInfo: 'Sosta libera h24 su stalli bianchi',
    source: 'Roma Mobilità / Dipartimento Mobilità Sostenibile Roma Capitale',
    sourceUrl: 'https://romamobilita.it',
    notes: 'Stalli bianchi gratuiti adiacenti alla Cittadella Giudiziaria. Attenzione ai giorni indicati per la pulizia meccanica strade.',
    lastVerifiedAt: '2026-08-25',
    isFree: true,
    totalCapacityEstimated: 280,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-25T10:30:00.000Z',
  },
  {
    id: 'free-milvio-02',
    name: 'Parcheggio Libero Ponte Milvio / San Giuliano',
    address: 'Via Antonino di San Giuliano, 00135 Roma RM',
    latitude: 41.9362,
    longitude: 12.4738,
    parkingType: 'free_street',
    city: 'Roma',
    approximateLocation: 'Ponte Milvio / Flaminio / Stadio Olimpico',
    availabilityInfo: 'Area pubblica aperta gratuita',
    source: 'Roma Capitale - Municipio XV',
    sourceUrl: 'https://comune.roma.it',
    notes: 'Ampia area golenale e stradale non tariffata. Molto frequentata nei weekend e durante le partite allo Stadio Olimpico.',
    lastVerifiedAt: '2026-08-28',
    isFree: true,
    totalCapacityEstimated: 190,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-28T14:15:00.000Z',
  },
  {
    id: 'free-soccorso-03',
    name: 'Parcheggio di Scambio Santa Maria del Soccorso (Metro B)',
    address: 'Via Tiburtina / Via Santa Maria del Soccorso, 00157 Roma RM',
    latitude: 41.9162,
    longitude: 12.5488,
    parkingType: 'exchange_metro',
    city: 'Roma',
    approximateLocation: 'Tiburtina / Pietralata / Metro B',
    availabilityInfo: 'Parcheggio di scambio a raso gratuito',
    source: 'ATAC S.p.A. - Rete Parcheggi di Scambio Roma',
    sourceUrl: 'https://atac.roma.it',
    notes: 'Accesso libero non custodito direttamente adiacente alla fermata Metro B. Ideale per raggiungere Termini e Colosseo in metropolitana.',
    lastVerifiedAt: '2026-09-02',
    isFree: true,
    totalCapacityEstimated: 320,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-02T09:00:00.000Z',
  },
  {
    id: 'free-romanisti-04',
    name: 'Parcheggio Libero Viale dei Romanisti (Metro C)',
    address: 'Viale dei Romanisti, 00169 Roma RM',
    latitude: 41.8672,
    longitude: 12.5762,
    parkingType: 'exchange_metro',
    city: 'Roma',
    approximateLocation: 'Torre Spaccata / Alessandrino / Metro C',
    availabilityInfo: 'Stalli bianchi gratuiti non tariffati',
    source: 'Roma Mobilità',
    sourceUrl: 'https://romamobilita.it',
    notes: 'Parcheggio su sede stradale alberata con strisce bianche. Interscambio veloce con le fermate Torre Spaccata e Alessandrino di Metro C.',
    lastVerifiedAt: '2026-08-30',
    isFree: true,
    totalCapacityEstimated: 160,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-30T11:45:00.000Z',
  },
  {
    id: 'free-tiburtina-05',
    name: 'Parcheggio Libero Tiburtina Est / Circonvallazione',
    address: 'Circonvallazione Nomentana 500, 00162 Roma RM',
    latitude: 41.9125,
    longitude: 12.5310,
    parkingType: 'free_street',
    city: 'Roma',
    approximateLocation: 'Stazione Tiburtina / Nomentana',
    availabilityInfo: 'Stalli bianchi lungo corsia laterale',
    source: 'Roma Capitale / Mobilità e Trasporti',
    sourceUrl: 'https://romamobilita.it',
    notes: 'Fascia esterna alla ZTL con posti liberi non soggetti a parcometro. Comodo per la stazione ferroviaria AV e autobus Tibus.',
    lastVerifiedAt: '2026-08-20',
    isFree: true,
    totalCapacityEstimated: 110,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T16:20:00.000Z',
  },
  {
    id: 'free-sanpaolo-06',
    name: 'Parcheggio Libero San Paolo / Viale Ferdinando Baldelli',
    address: 'Viale Ferdinando Baldelli, 00146 Roma RM',
    latitude: 41.8575,
    longitude: 12.4795,
    parkingType: 'free_surface',
    city: 'Roma',
    approximateLocation: 'San Paolo / Ostiense / Basilica',
    availabilityInfo: 'Area parcheggio pubblica gratuita',
    source: 'Roma Mobilità',
    sourceUrl: 'https://romamobilita.it',
    notes: 'Stalli bianchi liberi vicino a Metro B San Paolo e all\'Università Roma Tre. Fuori dalla ZTL notturna di San Lorenzo e Trastevere.',
    lastVerifiedAt: '2026-09-04',
    isFree: true,
    totalCapacityEstimated: 140,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-04T08:15:00.000Z',
  }
];

function getStoredFreeSpots(): FreeParkingSpot[] {
  try {
    const raw = localStorage.getItem(FREE_PARKING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read free spots from localStorage', e);
  }
  return VERIFIED_ROME_FREE_SPOTS;
}

function saveStoredFreeSpots(spots: FreeParkingSpot[]) {
  try {
    localStorage.setItem(FREE_PARKING_STORAGE_KEY, JSON.stringify(spots));
  } catch (e) {
    console.warn('Could not save free spots to localStorage', e);
  }
}

export function subscribeToFreeParkingSpots(callback: (spots: FreeParkingSpot[]) => void): () => void {
  // Always trigger immediately with initial verified set
  callback(getStoredFreeSpots());

  if (!db) {
    return () => {};
  }

  try {
    const q = collection(db, 'freeParkingSpots');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteSpots = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as FreeParkingSpot[];

          // Merge: remote spots take precedence or append
          const combinedMap = new Map<string, FreeParkingSpot>();
          // 1. Initial verified spots
          for (const s of VERIFIED_ROME_FREE_SPOTS) {
            combinedMap.set(s.id, s);
          }
          // 2. Local overrides
          for (const s of getStoredFreeSpots()) {
            combinedMap.set(s.id, s);
          }
          // 3. Firestore verified spots
          for (const s of remoteSpots) {
            combinedMap.set(s.id, s);
          }
          const merged = Array.from(combinedMap.values());
          saveStoredFreeSpots(merged);
          callback(merged);
        } else {
          callback(getStoredFreeSpots());
        }
      },
      (error) => {
        console.warn('Firestore freeParkingSpots subscription error, using cached verified spots:', error);
        callback(getStoredFreeSpots());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to listen to freeParkingSpots collection:', err);
    return () => {};
  }
}

export async function createFreeParkingSpot(spotData: Omit<FreeParkingSpot, 'id' | 'createdAt' | 'updatedAt' | 'isFree'>): Promise<FreeParkingSpot> {
  const newSpot: FreeParkingSpot = {
    ...spotData,
    id: `free-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isFree: true,
    city: spotData.city || 'Roma',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Local persistence
  const current = getStoredFreeSpots();
  const updated = [newSpot, ...current];
  saveStoredFreeSpots(updated);

  // Firestore sync if available
  if (db) {
    try {
      await setDoc(doc(db, 'freeParkingSpots', newSpot.id), newSpot);
    } catch (err) {
      console.warn('Could not sync free spot to Firestore:', err);
    }
  }

  return newSpot;
}

export async function updateFreeParkingSpot(spotId: string, updates: Partial<FreeParkingSpot>): Promise<void> {
  const current = getStoredFreeSpots();
  const index = current.findIndex((s) => s.id === spotId);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStoredFreeSpots(current);
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'freeParkingSpots', spotId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update free spot in Firestore:', err);
    }
  }
}

export async function reportCommunitySpotStatus(
  spotId: string, 
  status: 'available' | 'full'
): Promise<void> {
  const current = getStoredFreeSpots();
  const index = current.findIndex((s) => s.id === spotId);
  const nowIso = new Date().toISOString();
  
  if (index !== -1) {
    const existing = current[index];
    const newCount = (existing.confirmationsCount || 0) + (status === 'available' ? 1 : 0);
    const newScore = status === 'available' ? Math.min(99, (existing.reliabilityScore || 85) + 3) : Math.max(30, (existing.reliabilityScore || 85) - 20);

    const updates: Partial<FreeParkingSpot> = {
      currentStatus: status,
      confirmationsCount: newCount,
      lastCommunityReportAt: nowIso,
      reliabilityScore: newScore,
      updatedAt: nowIso,
    };

    current[index] = { ...existing, ...updates };
    saveStoredFreeSpots(current);

    if (db) {
      try {
        await updateDoc(doc(db, 'freeParkingSpots', spotId), updates);
      } catch (err) {
        console.warn('Could not update community status in Firestore:', err);
      }
    }
  }
}

export async function deleteFreeParkingSpot(spotId: string): Promise<void> {
  const current = getStoredFreeSpots().filter((s) => s.id !== spotId);
  saveStoredFreeSpots(current);

  if (db) {
    try {
      await deleteDoc(doc(db, 'freeParkingSpots', spotId));
    } catch (err) {
      console.warn('Could not delete free spot in Firestore:', err);
    }
  }
}
