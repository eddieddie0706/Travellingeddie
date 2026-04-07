import { useState } from 'react';
import { Wallet, RefreshCw, TrendingUp, Receipt, Copy, Check, X } from 'lucide-react';
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

// ── Bill Modal ────────────────────────────────────────────────────────────────

interface BillItem {
  dayDate: string;
  dayIndex: number;
  title: string;
  category: ActivityCategory;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  splitCount: number;
  perPersonConverted: number;
}

function BillModal({ trip, rates, onClose }: { trip: Trip; rates: ExchangeRates | null; onClose: () => void }) {
  const { locale } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Collect all split items
  const items: BillItem[] = [];
  trip.days.forEach((day, dayIndex) => {
    day.activities.forEach(act => {
      if (!act.expense) return;
      const splitCount = act.expense.splitCount && act.expense.splitCount > 1 ? act.expense.splitCount : 0;
      if (splitCount < 2) return;

      const converted = rates
        ? convertCurrency(act.expense.amount, act.expense.currency, trip.baseCurrency, rates)
        : act.expense.amount;

      items.push({
        dayDate: day.date,
        dayIndex,
        title: act.title,
        category: act.category,
        originalAmount: act.expense.amount,
        originalCurrency: act.expense.currency,
        convertedAmount: converted,
        splitCount,
        perPersonConverted: converted / splitCount,
      });
    });
  });

  // Group by splitCount for summary
  const byCount = new Map<number, number>();
  items.forEach(item => {
    byCount.set(item.splitCount, (byCount.get(item.splitCount) || 0) + item.perPersonConverted);
  });

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCopy = async () => {
    const lines: string[] = [];
    lines.push(`📋 ${trip.name} — ${locale === 'zh' ? '账单明细' : 'Bill'}`);
    lines.push(`${trip.destination}  ${trip.startDate} ~ ${trip.endDate}`);
    lines.push('');

    items.forEach(item => {
      const sameAsCurrency = item.originalCurrency === trip.baseCurrency;
      const amountStr = sameAsCurrency
        ? `${trip.baseCurrency} ${fmt(item.originalAmount)}`
        : `${item.originalCurrency} ${fmt(item.originalAmount)} (≈ ${trip.baseCurrency} ${fmt(item.convertedAmount)})`;
      lines.push(`• ${item.title}`);
      lines.push(`  ${amountStr} ÷ ${item.splitCount} = ${trip.baseCurrency} ${fmt(item.perPersonConverted)}/人`);
    });

    lines.push('');
    byCount.forEach((total, count) => {
      lines.push(`${locale === 'zh' ? '每人合计' : 'Per person total'} (${count}人均摊项): ${trip.baseCurrency} ${fmt(total)}`);
    });

    if (rates) {
      lines.push('');
      lines.push(locale === 'zh' ? `（已按当前汇率换算为 ${trip.baseCurrency}）` : `(Converted to ${trip.baseCurrency} at current rates)`);
    }

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <h3 className="font-semibold">{locale === 'zh' ? '账单明细' : 'Bill'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container">
            <X size={20} />
          </button>
        </div>

        {/* Trip info */}
        <div className="px-4 py-3 bg-surface-dim border-b border-border text-sm text-on-surface-secondary">
          <span className="font-medium text-on-surface">{trip.name}</span>
          <span className="mx-2">·</span>
          {trip.startDate} ~ {trip.endDate}
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-center py-8 text-on-surface-secondary text-sm">
              {locale === 'zh' ? '暂无 AA 均摊项目' : 'No split items found'}
            </p>
          ) : (
            items.map((item, i) => {
              const sameAsCurrency = item.originalCurrency === trip.baseCurrency;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-dim">
                  <div className="mt-0.5">
                    <CategoryIcon category={item.category} size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.title}</div>
                    <div className="text-xs text-on-surface-secondary mt-0.5">
                      Day {item.dayIndex + 1} · {item.dayDate}
                    </div>
                    <div className="text-xs text-on-surface-secondary mt-1">
                      {!sameAsCurrency && (
                        <span>{item.originalCurrency} {fmt(item.originalAmount)} ≈ </span>
                      )}
                      <span>{trip.baseCurrency} {fmt(item.convertedAmount)}</span>
                      <span className="mx-1">÷ {item.splitCount}人</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-primary">
                      {trip.baseCurrency} {fmt(item.perPersonConverted)}
                    </div>
                    <div className="text-xs text-on-surface-secondary">/人</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-border px-4 py-3 space-y-1">
            {Array.from(byCount.entries()).map(([count, total]) => (
              <div key={count} className="flex justify-between items-center text-sm">
                <span className="text-on-surface-secondary">
                  {locale === 'zh' ? `每人合计（${count}人均摊项）` : `Per person (${count}-way splits)`}
                </span>
                <span className="font-bold text-primary text-base">
                  {trip.baseCurrency} {fmt(total)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Copy button */}
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={handleCopy}
            disabled={items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied
              ? (locale === 'zh' ? '已复制！' : 'Copied!')
              : (locale === 'zh' ? '复制账单' : 'Copy Bill')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ExpenseSummary({ trip, rates, ratesLoading, onRefreshRates }: Props) {
  const { t, locale } = useLanguage();
  const [showBill, setShowBill] = useState(false);

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

      {/* Generate Bill */}
      {splitItemCount > 0 && (
        <button
          onClick={() => setShowBill(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-border rounded-xl text-sm font-medium text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          <Receipt size={16} />
          {locale === 'zh' ? '出账单（向他人收款）' : 'Generate Bill'}
        </button>
      )}

      {showBill && (
        <BillModal trip={trip} rates={rates} onClose={() => setShowBill(false)} />
      )}
    </div>
  );
}
