import { useMemo } from 'react';

interface DayCalendarProps {
  blockedDates: string[];
  privateEvents: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function formatIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DayCalendar({ blockedDates, privateEvents, selectedDate, onSelectDate }: DayCalendarProps) {
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 21 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const iso = formatIso(d);
      return {
        iso,
        label: d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        blocked: blockedDates.includes(iso),
        isPrivateEvent: privateEvents.includes(iso),
      };
    });
  }, [blockedDates, privateEvents]);

  return (
    <div className="calendar-grid">
      {dates.map((day) => (
        <button
          key={day.iso}
          className={`calendar-day ${selectedDate === day.iso ? 'selected' : ''}`}
          onClick={() => onSelectDate(day.iso)}
          disabled={day.blocked}
          type="button"
        >
          <span>{day.label}</span>
          {day.isPrivateEvent && <small className="event-badge">EVENTO PRIVADO</small>}
        </button>
      ))}
    </div>
  );
}
