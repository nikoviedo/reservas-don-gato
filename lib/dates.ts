export function normalizeDate(input: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function weekdayFromDate(date: string) {
  return new Date(`${date}T00:00:00-03:00`).getDay();
}
