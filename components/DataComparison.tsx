import type { ComparisonCard, Region } from '@/lib/types';

interface DataComparisonProps {
  comparison: ComparisonCard;
  regions: Region[];
}

export default function DataComparison({ comparison, regions }: DataComparisonProps) {
  return (
    <section className="comparison-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">DATA COMPARISON</h2>
          <p className="section-subtitle">Quarter over quarter analysis</p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card">
            <div className="comparison-header">
              <h3>{comparison.title}</h3>
            </div>
            <div className="comparison-content">
              {comparison.items.map((item) => (
                <div className="comparison-item" key={item.label}>
                  <span className="comparison-label">{item.label}</span>
                  <div className="comparison-bars">
                    <div className="comparison-bar" style={{ width: `${item.current.width}%` }}>
                      <span>{item.current.text}</span>
                    </div>
                    <div
                      className="comparison-bar secondary"
                      style={{ width: `${item.previous.width}%` }}
                    >
                      <span>{item.previous.text}</span>
                    </div>
                  </div>
                  <span className={`comparison-diff ${item.direction}`}>{item.diff}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="comparison-card">
            <div className="comparison-header">
              <h3>Regional Performance</h3>
            </div>
            <div className="regional-stats">
              {regions.map((region) => (
                <div className="regional-item" key={region.key}>
                  <div className="regional-info">
                    <span className="region-name">{region.name}</span>
                    <span className="region-value">{region.value}</span>
                  </div>
                  <div className="regional-bar">
                    <div
                      className="regional-fill"
                      style={{ width: `${region.percentage}%` }}
                      data-region={region.key}
                    />
                  </div>
                  <span className="region-percentage">{region.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}