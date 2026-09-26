import React from 'react';

export default function SkierToggle({ gladeFocus, setGladeFocus }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '0 0 24px 0'
    }}>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
        Displaying 10 Vermont Ski Mountains ranked by conditions on this date:
      </div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '4px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setGladeFocus(false)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: !gladeFocus ? 'var(--bg-surface-elevated)' : 'transparent',
            color: !gladeFocus ? 'var(--cyan-bright)' : 'var(--text-dim)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          ⛷️ All Mountain Terrain
        </button>
        <button
          onClick={() => setGladeFocus(true)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: gladeFocus ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: gladeFocus ? 'var(--glade-green)' : 'var(--text-dim)',
            border: gladeFocus ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🌲</span> Woods & Glades Priority
        </button>
      </div>
    </div>
  );
}
