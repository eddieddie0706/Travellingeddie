import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, MapPin, Trash2, Edit3, Users } from 'lucide-react';
import type { Activity, ExchangeRates } from '../types';
import { CATEGORY_CONFIG } from '../types';
import { convertCurrency } from '../lib/currency';
import CategoryIcon from './CategoryIcon';

interface Props {
  activity: Activity;
  baseCurrency: string;
  rates: ExchangeRates | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({ activity, baseCurrency, rates, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = CATEGORY_CONFIG[activity.category];

  const convertedAmount = activity.expense && rates
    ? convertCurrency(
        activity.expense.amount,
        activity.expense.currency,
        baseCurrency,
        rates
      )
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-border hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-0.5 cursor-grab active:cursor-grabbing text-on-surface-secondary/40 hover:text-on-surface-secondary touch-none"
        >
          <GripVertical size={16} />
        </button>

        {/* Category icon */}
        <CategoryIcon category={activity.category} size={18} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">{activity.title}</h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-on-surface-secondary">
                {(activity.startTime || activity.endTime) && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {activity.startTime}{activity.endTime ? ` - ${activity.endTime}` : ''}
                  </span>
                )}
                {activity.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-[120px]">{activity.location}</span>
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: config.color + '18', color: config.color }}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Expense */}
            {activity.expense && (
              <div className="text-right shrink-0">
                <div className="font-medium text-sm">
                  {activity.expense.currency} {activity.expense.amount.toLocaleString()}
                </div>
                {convertedAmount !== null && activity.expense.currency !== baseCurrency && (
                  <div className="text-xs text-on-surface-secondary">
                    ≈ {baseCurrency} {convertedAmount.toLocaleString()}
                  </div>
                )}
                {activity.expense.splitCount && activity.expense.splitCount > 1 && (
                  <div className="text-xs text-primary flex items-center justify-end gap-0.5 mt-0.5">
                    <Users size={10} />
                    <span>AA×{activity.expense.splitCount} 人均{(activity.expense.amount / activity.expense.splitCount).toFixed(0)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {activity.notes && (
            <p className="text-xs text-on-surface-secondary mt-1.5 line-clamp-2">{activity.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded hover:bg-surface-container text-on-surface-secondary">
            <Edit3 size={14} />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-on-surface-secondary hover:text-danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
