import type { FailureCode, Video, VideoStatus } from '../features/videos/types';

/**
 * Estado em memória do modo mock (MSW). Simula o fiapx-auth, o fiapx-video-api e o S3, inclusive a evolução
 * de status de cada vídeo depois do envio: UPLOADED → QUEUED → PROCESSING → COMPLETED em ~15 s, ou FAILED
 * quando o nome do arquivo contém "erro".
 */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface MockVideo {
  id: string;
  ownerId: string;
  original_name: string;
  size_bytes: number;
  created_at: number;
  /** Momento em que o "S3" recebeu o arquivo; null enquanto PENDING_UPLOAD. */
  uploaded_at: number | null;
  key: string;
}

export interface MockTiming {
  /** Fim de UPLOADED (ms depois do envio). */
  uploadedMs: number;
  /** Fim de QUEUED. */
  queuedMs: number;
  /** Fim de PROCESSING: daí em diante COMPLETED ou FAILED. */
  processingMs: number;
  /** Sem envio por este tempo → EXPIRED. */
  expireMs: number;
}

export const DEMO_USER: MockUser = {
  id: '0192f1c4-6a00-7b00-8c00-1d2e3f4a5b6c',
  name: 'Demo Usuário',
  email: 'demo@fiapx.com',
  password: 'senha12345',
};

/** Token de redefinição aceito pelo mock (link: /redefinir-senha?token=...). */
export const MOCK_RESET_TOKEN = 'demo-reset-token-0000000000000000000000000000';
export const MOCK_FAILURE_REASON = 'O arquivo de vídeo está corrompido ou em um formato que não conseguimos ler';
export const MOCK_S3_URL = '/__mock-s3/fiapx-mock-videos';

const DEFAULT_TIMING: MockTiming = { uploadedMs: 1500, queuedMs: 4000, processingMs: 15000, expireMs: 3600_000 };

let users: MockUser[] = [];
let videos: MockVideo[] = [];
let resetTokenUsed = false;
let resetTokenExpiresAt = 0;
let timing: MockTiming = { ...DEFAULT_TIMING };
let counter = 0;

function uuid(): string {
  counter += 1;
  const random = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  return `0192f1c4-${counter.toString(16).padStart(4, '0')}-7c3d-8e4f-${random}0000`;
}

/** Volta ao estado inicial: usuário demo com dois vídeos de exemplo. */
export function resetDb(now: number = Date.now()): void {
  users = [{ ...DEMO_USER }];
  timing = { ...DEFAULT_TIMING };
  resetTokenUsed = false;
  resetTokenExpiresAt = now + 30 * 60_000;
  videos = [
    {
      id: '0192f1c4-7a2b-7c3d-8e4f-5a6b7c8d9e0f',
      ownerId: DEMO_USER.id,
      original_name: 'aula-01-introducao.mp4',
      size_bytes: 73_400_320,
      created_at: now - 2 * 3600_000,
      uploaded_at: now - 2 * 3600_000,
      key: 'uploads/0192f1c4-7a2b-7c3d-8e4f-5a6b7c8d9e0f.mp4',
    },
    {
      id: '0192f1c4-7b00-7c3d-8e4f-5a6b7c8d9e10',
      ownerId: DEMO_USER.id,
      original_name: 'gravacao-com-erro.avi',
      size_bytes: 1_048_576,
      created_at: now - 3 * 3600_000,
      uploaded_at: now - 3 * 3600_000,
      key: 'uploads/0192f1c4-7b00-7c3d-8e4f-5a6b7c8d9e10.avi',
    },
  ];
}

export function setTiming(changes: Partial<MockTiming>): void {
  timing = { ...timing, ...changes };
}

export function findUserByEmail(email: string): MockUser | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): MockUser | undefined {
  return users.find((u) => u.id === id);
}

export function addUser(name: string, email: string, password: string): MockUser {
  const user = { id: uuid(), name, email, password };
  users.push(user);
  return user;
}

export function resetTokenState(now: number = Date.now()): { valid: boolean; expiresAt: number } {
  return { valid: !resetTokenUsed && now < resetTokenExpiresAt, expiresAt: resetTokenExpiresAt };
}

export function consumeResetToken(): void {
  resetTokenUsed = true;
}

function statusOf(video: MockVideo, now: number): VideoStatus {
  if (video.uploaded_at === null) return now - video.created_at > timing.expireMs ? 'EXPIRED' : 'PENDING_UPLOAD';
  const elapsed = now - video.uploaded_at;
  if (elapsed < timing.uploadedMs) return 'UPLOADED';
  if (elapsed < timing.queuedMs) return 'QUEUED';
  if (elapsed < timing.processingMs) return 'PROCESSING';
  return video.original_name.toLowerCase().includes('erro') ? 'FAILED' : 'COMPLETED';
}

function updatedAt(video: MockVideo, status: VideoStatus): number {
  if (video.uploaded_at === null) return status === 'EXPIRED' ? video.created_at + timing.expireMs : video.created_at;
  const offsets: Partial<Record<VideoStatus, number>> = {
    UPLOADED: 0,
    QUEUED: timing.uploadedMs,
    PROCESSING: timing.queuedMs,
  };
  return video.uploaded_at + (offsets[status] ?? timing.processingMs);
}

export function toApiVideo(video: MockVideo, now: number = Date.now()): Video {
  const status = statusOf(video, now);
  const failed = status === 'FAILED';
  const failureCode: FailureCode | null = failed ? 'FFMPEG_ERROR' : null;
  return {
    id: video.id,
    original_name: video.original_name,
    size_bytes: video.size_bytes,
    status,
    // 1 frame por segundo: no mock, ~1 frame a cada 400 KB.
    frame_count: status === 'COMPLETED' ? Math.max(1, Math.round(video.size_bytes / 400_000)) : null,
    failure_code: failureCode,
    failure_reason: failed ? MOCK_FAILURE_REASON : null,
    created_at: new Date(video.created_at).toISOString(),
    updated_at: new Date(updatedAt(video, status)).toISOString(),
  };
}

export function createVideo(ownerId: string, name: string, size: number, now: number = Date.now()): MockVideo {
  const id = uuid();
  const extension = name.split('.').pop()?.toLowerCase() ?? 'mp4';
  const video: MockVideo = { id, ownerId, original_name: name, size_bytes: size, created_at: now, uploaded_at: null, key: `uploads/${id}.${extension}` };
  videos.push(video);
  return video;
}

export function findVideo(ownerId: string, id: string): MockVideo | undefined {
  return videos.find((v) => v.id === id && v.ownerId === ownerId);
}

/** O "S3" recebeu o arquivo da chave. */
export function markUploaded(key: string, now: number = Date.now()): boolean {
  const video = videos.find((v) => v.key === key && v.uploaded_at === null);
  if (!video) return false;
  video.uploaded_at = now;
  return true;
}

export function listVideos(ownerId: string, now: number = Date.now()): Video[] {
  return videos
    .filter((v) => v.ownerId === ownerId)
    .sort((a, b) => b.created_at - a.created_at)
    .map((v) => toApiVideo(v, now));
}

resetDb();
