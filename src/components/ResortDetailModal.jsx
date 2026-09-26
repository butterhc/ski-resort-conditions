import React, { useEffect, useRef } from 'react';
import SeasonalProgressionChart from './SeasonalProgressionChart';

export default function ResortDetailModal({ resort, currentDayIndex, statsOnDate, onClose }) {
  if (!resort) return null;

  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Focus the modal container on mount for accessibility
    if (modalRef.current) modalRef.current.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { stats, iconic_runs, timeline } = resort;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${resort.name} detailed terrain and glade analysis`}
      style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--cyan-glow)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
              {resort.name}
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 {resort.region}
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ⛰️ Summit: {stats.summit_elevation_ft}' | Vert: {stats.vertical_drop_ft}'
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--cyan-bright)' }}>
                ❄️ Annual Snow: {stats.average_snowfall_in}"
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--glade-green)' }}>
                🌲 Glades: {stats.glades_acres} Acres
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close resort modal"
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
            Seasonal Terrain & Glade Opening Curve (Oct 15 – Jun 1)
          </h3>
          <SeasonalProgressionChart timeline={timeline} currentDayIndex={currentDayIndex} />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Terrain Composition Split on Selected Date
          </h4>
          <div style={{ display: 'flex', height: '14px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${statsOnDate.snowmaking_pct}%`, background: 'var(--cyan-bright)' }} title={`Snowmaking: ${statsOnDate.snowmaking_pct}%`} />
            <div style={{ width: `${statsOnDate.natural_pct}%`, background: 'var(--glade-green)' }} title={`Natural/Glades: ${statsOnDate.natural_pct}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-dim)' }}>
            <span>⚡ Snowmaking Cruisers: {statsOnDate.snowmaking_pct}%</span>
            <span>🌲 Natural Snow & Woods: {statsOnDate.natural_pct}%</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Signature & Rare Terrain Unlock Tracker
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {iconic_runs.map((run, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{run.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--amber-gold)', fontWeight: 600 }}>{run.difficulty}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
                  Needs: <strong>{run.min_base_in}" base</strong> | Median Open: <strong>{run.median_open_date}</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>MLK Weekend Odds:</span>
                    <strong style={{ color: run.holiday_odds.mlk_weekend >= 0.7 ? 'var(--glade-green)' : 'var(--cyan-bright)' }}>
                      {Math.round(run.holiday_odds.mlk_weekend * 100)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Presidents' Day Odds:</span>
                    <strong style={{ color: run.holiday_odds.presidents_day >= 0.85 ? 'var(--glade-green)' : 'var(--cyan-bright)' }}>
                      {Math.round(run.holiday_odds.presidents_day * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
