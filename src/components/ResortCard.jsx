import React from 'react';

export default function ResortCard({ rank, resort, statsOnDate, onSelect }) {
  const { median_open_pct, p10_open_pct, p90_open_pct, glade_probability } = statsOnDate;
  const gladePercent = Math.round(glade_probability * 100);

  const gladeColor = gladePercent >= 70 ? 'var(--glade-green)' : gladePercent >= 40 ? 'var(--cyan-bright)' : 'var(--amber-gold)';
  const primaryRun = resort.iconic_runs[0];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${resort.name}: ${median_open_pct}% open, ${gladePercent}% glade readiness. Click for details.`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5), 0 0 15px var(--cyan-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--cyan-bright)',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              #{rank}
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              {resort.name}
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{resort.region}</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {resort.stats.average_snowfall_in}" Snow / yr
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Open</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {median_open_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Range: {p10_open_pct}% – {p90_open_pct}%
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Woods Readiness</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: gladeColor, marginTop: '2px' }}>
            {gladePercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {gladePercent >= 70 ? '🌲 Open & Viable' : gladePercent >= 35 ? '⚠️ Early / Thin' : '🚫 Dormant'}
          </div>
        </div>
      </div>

      {primaryRun && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Signature: <strong>{primaryRun.name}</strong></span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--cyan-bright)',
            fontWeight: 600
          }}>
            Opens ~{primaryRun.median_open_date}
          </span>
        </div>
      )}
    </div>
  );
}
