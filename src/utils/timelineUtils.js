export const SEASON_START = new Date(2026, 9, 15); // Oct 15
export const SEASON_END = new Date(2027, 5, 1);   // Jun 1

export const PRESET_DATES = [
  { id: 'first_turns', label: 'First Turns (Oct/Nov)', dateStr: '11-15', dayIndex: 31 },
  { id: 'holiday_week', label: 'Holiday Week (Dec)', dateStr: '12-28', dayIndex: 74 },
  { id: 'mlk_weekend', label: 'MLK Weekend (Jan)', dateStr: '01-17', dayIndex: 94 },
  { id: 'presidents_day', label: 'Presidents Day (Feb)', dateStr: '02-15', dayIndex: 123 },
  { id: 'spring_moguls', label: 'Spring Moguls (Apr-Jun)', dateStr: '04-10', dayIndex: 177 },
];

export function dayIndexToDate(dayIndex) {
  const d = new Date(2026, 9, 15);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

export function formatDateLabel(d) {
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export function formatDateKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}
