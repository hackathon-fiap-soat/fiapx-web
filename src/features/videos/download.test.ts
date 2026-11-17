import { triggerDownload, zipNameFor } from './download';

describe('download', () => {
  it('clica num link com download e o remove', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    triggerDownload('https://s3/frames.zip?sig=1', 'aula-frames.zip');
    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.href).toBe('https://s3/frames.zip?sig=1');
    expect(anchor.download).toBe('aula-frames.zip');
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('nome do zip a partir do vídeo', () => {
    expect(zipNameFor('aula-01.mp4')).toBe('aula-01-frames.zip');
    expect(zipNameFor('.mp4')).toBe('video-frames.zip');
  });
});
