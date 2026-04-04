import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';

const COLLECTION = 'trips';

// Firestore is the sole source of truth — no localStorage
export async function loadTripsFromFirestore(): Promise<Trip[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const trips = snapshot.docs.map(d => d.data() as Trip);
  trips.sort((a, b) => b.updatedAt - a.updatedAt);
  return trips;
}

export async function clearFirestore(): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, COLLECTION, d.id));
  }
}

// Firestore SDK throws on undefined values — strip them before writing
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function saveTripToFirestore(trip: Trip): Promise<void> {
  await setDoc(doc(db, COLLECTION, trip.id), stripUndefined(trip));
}

export async function deleteTripFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
