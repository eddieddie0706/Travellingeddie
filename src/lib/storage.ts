import type { Trip } from '../types';
import { createSampleTrip } from './sampleData';

const STORAGE_KEY = 'travellingeddie_trips';

// Local storage fallback when Firebase is not configured
export function loadTrips(): Trip[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const trips = JSON.parse(data) as Trip[];
      if (trips.length > 0) return trips;
    }
    // First visit: seed with sample trip
    const sample = [createSampleTrip()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  } catch {
    return [];
  }
}

export function saveTrips(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
