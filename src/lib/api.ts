import type {
  ConfigResponse,
  HoldRequest,
  HoldResponse,
  PublicConfirmResponse,
  StaffReservation,
  StaffReservationsResponse,
  StaffSettings,
  UpdateStatusRequest,
} from '../types/api';

declare global {
  interface Window {
    DG_API_BASE?: string;
    DG_NONCE?: string;
  }
}

const baseApi = (window.DG_API_BASE ?? import.meta.env.VITE_API_BASE ?? '/wp-json/dg/v1').replace(/\/$/, '');

function normalizeConfig(config: Record<string, unknown>): ConfigResponse {
  const blockedDates = Array.isArray(config.blocked_dates)
    ? (config.blocked_dates as string[])
    : Array.isArray(config.disabledDates)
      ? (config.disabledDates as string[])
      : [];

  const privateEvents = Array.isArray(config.private_events)
    ? (config.private_events as string[])
    : config.blockedEvents && typeof config.blockedEvents === 'object'
      ? Object.keys(config.blockedEvents as Record<string, string>)
      : [];

  return {
    timezone: String(config.timezone ?? 'America/Argentina/Buenos_Aires'),
    locale: String(config.locale ?? 'es-AR'),
    slot_minutes: Number(config.slot_minutes ?? 30),
    open_days: Array.isArray(config.open_days) ? (config.open_days as string[]) : [],
    opening_hours: Array.isArray(config.opening_hours)
      ? (config.opening_hours as Array<{ day: string; from: string; to: string }>)
      : [],
    blocked_dates: blockedDates,
    blocked_ranges: Array.isArray(config.blocked_ranges)
      ? (config.blocked_ranges as Array<{ from: string; to: string }>)
      : [],
    private_events: privateEvents,
    allow_without_table:
      typeof config.allow_without_table === 'boolean'
        ? config.allow_without_table
        : !(config.enableTableSelection as boolean),
    max_party_size: Number(config.max_party_size ?? 20),
    min_party_size: Number(config.min_party_size ?? 1),
    reservation_notice: typeof config.reservation_notice === 'string' ? config.reservation_notice : undefined,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseApi}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(window.DG_NONCE ? { 'X-WP-Nonce': window.DG_NONCE } : {}),
      ...init?.headers,
    },
    ...init,
  });

  const data = (await res.json().catch(() => ({}))) as T & { message?: string; error?: string };
  if (!res.ok) {
    const message = data?.message ?? data?.error ?? `Error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

let configPromise: Promise<ConfigResponse> | null = null;

function toBackendHoldPayload(payload: HoldRequest) {
  return {
    name: payload.customer_name,
    phone: payload.customer_phone,
    date: payload.date,
    time: payload.time,
    pax: payload.guests,
    notes: payload.notes,
    event_type: payload.event_type,
    tableId: payload.without_table ? null : undefined,
  };
}

export const api = {
  getConfig(): Promise<ConfigResponse> {
    if (!configPromise) {
      configPromise = request<Record<string, unknown>>('/config').then((config) => normalizeConfig(config));
    }
    return configPromise;
  },
  async createHold(payload: HoldRequest): Promise<HoldResponse> {
    const res = await request<{ ok?: boolean; code?: string; status?: string; success?: boolean; message?: string }>('/public_hold', {
      method: 'POST',
      body: JSON.stringify(toBackendHoldPayload(payload)),
    });

    if (typeof res.success === 'boolean') return res as HoldResponse;

    return {
      success: Boolean(res.ok),
      message: res.ok ? `Reserva creada (${res.code ?? 'sin código'})` : 'No se pudo crear la reserva',
      reservation_key: res.code,
    };
  },
  confirmReservation(key: string): Promise<PublicConfirmResponse> {
    return request<PublicConfirmResponse>(`/public_confirm?key=${encodeURIComponent(key)}`);
  },
  getStaffReservations(): Promise<StaffReservation[]> {
    return request<StaffReservationsResponse>('/staff_reservations').then((r) => r.items ?? []);
  },
  updateReservationStatus(payload: UpdateStatusRequest): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/staff_reservation_status', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getStaffSettings(): Promise<StaffSettings> {
    return request<StaffSettings>('/staff_settings');
  },
  saveStaffSettings(payload: StaffSettings): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/staff_settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
