import { API_BASE_URL } from './config';
import { getToken } from './tokenStore';

/** Erro no formato da API: `{ message, errors?: { campo: string[] } }`. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** Primeira mensagem de um campo, para mostrar sob o input. */
  field(name: string): string | undefined {
    return this.fieldErrors[name]?.[0];
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** O AuthProvider registra aqui o que fazer quando a API recusa o token (401/403). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Envia o Bearer e trata 401/403 como sessão expirada. */
  auth?: boolean;
  signal?: AbortSignal;
}

const GENERIC_MESSAGES: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Sua sessão expirou. Entre novamente.',
  404: 'Recurso não encontrado.',
  429: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.',
};

function fallbackMessage(status: number): string {
  return GENERIC_MESSAGES[status] ?? (status >= 500 ? 'O serviço está indisponível no momento. Tente de novo em instantes.' : 'Não foi possível concluir a operação.');
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** URL absoluta na origem do site (o fetch do Node, usado nos testes, não aceita URL relativa). */
export function apiUrl(path: string): string {
  return new URL(`${API_BASE_URL}${path}`, window.location.origin).toString();
}

/** Cliente HTTP único: base URL, JSON, Bearer e tratamento de erros. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique a sua internet e tente de novo.');
  }

  const data = await parseBody(response);
  if (response.ok) return data as T;

  if (auth && (response.status === 401 || response.status === 403)) {
    onUnauthorized?.();
  }

  const payload = (data && typeof data === 'object' ? data : {}) as { message?: unknown; errors?: unknown };
  const isGatewayDefault = payload.message === 'Unauthorized' || payload.message === 'Forbidden' || payload.message === 'Too Many Requests';
  const message =
    typeof payload.message === 'string' && payload.message && !isGatewayDefault ? payload.message : fallbackMessage(response.status);
  const errors = payload.errors && typeof payload.errors === 'object' ? (payload.errors as Record<string, string[]>) : {};
  throw new ApiError(response.status, message, errors);
}
