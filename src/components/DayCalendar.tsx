import { useMemo, useState } from 'react';

interface DayCalendarProps {
  blockedDates: string[];
  blockedRanges?: Array<{ from: string; to: string }>;
  privateEvents: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function fromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function firstDayGrid(monthDate: Date): Date {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);
  return gridStart;
}

export function DayCalendar({ blockedDates, blockedRanges = [], privateEvents, selectedDate, onSelectDate }: DayCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const selected = fromIso(selectedDate);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const privateEventsSet = useMemo(() => new Set(privateEvents), [privateEvents]);

  const days = useMemo(() => {
    const start = firstDayGrid(cursor);
    return Array.from({ length: 42 }, (_, idx) => {
      const date = new Date(start);
      date.setDate(start.getDate() + idx);
      const iso = toIso(date);
      const today = new Date();
      const beforeToday = new Date(date.getFullYear(), date.getMonth(), date.getDate()) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const inBlockedRange = blockedRanges.some((range) => {
        if (!range.from || !range.to) return false;
        const from = fromIso(range.from);
        const to = fromIso(range.to);
        return date >= from && date <= to;
      });

      return {
        iso,
        date,
        isCurrentMonth: date.getMonth() === cursor.getMonth(),
        isBlocked: beforeToday || blockedDateSet.has(iso) || inBlockedRange,
        isPrivateEvent: privateEventsSet.has(iso),
      };
    });
  }, [blockedDateSet, blockedRanges, cursor, privateEventsSet]);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button type="button" onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>{'<'}</button>
        <strong>{cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>{'>'}</button>
      </div>
      <div className="calendar-weekdays">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="calendar-grid">
        {days.map((day) => (
          <button
            key={day.iso}
            type="button"
            disabled={day.isBlocked || day.isPrivateEvent}
            className={`calendar-day ${selectedDate === day.iso ? 'selected' : ''} ${!day.isCurrentMonth ? 'outside-month' : ''}`}
            onClick={() => onSelectDate(day.iso)}
          >
            {day.date.getDate()}
            {day.isPrivateEvent && <small className="event-badge">PRIVADO</small>}
          </button>
        ))}
      </div>
      <p className="calendar-help">Podés bloquear fechas sueltas y también rangos desde/hasta.</p>
    </div>
  );
}
