import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';
import { createSampleTrip } from './sampleData';

const COLLECTION = 'trips';

// Firestore is the sole source of truth — no localStorage
export async function loadTripsFromFirestore(): Promise<Trip[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));

  if (snapshot.docs.length > 0) {
    const trips = snapshot.docs.map(d => d.data() as Trip);
    trips.sort((a, b) => b.updatedAt - a.updatedAt);
    return trips;
  }

  // Firestore is empty — create one sample trip and upload it
  const sample = createSampleTrip();
  await setDoc(doc(db, COLLECTION, sample.id), sample);
  return [sample];
}

export async function clearFirestore(): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, COLLECTION, d.id));
  }
}

export async function saveTripToFirestore(trip: Trip): Promise<void> {
  await setDoc(doc(db, COLLECTION, trip.id), trip);
}

export async function deleteTripFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
