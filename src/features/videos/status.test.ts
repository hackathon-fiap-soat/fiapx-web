import { failureMessage, hasPendingVideos, isFinal } from './status';
import type { Video } from './types';

const video = (status: Video['status']): Video => ({
  id: '1',
  original_name: 'a.mp4',
  size_bytes: 1,
  status,
  frame_count: null,
  failure_code: null,
  failure_reason: null,
  created_at: '',
  updated_at: '',
});

describe('status', () => {
  it('finais: COMPLETED, FAILED e EXPIRED', () => {
    expect(['COMPLETED', 'FAILED', 'EXPIRED'].every((s) => isFinal(s as Video['status']))).toBe(true);
    expect(['PENDING_UPLOAD', 'UPLOADED', 'QUEUED', 'PROCESSING'].some((s) => isFinal(s as Video['status']))).toBe(false);
  });

  it('há polling enquanto existir vídeo não final', () => {
    expect(hasPendingVideos(undefined)).toBe(false);
    expect(hasPendingVideos([video('COMPLETED'), video('FAILED')])).toBe(false);
    expect(hasPendingVideos([video('COMPLETED'), video('QUEUED')])).toBe(true);
  });

  it('motivo da falha: usa failure_reason e cai no texto do failure_code', () => {
    expect(failureMessage({ failure_code: 'FFMPEG_ERROR', failure_reason: 'Texto da API' })).toBe('Texto da API');
    expect(failureMessage({ failure_code: 'NO_FRAMES', failure_reason: null })).toContain('Não foi possível extrair');
    expect(failureMessage({ failure_code: null, failure_reason: null })).toBe('O processamento falhou.');
  });
});
