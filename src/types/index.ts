export type ActivityCategory =
  | 'flight'
  | 'train'
  | 'bus'
  | 'car'
  | 'boat'
  | 'dining'
  | 'bar'
  | 'cafe'
  | 'hotel'
  | 'massage'
  | 'shopping'
  | 'sightseeing'
  | 'museum'
  | 'entertainment'
  | 'other';

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  location?: string;
  notes?: string;
  expense?: Expense;
  order: number;
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  activities: Activity[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverColor: string;
  baseCurrency: string;
  days: DayPlan[];
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  note?: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
}

export const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string; icon: string }> = {
  flight:        { label: '飞机', color: '#3B82F6', icon: 'Plane' },
  train:         { label: '火车', color: '#6366F1', icon: 'TrainFront' },
  bus:           { label: '巴士', color: '#8B5CF6', icon: 'Bus' },
  car:           { label: '打车', color: '#A855F7', icon: 'Car' },
  boat:          { label: '船', color: '#06B6D4', icon: 'Ship' },
  dining:        { label: '餐饮', color: '#F97316', icon: 'UtensilsCrossed' },
  bar:           { label: '酒吧', color: '#EC4899', icon: 'Wine' },
  cafe:          { label: '咖啡', color: '#92400E', icon: 'Coffee' },
  hotel:         { label: '住宿', color: '#10B981', icon: 'Hotel' },
  massage:       { label: '按摩/SPA', color: '#14B8A6', icon: 'Sparkles' },
  shopping:      { label: '购物', color: '#F59E0B', icon: 'ShoppingBag' },
  sightseeing:   { label: '观光', color: '#EF4444', icon: 'Camera' },
  museum:        { label: '博物馆', color: '#78716C', icon: 'Landmark' },
  entertainment: { label: '娱乐', color: '#D946EF', icon: 'Music' },
  other:         { label: '其他', color: '#6B7280', icon: 'MapPin' },
};

export const CURRENCIES = [
  'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'THB', 'SGD',
  'AUD', 'CAD', 'HKD', 'TWD', 'MYR', 'IDR', 'VND', 'PHP',
  'INR', 'CHF', 'NZD', 'AED',
];

export const COVER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];
