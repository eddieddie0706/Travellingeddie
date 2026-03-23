import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';
import { createSampleTrip } from './sampleData';

const COLLECTION = 'trips';
const LOCAL_KEY = 'travellingeddie_trips';

// Firestore operations
export async function loadTripsFromFirestore(): Promise<Trip[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const trips = snapshot.docs.map(d => d.data() as Trip);
    if (trips.length === 0) {
      // First visit: seed with sample trip
      const sample = createSampleTrip();
      await saveTripToFirestore(sample);
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
  try {
    await setDoc(doc(db, COLLECTION, trip.id), trip);
  } catch (err) {
    console.warn('Firestore save failed:', err);
  }
}

export async function deleteTripFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (err) {
    console.warn('Firestore delete failed:', err);
  }
}

// localStorage fallback
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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
