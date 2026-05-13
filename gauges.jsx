// Gauges row: 5 horizontal bars with icons + values. Top-left HUD.

function Gauges({ gauges, compact = false }) {
  return (
    <div className={"gauges " + (compact ? "gauges-compact" : "")}>
      {GAUGE_DEFS.map((g) => {
        const v = Math.round(gauges[g.key] || 0);
        const danger = v < 30;
        const alert = v < 10;
        return (
          <div key={g.key} className={"gauge " + (alert ? "gauge-alert" : danger ? "gauge-danger" : "")}>
            <div className="gauge-icon" aria-hidden="true">{g.icon}</div>
            <div className="gauge-body">
              <div className="gauge-meta">
                <span className="gauge-label">{g.label}</span>
                <span className="gauge-val">{v}<span className="gauge-max">/100</span></span>
              </div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: v + '%', background: g.color }} />
                <div className="gauge-ticks">
                  {[20, 40, 60, 80].map((t) => <span key={t} style={{ left: t + '%' }} />)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.Gauges = Gauges;
