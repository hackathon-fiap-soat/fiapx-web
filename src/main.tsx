import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

async function enableMocks(): Promise<void> {
  // Removido do build de produção: o Vite troca a variável pelo valor e elimina o import.
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return;
  const { startMockWorker } = await import('./mocks/browser');
  await startMockWorker();
}

void enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
