import { useMemo, useState } from 'react';
import type { ReservationStatus, StaffReservation } from '../types/api';
import { StatusBadge } from './StatusBadge';

type Sortable = keyof Pick<StaffReservation, 'customer_name' | 'date' | 'time' | 'guests' | 'status' | 'created_at'>;

interface StaffTableProps {
  rows: StaffReservation[];
  onStatusChange: (reservationId: number, status: ReservationStatus) => void;
}

export function StaffTable({ rows, onStatusChange }: StaffTableProps) {
  const [sortBy, setSortBy] = useState<Sortable>('date');
  const [desc, setDesc] = useState(false);

  const sorted = useMemo(() => {
    const clone = [...rows];
    clone.sort((a, b) => {
      const aVal = String(a[sortBy]);
      const bVal = String(b[sortBy]);
      return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    });
    return clone;
  }, [rows, sortBy, desc]);

  const applySort = (key: Sortable) => {
    if (sortBy === key) {
      setDesc((v) => !v);
    } else {
      setSortBy(key);
      setDesc(false);
    }
  };

  return (
    <>
      <table className="staff-table desktop-only">
        <thead>
          <tr>
            <th><button type="button" onClick={() => applySort('customer_name')}>Cliente</button></th>
            <th><button type="button" onClick={() => applySort('date')}>Fecha</button></th>
            <th><button type="button" onClick={() => applySort('time')}>Hora</button></th>
            <th><button type="button" onClick={() => applySort('guests')}>Personas</button></th>
            <th><button type="button" onClick={() => applySort('status')}>Estado</button></th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id}>
              <td>{item.customer_name}</td>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>{item.guests}</td>
              <td><StatusBadge status={item.status} /></td>
              <td>
                <select value={item.status} onChange={(e) => onStatusChange(item.id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mobile-accordion mobile-only">
        {sorted.map((item) => (
          <details key={item.id}>
            <summary>
              {item.customer_name} · {item.date} {item.time}
            </summary>
            <p>Personas: {item.guests}</p>
            <p>Teléfono: {item.customer_phone}</p>
            <p><StatusBadge status={item.status} /></p>
            <select value={item.status} onChange={(e) => onStatusChange(item.id, e.target.value)}>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </details>
        ))}
      </div>
    </>
  );
}
