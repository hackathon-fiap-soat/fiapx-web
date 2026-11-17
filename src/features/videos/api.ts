import { request } from '../../shared/httpClient';
import type { DownloadLink, VideoPage, VideoStatus, VideoUploadCreated } from './types';

export interface ListParams {
  status?: VideoStatus;
  page?: number;
  perPage?: number;
}

export const videosApi = {
  list: ({ status, page = 1, perPage = 10 }: ListParams = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) query.set('status', status);
    return request<VideoPage>(`/videos?${query.toString()}`, { auth: true, signal });
  },
  requestUpload: (file: { name: string; size: number; type: string }) =>
    request<VideoUploadCreated>('/videos', {
      method: 'POST',
      auth: true,
      body: { filename: file.name, size_bytes: file.size, content_type: file.type || contentTypeFor(file.name) },
    }),
  downloadLink: (id: string) => request<DownloadLink>(`/videos/${encodeURIComponent(id)}/download`, { auth: true }),
};

const MIME_BY_EXTENSION: Record<string, string> = {
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  webm: 'video/webm',
};

/** Alguns navegadores não informam o MIME de .mkv/.flv: deduz pela extensão. */
export function contentTypeFor(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[extension] ?? 'application/octet-stream';
}
