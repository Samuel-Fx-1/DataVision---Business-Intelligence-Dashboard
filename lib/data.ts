import type {
  ComparisonCard,
  DashboardData,
  HeroStat,
  Kpi,
  Period,
  Region,
  StreamEvent,
  TrafficSeries,
  TrendSeries,
} from './types';

/**
 * Server-side data source for the dashboard.
 *
 * Everything the page renders comes from here, so the React components never
 * hard-code numbers. Swap these functions for real database / API queries and
 * the UI needs no changes.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ------------------------------------------------------------------ */
/* Hero + KPI                                                          */
/* ------------------------------------------------------------------ */

const heroStats: HeroStat[] = [
  { prefix: '$', suffix: 'K', target: 2847, label: 'ACTIVE CLIENTS' },
  { prefix: '#', suffix: '+', target: 1524, label: 'DATA SOURCES' },
  { suffix: '%', target: 99.8, label: 'UPTIME %' },
];

const kpis: Kpi[] = [
  {
    icon: 'fas fa-chart-line',
    value: 2847500,
    initial: '$0',
    label: 'Total Revenue',
    change: 12.5,
    direction: 'positive',
  },
  { icon: 'fas fa-users', value: 45829, initial: '0', label: 'Active Users', change: 8.3, direction: 'positive' },
  { icon: 'fas fa-shopping-cart', value: 15423, initial: '0', label: 'Total Orders', change: 3.2, direction: 'negative' },
  { icon: 'fas fa-percentage', value: 67.8, initial: '0', label: 'Conversion Rate', change: 5.7, direction: 'positive' },
];

/* ------------------------------------------------------------------ */
/* Trend series                                                        */
/* ------------------------------------------------------------------ */

const revenue2024 = [185000, 195000, 210000, 225000, 235000, 245000, 250000, 260000, 268000, 275000, 282000, 290000];
const revenue2023 = [165000, 172000, 180000, 190000, 198000, 205000, 212000, 218000, 225000, 232000, 238000, 245000];

const users2024 = [32000, 34500, 36200, 38100, 39800, 41200, 42500, 43800, 44500, 45200, 45600, 45829];
const users2023 = [28100, 29300, 30100, 31500, 32800, 33700, 34400, 35600, 36200, 37100, 37800, 38500];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const revenueDays = [7800, 9200, 8600, 10400, 11800, 9600, 11200];
const revenueDaysPrev = [6900, 8100, 7600, 9200, 10300, 8400, 9800];
const usersDays = [43800, 44150, 44420, 44810, 45230, 45500, 45829];
const usersDaysPrev = [36800, 37050, 37240, 37510, 37800, 38150, 38500];

const weeks4 = ['Dec 04', 'Dec 11', 'Dec 18', 'Dec 25'];
const revenueWeeks = [62000, 68500, 74200, 83000];
const revenueWeeksPrev = [54900, 60100, 64800, 71200];
const usersWeeks = [44100, 44550, 45120, 45829];
const usersWeeksPrev = [37050, 37420, 37860, 38500];

const weeks12 = [
  'Oct 02', 'Oct 09', 'Oct 16', 'Oct 23', 'Oct 30', 'Nov 06',
  'Nov 13', 'Nov 20', 'Nov 27', 'Dec 04', 'Dec 11', 'Dec 18',
];
const revenueWeeks12 = [15500, 16200, 15800, 17100, 16600, 17900, 18500, 19200, 18800, 20500, 21400, 22800];
const revenueWeeks12Prev = [13800, 14200, 14000, 15100, 14700, 15900, 16500, 17100, 16700, 18200, 19000, 20200];
const usersWeeks12 = [43200, 43450, 43600, 43810, 43990, 44230, 44480, 44650, 44800, 45050, 45280, 45560];
const usersWeeks12Prev = [36300, 36450, 36610, 36780, 36920, 37100, 37260, 37400, 37550, 37700, 37860, 38010];

function buildTrendSeries(
  labels: string[],
  current: (number | null)[],
  previous: (number | null)[],
  currentLabel: string,
  previousLabel: string,
): TrendSeries {
  return { labels, current, previous, currentLabel, previousLabel };
}

/** Revenue + user series for the requested time filter. */
export function getTrend(period: Period): { revenue: TrendSeries; users: TrendSeries } {
  switch (period) {
    case '7d':
      return {
        revenue: buildTrendSeries(days, revenueDays, revenueDaysPrev, 'Revenue (7 days)', 'Previous 7 days'),
        users: buildTrendSeries(days, usersDays, usersDaysPrev, 'Active Users (7 days)', 'Previous 7 days'),
      };
    case '1m':
      return {
        revenue: buildTrendSeries(weeks4, revenueWeeks, revenueWeeksPrev, 'Revenue (1 month)', 'Previous 4 weeks'),
        users: buildTrendSeries(weeks4, usersWeeks, usersWeeksPrev, 'Active Users (1 month)', 'Previous 4 weeks'),
      };
    case '3m':
      return {
        revenue: buildTrendSeries(weeks12, revenueWeeks12, revenueWeeks12Prev, 'Revenue (3 months)', 'Previous 12 weeks'),
        users: buildTrendSeries(weeks12, usersWeeks12, usersWeeks12Prev, 'Active Users (3 months)', 'Previous 12 weeks'),
      };
    case 'all': {
      const labels = [...MONTHS.map((m) => `${m} 23`), ...MONTHS.map((m) => `${m} 24`)];
      const gap = new Array(12).fill(null);
      return {
        revenue: buildTrendSeries(
          labels,
          [...gap, ...revenue2024],
          [...revenue2023, ...gap],
          'Revenue 2024',
          'Revenue 2023',
        ),
        users: buildTrendSeries(
          labels,
          [...gap, ...users2024],
          [...users2023, ...gap],
          'Active Users 2024',
          'Active Users 2023',
        ),
      };
    }
    case '1y':
    default:
      return {
        revenue: buildTrendSeries(MONTHS, revenue2024, revenue2023, 'Revenue 2024', 'Revenue 2023'),
        users: buildTrendSeries(MONTHS, users2024, users2023, 'Active Users 2024', 'Active Users 2023'),
      };
  }
}

/* ------------------------------------------------------------------ */
/* Period-independent charts                                           */
/* ------------------------------------------------------------------ */

export const categories = [
  { label: 'Electronics', value: 35, color: '#00D9FF' },
  { label: 'Fashion', value: 25, color: '#00FFA3' },
  { label: 'Home & Garden', value: 18, color: '#FF6B35' },
  { label: 'Sports', value: 12, color: '#9B59B6' },
  { label: 'Books', value: 6, color: '#F1C40F' },
  { label: 'Others', value: 4, color: 'rgba(255, 255, 255, 0.3)' },
];

export const performance = {
  labels: ['Sales', 'Marketing', 'Customer Service', 'Product Quality', 'Delivery', 'Support'],
  current: [85, 78, 92, 88, 85, 90],
  previous: [78, 72, 85, 82, 80, 83],
};

export const marketShare = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  data: [22, 28, 31, 35],
  backgroundColor: [
    'rgba(0, 217, 255, 0.6)',
    'rgba(0, 255, 163, 0.6)',
    'rgba(255, 107, 53, 0.6)',
    'rgba(155, 89, 182, 0.6)',
  ],
  borderColor: ['#00D9FF', '#00FFA3', '#FF6B35', '#9B59B6'],
};

export const traffic: { labels: string[]; series: TrafficSeries[] } = {
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  series: [
    {
      label: 'Organic Search',
      data: [1200, 800, 2400, 3800, 4200, 3500, 2800],
      borderColor: '#00D9FF',
      backgroundColor: 'rgba(0, 217, 255, 0.1)',
    },
    {
      label: 'Direct',
      data: [800, 600, 1600, 2200, 2800, 2400, 1800],
      borderColor: '#00FFA3',
      backgroundColor: 'rgba(0, 255, 163, 0.1)',
    },
    {
      label: 'Social Media',
      data: [400, 300, 800, 1500, 1800, 1600, 1200],
      borderColor: '#FF6B35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Comparison + regions + stream                                       */
/* ------------------------------------------------------------------ */

const comparison: ComparisonCard = {
  title: 'Q4 2024 vs Q3 2024',
  items: [
    {
      label: 'Revenue',
      current: { width: 85, text: '$2.8M' },
      previous: { width: 72, text: '$2.4M' },
      diff: '+16.7%',
      direction: 'positive',
    },
    {
      label: 'Users',
      current: { width: 92, text: '45.8K' },
      previous: { width: 85, text: '42.3K' },
      diff: '+8.3%',
      direction: 'positive',
    },
    {
      label: 'Orders',
      current: { width: 78, text: '15.4K' },
      previous: { width: 80, text: '15.9K' },
      diff: '-3.1%',
      direction: 'negative',
    },
    {
      label: 'Conversion',
      current: { width: 68, text: '67.8%' },
      previous: { width: 64, text: '64.2%' },
      diff: '+5.6%',
      direction: 'positive',
    },
  ],
};

const regions: Region[] = [
  { key: 'na', name: 'North America', value: '$1.2M', percentage: 42 },
  { key: 'eu', name: 'Europe', value: '$890K', percentage: 31 },
  { key: 'ap', name: 'Asia Pacific', value: '$520K', percentage: 18 },
  { key: 'ot', name: 'Others', value: '$237K', percentage: 9 },
];

const stream: StreamEvent[] = [
  {
    id: 'evt-1',
    icon: 'fas fa-shopping-bag',
    title: 'New Order #15423',
    detail: '$248.99 • New York, USA',
    seconds: 2,
  },
  {
    id: 'evt-2',
    icon: 'fas fa-user-plus',
    title: 'New User Registration',
    detail: 'Premium Plan • London, UK',
    seconds: 5,
  },
  {
    id: 'evt-3',
    icon: 'fas fa-credit-card',
    title: 'Payment Received',
    detail: '$1,299.00 • Tokyo, Japan',
    seconds: 8,
  },
  {
    id: 'evt-4',
    icon: 'fas fa-chart-line',
    title: 'Milestone Reached',
    detail: '45K Active Users',
    seconds: 12,
  },
  {
    id: 'evt-5',
    icon: 'fas fa-bell',
    title: 'Alert: High Traffic',
    detail: '+285% from average',
    seconds: 15,
  },
];

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function getDashboard(period: Period = '1y'): DashboardData {
  const { revenue, users } = getTrend(period);
  return {
    heroStats,
    kpis,
    revenue,
    users,
    categories,
    performance,
    marketShare,
    traffic,
    comparison,
    regions,
    stream,
  };
}

export function getStreamEvents(): StreamEvent[] {
  return stream;
}

export function getHeroStats(): HeroStat[] {
  return heroStats;
}

export function getKpis(): Kpi[] {
  return kpis;
}