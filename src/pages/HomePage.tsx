import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { useLanguage } from '../contexts/LanguageContext';
import { COVER_COLORS, CURRENCIES } from '../types';
import { convertCurrency } from '../lib/currency';

export default function HomePage() {
  const { trips, loading, addTrip, deleteTrip, rates } = useTrips();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-on-surface-secondary">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-on-surface mb-1">Your Trips</h1>
        <p className="text-on-surface-secondary text-sm">{t('planTrackEnjoy')}</p>
      </div>

      {/* Trip list */}
      {trips.length === 0 ? (
        <div className="text-center py-20 text-on-surface-secondary">
          <div className="text-5xl mb-5">✈️</div>
          <p className="font-medium text-on-surface">{t('noTripsYet')}</p>
          <p className="text-sm mt-1 mb-8">{t('clickToCreate')}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            {t('createNewTrip')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {trips.map(trip => {
              const totalExpenses = trip.days.reduce(
                (sum, day) => sum + day.activities.reduce(
                  (s, a) => {
                    if (!a.expense) return s;
                    const converted = rates
                      ? convertCurrency(a.expense.amount, a.expense.currency, trip.baseCurrency, rates)
                      : a.expense.amount;
                    const splitCount = a.expense.splitCount && a.expense.splitCount > 1 ? a.expense.splitCount : 1;
                    return s + converted / splitCount;
                  }, 0
                ), 0
              );
              const activityCount = trip.days.reduce((s, d) => s + d.activities.length, 0);

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-lift)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
                >
                  {/* Color banner */}
                  <div className="h-1.5" style={{ backgroundColor: trip.coverColor }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg leading-tight truncate">{trip.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-on-surface-secondary mt-1.5">
                          <MapPin size={13} />
                          <span>{trip.destination}</span>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(t('confirmDeleteTrip'))) deleteTrip(trip.id);
                        }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-on-surface-secondary hover:text-danger transition-all shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-on-surface-secondary">
                      <span className="font-mono">{trip.startDate} — {trip.endDate}</span>
                      <span className="text-border">·</span>
                      <span>{trip.days.length} {t('days')}</span>
                      <span className="text-border">·</span>
                      <span>{activityCount} {t('activities')}</span>
                    </div>

                    {totalExpenses > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium">
                        <span>{trip.baseCurrency} {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span className="text-primary/50">{t('spent')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new trip button */}
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mt-4 p-4 border border-dashed border-border rounded-2xl hover:border-primary hover:bg-primary/4 transition-all flex items-center justify-center gap-2 text-on-surface-secondary hover:text-primary text-sm"
          >
            <Plus size={16} />
            <span>{t('createNewTrip')}</span>
          </button>
        </>
      )}

      {showCreate && (
        <CreateTripModal
          existingIds={trips.map(tr => tr.id)}
          onClose={() => setShowCreate(false)}
          onCreate={data => {
            const trip = addTrip(data);
            setShowCreate(false);
            navigate(`/trip/${trip.id}`);
          }}
        />
      )}
    </div>
  );
}

function CreateTripModal({
  existingIds,
  onClose,
  onCreate,
}: {
  existingIds: string[];
  onClose: () => void;
  onCreate: (data: { id?: string; name: string; destination: string; startDate: string; endDate: string; coverColor: string; baseCurrency: string }) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [baseCurrency, setBaseCurrency] = useState('CNY');
  const [customId, setCustomId] = useState('');
  const [idError, setIdError] = useState('');

  const validateId = (val: string): string => {
    if (!val) return '';
    if (!/^[a-zA-Z0-9-]+$/.test(val)) return t('tripIdInvalid');
    if (existingIds.includes(val)) return t('tripIdDuplicate');
    return '';
  };

  const handleIdChange = (val: string) => {
    setCustomId(val);
    setIdError(validateId(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim() || !startDate || !endDate) return;
    const err = validateId(customId);
    if (err) { setIdError(err); return; }
    onCreate({ id: customId.trim() || undefined, name: name.trim(), destination: destination.trim(), startDate, endDate, coverColor, baseCurrency });
  };

  const inputCls = 'w-full px-3 py-2.5 bg-surface-dim border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-lift)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 rounded-t-2xl flex items-center justify-between">
          <h3 className="font-display text-base">{t('createNewTrip')}</h3>
          <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('tripName')} *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('tripNamePlaceholder')} className={inputCls} autoFocus />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('destination')} *</label>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
              placeholder={t('destinationPlaceholder')} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('startDate')} *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('endDate')} *</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('baseCurrency')}</label>
            <select value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)} className={inputCls}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-2">{t('themeColor')}</label>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setCoverColor(color)}
                  className={`w-7 h-7 rounded-full transition-all ${coverColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-secondary uppercase tracking-wider mb-1.5">{t('tripIdLabel')}</label>
            <input type="text" value={customId} onChange={e => handleIdChange(e.target.value.toLowerCase())}
              placeholder={t('tripIdPlaceholder')}
              className={`${inputCls} font-mono ${idError ? 'border-danger' : ''}`} />
            {idError && <p className="text-danger text-xs mt-1">{idError}</p>}
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-surface-container transition-colors">
              {t('cancel')}
            </button>
            <button type="submit"
              disabled={!name.trim() || !destination.trim() || !startDate || !endDate}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40">
              {t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
