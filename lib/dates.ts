function monthToInt(raw: string) {
  const normalized = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const map: Record<string, number> = {
    ene: 1,
    enero: 1,
    feb: 2,
    febrero: 2,
    mar: 3,
    marzo: 3,
    abr: 4,
    abril: 4,
    may: 5,
    mayo: 5,
    jun: 6,
    junio: 6,
    jul: 7,
    julio: 7,
    ago: 8,
    agosto: 8,
    sep: 9,
    sept: 9,
    septiembre: 9,
    set: 9,
    setiembre: 9,
    oct: 10,
    octubre: 10,
    nov: 11,
    noviembre: 11,
    dic: 12,
    diciembre: 12,
  };

  return map[normalized] ?? map[normalized.slice(0, 3)] ?? 0;
}

export function normalizeDate(input: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const slash = input.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]);
    const year = Number(slash[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }

  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const explicitYear = normalized.match(/\b(\d{4})\b/);
  const dashStyle = normalized.match(/\b(\d{1,2})\s*-\s*([a-z]{3,})\b/);
  if (dashStyle) {
    const day = Number(dashStyle[1]);
    const month = monthToInt(dashStyle[2]);
    const year = explicitYear ? Number(explicitYear[1]) : new Date().getFullYear();
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function weekdayFromDate(date: string) {
  return new Date(`${date}T00:00:00-03:00`).getDay();
}
