import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Liga o MSW no navegador (VITE_USE_MOCKS=true). Requisições sem handler (fontes, assets) seguem normais. */
export async function startMockWorker(): Promise<void> {
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass', quiet: false });
}
