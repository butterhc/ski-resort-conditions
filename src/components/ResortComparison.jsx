import React, { useState } from 'react';

export default function ResortComparison({ resorts, onSelectResort }) {
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('snowfall');

  const filtered = resorts.filter((r) => {
    if (filterRegion === 'north') return r.region.includes('Northern');
    if (filterRegion === 'south') return r.region.includes('Southern') || r.region.includes('Central');
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'snowfall') return b.stats.average_snowfall_in - a.stats.average_snowfall_in;
    if (sortBy === 'vertical') return b.stats.vertical_drop_ft - a.stats.vertical_drop_ft;
    if (sortBy === 'glades') return b.stats.glades_acres - a.stats.glades_acres;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterRegion('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'all' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'all' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            All Vermont Mountains
          </button>
          <button
            onClick={() => setFilterRegion('north')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'north' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'north' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Northern Powder Spine
          </button>
          <button
            onClick={() => setFilterRegion('south')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'south' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'south' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Central & Southern Hubs
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px'
            }}
          >
            <option value="snowfall">Annual Snowfall</option>
            <option value="vertical">Vertical Drop</option>
            <option value="glades">Glades Acreage</option>
            <option value="name">Resort Name</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
              <th style={{ padding: '12px 16px' }}>Resort</th>
              <th style={{ padding: '12px 16px' }}>Annual Snow</th>
              <th style={{ padding: '12px 16px' }}>Summit Vert</th>
              <th style={{ padding: '12px 16px' }}>Glades Acres</th>
              <th style={{ padding: '12px 16px' }}>MLK Woods Odds</th>
              <th style={{ padding: '12px 16px' }}>Presidents' Woods</th>
              <th style={{ padding: '12px 16px' }}>Trophy Run</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const run = r.iconic_runs[0];
              const mlkOdds = run ? Math.round(run.holiday_odds.mlk_weekend * 100) : 50;
              const presOdds = run ? Math.round(run.holiday_odds.presidents_day * 100) : 80;

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectResort(r)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--cyan-bright)' }}>{r.stats.average_snowfall_in}"</td>
                  <td style={{ padding: '14px 16px' }}>{r.stats.vertical_drop_ft}'</td>
                  <td style={{ padding: '14px 16px', color: 'var(--glade-green)' }}>{r.stats.glades_acres} ac</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: mlkOdds >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)',
                      color: mlkOdds >= 70 ? 'var(--glade-green)' : 'var(--cyan-bright)',
                      fontWeight: 700
                    }}>
                      {mlkOdds}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: presOdds >= 85 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: presOdds >= 85 ? 'var(--glade-green)' : 'var(--amber-gold)',
                      fontWeight: 700
                    }}>
                      {presOdds}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{run ? run.name : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
