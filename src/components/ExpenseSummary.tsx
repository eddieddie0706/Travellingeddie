import { Wallet, RefreshCw, TrendingUp } from 'lucide-react';
import type { Trip, ExchangeRates, ActivityCategory } from '../types';
import { CATEGORY_CONFIG } from '../types';
import { convertCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryIcon from './CategoryIcon';

interface Props {
  trip: Trip;
  rates: ExchangeRates | null;
  ratesLoading: boolean;
  onRefreshRates: () => void;
}

interface CategoryTotal {
  category: ActivityCategory;
  total: number;
  count: number;
}

export default function ExpenseSummary({ trip, rates, ratesLoading, onRefreshRates }: Props) {
  const { t, locale } = useLanguage();

  // Compute all expense totals directly (no useMemo to avoid stale cache)
  let grandTotal = 0;
  let myTotal = 0;
  let splitItemCount = 0;
  const catMap = new Map<ActivityCategory, { total: number; count: number }>();
  const curMap = new Map<string, number>();

  for (const day of trip.days) {
    for (const act of day.activities) {
      if (!act.expense) continue;

      // Original currency totals
      curMap.set(act.expense.currency, (curMap.get(act.expense.currency) || 0) + act.expense.amount);

      // Convert to base currency
      const converted = rates
        ? convertCurrency(act.expense.amount, act.expense.currency, trip.baseCurrency, rates)
        : act.expense.amount;

      grandTotal += converted;

      // Calculate per-person share
      const splitCount = act.expense.splitCount && act.expense.splitCount > 1 ? act.expense.splitCount : 1;
      const myShare = converted / splitCount;
      myTotal += myShare;
      if (splitCount > 1) splitItemCount++;

      const existing = catMap.get(act.category) || { total: 0, count: 0 };
      catMap.set(act.category, { total: existing.total + myShare, count: existing.count + 1 });
    }
  }

  const byCategory: CategoryTotal[] = Array.from(catMap.entries())
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);

  const byCurrency = Array.from(curMap.entries())
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => b.total - a.total);

  const splitSavings = grandTotal - myTotal;

  return (
    <div className="space-y-4">
      {/* Grand Total */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h3 className="font-semibold">{t('totalExpenses')}</h3>
          </div>
          <button
            onClick={onRefreshRates}
            disabled={ratesLoading}
            className="flex items-center gap-1 text-xs text-on-surface-secondary hover:text-primary transition-colors"
          >
            <RefreshCw size={12} className={ratesLoading ? 'animate-spin' : ''} />
            {t('refreshRates')}
          </button>
        </div>
        {splitItemCount > 0 ? (
          <div>
            <div className="text-2xl font-bold text-primary">
              {trip.baseCurrency} {myTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-on-surface-secondary mt-1">
              {t('myPayment', { count: splitItemCount })}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-secondary">
              <span>{t('totalSpending')} {trip.baseCurrency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-green-600">{t('aaSavings')} {trip.baseCurrency} {splitSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        ) : (
          <div className="text-2xl font-bold text-primary">
            {trip.baseCurrency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        {rates && rates.lastUpdated > 0 && (
          <div className="text-xs text-on-surface-secondary mt-1">
            {t('ratesUpdatedAt')} {new Date(rates.lastUpdated).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
          </div>
        )}
      </div>

      {/* By Currency */}
      {byCurrency.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-on-surface-secondary" />
            <h3 className="font-semibold text-sm">{t('byCurrency')}</h3>
          </div>
          <div className="space-y-2">
            {byCurrency.map(({ currency, total }) => (
              <div key={currency} className="flex items-center justify-between text-sm">
                <span className="font-medium">{currency}</span>
                <span>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <h3 className="font-semibold text-sm mb-3">{t('byCategory')}</h3>
          <div className="space-y-2.5">
            {byCategory.map(({ category, total, count }) => {
              const pct = myTotal > 0 ? (total / myTotal) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={category} size={14} />
                      <span>{t(`cat.${category}` as any)}</span>
                      <span className="text-xs text-on-surface-secondary">({t('countItems', { count })})</span>
                    </div>
                    <span className="font-medium">
                      {trip.baseCurrency} {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_CONFIG[category].color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
