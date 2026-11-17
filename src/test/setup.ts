import '@testing-library/jest-dom/vitest';
import { File as NodeFile } from 'node:buffer';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';
import { resetDb } from '../mocks/db';
import { clearToken } from '../shared/tokenStore';

// O FormData/File do jsdom não serializam no XMLHttpRequest interceptado pelo MSW (o corpo nunca termina).
// Nos testes, usa os do Node (undici), como o navegador faz de verdade.
const NodeFormData = (await new Response('a=1', { headers: { 'content-type': 'application/x-www-form-urlencoded' } }).formData())
  .constructor as typeof FormData;
globalThis.FormData = NodeFormData;
globalThis.File = NodeFile as unknown as typeof File;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  clearToken();
  window.history.replaceState(null, '', '/');
});
afterAll(() => server.close());
