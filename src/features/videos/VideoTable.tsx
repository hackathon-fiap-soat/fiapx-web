import { AlertTriangle, CheckCircle2, Download, Hourglass, PlayCircle } from 'lucide-react';
import { formatBytes, formatDateTime, formatNumber } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { StatusBadge } from './StatusBadge';
import { failureMessage } from './status';
import type { Video } from './types';

function RowIcon({ video }: { video: Video }) {
  const base = 'flex size-10 shrink-0 items-center justify-center rounded-lg';
  if (video.status === 'COMPLETED') return <span className={`${base} bg-surface-tint text-primary-ink`}><CheckCircle2 size={20} aria-hidden /></span>;
  if (video.status === 'FAILED') return <span className={`${base} bg-rose-50 text-rose-600 dark:bg-rose-500/15`}><AlertTriangle size={20} aria-hidden /></span>;
  if (video.status === 'PROCESSING') return <span className={`${base} bg-amber-50 text-amber-600 dark:bg-amber-500/15`}><Hourglass size={20} aria-hidden /></span>;
  return <span className={`${base} bg-surface-tint text-muted`}><PlayCircle size={20} aria-hidden /></span>;
}

interface VideoTableProps {
  videos: Video[];
  onDownload: (video: Video) => void;
  downloadingId: string | null;
}

/** Tabela "Meus vídeos": nome, data de envio, status, frames e o botão de download. */
export function VideoTable({ videos, onDownload, downloadingId }: VideoTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-surface-tint">
          <tr className="font-mono text-xs uppercase tracking-wider text-muted">
            <th scope="col" className="px-4 py-3 font-medium">Vídeo</th>
            <th scope="col" className="px-4 py-3 font-medium">Data de envio</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Frames extraídos</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {videos.map((video) => {
            const { date, time } = formatDateTime(video.created_at);
            return (
              <tr key={video.id} data-testid="video-row" className={video.status === 'PROCESSING' ? 'bg-amber-50/30 dark:bg-amber-500/5' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <RowIcon video={video} />
                    <div className="min-w-0">
                      <p className="max-w-[280px] truncate font-medium text-ink" title={video.original_name}>
                        {video.original_name}
                      </p>
                      <p className="font-mono text-xs text-muted">{formatBytes(video.size_bytes)}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink">
                  {date}
                  {time && <span className="block text-muted">às {time}</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={video.status} />
                  {video.status === 'FAILED' && (
                    <p className="mt-1 max-w-[320px] text-xs text-rose-700 dark:text-rose-300">{failureMessage(video)}</p>
                  )}
                  {video.status === 'EXPIRED' && <p className="mt-1 text-xs text-muted">O envio não foi feito em 1 hora.</p>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink">
                  {video.frame_count !== null ? `${formatNumber(video.frame_count)} frames` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {video.status === 'COMPLETED' ? (
                    <Button
                      size="sm"
                      icon={<Download size={14} aria-hidden />}
                      loading={downloadingId === video.id}
                      onClick={() => onDownload(video)}
                      aria-label={`Baixar ZIP de ${video.original_name}`}
                    >
                      Baixar ZIP
                    </Button>
                  ) : (
                    <span className="text-xs italic text-muted">{video.status === 'FAILED' || video.status === 'EXPIRED' ? '—' : 'Aguardando'}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
