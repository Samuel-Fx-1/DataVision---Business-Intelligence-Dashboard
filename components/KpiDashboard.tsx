import Counter from './Counter';
import type { Kpi } from '@/lib/types';

interface KpiDashboardProps {
  kpis: Kpi[];
}

export default function KpiDashboard({ kpis }: KpiDashboardProps) {
  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">KEY PERFORMANCE INDICATORS</h2>
          <p className="section-subtitle">Real-time business metrics at a glance</p>
        </div>

        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <div className="kpi-card" key={kpi.label}>
              <div className="kpi-icon">
                <i className={kpi.icon} />
              </div>
              <div className="kpi-content">
                <Counter className="kpi-value" target={kpi.value} initial={kpi.initial} />
                <div className="kpi-label">{kpi.label}</div>
                <div className={`kpi-change ${kpi.direction}`}>
                  <i className={`fas fa-arrow-${kpi.direction === 'positive' ? 'up' : 'down'}`} />{' '}
                  {kpi.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}