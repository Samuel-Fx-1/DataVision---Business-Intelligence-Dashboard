import { prisma } from './prisma';
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
 * Dashboard data lives in SQLite (see prisma/schema.prisma) and is read
 * through Prisma. The seed script (prisma/seed.ts) loads the demo numbers.
 * Everything the page renders comes from here, so the React components never
 * hard-code numbers.
 */

/* ------------------------------------------------------------------ */
/* Period-independent charts (static demo data, no table)              */
/* ------------------------------------------------------------------ */

const heroStats: HeroStat[] = [
  { prefix: '$', suffix: 'K', target: 2847, label: 'ACTIVE CLIENTS' },
  { prefix: '#', suffix: '+', target: 1524, label: 'DATA SOURCES' },
  { suffix: '%', target: 99.8, label: 'UPTIME %' },
];

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

/* ------------------------------------------------------------------ */
/* Prisma queries                                                      */
/* ------------------------------------------------------------------ */

function toTrendSeries(points: { label: string; current: number | null; previous: number | null; currentLabel: string; previousLabel: string }[]): TrendSeries {
  return {
    labels: points.map((p) => p.label),
    current: points.map((p) => p.current),
    previous: points.map((p) => p.previous),
    currentLabel: points[0]?.currentLabel ?? '',
    previousLabel: points[0]?.previousLabel ?? '',
  };
}

/** Revenue + user series for the requested time filter. */
export async function getTrend(period: Period): Promise<{ revenue: TrendSeries; users: TrendSeries }> {
  const [revenuePoints, userPoints] = await Promise.all([
    prisma.revenuePoint.findMany({ where: { period }, orderBy: { position: 'asc' } }),
    prisma.userGrowthPoint.findMany({ where: { period }, orderBy: { position: 'asc' } }),
  ]);

  return {
    revenue: toTrendSeries(revenuePoints),
    users: toTrendSeries(userPoints),
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getDashboard(period: Period = '1y'): Promise<DashboardData> {
  const [{ revenue, users }, kpiRows, categoryRows, regionRows, activityRows] = await Promise.all([
    getTrend(period),
    prisma.kpi.findMany({ orderBy: { position: 'asc' } }),
    prisma.categorySale.findMany(),
    prisma.regionPerformance.findMany(),
    prisma.activity.findMany({ orderBy: { seconds: 'asc' } }),
  ]);

  const kpis: Kpi[] = kpiRows.map((row) => ({
    icon: row.icon,
    value: row.value,
    initial: row.initial,
    label: row.label,
    change: row.change,
    direction: row.direction as Kpi['direction'],
  }));

  const regions: Region[] = regionRows.map((row) => ({
    key: row.key,
    name: row.name,
    value: row.value,
    percentage: row.percentage,
  }));

  const stream: StreamEvent[] = activityRows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    detail: row.detail,
    seconds: row.seconds,
  }));

  return {
    heroStats,
    kpis,
    revenue,
    users,
    categories: categoryRows.map(({ label, value, color }) => ({ label, value, color })),
    performance,
    marketShare,
    traffic,
    comparison,
    regions,
    stream,
  };
}

export async function getStreamEvents(): Promise<StreamEvent[]> {
  const rows = await prisma.activity.findMany({ orderBy: { seconds: 'asc' } });

  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    detail: row.detail,
    seconds: row.seconds,
  }));
}

export function getHeroStats(): HeroStat[] {
  return heroStats;
}

export async function getKpis(): Promise<Kpi[]> {
  const rows = await prisma.kpi.findMany({ orderBy: { position: 'asc' } });

  return rows.map((row) => ({
    icon: row.icon,
    value: row.value,
    initial: row.initial,
    label: row.label,
    change: row.change,
    direction: row.direction as Kpi['direction'],
  }));
}
