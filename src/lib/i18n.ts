export type Locale = 'zh' | 'en';

type Translations = Record<string, string>;

const zh: Translations = {
  // Layout
  myTrips: 'Travelling Eddie',

  // HomePage
  loading: '加载中...',
  planTrackEnjoy: '规划行程、记录开销、享受旅途',
  createNewTrip: '创建新旅行',
  noTripsYet: '还没有旅行计划',
  clickToCreate: '点击上方按钮开始创建吧！',
  confirmDeleteTrip: '确定删除此旅行？',
  days: '天',
  activities: '项活动',
  spent: '已花费',

  // CreateTripModal
  tripName: '旅行名称',
  tripNamePlaceholder: '例如：东京五日游',
  destination: '目的地',
  destinationPlaceholder: '例如：日本东京',
  startDate: '开始日期',
  endDate: '结束日期',
  baseCurrency: '基准货币',
  themeColor: '主题色',
  cancel: '取消',
  create: '创建',
  tripIdLabel: '旅程ID（可选）',
  tripIdPlaceholder: '如 bkk-april-2026（留空自动生成）',
  tripIdInvalid: '只允许字母、数字和连字符（-）',
  tripIdDuplicate: '此ID已被使用，请换一个',

  // TripDetailPage
  tripNotFound: '旅行不存在',
  backToHome: '返回首页',
  itinerary: '行程',
  expenses: '费用',
  dragHere: '拖拽活动到此处',
  items: '项',
  addActivity: '添加活动',

  // ActivityForm
  editActivity: '编辑活动',
  activityName: '活动名称',
  activityNamePlaceholder: '例如：飞往东京',
  category: '分类',
  startTime: '开始时间',
  endTime: '结束时间',
  location: '地点',
  locationPlaceholder: '例如：成田国际机场',
  addExpense: '添加费用',
  amount: '金额',
  currency: '货币',
  splitBill: 'AA制',
  splitPeople: '人均摊',
  perPerson: '人均',
  notes: '备注',
  notesPlaceholder: '补充信息...',
  save: '保存',
  add: '添加',

  // ActivityCard
  aaSplit: 'AA×{count} 人均{amount}',

  // ExpenseSummary
  totalExpenses: '费用总计',
  refreshRates: '刷新汇率',
  myPayment: '我的实付（含{count}笔AA均摊）',
  totalSpending: '总消费',
  aaSavings: 'AA节省',
  ratesUpdatedAt: '汇率更新于',
  byCurrency: '按货币',
  byCategory: '按分类',
  countItems: '{count}笔',

  // Categories
  'cat.flight': '飞机',
  'cat.train': '火车',
  'cat.bus': '巴士',
  'cat.car': '打车',
  'cat.boat': '船',
  'cat.dining': '餐饮',
  'cat.bar': '酒吧',
  'cat.cafe': '咖啡',
  'cat.hotel': '住宿',
  'cat.massage': '按摩/SPA',
  'cat.shopping': '购物',
  'cat.sightseeing': '观光',
  'cat.museum': '博物馆',
  'cat.entertainment': '娱乐',
  'cat.other': '其他',

  // Date format
  dateFormat: 'M月d日 EEEE',
} as const;

const en: Translations = {
  // Layout
  myTrips: 'Travelling Eddie',

  // HomePage
  loading: 'Loading...',
  planTrackEnjoy: 'Plan trips, track expenses, enjoy the journey',
  createNewTrip: 'Create New Trip',
  noTripsYet: 'No trips yet',
  clickToCreate: 'Click the button above to create one!',
  confirmDeleteTrip: 'Delete this trip?',
  days: 'days',
  activities: 'activities',
  spent: 'Spent',

  // CreateTripModal
  tripName: 'Trip Name',
  tripNamePlaceholder: 'e.g., 5-day Tokyo trip',
  destination: 'Destination',
  destinationPlaceholder: 'e.g., Tokyo, Japan',
  startDate: 'Start Date',
  endDate: 'End Date',
  baseCurrency: 'Base Currency',
  themeColor: 'Theme Color',
  cancel: 'Cancel',
  create: 'Create',
  tripIdLabel: 'Trip ID (optional)',
  tripIdPlaceholder: 'e.g. bkk-april-2026 (auto if empty)',
  tripIdInvalid: 'Letters, numbers and hyphens only',
  tripIdDuplicate: 'This ID already exists, try another',

  // TripDetailPage
  tripNotFound: 'Trip not found',
  backToHome: 'Back to Home',
  itinerary: 'Itinerary',
  expenses: 'Expenses',
  dragHere: 'Drag activities here',
  items: '',
  addActivity: 'Add Activity',

  // ActivityForm
  editActivity: 'Edit Activity',
  activityName: 'Activity Name',
  activityNamePlaceholder: 'e.g., Fly to Tokyo',
  category: 'Category',
  startTime: 'Start Time',
  endTime: 'End Time',
  location: 'Location',
  locationPlaceholder: 'e.g., Narita International Airport',
  addExpense: 'Add Expense',
  amount: 'Amount',
  currency: 'Currency',
  splitBill: 'Split Bill',
  splitPeople: 'people split',
  perPerson: 'per person',
  notes: 'Notes',
  notesPlaceholder: 'Additional info...',
  save: 'Save',
  add: 'Add',

  // ActivityCard
  aaSplit: 'Split×{count} {amount}/person',

  // ExpenseSummary
  totalExpenses: 'Total Expenses',
  refreshRates: 'Refresh Rates',
  myPayment: 'My payment ({count} split bills included)',
  totalSpending: 'Total spending',
  aaSavings: 'Split savings',
  ratesUpdatedAt: 'Rates updated at',
  byCurrency: 'By Currency',
  byCategory: 'By Category',
  countItems: '{count} items',

  // Categories
  'cat.flight': 'Flight',
  'cat.train': 'Train',
  'cat.bus': 'Bus',
  'cat.car': 'Taxi',
  'cat.boat': 'Boat',
  'cat.dining': 'Dining',
  'cat.bar': 'Bar',
  'cat.cafe': 'Cafe',
  'cat.hotel': 'Hotel',
  'cat.massage': 'Massage/SPA',
  'cat.shopping': 'Shopping',
  'cat.sightseeing': 'Sightseeing',
  'cat.museum': 'Museum',
  'cat.entertainment': 'Entertainment',
  'cat.other': 'Other',

  // Date format
  dateFormat: 'MMM d, EEEE',
};

export const translations = { zh, en };
export type TranslationKey = string;
