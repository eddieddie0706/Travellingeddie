import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';
import { createSampleTrip } from './sampleData';

const COLLECTION = 'trips';
const LOCAL_KEY = 'travellingeddie_trips';
const SAMPLE_VERSION_KEY = 'travellingeddie_sample_version';
const CURRENT_SAMPLE_VERSION = 2; // Bump this to reset sample data

// Firestore operations
export async function loadTripsFromFirestore(): Promise<Trip[]> {
  try {
    const storedVersion = parseInt(localStorage.getItem(SAMPLE_VERSION_KEY) || '0');
    const needsReset = storedVersion < CURRENT_SAMPLE_VERSION;

    if (needsReset) {
      // Delete all existing trips and recreate sample
      const snapshot = await getDocs(collection(db, COLLECTION));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, COLLECTION, d.id));
      }
      localStorage.removeItem(LOCAL_KEY);

      const sample = createSampleTrip();
      await saveTripToFirestore(sample);
      localStorage.setItem(SAMPLE_VERSION_KEY, String(CURRENT_SAMPLE_VERSION));
      return [sample];
    }

    const snapshot = await getDocs(collection(db, COLLECTION));
    const trips = snapshot.docs.map(d => d.data() as Trip);
    if (trips.length === 0) {
      // First visit: seed with sample trip
      const sample = createSampleTrip();
      await saveTripToFirestore(sample);
      localStorage.setItem(SAMPLE_VERSION_KEY, String(CURRENT_SAMPLE_VERSION));
      return [sample];
    }
    // Sort by updatedAt descending
    trips.sort((a, b) => b.updatedAt - a.updatedAt);
    return trips;
  } catch (err) {
    console.warn('Firestore load failed, falling back to localStorage:', err);
    return loadTripsLocal();
  }
}

export async function saveTripToFirestore(trip: Trip): Promise<void> {
  saveTripsLocal(trip);
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

// localStorage - always used as persistent backup
function loadTripsLocal(): Trip[] {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const trips = JSON.parse(data) as Trip[];
      if (trips.length > 0) return trips;
    }
    const sample = [createSampleTrip()];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(sample));
    return sample;
  } catch {
    return [];
  }
}

function saveTripsLocal(trip: Trip): void {
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
