export type Period = '7d' | '1m' | '3m' | '1y' | 'all';

export const PERIODS: Period[] = ['7d', '1m', '3m', '1y', 'all'];

export function isPeriod(value: string): value is Period {
  return (PERIODS as string[]).includes(value);
}

/** A chart series. `null` leaves a gap in the line (used by the 24-month "all" view). */
export type Series = (number | null)[];

export interface TrendSeries {
  labels: string[];
  current: Series;
  previous: Series;
  currentLabel: string;
  previousLabel: string;
}

export interface HeroStat {
  prefix?: string;
  suffix?: string;
  target: number;
  label: string;
}

export interface Kpi {
  icon: string;
  value: number;
  /** Text rendered before the counter starts ticking up. */
  initial: string;
  label: string;
  change: number;
  direction: 'positive' | 'negative';
}

export interface ComparisonItem {
  label: string;
  current: { width: number; text: string };
  previous: { width: number; text: string };
  diff: string;
  direction: 'positive' | 'negative';
}

export interface ComparisonCard {
  title: string;
  items: ComparisonItem[];
}

export interface Region {
  key: string;
  name: string;
  value: string;
  percentage: number;
}

export interface StreamEvent {
  id: string;
  icon: string;
  title: string;
  detail: string;
  /** Seconds elapsed since the event happened. Ticks up every second on the client. */
  seconds: number;
}

export interface TrafficSeries {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export interface DashboardData {
  heroStats: HeroStat[];
  kpis: Kpi[];
  revenue: TrendSeries;
  users: TrendSeries;
  categories: { label: string; value: number; color: string }[];
  performance: {
    labels: string[];
    current: number[];
    previous: number[];
  };
  marketShare: {
    labels: string[];
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  };
  traffic: {
    labels: string[];
    series: TrafficSeries[];
  };
  comparison: ComparisonCard;
  regions: Region[];
  stream: StreamEvent[];
}