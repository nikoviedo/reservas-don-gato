import { FormEvent, useMemo, useState } from 'react';
import { Alert } from '../components/Alert';
import { DayCalendar } from '../components/DayCalendar';
import { TimeSlots } from '../components/TimeSlots';
import { useConfig } from '../hooks/useConfig';
import { api } from '../lib/api';

const FIXED_SLOTS = ['20:00', '20:30', '21:00', '21:30', '22:00'];

export function PublicBooking() {
  const { data: config, loading, error } = useConfig();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guests: 2,
    notes: '',
    event_type: '' as '' | 'cumpleanos' | 'juntada',
    without_table: false,
  });

  const slots = useMemo(() => FIXED_SLOTS, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!time) {
      setMessage({ type: 'error', text: 'Seleccioná un horario.' });
      return;
    }
    setSending(true);
    try {
      const res = await api.createHold({ ...form, date, time });
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al enviar reserva' });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p>Cargando configuración...</p>;
  if (error || !config) return <Alert type="error" message={error ?? 'No se pudo inicializar la app'} />;

  return (
    <section className="page">
      <h1>Reservá en Don Gato</h1>
      {config.reservation_notice && <Alert type="info" message={config.reservation_notice} />}
      <h2>1) Elegí fecha</h2>
      <DayCalendar
        blockedDates={config.blocked_dates}
        blockedRanges={config.blocked_ranges}
        privateEvents={config.private_events}
        selectedDate={date}
        onSelectDate={setDate}
      />
      <h2>2) Elegí horario</h2>
      <TimeSlots value={time} slots={slots} onChange={setTime} />

      <h2>3) Completá tus datos</h2>
      <form className="card" onSubmit={submit}>
        <input
          required
          placeholder="Nombre"
          value={form.customer_name}
          onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
        />
        <input
          required
          placeholder="WhatsApp"
          value={form.customer_phone}
          onChange={(e) => setForm((prev) => ({ ...prev, customer_phone: e.target.value }))}
        />
        <input
          type="email"
          placeholder="Email (opcional)"
          value={form.customer_email}
          onChange={(e) => setForm((prev) => ({ ...prev, customer_email: e.target.value }))}
        />
        <input
          type="number"
          min={config.min_party_size}
          max={config.max_party_size}
          value={form.guests}
          onChange={(e) => setForm((prev) => ({ ...prev, guests: Number(e.target.value) }))}
        />
        {config.allow_without_table && (
          <label>
            <input
              type="checkbox"
              checked={form.without_table}
              onChange={(e) => setForm((prev) => ({ ...prev, without_table: e.target.checked }))}
            />
            Reserva sin mesa
          </label>
        )}
        <textarea
          placeholder="Notas"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />
        <select
          value={form.event_type}
          onChange={(e) => setForm((prev) => ({ ...prev, event_type: e.target.value as '' | 'cumpleanos' | 'juntada' }))}
        >
          <option value="">Tipo de evento (opcional)</option>
          <option value="cumpleanos">Cumpleaños</option>
          <option value="juntada">Juntada</option>
        </select>
        <button type="submit" disabled={sending}>{sending ? 'Enviando...' : 'Confirmar reserva'}</button>
      </form>
      {message && <Alert type={message.type} message={message.text} />}
    </section>
  );
}
