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

const baseApi = window.DG_API_BASE ?? '/wp-json/dg/v1';

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

export const api = {
  getConfig(): Promise<ConfigResponse> {
    if (!configPromise) {
      configPromise = request<ConfigResponse>('/config');
    }
    return configPromise;
  },
  createHold(payload: HoldRequest): Promise<HoldResponse> {
    return request<HoldResponse>('/public_hold', {
      method: 'POST',
      body: JSON.stringify(payload),
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
