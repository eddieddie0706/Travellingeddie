import type { ExchangeRates } from '../types';

const CACHE_KEY = 'travellingeddie_rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Fallback rates (approximate, updated periodically)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, CNY: 7.24, EUR: 0.92, GBP: 0.79, JPY: 149.5,
  KRW: 1320, THB: 35.5, SGD: 1.34, AUD: 1.53, CAD: 1.36,
  HKD: 7.82, TWD: 31.5, MYR: 4.72, IDR: 15700, VND: 24500,
  PHP: 56.2, INR: 83.1, CHF: 0.88, NZD: 1.64, AED: 3.67,
};

export async function fetchExchangeRates(base: string = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates();
  if (cached && cached.base === base && Date.now() - cached.lastUpdated < CACHE_DURATION) {
    return cached;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await res.json();

    if (data.result === 'success') {
      const rates: ExchangeRates = {
        base,
        rates: data.rates,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
      return rates;
    }
    throw new Error('API error');
  } catch {
    // Fallback to cached or hardcoded rates
    if (cached) return cached;
    return { base: 'USD', rates: FALLBACK_RATES, lastUpdated: 0 };
  }
}

function getCachedRates(): ExchangeRates | null {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates
): number {
  if (from === to) return amount;

  const { base, rates: rateMap } = rates;

  // Convert from source to base, then base to target
  let inBase: number;
  if (from === base) {
    inBase = amount;
  } else {
    inBase = amount / (rateMap[from] || 1);
  }

  if (to === base) return Math.round(inBase * 100) / 100;
  return Math.round(inBase * (rateMap[to] || 1) * 100) / 100;
}
