import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { COVER_COLORS, CURRENCIES } from '../types';
import { convertCurrency } from '../lib/currency';

export default function HomePage() {
  const { trips, loading, addTrip, deleteTrip, rates } = useTrips();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) {
    return (
      <div className="text-center py-16 text-on-surface-secondary">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">我的旅行</h1>
        <p className="text-on-surface-secondary text-sm">规划行程、记录开销、享受旅途</p>
      </div>

      {/* Create button */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-on-surface-secondary hover:text-primary mb-6"
      >
        <Plus size={20} />
        <span className="font-medium">创建新旅行</span>
      </button>

      {/* Trip list */}
      {trips.length === 0 ? (
        <div className="text-center py-16 text-on-surface-secondary">
          <div className="text-4xl mb-4">✈️</div>
          <p>还没有旅行计划</p>
          <p className="text-sm mt-1">点击上方按钮开始创建吧！</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map(trip => {
            const totalExpenses = trip.days.reduce(
              (sum, day) => sum + day.activities.reduce(
                (s, a) => {
                  if (!a.expense) return s;
                  const converted = rates
                    ? convertCurrency(a.expense.amount, a.expense.currency, trip.baseCurrency, rates)
                    : a.expense.amount;
                  return s + converted;
                }, 0
              ), 0
            );
            const activityCount = trip.days.reduce((s, d) => s + d.activities.length, 0);

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="bg-white rounded-xl border border-border hover:shadow-md transition-all cursor-pointer overflow-hidden group"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: trip.coverColor }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">{trip.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-on-surface-secondary mt-1">
                        <MapPin size={14} />
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('确定删除此旅行？')) deleteTrip(trip.id);
                      }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-on-surface-secondary hover:text-danger transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {trip.startDate} ~ {trip.endDate}
                    </span>
                    <span>{trip.days.length}天</span>
                    <span>{activityCount}项活动</span>
                  </div>

                  {totalExpenses > 0 && (
                    <div className="mt-2 text-sm font-medium text-primary">
                      已花费 {trip.baseCurrency} {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateTripModal
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
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; destination: string; startDate: string; endDate: string; coverColor: string; baseCurrency: string }) => void;
}) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [baseCurrency, setBaseCurrency] = useState('CNY');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim() || !startDate || !endDate) return;
    onCreate({ name: name.trim(), destination: destination.trim(), startDate, endDate, coverColor, baseCurrency });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 rounded-t-2xl">
          <h3 className="font-semibold text-center">创建新旅行</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">旅行名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：东京五日游"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">目的地 *</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="例如：日本东京"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">开始日期 *</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">结束日期 *</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">基准货币</label>
            <select
              value={baseCurrency}
              onChange={e => setBaseCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">主题色</label>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCoverColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    coverColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !destination.trim() || !startDate || !endDate}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
