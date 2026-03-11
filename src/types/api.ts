export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;

export interface ConfigResponse {
  timezone: string;
  locale: string;
  slot_minutes: number;
  open_days: string[];
  opening_hours: Array<{ day: string; from: string; to: string }>;
  blocked_dates: string[];
  blocked_ranges?: Array<{ from: string; to: string }>;
  private_events: string[];
  allow_without_table: boolean;
  max_party_size: number;
  min_party_size: number;
  reservation_notice?: string;
}

export interface HoldRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  event_type?: 'cumpleanos' | 'juntada' | '';
  without_table?: boolean;
}

export interface HoldResponse {
  success: boolean;
  message: string;
  reservation_key?: string;
}

export interface PublicConfirmResponse {
  success: boolean;
  message: string;
}

export interface StaffReservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  without_table: boolean;
  notes?: string;
  created_at: string;
}

export interface StaffReservationsResponse {
  items: StaffReservation[];
}

export interface UpdateStatusRequest {
  reservation_id: number;
  status: ReservationStatus;
}

export interface StaffSettings {
  allow_without_table: boolean;
  default_status: ReservationStatus;
  whatsapp_enabled: boolean;
  reservation_notice?: string;
}

export interface ApiError {
  message: string;
}
