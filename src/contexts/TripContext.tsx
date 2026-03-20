import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Trip, ExchangeRates } from '../types';
import { loadTrips, saveTrips, generateId } from '../lib/storage';
import { fetchExchangeRates } from '../lib/currency';

interface TripContextValue {
  trips: Trip[];
  rates: ExchangeRates | null;
  ratesLoading: boolean;
  addTrip: (trip: Omit<Trip, 'id' | 'days' | 'createdAt' | 'updatedAt'>) => Trip;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
  refreshRates: (base?: string) => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips());
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

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

  const addTrip = useCallback((data: Omit<Trip, 'id' | 'days' | 'createdAt' | 'updatedAt'>) => {
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

    const trip: Trip = {
      ...data,
      id: generateId(),
      days,
      createdAt: now,
      updatedAt: now,
    };

    setTrips(prev => [trip, ...prev]);
    return trip;
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    setTrips(prev => prev.map(t => t.id === trip.id ? { ...trip, updatedAt: Date.now() } : t));
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTrip = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  return (
    <TripContext.Provider value={{ trips, rates, ratesLoading, addTrip, updateTrip, deleteTrip, getTrip, refreshRates }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used within TripProvider');
  return ctx;
}
