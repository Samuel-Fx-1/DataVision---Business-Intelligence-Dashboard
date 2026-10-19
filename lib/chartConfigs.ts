import type { ChartConfiguration } from 'chart.js';
import {
  categories,
  marketShare,
  performance,
  traffic,
} from './data';
import type { Series, TrendSeries } from './types';

/**
 * Chart.js configuration, ported from the original `js/main.js`.
 * Client-only: imported exclusively from client components.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyConfig = ChartConfiguration<any, any, any>;

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#FFFFFF',
        padding: 15,
        font: { size: 11, weight: '500' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(44, 64, 73, 0.95)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      borderColor: 'rgba(0, 217, 255, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
} as const;

export function applyChartDefaults(Chart: any) {
  Chart.defaults.color = '#FFFFFF';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
}

/* ------------------------------------------------------------------ */
/* Revenue Trend                                                       */
/* ------------------------------------------------------------------ */

export function revenueConfig(trend: TrendSeries): AnyConfig {
  return {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [
        {
          label: trend.currentLabel,
          data: trend.current,
          borderColor: '#00D9FF',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 350);
            gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
            return gradient;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#00D9FF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
        },
        {
          label: trend.previousLabel,
          data: trend.previous,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: (value: number) => '$' + value / 1000 + 'K',
          },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        },
      },
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* User Growth                                                         */
/* ------------------------------------------------------------------ */

export function userConfig(trend: TrendSeries): AnyConfig {
  return {
    type: 'bar',
    data: {
      labels: trend.labels,
      // Single dataset, matching the original chart.
      datasets: [
        {
          label: trend.currentLabel,
          data: trend.current,
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 350);
            gradient.addColorStop(0, 'rgba(0, 255, 163, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 255, 163, 0.2)');
            return gradient;
          },
          borderColor: '#00FFA3',
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: (value: number) => value / 1000 + 'K',
          },
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        },
      },
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* Sales by Category                                                   */
/* ------------------------------------------------------------------ */

export function categoryConfig(): AnyConfig {
  return {
    type: 'doughnut',
    data: {
      labels: categories.map((c) => c.label),
      datasets: [
        {
          data: categories.map((c) => c.value),
          backgroundColor: categories.map((c) => c.color),
          borderColor: 'rgba(44, 64, 73, 0.8)',
          borderWidth: 3,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: '#FFFFFF',
            padding: 12,
            font: { size: 11, weight: '500' },
            generateLabels: (chart: any) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label: string, i: number) => {
                  const value = data.datasets[0].data[i];
                  return {
                    text: `${label} (${value}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
      },
      cutout: '65%',
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* Performance Metrics                                                */
/* ------------------------------------------------------------------ */

export function performanceConfig(): AnyConfig {
  return {
    type: 'radar',
    data: {
      labels: performance.labels,
      datasets: [
        {
          label: 'Current Quarter',
          data: performance.current,
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          borderColor: '#00D9FF',
          borderWidth: 2,
          pointBackgroundColor: '#00D9FF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Previous Quarter',
          data: performance.previous,
          backgroundColor: 'rgba(0, 255, 163, 0.1)',
          borderColor: '#00FFA3',
          borderWidth: 2,
          pointBackgroundColor: '#00FFA3',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: 'rgba(255, 255, 255, 0.6)',
            backdropColor: 'transparent',
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11 } },
        },
      },
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* Market Share                                                        */
/* ------------------------------------------------------------------ */

export function marketShareConfig(): AnyConfig {
  return {
    type: 'polarArea',
    data: {
      labels: marketShare.labels,
      datasets: [
        {
          label: 'Market Share by Quarter',
          data: marketShare.data,
          backgroundColor: marketShare.backgroundColor,
          borderColor: marketShare.borderColor,
          borderWidth: 2,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 10,
            color: 'rgba(255, 255, 255, 0.6)',
            backdropColor: 'transparent',
            callback: (value: number) => value + '%',
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12, weight: '600' } },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        legend: { display: false },
      },
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* Traffic Sources                                                     */
/* ------------------------------------------------------------------ */

export function trafficConfig(): AnyConfig {
  return {
    type: 'line',
    data: {
      labels: traffic.labels,
      datasets: traffic.series.map((s) => ({
        label: s.label,
        data: s.data,
        borderColor: s.borderColor,
        backgroundColor: s.backgroundColor,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: (value: number) => value / 1000 + 'K',
          },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#FFFFFF',
            padding: 12,
            font: { size: 10, weight: '500' },
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
      },
    },
  } as AnyConfig;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export function chartConfigMap(revenue: TrendSeries, users: TrendSeries) {
  return {
    revenueChart: revenueConfig(revenue),
    userChart: userConfig(users),
    categoryChart: categoryConfig(),
    performanceChart: performanceConfig(),
    marketShareChart: marketShareConfig(),
    trafficChart: trafficConfig(),
  };
}

/** Push a new period's data into an existing chart instance. */
export function applyTrend(chart: any, trend: TrendSeries) {
  chart.data.labels = trend.labels;
  if (chart.data.datasets[0]) {
    chart.data.datasets[0].label = trend.currentLabel;
    chart.data.datasets[0].data = trend.current as Series;
  }
  if (chart.data.datasets[1]) {
    chart.data.datasets[1].label = trend.previousLabel;
    chart.data.datasets[1].data = trend.previous as Series;
  }
}