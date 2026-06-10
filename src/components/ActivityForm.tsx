import { useState } from 'react';
import { X } from 'lucide-react';
import type { Activity, ActivityCategory, Expense } from '../types';
import { CATEGORY_CONFIG, CURRENCIES } from '../types';
import { generateId } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryIcon from './CategoryIcon';

interface Props {
  activity?: Activity;
  defaultCurrency: string;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}

export default function ActivityForm({ activity, defaultCurrency, onSave, onClose }: Props) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(activity?.title || '');
  const [category, setCategory] = useState<ActivityCategory>(activity?.category || 'sightseeing');
  const [startTime, setStartTime] = useState(activity?.startTime || '');
  const [endTime, setEndTime] = useState(activity?.endTime || '');
  const [location, setLocation] = useState(activity?.location || '');
  const [notes, setNotes] = useState(activity?.notes || '');
  const [hasExpense, setHasExpense] = useState(!!activity?.expense);
  const [amount, setAmount] = useState(activity?.expense?.amount?.toString() || '');
  const [currency, setCurrency] = useState(activity?.expense?.currency || defaultCurrency);
  const [isSplit, setIsSplit] = useState((activity?.expense?.splitCount ?? 0) > 1);
  const [splitCount, setSplitCount] = useState(activity?.expense?.splitCount?.toString() || '2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let expense: Expense | undefined;
    if (hasExpense && amount) {
      expense = {
        amount: parseFloat(amount),
        currency,
        ...(isSplit && parseInt(splitCount) > 1 ? { splitCount: parseInt(splitCount) } : {}),
      };
    }

    onSave({
      id: activity?.id || generateId(),
      title: title.trim(),
      category,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      expense,
      order: activity?.order ?? 0,
    });
  };

  const categories = Object.entries(CATEGORY_CONFIG) as [ActivityCategory, typeof CATEGORY_CONFIG[ActivityCategory]][];
  const inputCls = 'w-full px-3 py-2.5 bg-surface-dim border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors';
  const labelCls = 'block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-lift)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-display text-base">{activity ? t('editActivity') : t('addActivity')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className={labelCls}>{t('activityName')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder={t('activityNamePlaceholder')} className={inputCls} autoFocus />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>{t('category')}</label>
            <div className="grid grid-cols-5 gap-1.5">
              {categories.map(([key]) => (
                <button key={key} type="button" onClick={() => setCategory(key)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs transition-all ${
                    category === key
                      ? 'border-primary bg-primary/6 text-on-surface font-medium'
                      : 'border-transparent hover:bg-surface-container text-on-surface-secondary'
                  }`}
                >
                  <CategoryIcon category={key} size={16} />
                  <span className="truncate w-full text-center leading-tight">{t(`cat.${key}` as any)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('startTime')}</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('endTime')}</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>{t('location')}</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')} className={inputCls} />
          </div>

          {/* Expense toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className={`w-10 h-5.5 rounded-full relative transition-colors ${hasExpense ? 'bg-primary' : 'bg-surface-container'}`}
              onClick={() => setHasExpense(v => !v)}>
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${hasExpense ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm font-medium">{t('addExpense')}</span>
          </label>

          {/* Expense fields */}
          {hasExpense && (
            <div className="bg-surface-dim rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <div>
                  <label className={labelCls}>{t('amount')}</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" step="0.01" min="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('currency')}</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className={`w-10 h-5.5 rounded-full relative transition-colors ${isSplit ? 'bg-primary' : 'bg-surface-container'}`}
                  onClick={() => setIsSplit(v => !v)}>
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${isSplit ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium">{t('splitBill')}</span>
              </label>

              {isSplit && (
                <div className="flex items-center gap-3">
                  <input type="number" value={splitCount} onChange={e => setSplitCount(e.target.value)}
                    min="2" max="99"
                    className="w-16 px-3 py-2 bg-white border border-border rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="text-sm text-on-surface-secondary">{t('splitPeople')}</span>
                  {amount && parseInt(splitCount) > 1 && (
                    <span className="text-xs text-on-surface-secondary ml-auto">
                      {t('perPerson')} {(parseFloat(amount) / parseInt(splitCount)).toFixed(2)} {currency}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={labelCls}>{t('notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')} rows={2}
              className={`${inputCls} resize-none`} />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-surface-container transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40">
              {activity ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
