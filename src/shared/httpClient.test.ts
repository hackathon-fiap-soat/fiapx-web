import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiError, apiUrl, request, setUnauthorizedHandler } from './httpClient';
import { setToken } from './tokenStore';

describe('httpClient', () => {
  afterEach(() => setUnauthorizedHandler(null));

  it('monta a URL absoluta na mesma origem, com a base /api', () => {
    expect(apiUrl('/videos')).toBe(`${window.location.origin}/api/videos`);
  });

  it('envia JSON e o Bearer nas rotas autenticadas', async () => {
    setToken('tok.en.x');
    let seen: { auth: string | null; type: string | null; body: unknown } | null = null;
    server.use(
      http.post('/api/eco', async ({ request: req }) => {
        seen = { auth: req.headers.get('authorization'), type: req.headers.get('content-type'), body: await req.json() };
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(request('/eco', { method: 'POST', body: { a: 1 }, auth: true })).resolves.toEqual({ ok: true });
    expect(seen).toEqual({ auth: 'Bearer tok.en.x', type: 'application/json', body: { a: 1 } });
  });

  it('não envia Authorization nas rotas públicas', async () => {
    setToken('tok.en.x');
    let auth: string | null = 'x';
    server.use(
      http.get('/api/publica', ({ request: req }) => {
        auth = req.headers.get('authorization');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(request('/publica')).resolves.toBeNull();
    expect(auth).toBeNull();
  });

  it('transforma o erro da API em ApiError com mensagens por campo', async () => {
    server.use(
      http.post('/api/form', () => HttpResponse.json({ message: 'Os dados informados são inválidos.', errors: { email: ['Inválido.'] } }, { status: 422 })),
    );
    const error = await request('/form', { method: 'POST', body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).message).toBe('Os dados informados são inválidos.');
    expect((error as ApiError).field('email')).toBe('Inválido.');
    expect((error as ApiError).field('name')).toBeUndefined();
  });

  it.each([
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
  ])('%i em rota autenticada chama o handler de sessão expirada', async (status, message) => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    server.use(http.get('/api/privada', () => HttpResponse.json({ message }, { status })));
    await expect(request('/privada', { auth: true })).rejects.toMatchObject({ status, message: 'Sua sessão expirou. Entre novamente.' });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('401 em rota pública (login) não derruba a sessão', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    server.use(http.post('/api/login', () => HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 })));
    await expect(request('/login', { method: 'POST', body: {} })).rejects.toMatchObject({ message: 'E-mail ou senha inválidos.' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('usa mensagens genéricas para 429, 5xx e corpo que não é JSON', async () => {
    server.use(
      http.get('/api/limite', () => HttpResponse.json({ message: 'Too Many Requests' }, { status: 429 })),
      http.get('/api/quebrou', () => new HttpResponse('<html>erro</html>', { status: 502 })),
      http.get('/api/conflito', () => new HttpResponse(null, { status: 409 })),
      http.get('/api/sumiu', () => new HttpResponse(null, { status: 404 })),
    );
    await expect(request('/limite')).rejects.toMatchObject({ message: expect.stringContaining('Muitas tentativas') });
    await expect(request('/quebrou')).rejects.toMatchObject({ message: expect.stringContaining('indisponível') });
    await expect(request('/conflito')).rejects.toMatchObject({ message: 'Não foi possível concluir a operação.' });
    await expect(request('/sumiu')).rejects.toMatchObject({ message: 'Recurso não encontrado.' });
  });

  it('falha de rede vira ApiError com status 0', async () => {
    server.use(http.get('/api/offline', () => HttpResponse.error()));
    await expect(request('/offline')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('Sem conexão') });
  });

  it('repassa o cancelamento (AbortError)', async () => {
    server.use(http.get('/api/lenta', async () => new Promise<Response>(() => undefined)));
    const controller = new AbortController();
    const pending = request('/lenta', { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
