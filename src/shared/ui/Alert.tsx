import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type Tone = 'error' | 'success' | 'info';

const TONES: Record<Tone, string> = {
  error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-200',
  info: 'bg-surface-tint border-line text-ink',
};

const ICONS: Record<Tone, ReactNode> = {
  error: <AlertTriangle size={18} aria-hidden />,
  success: <CheckCircle2 size={18} aria-hidden />,
  info: <Info size={18} aria-hidden />,
};

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${TONES[tone]}`}
    >
      <span className="mt-0.5 shrink-0">{ICONS[tone]}</span>
      <div>{children}</div>
    </div>
  );
}
