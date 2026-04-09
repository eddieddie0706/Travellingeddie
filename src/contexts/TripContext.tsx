import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Trip, ExchangeRates } from '../types';
import { loadTripsFromFirestore, saveTripToFirestore, deleteTripFromFirestore, generateId } from '../lib/storage';
import { fetchExchangeRates } from '../lib/currency';

interface TripContextValue {
  trips: Trip[];
  loading: boolean;
  rates: ExchangeRates | null;
  ratesLoading: boolean;
  addTrip: (trip: Omit<Trip, 'id' | 'days' | 'createdAt' | 'updatedAt'> & { id?: string }) => Trip;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
  refreshRates: (base?: string) => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    loadTripsFromFirestore().then(data => {
      setTrips(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    refreshRates();
  }, []);

  const refreshRates = useCallback(async (base: string = 'USD') => {
    setRatesLoading(true);
    try {
      const r = await fetchExchangeRates(base);
      setRates(r);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  const addTrip = useCallback((data: Omit<Trip, 'id' | 'days' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = Date.now();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const days = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        id: generateId(),
        date: date.toISOString().slice(0, 10),
        activities: [],
      };
    });

    const { id: customId, ...rest } = data;
    const trip: Trip = {
      ...rest,
      id: customId || generateId(),
      days,
      createdAt: now,
      updatedAt: now,
    };

    setTrips(prev => [trip, ...prev]);
    saveTripToFirestore(trip).catch(() => reload());
    return trip;
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    const updated = { ...trip, updatedAt: Date.now() };
    setTrips(prev => prev.map(t => t.id === trip.id ? updated : t));
    saveTripToFirestore(updated).catch(() => reload());
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    deleteTripFromFirestore(id).catch(() => reload());
  }, []);

  const getTrip = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  return (
    <TripContext.Provider value={{ trips, loading, rates, ratesLoading, addTrip, updateTrip, deleteTrip, getTrip, refreshRates }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used within TripProvider');
  return ctx;
}
