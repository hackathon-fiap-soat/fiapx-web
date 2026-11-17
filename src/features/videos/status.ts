import type { FailureCode, Video, VideoStatus } from './types';

export const STATUS_LABELS: Record<VideoStatus, string> = {
  PENDING_UPLOAD: 'Aguardando envio',
  UPLOADED: 'Recebido',
  QUEUED: 'Na fila',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
  EXPIRED: 'Expirado',
};

const FINAL_STATUSES: ReadonlySet<VideoStatus> = new Set(['COMPLETED', 'FAILED', 'EXPIRED']);

export function isFinal(status: VideoStatus): boolean {
  return FINAL_STATUSES.has(status);
}

/** Polling de 5 s enquanto houver algum vídeo em estado não final (spec §8.7). */
export const POLL_INTERVAL_MS = 5000;

export function hasPendingVideos(videos: Video[] | undefined): boolean {
  return (videos ?? []).some((video) => !isFinal(video.status));
}

/** Textos de reserva por failure_code; a API já manda failure_reason legível. */
const FAILURE_MESSAGES: Record<FailureCode, string> = {
  INVALID_UPLOAD: 'O arquivo enviado não corresponde ao que foi declarado.',
  QUOTA_EXCEEDED: 'Você atingiu o limite de vídeos em processamento. Tente de novo mais tarde.',
  FFMPEG_ERROR: 'O arquivo de vídeo está corrompido ou em um formato que não conseguimos ler.',
  NO_FRAMES: 'Não foi possível extrair nenhum frame do vídeo.',
  DOWNLOAD_ERROR: 'Não conseguimos ler o vídeo enviado. Envie de novo.',
  UPLOAD_ERROR: 'Não conseguimos salvar o resultado. Envie o vídeo de novo.',
  PROCESSING_TIMEOUT: 'O processamento demorou demais e foi interrompido.',
};

export function failureMessage(video: Pick<Video, 'failure_code' | 'failure_reason'>): string {
  if (video.failure_reason) return video.failure_reason;
  if (video.failure_code) return FAILURE_MESSAGES[video.failure_code] ?? 'O processamento falhou.';
  return 'O processamento falhou.';
}
