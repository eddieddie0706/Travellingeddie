import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, MapPin, Trash2, Edit3, Users } from 'lucide-react';
import type { Activity, ExchangeRates } from '../types';
import { CATEGORY_CONFIG } from '../types';
import { convertCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryIcon from './CategoryIcon';

interface Props {
  activity: Activity;
  baseCurrency: string;
  rates: ExchangeRates | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({ activity, baseCurrency, rates, onEdit, onDelete }: Props) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const convertedAmount = activity.expense && rates
    ? convertCurrency(activity.expense.amount, activity.expense.currency, baseCurrency, rates)
    : null;

  const accentColor = CATEGORY_CONFIG[activity.category].color;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl overflow-hidden group transition-shadow"
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px -4px rgb(28 25 23 / 0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
    >
      <div className="flex">
        {/* Left accent bar */}
        <div className="w-0.5 shrink-0 rounded-l-xl" style={{ backgroundColor: accentColor }} />

        <div className="flex items-start gap-2 p-3 flex-1 min-w-0">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 p-0.5 cursor-grab active:cursor-grabbing text-on-surface-secondary/30 hover:text-on-surface-secondary/60 touch-none shrink-0"
          >
            <GripVertical size={14} />
          </button>

          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            <CategoryIcon category={activity.category} size={16} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm leading-snug truncate">{activity.title}</h4>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-on-surface-secondary">
                  {(activity.startTime || activity.endTime) && (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {activity.startTime}{activity.endTime ? `–${activity.endTime}` : ''}
                    </span>
                  )}
                  {activity.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      <span className="truncate max-w-[110px]">{activity.location}</span>
                    </span>
                  )}
                </div>
                {activity.notes && (
                  <p className="text-xs text-on-surface-secondary/70 mt-1.5 line-clamp-2 italic">{activity.notes}</p>
                )}
              </div>

              {/* Expense */}
              {activity.expense && (
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium tabular-nums">
                    {activity.expense.currency} {activity.expense.amount.toLocaleString()}
                  </div>
                  {convertedAmount !== null && activity.expense.currency !== baseCurrency && (
                    <div className="text-xs text-on-surface-secondary tabular-nums">
                      ≈ {baseCurrency} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  )}
                  {activity.expense.splitCount && activity.expense.splitCount > 1 && (
                    <div className="text-xs text-primary flex items-center justify-end gap-0.5 mt-0.5">
                      <Users size={10} />
                      <span>{t('aaSplit', { count: activity.expense.splitCount, amount: (activity.expense.amount / activity.expense.splitCount).toFixed(0) })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="p-1 rounded hover:bg-surface-container text-on-surface-secondary hover:text-primary transition-colors">
              <Edit3 size={13} />
            </button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-on-surface-secondary hover:text-danger transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
