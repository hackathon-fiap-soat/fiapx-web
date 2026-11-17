import type { UploadTicket } from './types';

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

/** Fábrica do XHR (injetável nos testes). */
export type XhrFactory = () => XMLHttpRequest;

/**
 * POST multipart direto no S3 com o formulário pré-assinado: todos os `fields` na ordem recebida e o arquivo
 * por ÚLTIMO (o S3 ignora campos depois de `file`). Usa XMLHttpRequest porque o fetch não informa o progresso
 * do envio. Não manda Authorization: a autorização está na policy assinada.
 */
export function uploadToS3(
  ticket: UploadTicket,
  file: File,
  onProgress: (percent: number) => void,
  createXhr: XhrFactory = () => new XMLHttpRequest(),
): { promise: Promise<void>; abort: () => void } {
  const xhr = createXhr();
  const promise = new Promise<void>((resolve, reject) => {
    const form = new FormData();
    for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
    form.append('file', file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else if (xhr.status === 403) {
        reject(new UploadError('O armazenamento recusou o envio (autorização expirada ou arquivo diferente do declarado).'));
      } else {
        reject(new UploadError(`O armazenamento recusou o envio (HTTP ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new UploadError('Falha de rede durante o envio.'));
    xhr.onabort = () => reject(new UploadError('Envio cancelado.'));

    xhr.open('POST', ticket.url);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}
