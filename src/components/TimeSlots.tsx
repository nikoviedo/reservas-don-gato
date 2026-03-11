interface TimeSlotsProps {
  value: string;
  slots: string[];
  onChange: (slot: string) => void;
}

export function TimeSlots({ value, slots, onChange }: TimeSlotsProps) {
  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          className={`slot ${slot === value ? 'selected' : ''}`}
          onClick={() => onChange(slot)}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
