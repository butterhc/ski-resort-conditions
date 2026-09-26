import React, { useMemo } from 'react';

export default function SeasonalProgressionChart({ timeline, currentDayIndex }) {
  const width = 800;
  const height = 300;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const { p10Points, medianPoints, p90Points, gladePoints, cursorX } = useMemo(() => {
    const total = timeline.length;
    if (total === 0) return { p10Points: '', medianPoints: '', p90Points: '', gladePoints: '', cursorX: 0 };

    const getX = (idx) => padLeft + (idx / (total - 1)) * chartW;
    const getY = (val) => padTop + chartH - (val / 100) * chartH;

    let medPts = [];
    let p10Pts = [];
    let p90Pts = [];
    let gladePts = [];

    timeline.forEach((pt, i) => {
      const x = getX(i);
      medPts.push(`${x},${getY(pt.median_open_pct)}`);
      p10Pts.push(`${x},${getY(pt.p10_open_pct)}`);
      p90Pts.push(`${x},${getY(pt.p90_open_pct)}`);
      gladePts.push(`${x},${getY(pt.glade_probability * 100)}`);
    });

    const currX = getX(Math.min(currentDayIndex, total - 1));

    return {
      medianPoints: medPts.join(' '),
      p10Points: p10Pts.join(' '),
      p90Points: p90Pts.join(' '),
      gladePoints: gladePts.join(' '),
      cursorX: currX
    };
  }, [timeline, currentDayIndex]);

  const envelopePolygon = useMemo(() => {
    if (!timeline.length) return '';
    const total = timeline.length;
    const getX = (idx) => padLeft + (idx / (total - 1)) * chartW;
    const getY = (val) => padTop + chartH - (val / 100) * chartH;

    let top = [];
    let bottom = [];
    timeline.forEach((pt, i) => {
      top.push(`${getX(i)},${getY(pt.p90_open_pct)}`);
      bottom.unshift(`${getX(i)},${getY(pt.p10_open_pct)}`);
    });
    return top.concat(bottom).join(' ');
  }, [timeline]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padTop + chartH - (tick / 100) * chartH;
          return (
            <g key={tick}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={padLeft - 8} y={y + 4} fill="var(--text-dim)" fontSize="11" textAnchor="end">{tick}%</text>
            </g>
          );
        })}

        <polygon points={envelopePolygon} fill="rgba(56, 189, 248, 0.12)" />
        <polyline points={medianPoints} fill="none" stroke="#f8fafc" strokeWidth="2.5" />
        <polyline points={gladePoints} fill="none" stroke="var(--glade-green)" strokeWidth="3" filter="drop-shadow(0px 0px 4px rgba(16,185,129,0.7))" />

        <line x1={cursorX} y1={padTop} x2={cursorX} y2={height - padBottom} stroke="var(--cyan-bright)" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx={cursorX} cy={padTop + 4} r="4" fill="var(--cyan-bright)" />

        {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
          const x = padLeft + (idx / 8) * chartW;
          return (
            <text key={month} x={x} y={height - 12} fill="var(--text-dim)" fontSize="11" textAnchor="middle">
              {month}
            </text>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
          <span style={{ width: '14px', height: '3px', background: '#f8fafc', display: 'inline-block' }}></span> Median Open %
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--glade-green)' }}>
          <span style={{ width: '14px', height: '3px', background: 'var(--glade-green)', display: 'inline-block' }}></span> Glade Readiness Probability
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan-bright)' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(56, 189, 248, 0.25)', display: 'inline-block', borderRadius: '2px' }}></span> 10th–90th Percentile Range
        </span>
      </div>
    </div>
  );
}
