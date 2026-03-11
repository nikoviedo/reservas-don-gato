import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Alert } from '../components/Alert';
import { StaffTable } from '../components/StaffTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { api } from '../lib/api';
import type { ReservationStatus, StaffReservation, StaffSettings } from '../types/api';

const StaffSettingsForm = lazy(async () => {
  const mod = await import('../components/StaffSettingsForm');
  return { default: mod.StaffSettingsForm };
});

export function Staff() {
  const [rows, setRows] = useState<StaffReservation[]>([]);
  const [settings, setSettings] = useState<StaffSettings | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const textDebounced = useDebouncedValue(text);

  useEffect(() => {
    Promise.all([api.getStaffReservations(), api.getStaffSettings()])
      .then(([reservations, cfg]) => {
        setRows(reservations);
        setSettings(cfg);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error cargando staff'));
  }, []);

  const filtered = useMemo(() => {
    const query = textDebounced.trim().toLowerCase();
    return rows.filter((row) => {
      const matchStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchText =
        query.length === 0 ||
        row.customer_name.toLowerCase().includes(query) ||
        row.customer_phone.toLowerCase().includes(query);
      return matchStatus && matchText;
    });
  }, [rows, statusFilter, textDebounced]);

  async function handleStatus(reservationId: number, status: ReservationStatus) {
    try {
      await api.updateReservationStatus({ reservation_id: reservationId, status });
      setRows((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status } : r)));
      setOkMessage('Estado actualizado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar estado');
    }
  }

  async function saveSettings(payload: StaffSettings) {
    await api.saveStaffSettings(payload);
    setSettings(payload);
    setOkMessage('Settings guardados');
  }

  return (
    <section className="page">
      <h1>Panel Staff</h1>
      {error && <Alert type="error" message={error} />}
      {okMessage && <Alert type="success" message={okMessage} />}

      <div className="toolbar card">
        <input
          placeholder="Buscar por nombre o teléfono"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <StaffTable rows={filtered} onStatusChange={handleStatus} />

      {settings && (
        <Suspense fallback={<p>Cargando settings...</p>}>
          <StaffSettingsForm initial={settings} onSubmit={saveSettings} />
        </Suspense>
      )}
    </section>
  );
}
