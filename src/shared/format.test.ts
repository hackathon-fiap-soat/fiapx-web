import { formatBytes, formatDateTime, formatNumber } from './format';

describe('format', () => {
  it('formata bytes em pt-BR', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2,0 KB');
    expect(formatBytes(73_400_320)).toBe('70,0 MB');
    expect(formatBytes(3 * 1024 ** 3)).toBe('3,0 GB');
  });

  it('formata data e hora', () => {
    const { date, time } = formatDateTime('2026-11-16T12:00:00Z');
    expect(date).toMatch(/^\d{2}\/\d{2}\/2026$/);
    expect(time).toMatch(/^\d{2}:\d{2}$/);
    expect(formatDateTime('não é data')).toEqual({ date: '—', time: '' });
  });

  it('usa ponto como separador de milhar', () => {
    expect(formatNumber(14820)).toBe('14.820');
  });
});
