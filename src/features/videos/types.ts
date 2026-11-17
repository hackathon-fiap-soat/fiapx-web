/** Tipos de /videos* (fiapx-docs/api/openapi.yaml). */
export const VIDEO_STATUSES = ['PENDING_UPLOAD', 'UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'] as const;
export type VideoStatus = (typeof VIDEO_STATUSES)[number];

export type FailureCode =
  | 'INVALID_UPLOAD'
  | 'QUOTA_EXCEEDED'
  | 'FFMPEG_ERROR'
  | 'NO_FRAMES'
  | 'DOWNLOAD_ERROR'
  | 'UPLOAD_ERROR'
  | 'PROCESSING_TIMEOUT';

export interface Video {
  id: string;
  original_name: string;
  size_bytes: number;
  status: VideoStatus;
  frame_count: number | null;
  failure_code: FailureCode | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoPage {
  data: Video[];
  meta: { page: number; per_page: number; total: number };
}

export interface UploadTicket {
  url: string;
  fields: Record<string, string>;
  expires_at: string;
}

export interface VideoUploadCreated {
  id: string;
  status: 'PENDING_UPLOAD';
  upload: UploadTicket;
}

export interface DownloadLink {
  url: string;
  expires_at: string;
}
