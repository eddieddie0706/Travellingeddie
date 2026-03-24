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
    // Clear Firestore in background
    clearFirestore();

    const sample = createSampleTrip();
    saveTripsLocalFull([sample]);
    localStorage.setItem(SAMPLE_VERSION_KEY, String(CURRENT_SAMPLE_VERSION));
    // Also save to Firestore in background
    setDoc(doc(db, COLLECTION, sample.id), sample).catch(() => {});
    return [sample];
  }

  // Load from localStorage first (instant, always up-to-date)
  const localTrips = loadTripsLocal();

  // Sync from Firestore in background (for cross-device sync)
  syncFromFirestore(localTrips);

  return localTrips;
}

// Background sync: merge Firestore data with local data
async function syncFromFirestore(localTrips: Trip[]): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const firestoreTrips = snapshot.docs.map(d => d.data() as Trip);

    if (firestoreTrips.length === 0 && localTrips.length > 0) {
      // Firestore empty but we have local data → push local to Firestore
      for (const trip of localTrips) {
        setDoc(doc(db, COLLECTION, trip.id), trip).catch(() => {});
      }
    }
    // If both have data, localStorage is the source of truth
    // (Firestore sync for cross-device can be added later)
  } catch {
    // Firestore unavailable, no problem - localStorage has our data
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
