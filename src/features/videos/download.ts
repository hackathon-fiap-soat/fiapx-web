/**
 * Abre a URL pré-assinada do zip. Um link com `download` funciona tanto com a URL do S3 (outra origem: o S3
 * responde com Content-Disposition: attachment) quanto com a URL do modo mock.
 */
export function triggerDownload(url: string, filename = 'frames.zip'): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** "aula-01.mp4" → "aula-01-frames.zip". */
export function zipNameFor(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'video';
  return `${base}-frames.zip`;
}
