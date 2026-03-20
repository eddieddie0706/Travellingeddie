import { useMemo } from 'react';
import { Wallet, RefreshCw, TrendingUp } from 'lucide-react';
import type { Trip, ExchangeRates, ActivityCategory } from '../types';
import { CATEGORY_CONFIG } from '../types';
import { convertCurrency } from '../lib/currency';
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
  const { grandTotal, byCategory, byCurrency } = useMemo(() => {
    let grandTotal = 0;
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

        const existing = catMap.get(act.category) || { total: 0, count: 0 };
        catMap.set(act.category, { total: existing.total + converted, count: existing.count + 1 });
      }
    }

    const byCategory: CategoryTotal[] = Array.from(catMap.entries())
      .map(([category, { total, count }]) => ({ category, total, count }))
      .sort((a, b) => b.total - a.total);

    const byCurrency = Array.from(curMap.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => b.total - a.total);

    return { grandTotal, byCategory, byCurrency };
  }, [trip, rates]);

  return (
    <div className="space-y-4">
      {/* Grand Total */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h3 className="font-semibold">费用总计</h3>
          </div>
          <button
            onClick={onRefreshRates}
            disabled={ratesLoading}
            className="flex items-center gap-1 text-xs text-on-surface-secondary hover:text-primary transition-colors"
          >
            <RefreshCw size={12} className={ratesLoading ? 'animate-spin' : ''} />
            刷新汇率
          </button>
        </div>
        <div className="text-2xl font-bold text-primary">
          {trip.baseCurrency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {rates && rates.lastUpdated > 0 && (
          <div className="text-xs text-on-surface-secondary mt-1">
            汇率更新于 {new Date(rates.lastUpdated).toLocaleString('zh-CN')}
          </div>
        )}
      </div>

      {/* By Currency */}
      {byCurrency.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-on-surface-secondary" />
            <h3 className="font-semibold text-sm">按货币</h3>
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
          <h3 className="font-semibold text-sm mb-3">按分类</h3>
          <div className="space-y-2.5">
            {byCategory.map(({ category, total, count }) => {
              const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={category} size={14} />
                      <span>{CATEGORY_CONFIG[category].label}</span>
                      <span className="text-xs text-on-surface-secondary">({count}笔)</span>
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
