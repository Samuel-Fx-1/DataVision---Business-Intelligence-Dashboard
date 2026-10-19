'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  applyChartDefaults,
  applyTrend,
  chartConfigMap,
} from '@/lib/chartConfigs';
import type { Period, TrendSeries } from '@/lib/types';

const FILTERS: { period: Period; label: string }[] = [
  { period: '7d', label: '7D' },
  { period: '1m', label: '1M' },
  { period: '3m', label: '3M' },
  { period: '1y', label: '1Y' },
  { period: 'all', label: 'ALL' },
];

interface TrendAnalysisProps {
  revenue: TrendSeries;
  users: TrendSeries;
  initialPeriod: Period;
}

export default function TrendAnalysis({ revenue, users, initialPeriod }: TrendAnalysisProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [trend, setTrend] = useState({ revenue, users });
  const charts = useRef<Record<string, Chart | null>>({});

  // Mount every chart once. Re-runs only on unmount (and StrictMode remount).
  useEffect(() => {
    applyChartDefaults(Chart);
    const configs = chartConfigMap(trend.revenue, trend.users);

    Object.entries(configs).forEach(([id, config]) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement | null;
      if (!canvas) return;
      charts.current[id] = new Chart(canvas, config);
    });

    return () => {
      Object.values(charts.current).forEach((chart) => chart?.destroy());
      charts.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push new period data into the existing revenue + user charts.
  useEffect(() => {
    const revenueChart = charts.current.revenueChart;
    const userChart = charts.current.userChart;
    if (!revenueChart || !userChart) return;

    applyTrend(revenueChart, trend.revenue);
    applyTrend(userChart, trend.users);
    revenueChart.update();
    userChart.update();
  }, [trend]);

  // Fetch the selected period from the Node API.
  useEffect(() => {
    if (period === initialPeriod) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/dashboard?period=${period}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setTrend({ revenue: data.revenue, users: data.users });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load dashboard period', period, error);
          setPeriod(initialPeriod);
        }
      }
    })();

    return () => controller.abort();
  }, [period, initialPeriod]);

  return (
    <section className="charts-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">TREND ANALYSIS</h2>
          <p className="section-subtitle">Historical performance and predictions</p>

          <div className="time-filter" role="group" aria-label="Time period filter">
            {FILTERS.map((filter) => (
              <button
                key={filter.period}
                type="button"
                className={`filter-btn${period === filter.period ? ' active' : ''}`}
                data-period={filter.period}
                aria-pressed={period === filter.period}
                onClick={() => setPeriod(filter.period)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="charts-grid" aria-busy={period !== initialPeriod}>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Revenue Trend</h3>
              <div className="chart-info">
                {/* The pulse is driven by `@keyframes pulse` in style.css. */}
                <span className="live-indicator">
                  <i className="fas fa-circle" /> LIVE
                </span>
              </div>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="revenueChart" />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">User Growth</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="userChart" />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Sales by Category</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="categoryChart" />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Performance Metrics</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="performanceChart" />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Market Share</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="marketShareChart" />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Traffic Sources</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <canvas id="trafficChart" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}