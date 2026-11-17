import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../shared/httpClient';
import { videosApi } from './api';
import { uploadToS3, UploadError } from './uploadToS3';
import { validateVideoFile } from './validateFile';

export type UploadPhase = 'waiting' | 'requesting' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  key: string;
  name: string;
  size: number;
  phase: UploadPhase;
  progress: number;
  error?: string;
}

export interface UseUploadsOptions {
  /** Chamado quando um vídeo é registrado e quando o envio termina (para atualizar a lista). */
  onChange?: () => void;
  /** Envios simultâneos (spec: no máximo 3). */
  maxConcurrent?: number;
  requestUpload?: typeof videosApi.requestUpload;
  upload?: typeof uploadToS3;
}

let sequence = 0;

/** Fila de uploads: valida, pede o POST pré-assinado e envia ao S3, no máximo `maxConcurrent` por vez. */
export function useUploads({
  onChange,
  maxConcurrent = 3,
  requestUpload = videosApi.requestUpload,
  upload = uploadToS3,
}: UseUploadsOptions = {}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const files = useRef(new Map<string, File>());
  const queue = useRef<string[]>([]);
  const active = useRef(0);
  const aborts = useRef(new Map<string, () => void>());
  const mounted = useRef(true);
  const deps = useRef({ onChange, requestUpload, upload, maxConcurrent });
  deps.current = { onChange, requestUpload, upload, maxConcurrent };

  const patch = useCallback((key: string, changes: Partial<UploadItem>) => {
    if (!mounted.current) return;
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }, []);

  const run = useCallback(
    async (key: string) => {
      const file = files.current.get(key);
      if (!file) return;
      const { requestUpload: request, upload: send } = deps.current;
      try {
        patch(key, { phase: 'requesting' });
        const created = await request(file);
        deps.current.onChange?.();
        patch(key, { phase: 'uploading', progress: 0 });
        const handle = send(created.upload, file, (progress) => patch(key, { progress }));
        aborts.current.set(key, handle.abort);
        await handle.promise;
        patch(key, { phase: 'done', progress: 100 });
        deps.current.onChange?.();
      } catch (error) {
        const message =
          error instanceof ApiError
            ? (error.field('filename') ?? error.field('size_bytes') ?? error.message)
            : error instanceof UploadError
              ? error.message
              : 'Não foi possível enviar o arquivo.';
        patch(key, { phase: 'error', error: message });
      } finally {
        aborts.current.delete(key);
        files.current.delete(key);
      }
    },
    [patch],
  );

  const pump = useCallback(() => {
    while (active.current < deps.current.maxConcurrent && queue.current.length > 0) {
      const key = queue.current.shift()!;
      active.current += 1;
      void run(key).finally(() => {
        active.current -= 1;
        if (mounted.current) pump();
      });
    }
  }, [run]);

  const addFiles = useCallback(
    (selected: File[]) => {
      const added: UploadItem[] = selected.map((file) => {
        sequence += 1;
        const key = `upload-${sequence}`;
        const error = validateVideoFile(file);
        if (!error) {
          files.current.set(key, file);
          queue.current.push(key);
        }
        return { key, name: file.name, size: file.size, phase: error ? 'error' : 'waiting', progress: 0, error: error ?? undefined };
      });
      setItems((current) => [...added, ...current]);
      pump();
    },
    [pump],
  );

  const clearFinished = useCallback(() => {
    setItems((current) => current.filter((item) => item.phase !== 'done' && item.phase !== 'error'));
  }, []);

  useEffect(() => {
    mounted.current = true;
    const pending = aborts.current;
    return () => {
      mounted.current = false;
      queue.current = [];
      pending.forEach((abort) => abort());
    };
  }, []);

  const inProgress = items.filter((item) => item.phase === 'waiting' || item.phase === 'requesting' || item.phase === 'uploading').length;
  return { items, addFiles, clearFinished, inProgress };
}
