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

// O fetch do Node 24 recusa o AbortSignal do jsdom ("Expected signal to be an instance of AbortSignal"):
// repassa a requisição sem o signal e rejeita com AbortError quando o signal do jsdom dispara.
function bridgeAbortSignal(): void {
  const nodeFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const signal = init?.signal;
    if (!signal) return nodeFetch(input, init);
    const { signal: _ignored, ...rest } = init;
    void _ignored;
    return new Promise<Response>((resolve, reject) => {
      const abort = () => reject(new DOMException('The operation was aborted.', 'AbortError'));
      if (signal.aborted) return abort();
      signal.addEventListener('abort', abort, { once: true });
      nodeFetch(input, rest).then(resolve, reject);
    });
  };
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  // Depois do listen: o fetch do MSW também cria um Request com o signal e precisa receber a versão sem ele.
  bridgeAbortSignal();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  clearToken();
  window.history.replaceState(null, '', '/');
});
afterAll(() => server.close());
