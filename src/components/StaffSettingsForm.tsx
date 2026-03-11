import { FormEvent, useState } from 'react';
import type { StaffSettings } from '../types/api';

interface StaffSettingsFormProps {
  initial: StaffSettings;
  onSubmit: (settings: StaffSettings) => Promise<void>;
}

export function StaffSettingsForm({ initial, onSubmit }: StaffSettingsFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="settings-card" onSubmit={handleSubmit}>
      <label>
        <input
          type="checkbox"
          checked={form.allow_without_table}
          onChange={(e) => setForm((prev) => ({ ...prev, allow_without_table: e.target.checked }))}
        />
        Habilitar modo sin mesa
      </label>
      <label>
        <input
          type="checkbox"
          checked={form.whatsapp_enabled}
          onChange={(e) => setForm((prev) => ({ ...prev, whatsapp_enabled: e.target.checked }))}
        />
        Notificaciones WhatsApp
      </label>
      <label>
        Estado por defecto
        <select
          value={form.default_status}
          onChange={(e) => setForm((prev) => ({ ...prev, default_status: e.target.value }))}
        >
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
        </select>
      </label>
      <label>
        Mensaje visible
        <textarea
          value={form.reservation_notice ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, reservation_notice: e.target.value }))}
        />
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar settings'}</button>
    </form>
  );
}
