import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CircleUserRound, RefreshCw, VideoOff } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { videosApi } from '../features/videos/api';
import { triggerDownload, zipNameFor } from '../features/videos/download';
import { hasPendingVideos, POLL_INTERVAL_MS, STATUS_LABELS } from '../features/videos/status';
import type { Video, VideoStatus } from '../features/videos/types';
import { VIDEO_STATUSES } from '../features/videos/types';
import { UploadDropzone } from '../features/videos/UploadDropzone';
import { UploadProgressList } from '../features/videos/UploadProgressList';
import { useUploads } from '../features/videos/useUploads';
import { VideoTable } from '../features/videos/VideoTable';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { Button } from '../shared/ui/Button';
import { Spinner } from '../shared/ui/Spinner';

const PER_PAGE_OPTIONS = [10, 25, 50] as const;

/** Painel "Meus vídeos": upload múltiplo, lista com status atualizada sozinha e download do zip. */
export function VideosPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<VideoStatus | ''>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['videos', { status, page, perPage }],
    queryFn: ({ signal }) => videosApi.list({ status: status || undefined, page, perPage }, signal),
    placeholderData: keepPreviousData,
    refetchInterval: (q) => (hasPendingVideos(q.state.data?.data) ? POLL_INTERVAL_MS : false),
  });

  const refreshList = () => void queryClient.invalidateQueries({ queryKey: ['videos'] });
  const uploads = useUploads({ onChange: refreshList });

  const videos = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const polling = hasPendingVideos(videos);
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(total, page * perPage);

  async function handleDownload(video: Video) {
    setDownloadError(null);
    setDownloadingId(video.id);
    try {
      const link = await videosApi.downloadLink(video.id);
      triggerDownload(link.url, zipNameFor(video.original_name));
    } catch (err) {
      setDownloadError(err instanceof ApiError ? err.message : 'Não foi possível gerar o link de download.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-8">
      <div className="flex flex-col gap-3 rounded-xl bg-surface-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-ink">
          <CircleUserRound size={20} className="text-muted" aria-hidden />
          <span>
            Olá, <strong className="font-semibold">{user?.name || 'usuário'}</strong>
            {user?.email && <span className="text-muted"> ({user.email})</span>}
          </span>
        </p>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-surface px-3 py-1 font-mono text-xs text-muted sm:self-auto">
          <span className={`size-2 rounded-full ${polling ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
          {polling ? `Atualização automática (a cada ${POLL_INTERVAL_MS / 1000} s)` : 'Todos os vídeos finalizados'}
        </span>
      </div>

      <UploadDropzone onFiles={uploads.addFiles} />
      <UploadProgressList items={uploads.items} inProgress={uploads.inProgress} onClear={uploads.clearFinished} />

      <section aria-labelledby="meus-videos" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 id="meus-videos" className="font-display text-xl font-semibold text-ink">
              Meus vídeos
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary-ink" aria-label={`${total} vídeos`}>
              {total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-status" className="sr-only">
              Filtrar por status
            </label>
            <select
              id="filtro-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as VideoStatus | '');
                setPage(1);
              }}
              className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="">Todos os status</option>
              {VIDEO_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={() => void query.refetch()}
              aria-label="Atualizar lista"
              icon={<RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} aria-hidden />}
            >
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>

        {downloadError && <Alert tone="error">{downloadError}</Alert>}
        {query.isError && <Alert tone="error">{query.error instanceof ApiError ? query.error.message : 'Não foi possível carregar os vídeos.'}</Alert>}

        {query.isPending ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
            <Spinner size={18} label="" /> Carregando seus vídeos…
          </div>
        ) : videos.length === 0 && !query.isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line py-12 text-center">
            <VideoOff size={28} className="text-muted" aria-hidden />
            <p className="font-medium text-ink">{status ? 'Nenhum vídeo com esse status.' : 'Você ainda não enviou nenhum vídeo.'}</p>
            {!status && <p className="text-sm text-muted">Arraste um arquivo para a área acima para começar.</p>}
          </div>
        ) : (
          videos.length > 0 && <VideoTable videos={videos} onDownload={handleDownload} downloadingId={downloadingId} />
        )}

        {total > 0 && (
          <nav aria-label="Paginação" className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span>
                Mostrando <strong className="text-ink">{first}</strong> a <strong className="text-ink">{last}</strong> de{' '}
                <strong className="text-ink">{total}</strong> vídeos
              </span>
              <label className="flex items-center gap-2 text-xs">
                Itens por página
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Página anterior">
                <ChevronLeft size={16} aria-hidden />
              </Button>
              <span className="font-mono text-xs">
                {page} / {lastPage}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} aria-label="Próxima página">
                <ChevronRight size={16} aria-hidden />
              </Button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
