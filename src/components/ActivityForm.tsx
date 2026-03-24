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

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-semibold">{activity ? t('editActivity') : t('addActivity')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('activityName')} *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('activityNamePlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('category')}</label>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
              {categories.map(([key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    category === key
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-transparent hover:bg-surface-container'
                  }`}
                >
                  <CategoryIcon category={key} size={16} />
                  <span className="truncate w-full text-center">{t(`cat.${key}` as any)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('startTime')}</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('endTime')}</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('location')}</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>

          {/* Expense toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasExpense}
                onChange={e => setHasExpense(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">{t('addExpense')}</span>
            </label>
          </div>

          {/* Expense fields */}
          {hasExpense && (
            <div className="pl-6 space-y-3">
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('amount')}</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('currency')}</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-2 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Split bill */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSplit}
                    onChange={e => setIsSplit(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{t('splitBill')}</span>
                </label>
                {isSplit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={splitCount}
                      onChange={e => setSplitCount(e.target.value)}
                      min="2"
                      max="99"
                      className="w-16 px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm text-center"
                    />
                    <span className="text-sm text-on-surface-secondary">{t('splitPeople')}</span>
                    {amount && parseInt(splitCount) > 1 && (
                      <span className="text-xs text-on-surface-secondary">
                        ({t('perPerson')} {(parseFloat(amount) / parseInt(splitCount)).toFixed(2)} {currency})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              {activity ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
