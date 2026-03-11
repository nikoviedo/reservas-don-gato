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

function normalizeConfig(config: ConfigResponse): ConfigResponse {
  return {
    ...config,
    open_days: Array.isArray(config.open_days) ? config.open_days : [],
    opening_hours: Array.isArray(config.opening_hours) ? config.opening_hours : [],
    blocked_dates: Array.isArray(config.blocked_dates) ? config.blocked_dates : [],
    blocked_ranges: Array.isArray(config.blocked_ranges) ? config.blocked_ranges : [],
    private_events: Array.isArray(config.private_events) ? config.private_events : [],
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

  const data = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) {
    const message = data?.message ?? `Error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

let configPromise: Promise<ConfigResponse> | null = null;

function toBackendHoldPayload(payload: HoldRequest) {
  return {
    ...payload,
    name: payload.customer_name,
    phone: payload.customer_phone,
    pax: payload.guests,
    tableId: payload.without_table ? null : undefined,
  };
}

export const api = {
  getConfig(): Promise<ConfigResponse> {
    if (!configPromise) {
      configPromise = request<ConfigResponse>('/config').then((config) => normalizeConfig(config));
    }
    return configPromise;
  },
  createHold(payload: HoldRequest): Promise<HoldResponse> {
    return request<HoldResponse>('/public_hold', {
      method: 'POST',
      body: JSON.stringify(toBackendHoldPayload(payload)),
    });
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
