import React, { useState, useEffect, useMemo } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import DateScrubber from './components/DateScrubber';
import SkierToggle from './components/SkierToggle';
import ResortCard from './components/ResortCard';
import ResortDetailModal from './components/ResortDetailModal';
import ResortComparison from './components/ResortComparison';
import { dayIndexToDate, formatDateKey } from './utils/timelineUtils';

export default function App() {
  const [baselineData, setBaselineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planner');
  const [dayIndex, setDayIndex] = useState(94); // Default to MLK Weekend (~Jan 17)
  const [gladeFocus, setGladeFocus] = useState(false);
  const [selectedResort, setSelectedResort] = useState(null);

  useEffect(() => {
    const dataUrl = `${import.meta.env.BASE_URL}data/vermont_ski_baseline.json`;
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Baseline data not found');
        return res.json();
      })
      .then((data) => {
        setBaselineData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // P2.3: Build O(1) lookup maps for timeline data instead of O(n) Array.find()
  const timelineMaps = useMemo(() => {
    if (!baselineData?.resorts) return {};
    const maps = {};
    for (const resort of baselineData.resorts) {
      const dateMap = new Map();
      for (const point of resort.timeline) {
        dateMap.set(point.date, point);
      }
      maps[resort.id] = dateMap;
    }
    return maps;
  }, [baselineData]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--cyan-bright)' }}>
        Loading Vermont Ski Terrain Baseline...
      </div>
    );
  }

  if (!baselineData || !baselineData.resorts) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--ruby-red)' }}>
        Failed to load baseline data. Please run: <code>python pipeline/generate_baseline.py</code>
      </div>
    );
  }

  const currentDate = dayIndexToDate(dayIndex);
  const dateKey = formatDateKey(currentDate);

  const getStatsOnDate = (resort) => {
    const map = timelineMaps[resort.id];
    return map?.get(dateKey) || resort.timeline[0];
  };

  const rankedResorts = [...baselineData.resorts].sort((a, b) => {
    const statsA = getStatsOnDate(a);
    const statsB = getStatsOnDate(b);
    if (gladeFocus) {
      return statsB.glade_probability - statsA.glade_probability;
    }
    return statsB.median_open_pct - statsA.median_open_pct;
  });

  return (
    <ErrorBoundary>
      {/* Skip-to-content link for keyboard users (WCAG 2.1 AA) */}
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px', ':focus': { left: '10px', top: '10px' } }}>
        Skip to main content
      </a>
      <div className="container" style={{ paddingBottom: '60px' }}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main id="main-content">
          {activeTab === 'planner' ? (
            <>
              <DateScrubber dayIndex={dayIndex} setDayIndex={setDayIndex} />
              <SkierToggle gladeFocus={gladeFocus} setGladeFocus={setGladeFocus} />

              <div
                role="list"
                aria-label="Vermont ski resorts ranked by conditions"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '20px'
                }}
              >
                {rankedResorts.map((resort, idx) => (
                  <ResortCard
                    key={resort.id}
                    rank={idx + 1}
                    resort={resort}
                    statsOnDate={getStatsOnDate(resort)}
                    onSelect={() => setSelectedResort(resort)}
                  />
                ))}
              </div>
            </>
          ) : (
            <ResortComparison
              resorts={baselineData.resorts}
              onSelectResort={(resort) => setSelectedResort(resort)}
            />
          )}
        </main>

        {selectedResort && (
          <ResortDetailModal
            resort={selectedResort}
            currentDayIndex={dayIndex}
            statsOnDate={getStatsOnDate(selectedResort)}
            onClose={() => setSelectedResort(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
