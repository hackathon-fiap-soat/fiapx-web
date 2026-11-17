import { uploadToS3, UploadError } from './uploadToS3';

/** XHR falso: registra o que foi enviado e deixa o teste disparar os eventos. */
class FakeXhr {
  status = 0;
  method = '';
  url = '';
  body: FormData | null = null;
  headers: Record<string, string> = {};
  upload: { onprogress: ((e: Partial<ProgressEvent>) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send(body: FormData) {
    this.body = body;
  }
  abort() {
    this.onabort?.();
  }
}

const ticket = {
  url: 'https://fiapx-prod-videos.s3.us-east-1.amazonaws.com/',
  fields: { key: 'uploads/1.mp4', 'Content-Type': 'video/mp4', policy: 'p', 'x-amz-signature': 's' },
  expires_at: '2026-11-16T13:00:00Z',
};

function start() {
  const xhr = new FakeXhr();
  const progress: number[] = [];
  const file = new File(['conteudo'], 'aula.mp4', { type: 'video/mp4' });
  const handle = uploadToS3(ticket, file, (p) => progress.push(p), () => xhr as unknown as XMLHttpRequest);
  return { xhr, progress, handle, file };
}

describe('uploadToS3', () => {
  it('faz POST na URL do S3 com os fields na ordem e o arquivo por último, sem Authorization', async () => {
    const { xhr, progress, handle, file } = start();
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe(ticket.url);
    expect(xhr.headers).toEqual({});
    const entries = Array.from(xhr.body!.entries());
    expect(entries.map(([name]) => name)).toEqual(['key', 'Content-Type', 'policy', 'x-amz-signature', 'file']);
    expect((entries[4]![1] as File).name).toBe(file.name);

    xhr.upload.onprogress!({ lengthComputable: true, loaded: 50, total: 200 });
    xhr.upload.onprogress!({ lengthComputable: false, loaded: 1, total: 0 });
    xhr.status = 204;
    xhr.onload!();
    await expect(handle.promise).resolves.toBeUndefined();
    expect(progress).toEqual([25, 100]);
  });

  it('403 do S3 vira mensagem de autorização expirada', async () => {
    const { xhr, handle } = start();
    xhr.status = 403;
    xhr.onload!();
    await expect(handle.promise).rejects.toThrow(/autorização expirada/);
  });

  it('outros erros HTTP, rede e cancelamento', async () => {
    const a = start();
    a.xhr.status = 500;
    a.xhr.onload!();
    await expect(a.handle.promise).rejects.toThrow('HTTP 500');

    const b = start();
    b.xhr.onerror!();
    await expect(b.handle.promise).rejects.toBeInstanceOf(UploadError);

    const c = start();
    c.handle.abort();
    await expect(c.handle.promise).rejects.toThrow('Envio cancelado.');
  });
});
