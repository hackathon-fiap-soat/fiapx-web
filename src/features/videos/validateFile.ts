export const ACCEPTED_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'] as const;
/** 500 MB, o mesmo limite do POST pré-assinado (content-length-range). */
export const MAX_FILE_BYTES = 500 * 1024 * 1024;

/** Valida no cliente antes de pedir o upload. Devolve a mensagem de erro ou null. */
export function validateVideoFile(file: { name: string; size: number }): string | null {
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)) {
    return 'Formato não aceito. Use mp4, avi, mov, mkv, wmv, flv ou webm.';
  }
  if (file.size <= 0) return 'O arquivo está vazio.';
  if (file.size > MAX_FILE_BYTES) return 'O arquivo deve ter no máximo 500 MB.';
  if (file.name.length > 255) return 'O nome do arquivo deve ter no máximo 255 caracteres.';
  return null;
}
