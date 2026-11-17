import { http, HttpResponse } from 'msw';
import { isPasswordValid } from '../features/auth/passwordPolicy';
import { validateVideoFile } from '../features/videos/validateFile';
import { VIDEO_STATUSES, type VideoStatus } from '../features/videos/types';
import { API_BASE_URL } from '../shared/config';
import {
  addUser,
  consumeResetToken,
  createVideo,
  DEMO_USER,
  findUserByEmail,
  findUserById,
  findVideo,
  listVideos,
  markUploaded,
  MOCK_RESET_TOKEN,
  MOCK_S3_URL,
  resetTokenState,
  toApiVideo,
  type MockUser,
} from './db';

const api = (path: string) => `${API_BASE_URL}${path}`;

/** Zip vazio (só o registro de fim de diretório), servido como o "frames.zip" do mock. */
const EMPTY_ZIP_DATA_URL = 'data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==';

const INVALID_DATA = 'Os dados informados são inválidos.';
const INVALID_RESET = 'O link de redefinição é inválido ou expirou. Peça um novo.';

function base64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** JWT de mentira (sem assinatura válida), com as mesmas claims do fiapx-auth. */
export function issueToken(user: MockUser, now: number = Date.now()) {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({ sub: user.id, email: user.email, name: user.name, iss: 'fiapx-auth', aud: 'fiapx-api', exp: Math.floor(now / 1000) + 3600 }),
  );
  return { access_token: `${header}.${payload}.mock`, token_type: 'Bearer' as const, expires_in: 3600 };
}

type AuthResult = { user: MockUser } | { response: Response };

/** Imita o authorizer do API Gateway: 401 sem header, 403 com token inválido ou expirado. */
function authenticate(request: Request): AuthResult {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return { response: HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  try {
    const payload = header.slice(7).split('.')[1] ?? '';
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: string; exp?: number };
    const user = claims.sub ? findUserById(claims.sub) : undefined;
    if (user && claims.exp && claims.exp * 1000 > Date.now()) return { user };
  } catch {
    // token malformado: cai no 403
  }
  return { response: HttpResponse.json({ message: 'Forbidden' }, { status: 403 }) };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const str = (value: unknown) => (typeof value === 'string' ? value : '');

export const handlers = [
  http.post(api('/auth/register'), async ({ request }) => {
    const body = await readJson(request);
    const name = str(body.name).trim();
    const email = str(body.email).trim();
    const password = str(body.password);
    const errors: Record<string, string[]> = {};
    if (!name) errors.name = ['O nome é obrigatório.'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Informe um e-mail válido.'];
    if (!isPasswordValid(password)) errors.password = ['A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e símbolo.'];
    if (Object.keys(errors).length) return HttpResponse.json({ message: INVALID_DATA, errors }, { status: 422 });
    // E-mail repetido: o mesmo 422 genérico, sem revelar quem tem cadastro.
    if (findUserByEmail(email)) return HttpResponse.json({ message: 'Não foi possível concluir o cadastro.' }, { status: 422 });
    const user = addUser(name, email, password);
    return HttpResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  }),

  http.post(api('/auth/login'), async ({ request }) => {
    const body = await readJson(request);
    const user = findUserByEmail(str(body.email).trim());
    if (!user || user.password !== str(body.password)) {
      return HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }
    return HttpResponse.json(issueToken(user));
  }),

  http.post(api('/auth/password/forgot'), async ({ request }) => {
    const body = await readJson(request);
    const email = str(body.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return HttpResponse.json({ message: INVALID_DATA, errors: { email: ['Informe um e-mail válido.'] } }, { status: 422 });
    }
    if (findUserByEmail(email)?.id === DEMO_USER.id) {
      console.info(`[mock] Link de redefinição: /redefinir-senha?token=${MOCK_RESET_TOKEN}`);
    }
    return HttpResponse.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções em instantes.' }, { status: 202 });
  }),

  http.post(api('/auth/password/reset/verify'), async ({ request }) => {
    const body = await readJson(request);
    const state = resetTokenState();
    if (str(body.token) !== MOCK_RESET_TOKEN || !state.valid) return HttpResponse.json({ message: INVALID_RESET }, { status: 422 });
    return HttpResponse.json({ email_masked: 'd***o@fiapx.com', expires_at: new Date(state.expiresAt).toISOString() });
  }),

  http.post(api('/auth/password/reset'), async ({ request }) => {
    const body = await readJson(request);
    if (str(body.token) !== MOCK_RESET_TOKEN || !resetTokenState().valid) return HttpResponse.json({ message: INVALID_RESET }, { status: 422 });
    const password = str(body.password);
    if (!isPasswordValid(password)) {
      return HttpResponse.json({ message: INVALID_DATA, errors: { password: ['A senha não atende à política.'] } }, { status: 422 });
    }
    const user = findUserById(DEMO_USER.id)!;
    user.password = password;
    consumeResetToken();
    return HttpResponse.json(issueToken(user));
  }),

  http.put(api('/auth/password'), async ({ request }) => {
    const auth = authenticate(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    if (str(body.current_password) !== auth.user.password) {
      return HttpResponse.json({ message: INVALID_DATA, errors: { current_password: ['A senha atual está incorreta.'] } }, { status: 422 });
    }
    const next = str(body.new_password);
    if (!isPasswordValid(next) || next === auth.user.password) {
      return HttpResponse.json(
        { message: INVALID_DATA, errors: { new_password: ['A nova senha deve seguir a política e ser diferente da atual.'] } },
        { status: 422 },
      );
    }
    auth.user.password = next;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(api('/videos'), async ({ request }) => {
    const auth = authenticate(request);
    if ('response' in auth) return auth.response;
    const body = await readJson(request);
    const filename = str(body.filename);
    const size = typeof body.size_bytes === 'number' ? body.size_bytes : 0;
    const error = validateVideoFile({ name: filename, size });
    if (error) {
      const field = error.includes('Formato') ? 'filename' : 'size_bytes';
      return HttpResponse.json({ message: INVALID_DATA, errors: { [field]: [error] } }, { status: 422 });
    }
    const video = createVideo(auth.user.id, filename, size);
    return HttpResponse.json(
      {
        id: video.id,
        status: 'PENDING_UPLOAD',
        upload: {
          url: MOCK_S3_URL,
          fields: { key: video.key, 'Content-Type': str(body.content_type), policy: 'bW9jaw==', 'x-amz-signature': 'mock' },
          expires_at: new Date(Date.now() + 3600_000).toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  http.get(api('/videos'), ({ request }) => {
    const auth = authenticate(request);
    if ('response' in auth) return auth.response;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page') ?? 10) || 10));
    if (status && !VIDEO_STATUSES.includes(status as VideoStatus)) {
      return HttpResponse.json({ message: INVALID_DATA, errors: { status: ['Status inválido.'] } }, { status: 422 });
    }
    const all = listVideos(auth.user.id).filter((v) => !status || v.status === status);
    return HttpResponse.json({ data: all.slice((page - 1) * perPage, page * perPage), meta: { page, per_page: perPage, total: all.length } });
  }),

  http.get(api('/videos/:id'), ({ request, params }) => {
    const auth = authenticate(request);
    if ('response' in auth) return auth.response;
    const video = findVideo(auth.user.id, String(params.id));
    if (!video) return HttpResponse.json({ message: 'Vídeo não encontrado.' }, { status: 404 });
    return HttpResponse.json(toApiVideo(video));
  }),

  http.get(api('/videos/:id/download'), ({ request, params }) => {
    const auth = authenticate(request);
    if ('response' in auth) return auth.response;
    const video = findVideo(auth.user.id, String(params.id));
    if (!video) return HttpResponse.json({ message: 'Vídeo não encontrado.' }, { status: 404 });
    if (toApiVideo(video).status !== 'COMPLETED') {
      return HttpResponse.json({ message: 'O vídeo ainda não está pronto para download.' }, { status: 409 });
    }
    return HttpResponse.json({ url: EMPTY_ZIP_DATA_URL, expires_at: new Date(Date.now() + 900_000).toISOString() });
  }),

  // "S3": POST multipart com os fields do formulário e o arquivo como último campo.
  http.post(MOCK_S3_URL, async ({ request }) => {
    const form = await request.formData();
    const names = Array.from(form.keys());
    const key = form.get('key');
    if (names[names.length - 1] !== 'file' || typeof key !== 'string' || !markUploaded(key)) {
      return new HttpResponse('<Error><Code>AccessDenied</Code></Error>', { status: 403, headers: { 'content-type': 'application/xml' } });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
