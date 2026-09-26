import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--cyan-bright), #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px var(--cyan-glow)'
        }}>
          <span style={{ fontSize: '20px' }}>🏔️</span>
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Vermont Terrain & Glade Predictor
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--glade-green)',
              boxShadow: '0 0 8px var(--glade-green)'
            }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pre-Season Calibrated Estimates • Expert-Curated Resort Profiles & Terrain Analysis
            </span>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('planner')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'planner' ? 'var(--bg-surface-elevated)' : 'transparent',
            color: activeTab === 'planner' ? 'var(--cyan-bright)' : 'var(--text-muted)',
            border: activeTab === 'planner' ? '1px solid var(--border-active)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Trip Planner
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'matrix' ? 'var(--bg-surface-elevated)' : 'transparent',
            color: activeTab === 'matrix' ? 'var(--cyan-bright)' : 'var(--text-muted)',
            border: activeTab === 'matrix' ? '1px solid var(--border-active)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Resort Comparison Matrix
        </button>
      </nav>
    </header>
  );
}
