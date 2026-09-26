import React from 'react';
import { PRESET_DATES, dayIndexToDate, formatDateLabel } from '../utils/timelineUtils';

export default function DateScrubber({ dayIndex, setDayIndex }) {
  const currentDate = dayIndexToDate(dayIndex);
  const formattedDate = formatDateLabel(currentDate);

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
          Season Timeline Planner
        </h2>
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 16px',
          fontWeight: 700,
          color: 'var(--cyan-bright)',
          fontSize: '1.05rem',
          boxShadow: '0 0 15px var(--cyan-glow)'
        }}>
          🎯 Selected Target: {formattedDate}
        </div>
      </div>

      {/* Slider Bar */}
      <div style={{ position: 'relative', margin: '20px 0 12px 0' }}>
        <input
          type="range"
          min={0}
          max={229}
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          aria-label={`Season timeline date selector. Currently set to ${formattedDate}`}
          aria-valuemin={0}
          aria-valuemax={229}
          aria-valuenow={dayIndex}
          aria-valuetext={formattedDate}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #0284c7, #38bdf8, #10b981, #f59e0b, #38bdf8)',
            outline: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer'
          }}
        />
        {/* Milestone ticks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginTop: '8px',
          fontWeight: 600
        }}>
          <span>Oct (First Turns)</span>
          <span>Nov</span>
          <span>Dec (Holidays)</span>
          <span>Jan (Peak Powder)</span>
          <span>Feb (Presidents')</span>
          <span>Mar (Spring)</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun (Superstar Bumps)</span>
        </div>
      </div>

      {/* Quick Holiday Preset Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
        {PRESET_DATES.map((preset) => {
          const isSelected = Math.abs(dayIndex - preset.dayIndex) <= 2;
          return (
            <button
              key={preset.id}
              onClick={() => setDayIndex(preset.dayIndex)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
                color: isSelected ? 'var(--bg-deep)' : 'var(--text-main)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.82rem',
                border: isSelected ? '1px solid var(--cyan-bright)' : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? '0 0 12px var(--cyan-glow)' : 'none'
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
