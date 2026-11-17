import { contentTypeFor } from './api';
import { MAX_FILE_BYTES, validateVideoFile } from './validateFile';

describe('validateVideoFile', () => {
  it('aceita as extensões permitidas, em minúsculas ou maiúsculas', () => {
    for (const name of ['a.mp4', 'b.AVI', 'c.mov', 'd.mkv', 'e.wmv', 'f.flv', 'g.WebM']) {
      expect(validateVideoFile({ name, size: 10 })).toBeNull();
    }
  });

  it('recusa formato, arquivo vazio, acima de 500 MB e nome longo', () => {
    expect(validateVideoFile({ name: 'foto.png', size: 10 })).toMatch(/Formato não aceito/);
    expect(validateVideoFile({ name: 'semextensao', size: 10 })).toMatch(/Formato não aceito/);
    expect(validateVideoFile({ name: 'a.mp4', size: 0 })).toMatch(/vazio/);
    expect(validateVideoFile({ name: 'a.mp4', size: MAX_FILE_BYTES + 1 })).toMatch(/500 MB/);
    expect(validateVideoFile({ name: `${'a'.repeat(260)}.mp4`, size: 10 })).toMatch(/255/);
  });

  it('deduz o MIME pela extensão', () => {
    expect(contentTypeFor('a.MKV')).toBe('video/x-matroska');
    expect(contentTypeFor('a.xyz')).toBe('application/octet-stream');
  });
});
