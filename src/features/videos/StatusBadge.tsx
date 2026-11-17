import { Spinner } from '../../shared/ui/Spinner';
import { STATUS_LABELS } from './status';
import type { VideoStatus } from './types';

// Paleta de status do DESIGN.md; no tema escuro, fundo com 15% de opacidade e texto mais claro.
const STYLES: Record<VideoStatus, { badge: string; dot: string }> = {
  PENDING_UPLOAD: {
    badge: 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-400/15 dark:border-slate-500/40 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  UPLOADED: {
    badge: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  QUEUED: {
    badge: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  PROCESSING: {
    badge: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300',
    dot: '',
  },
  COMPLETED: {
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    badge: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  EXPIRED: {
    badge: 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-500/15 dark:border-slate-600/40 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const style = STYLES[status];
  return (
    <span
      data-status={status}
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 font-mono text-[11px] font-medium uppercase tracking-wide ${style.badge}`}
    >
      {status === 'PROCESSING' ? (
        <Spinner size={10} label="" className="text-amber-600" />
      ) : (
        <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
