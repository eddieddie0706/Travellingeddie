import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { format, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Plus, Calendar, Wallet, ChevronDown, ChevronRight } from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { Activity, DayPlan } from '../types';
import ActivityCard from '../components/ActivityCard';
import ActivityForm from '../components/ActivityForm';
import ExpenseSummary from '../components/ExpenseSummary';
import { convertCurrency } from '../lib/currency';

type Tab = 'itinerary' | 'expenses';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrip, updateTrip, rates, ratesLoading, refreshRates, loading } = useTrips();
  const { t, locale } = useLanguage();
  const trip = getTrip(id || '');

  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [editingActivity, setEditingActivity] = useState<{ dayId: string; activity?: Activity } | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const startEditName = useCallback(() => {
    if (!trip) return;
    setDraftName(trip.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  }, [trip]);

  const commitName = useCallback(() => {
    if (!trip) return;
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== trip.name) updateTrip({ ...trip, name: trimmed });
    setEditingName(false);
  }, [trip, draftName, updateTrip]);

  const cancelName = useCallback(() => setEditingName(false), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toggleDay = useCallback((dayId: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  }, []);

  const findDayByActivityId = useCallback((activityId: string | number) => {
    if (!trip) return null;
    for (const day of trip.days) {
      if (day.activities.some(a => a.id === activityId)) return day;
    }
    return null;
  }, [trip]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!trip) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceDay = findDayByActivityId(active.id);
    if (!sourceDay) return;

    // Check if dropping on a day drop zone (id starts with "day-drop-")
    const overIdStr = String(over.id);
    const isDropOnDay = overIdStr.startsWith('day-drop-');
    const targetDay = isDropOnDay
      ? trip.days.find(d => d.id === overIdStr.replace('day-drop-', ''))
      : findDayByActivityId(over.id);

    if (!targetDay) return;

    if (sourceDay.id === targetDay.id && !isDropOnDay) {
      // Same day reorder
      const updatedDays = trip.days.map(day => {
        if (day.id !== sourceDay.id) return day;
        const oldIndex = day.activities.findIndex(a => a.id === active.id);
        const newIndex = day.activities.findIndex(a => a.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return day;
        return { ...day, activities: arrayMove(day.activities, oldIndex, newIndex) };
      });
      updateTrip({ ...trip, days: updatedDays });
    } else {
      // Cross-day move
      const activity = sourceDay.activities.find(a => a.id === active.id);
      if (!activity) return;

      const updatedDays = trip.days.map(day => {
        if (day.id === sourceDay.id) {
          return { ...day, activities: day.activities.filter(a => a.id !== active.id) };
        }
        if (day.id === targetDay.id) {
          if (isDropOnDay) {
            // Dropped on day zone — append to end
            return { ...day, activities: [...day.activities, activity] };
          }
          // Insert at the position of the target activity
          const targetIndex = day.activities.findIndex(a => a.id === over.id);
          const newActivities = [...day.activities];
          newActivities.splice(targetIndex, 0, activity);
          return { ...day, activities: newActivities };
        }
        return day;
      });
      updateTrip({ ...trip, days: updatedDays });
    }
  }, [trip, updateTrip, findDayByActivityId]);

  const sortActivitiesByTime = useCallback((activities: Activity[]) => {
    return [...activities].sort((a, b) => {
      // Activities without startTime go to the end
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, []);

  const handleSaveActivity = useCallback((dayId: string, activity: Activity) => {
    if (!trip) return;
    const updatedDays = trip.days.map(day => {
      if (day.id !== dayId) return day;
      const exists = day.activities.find(a => a.id === activity.id);
      let activities: Activity[];
      if (exists) {
        activities = day.activities.map(a => a.id === activity.id ? activity : a);
      } else {
        activities = [...day.activities, { ...activity, order: day.activities.length }];
      }
      return { ...day, activities: sortActivitiesByTime(activities) };
    });
    updateTrip({ ...trip, days: updatedDays });
    setEditingActivity(null);
  }, [trip, updateTrip, sortActivitiesByTime]);

  const handleDeleteActivity = useCallback((dayId: string, activityId: string) => {
    if (!trip) return;
    const updatedDays = trip.days.map(day => {
      if (day.id !== dayId) return day;
      return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
    });
    updateTrip({ ...trip, days: updatedDays });
  }, [trip, updateTrip]);

  if (loading) {
    return (
      <div className="text-center py-16 text-on-surface-secondary">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p className="text-on-surface-secondary">{t('tripNotFound')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          {t('backToHome')}
        </button>
      </div>
    );
  }

  const totalActivities = trip.days.reduce((s, d) => s + d.activities.length, 0);

  return (
    <div>
      {/* Trip header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: trip.coverColor }} />
          {editingName ? (
            <input
              ref={nameInputRef}
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitName(); }
                if (e.key === 'Escape') { e.preventDefault(); cancelName(); }
              }}
              className="text-xl sm:text-2xl font-bold bg-transparent border-b-2 border-primary outline-none w-full"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={startEditName}
              title={t('editTripName')}
            >
              {trip.name}
            </h1>
          )}
        </div>
        <p className="text-sm text-on-surface-secondary">
          {trip.destination} · {trip.startDate} ~ {trip.endDate} · {trip.days.length} {t('days')} · {totalActivities} {t('activities')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-container p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'itinerary'
              ? 'bg-white shadow-sm text-on-surface'
              : 'text-on-surface-secondary hover:text-on-surface'
          }`}
        >
          <Calendar size={16} />
          {t('itinerary')}
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'bg-white shadow-sm text-on-surface'
              : 'text-on-surface-secondary hover:text-on-surface'
          }`}
        >
          <Wallet size={16} />
          {t('expenses')}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'itinerary' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {trip.days.map((day, dayIndex) => (
              <DaySection
                key={day.id}
                day={day}
                dayIndex={dayIndex}
                isCollapsed={collapsedDays.has(day.id)}
                onToggle={() => toggleDay(day.id)}
                onAddActivity={() => setEditingActivity({ dayId: day.id })}
                onEditActivity={(activity) => setEditingActivity({ dayId: day.id, activity })}
                onDeleteActivity={(activityId) => handleDeleteActivity(day.id, activityId)}
                baseCurrency={trip.baseCurrency}
                rates={rates}
                locale={locale}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <ExpenseSummary
          trip={trip}
          rates={rates}
          ratesLoading={ratesLoading}
          onRefreshRates={() => refreshRates(trip.baseCurrency)}
        />
      )}

      {/* Activity form modal */}
      {editingActivity && (
        <ActivityForm
          activity={editingActivity.activity}
          defaultCurrency={trip.baseCurrency}
          onSave={activity => handleSaveActivity(editingActivity.dayId, activity)}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}

function DayDropZone({ dayId, isEmpty, children }: { dayId: string; isEmpty: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-drop-${dayId}` });
  const { t } = useLanguage();

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] rounded-lg transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-primary/30' : ''}`}
    >
      {children}
      {isEmpty && (
        <div className={`py-4 text-center text-xs text-on-surface-secondary ${isOver ? 'text-primary' : ''}`}>
          {t('dragHere')}
        </div>
      )}
    </div>
  );
}

function DaySection({
  day,
  dayIndex,
  isCollapsed,
  onToggle,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  baseCurrency,
  rates,
  locale,
}: {
  day: DayPlan;
  dayIndex: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  baseCurrency: string;
  rates: import('../types').ExchangeRates | null;
  locale: string;
}) {
  const { t } = useLanguage();
  const dateObj = parseISO(day.date);
  const dateFnsLocale = locale === 'zh' ? zhCN : enUS;
  const dayLabel = format(dateObj, t('dateFormat'), { locale: dateFnsLocale });

  const dayExpenseTotal = day.activities.reduce((s, a) => {
    if (!a.expense) return s;
    const converted = rates
      ? convertCurrency(a.expense.amount, a.expense.currency, baseCurrency, rates)
      : a.expense.amount;
    const splitCount = a.expense.splitCount && a.expense.splitCount > 1 ? a.expense.splitCount : 1;
    return s + converted / splitCount;
  }, 0);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Day header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-dim transition-colors"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          <span className="font-semibold text-sm">Day {dayIndex + 1}</span>
          <span className="text-sm text-on-surface-secondary">{dayLabel}</span>
          <span className="text-xs text-on-surface-secondary bg-surface-container px-1.5 py-0.5 rounded">
            {day.activities.length}{t('items')}
          </span>
        </div>
        {dayExpenseTotal > 0 && (
          <span className="text-xs text-on-surface-secondary">
            {baseCurrency} {dayExpenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </button>

      {/* Activities */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <SortableContext
            items={day.activities.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <DayDropZone dayId={day.id} isEmpty={day.activities.length === 0}>
              <div className="space-y-2">
                {day.activities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    baseCurrency={baseCurrency}
                    rates={rates}
                    onEdit={() => onEditActivity(activity)}
                    onDelete={() => onDeleteActivity(activity.id)}
                  />
                ))}
              </div>
            </DayDropZone>
          </SortableContext>

          <button
            onClick={onAddActivity}
            className="w-full mt-2 p-2.5 border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5 text-sm text-on-surface-secondary hover:text-primary"
          >
            <Plus size={16} />
            {t('addActivity')}
          </button>
        </div>
      )}
    </div>
  );
}
