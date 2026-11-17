const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** 73400320 → "70,0 MB". */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 ? 0 : 1;
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${UNITS[unit]}`;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** ISO 8601 → { date: "16/11/2026", time: "09:00" } no fuso do navegador. */
export function formatDateTime(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: '—', time: '' };
  return { date: dateFormatter.format(date), time: timeFormatter.format(date) };
}

/** Número com separador de milhar: 14820 → "14.820". */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}
