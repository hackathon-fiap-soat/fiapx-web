import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from '../../shared/httpClient';
import { useUploads } from './useUploads';
import type { VideoUploadCreated } from './types';

const created = (id: string): VideoUploadCreated => ({
  id,
  status: 'PENDING_UPLOAD',
  upload: { url: 'https://s3/', fields: { key: id }, expires_at: '' },
});

function deferred() {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const file = (name: string, size = 10) => new File(['x'.repeat(size)], name, { type: 'video/mp4' });

describe('useUploads', () => {
  it('envia no máximo 3 arquivos ao mesmo tempo e segue a fila quando um termina', async () => {
    const uploads: { name: string; done: ReturnType<typeof deferred>; progress: (p: number) => void }[] = [];
    const requestUpload = vi.fn(async (f: { name: string }) => created(f.name));
    const upload = vi.fn((_t: unknown, f: File, onProgress: (p: number) => void) => {
      const done = deferred();
      uploads.push({ name: f.name, done, progress: onProgress });
      return { promise: done.promise, abort: vi.fn() };
    });
    const onChange = vi.fn();
    const { result } = renderHook(() => useUploads({ requestUpload, upload, onChange }));

    act(() => result.current.addFiles([file('1.mp4'), file('2.mp4'), file('3.mp4'), file('4.mp4')]));
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(3));
    expect(result.current.inProgress).toBe(4);
    expect(result.current.items.find((i) => i.name === '4.mp4')?.phase).toBe('waiting');

    act(() => uploads[0]!.progress(40));
    await waitFor(() => expect(result.current.items.find((i) => i.name === '1.mp4')?.progress).toBe(40));

    await act(async () => uploads[0]!.done.resolve());
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(4));
    expect(result.current.items.find((i) => i.name === '1.mp4')?.phase).toBe('done');

    await act(async () => uploads.slice(1).forEach((u) => u.done.resolve()));
    await waitFor(() => expect(result.current.inProgress).toBe(0));
    // registro + fim do envio de cada arquivo
    expect(onChange).toHaveBeenCalledTimes(8);

    act(() => result.current.clearFinished());
    expect(result.current.items).toHaveLength(0);
  });

  it('arquivo inválido não chega à API; erro da API e do S3 aparecem no item', async () => {
    const requestUpload = vi.fn(async (f: { name: string }) => {
      if (f.name === 'grande.mp4') throw new ApiError(422, 'Dados inválidos', { size_bytes: ['O arquivo deve ter no máximo 500 MB.'] });
      if (f.name === 'outro.mp4') throw new Error('qualquer');
      return created(f.name);
    });
    const upload = vi.fn(() => ({ promise: Promise.reject(new (class extends Error {})('x')), abort: vi.fn() }));
    const { result } = renderHook(() => useUploads({ requestUpload, upload }));

    act(() => result.current.addFiles([file('foto.png'), file('grande.mp4'), file('outro.mp4')]));
    await waitFor(() => expect(result.current.inProgress).toBe(0));
    const byName = Object.fromEntries(result.current.items.map((i) => [i.name, i]));
    expect(byName['foto.png']).toMatchObject({ phase: 'error', error: expect.stringMatching(/Formato não aceito/) });
    expect(byName['grande.mp4']).toMatchObject({ phase: 'error', error: 'O arquivo deve ter no máximo 500 MB.' });
    expect(byName['outro.mp4']).toMatchObject({ phase: 'error', error: 'Não foi possível enviar o arquivo.' });
    expect(requestUpload).toHaveBeenCalledTimes(2);
  });

  it('cancela os envios em andamento ao desmontar', async () => {
    const abort = vi.fn();
    const upload = vi.fn(() => ({ promise: new Promise<void>(() => undefined), abort }));
    const { result, unmount } = renderHook(() => useUploads({ requestUpload: async (f) => created(f.name), upload }));
    act(() => result.current.addFiles([file('a.mp4')]));
    await waitFor(() => expect(upload).toHaveBeenCalled());
    unmount();
    expect(abort).toHaveBeenCalled();
  });
});
