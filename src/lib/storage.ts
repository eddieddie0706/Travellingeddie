import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';
import { createSampleTrip } from './sampleData';

const COLLECTION = 'trips';
const LOCAL_KEY = 'travellingeddie_trips';
const SAMPLE_VERSION_KEY = 'travellingeddie_sample_version';
const CURRENT_SAMPLE_VERSION = 2; // Bump this to reset sample data

// Load trips: localStorage is primary, Firestore syncs in background
export async function loadTripsFromFirestore(): Promise<Trip[]> {
  const storedVersion = parseInt(localStorage.getItem(SAMPLE_VERSION_KEY) || '0');
  const needsReset = storedVersion < CURRENT_SAMPLE_VERSION;

  if (needsReset) {
    // Clear old data
    localStorage.removeItem(LOCAL_KEY);

    const sample = createSampleTrip();
    saveTripsLocalFull([sample]);
    localStorage.setItem(SAMPLE_VERSION_KEY, String(CURRENT_SAMPLE_VERSION));

    // Clear Firestore then write new sample (background, awaited in sequence)
    clearFirestore().then(() => {
      setDoc(doc(db, COLLECTION, sample.id), sample).catch(() => {});
    });

    return [sample];
  }

  // Load from localStorage first (instant, always up-to-date)
  const localTrips = loadTripsLocal();

  // Sync localStorage → Firestore in background
  syncToFirestore(localTrips);

  return localTrips;
}

// Background sync: push localStorage (source of truth) to Firestore
async function syncToFirestore(localTrips: Trip[]): Promise<void> {
  try {
    // Get current Firestore docs
    const snapshot = await getDocs(collection(db, COLLECTION));
    const firestoreIds = new Set(snapshot.docs.map(d => d.id));
    const localIds = new Set(localTrips.map(t => t.id));

    // Delete Firestore docs that don't exist locally
    for (const d of snapshot.docs) {
      if (!localIds.has(d.id)) {
        await deleteDoc(doc(db, COLLECTION, d.id));
      }
    }

    // Push all local trips to Firestore (upsert)
    for (const trip of localTrips) {
      const firestoreTrip = firestoreIds.has(trip.id)
        ? snapshot.docs.find(d => d.id === trip.id)?.data() as Trip | undefined
        : undefined;

      // Only write if local is newer or doesn't exist in Firestore
      if (!firestoreTrip || trip.updatedAt > (firestoreTrip.updatedAt || 0)) {
        await setDoc(doc(db, COLLECTION, trip.id), trip);
      }
    }

    console.log('Firestore sync complete');
  } catch (err) {
    console.warn('Firestore background sync failed:', err);
  }
}

async function clearFirestore(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, COLLECTION, d.id));
    }
  } catch {
    // ignore
  }
}

export async function saveTripToFirestore(trip: Trip): Promise<void> {
  saveTripsLocalSingle(trip);
  try {
    await setDoc(doc(db, COLLECTION, trip.id), trip);
  } catch (err) {
    console.warn('Firestore save failed, data saved to localStorage:', err);
  }
}

export async function deleteTripFromFirestore(id: string): Promise<void> {
  deleteTripsLocal(id);
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (err) {
    console.warn('Firestore delete failed:', err);
  }
}

// localStorage operations (primary storage)
function loadTripsLocal(): Trip[] {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const trips = JSON.parse(data) as Trip[];
      if (trips.length > 0) {
        trips.sort((a, b) => b.updatedAt - a.updatedAt);
        return trips;
      }
    }
    // No local data → create sample
    const sample = [createSampleTrip()];
    saveTripsLocalFull(sample);
    localStorage.setItem(SAMPLE_VERSION_KEY, String(CURRENT_SAMPLE_VERSION));
    return sample;
  } catch {
    return [];
  }
}

function saveTripsLocalFull(trips: Trip[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trips));
  } catch {
    // localStorage not available
  }
}

function saveTripsLocalSingle(trip: Trip): void {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    const trips: Trip[] = data ? JSON.parse(data) : [];
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = trip;
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trips));
  } catch {
    // localStorage not available
  }
}

function deleteTripsLocal(id: string): void {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const trips: Trip[] = JSON.parse(data);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(trips.filter(t => t.id !== id)));
    }
  } catch {
    // localStorage not available
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
