/**
 * Guarda o access token em memória e no sessionStorage (nunca no localStorage, spec §8.7): sobrevive a um
 * recarregamento da aba, mas não a fechar a aba.
 */
const STORAGE_KEY = 'fiapx.access_token';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** Expiração do token em milissegundos desde a época. */
  expiresAt: number;
}

let memoryToken: string | null = null;

function readStorage(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (memoryToken === null) {
    memoryToken = readStorage();
  }
  return memoryToken;
}

export function setToken(token: string): void {
  memoryToken = token;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // sessionStorage indisponível (modo privado restrito): fica só em memória.
  }
}

export function clearToken(): void {
  memoryToken = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada a limpar
  }
}

function base64UrlDecode(part: string): string {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Lê as claims do JWT sem validar a assinatura (quem valida é o authorizer do API Gateway). Devolve null para
 * um token malformado.
 */
export function decodeToken(token: string): SessionUser | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(base64UrlDecode(payload)) as Record<string, unknown>;
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') return null;
    return {
      id: claims.sub,
      name: typeof claims.name === 'string' ? claims.name : '',
      email: typeof claims.email === 'string' ? claims.email : '',
      expiresAt: claims.exp * 1000,
    };
  } catch {
    return null;
  }
}

/** Usuário do token guardado, se ainda não expirou. */
export function currentUser(now: number = Date.now()): SessionUser | null {
  const token = getToken();
  if (!token) return null;
  const user = decodeToken(token);
  if (!user || user.expiresAt <= now) {
    clearToken();
    return null;
  }
  return user;
}
