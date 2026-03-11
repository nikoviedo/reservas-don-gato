import type { ReservationStatus } from '../types/api';

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={`status status-${status}`}>{status}</span>;
}
