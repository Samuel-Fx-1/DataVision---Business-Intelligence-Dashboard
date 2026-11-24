import { PrismaClient } from '@prisma/client';

/**
 * Seeds the dashboard tables with the demo data previously hard-coded in
 * lib/data.ts. Idempotent: clears and re-inserts the seeded tables on every
 * run. The Subscriber table is left untouched.
 */

const prisma = new PrismaClient();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const kpis = [
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

interface RevenueSeriesSeed {
  period: string;
  labels: string[];
  current: (number | null)[];
  previous: (number | null)[];
  currentLabel: string;
  previousLabel: string;
}

const revenueSeries: RevenueSeriesSeed[] = [
  {
    period: '7d',
    labels: days,
    current: revenueDays,
    previous: revenueDaysPrev,
    currentLabel: 'Revenue (7 days)',
    previousLabel: 'Previous 7 days',
  },
  {
    period: '1m',
    labels: weeks4,
    current: revenueWeeks,
    previous: revenueWeeksPrev,
    currentLabel: 'Revenue (1 month)',
    previousLabel: 'Previous 4 weeks',
  },
  {
    period: '3m',
    labels: weeks12,
    current: revenueWeeks12,
    previous: revenueWeeks12Prev,
    currentLabel: 'Revenue (3 months)',
    previousLabel: 'Previous 12 weeks',
  },
  {
    period: '1y',
    labels: MONTHS,
    current: revenue2024,
    previous: revenue2023,
    currentLabel: 'Revenue 2024',
    previousLabel: 'Revenue 2023',
  },
  {
    period: 'all',
    labels: [...MONTHS.map((m) => `${m} 23`), ...MONTHS.map((m) => `${m} 24`)],
    current: [...new Array(12).fill(null), ...revenue2024],
    previous: [...revenue2023, ...new Array(12).fill(null)],
    currentLabel: 'Revenue 2024',
    previousLabel: 'Revenue 2023',
  },
];

interface UserGrowthSeriesSeed {
  period: string;
  labels: string[];
  current: (number | null)[];
  previous: (number | null)[];
  currentLabel: string;
  previousLabel: string;
}

const userSeries: UserGrowthSeriesSeed[] = [
  {
    period: '7d',
    labels: days,
    current: usersDays,
    previous: usersDaysPrev,
    currentLabel: 'Active Users (7 days)',
    previousLabel: 'Previous 7 days',
  },
  {
    period: '1m',
    labels: weeks4,
    current: usersWeeks,
    previous: usersWeeksPrev,
    currentLabel: 'Active Users (1 month)',
    previousLabel: 'Previous 4 weeks',
  },
  {
    period: '3m',
    labels: weeks12,
    current: usersWeeks12,
    previous: usersWeeks12Prev,
    currentLabel: 'Active Users (3 months)',
    previousLabel: 'Previous 12 weeks',
  },
  {
    period: '1y',
    labels: MONTHS,
    current: users2024,
    previous: users2023,
    currentLabel: 'Active Users 2024',
    previousLabel: 'Active Users 2023',
  },
  {
    period: 'all',
    labels: [...MONTHS.map((m) => `${m} 23`), ...MONTHS.map((m) => `${m} 24`)],
    current: [...new Array(12).fill(null), ...users2024],
    previous: [...users2023, ...new Array(12).fill(null)],
    currentLabel: 'Active Users 2024',
    previousLabel: 'Active Users 2023',
  },
];

const categories = [
  { label: 'Electronics', value: 35, color: '#00D9FF' },
  { label: 'Fashion', value: 25, color: '#00FFA3' },
  { label: 'Home & Garden', value: 18, color: '#FF6B35' },
  { label: 'Sports', value: 12, color: '#9B59B6' },
  { label: 'Books', value: 6, color: '#F1C40F' },
  { label: 'Others', value: 4, color: 'rgba(255, 255, 255, 0.3)' },
];

const regions = [
  { key: 'na', name: 'North America', value: '$1.2M', percentage: 42 },
  { key: 'eu', name: 'Europe', value: '$890K', percentage: 31 },
  { key: 'ap', name: 'Asia Pacific', value: '$520K', percentage: 18 },
  { key: 'ot', name: 'Others', value: '$237K', percentage: 9 },
];

const stream = [
  { id: 'evt-1', icon: 'fas fa-shopping-bag', title: 'New Order #15423', detail: '$248.99 • New York, USA', seconds: 2 },
  { id: 'evt-2', icon: 'fas fa-user-plus', title: 'New User Registration', detail: 'Premium Plan • London, UK', seconds: 5 },
  { id: 'evt-3', icon: 'fas fa-credit-card', title: 'Payment Received', detail: '$1,299.00 • Tokyo, Japan', seconds: 8 },
  { id: 'evt-4', icon: 'fas fa-chart-line', title: 'Milestone Reached', detail: '45K Active Users', seconds: 12 },
  { id: 'evt-5', icon: 'fas fa-bell', title: 'Alert: High Traffic', detail: '+285% from average', seconds: 15 },
];

async function main() {
  await prisma.$transaction([
    prisma.revenuePoint.deleteMany(),
    prisma.userGrowthPoint.deleteMany(),
    prisma.kpi.deleteMany(),
    prisma.categorySale.deleteMany(),
    prisma.regionPerformance.deleteMany(),
    prisma.activity.deleteMany(),
  ]);

  await prisma.kpi.createMany({
    data: kpis.map((kpi, position) => ({ ...kpi, position })),
  });

  await prisma.revenuePoint.createMany({
    data: revenueSeries.flatMap((series) =>
      series.labels.map((label, position) => ({
        period: series.period,
        position,
        label,
        current: series.current[position],
        previous: series.previous[position],
        currentLabel: series.currentLabel,
        previousLabel: series.previousLabel,
      })),
    ),
  });

  await prisma.userGrowthPoint.createMany({
    data: userSeries.flatMap((series) =>
      series.labels.map((label, position) => ({
        period: series.period,
        position,
        label,
        current: series.current[position],
        previous: series.previous[position],
        currentLabel: series.currentLabel,
        previousLabel: series.previousLabel,
      })),
    ),
  });

  await prisma.categorySale.createMany({ data: categories });
  await prisma.regionPerformance.createMany({ data: regions });
  await prisma.activity.createMany({ data: stream });

  const counts = {
    kpis: await prisma.kpi.count(),
    revenuePoints: await prisma.revenuePoint.count(),
    userGrowthPoints: await prisma.userGrowthPoint.count(),
    categorySales: await prisma.categorySale.count(),
    regions: await prisma.regionPerformance.count(),
    activities: await prisma.activity.count(),
    subscribers: await prisma.subscriber.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
