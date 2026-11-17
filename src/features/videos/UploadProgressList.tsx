import { AlertTriangle, CheckCircle2, Clapperboard, Hourglass } from 'lucide-react';
import { formatBytes } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import type { UploadItem } from './useUploads';

function phaseText(item: UploadItem): string {
  switch (item.phase) {
    case 'waiting':
      return 'Na fila de envio';
    case 'requesting':
      return 'Preparando envio…';
    case 'uploading':
      return `${item.progress}%`;
    case 'done':
      return 'Enviado';
    case 'error':
      return 'Falhou';
  }
}

function Icon({ item }: { item: UploadItem }) {
  if (item.phase === 'done') return <CheckCircle2 size={18} className="text-emerald-600" aria-hidden />;
  if (item.phase === 'error') return <AlertTriangle size={18} className="text-rose-600" aria-hidden />;
  if (item.phase === 'waiting') return <Hourglass size={18} className="text-muted" aria-hidden />;
  return <Clapperboard size={18} className="text-primary" aria-hidden />;
}

/** Cards dos envios: nome, tamanho e barra de progresso individual. */
export function UploadProgressList({ items, inProgress, onClear }: { items: UploadItem[]; inProgress: number; onClear: () => void }) {
  if (items.length === 0) return null;
  const finished = items.length - inProgress;
  return (
    <section aria-labelledby="uploads-titulo" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="uploads-titulo" className="font-display text-xl font-semibold text-ink">
            Uploads em andamento
          </h2>
          <span className="rounded-full bg-surface-tint px-2 py-0.5 font-mono text-xs text-ink">{inProgress} ativos</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">Máximo 3 simultâneos</span>
          {finished > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Limpar concluídos
            </Button>
          )}
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.key} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 shadow-card" aria-label={`Envio de ${item.name}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <Icon item={item} />
                <span className="truncate text-sm font-medium text-ink" title={item.name}>
                  {item.name}
                </span>
              </span>
              <span
                className={`shrink-0 font-mono text-xs ${item.phase === 'error' ? 'text-rose-700 dark:text-rose-300' : 'text-primary-ink'}`}
                aria-live="polite"
              >
                {phaseText(item)}
              </span>
            </div>
            <span className="font-mono text-xs text-muted">{formatBytes(item.size)}</span>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
              role="progressbar"
              aria-label={`Progresso de ${item.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.progress}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${item.phase === 'error' ? 'bg-rose-500' : item.phase === 'done' ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{ width: `${item.phase === 'error' ? 100 : item.progress}%` }}
              />
            </div>
            {item.error && <p className="text-xs text-rose-700 dark:text-rose-300">{item.error}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
