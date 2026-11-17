import { issueToken } from '../mocks/handlers';
import { DEMO_USER } from '../mocks/db';
import { clearToken, currentUser, decodeToken, getToken, setToken } from './tokenStore';

describe('tokenStore', () => {
  it('guarda em memória e no sessionStorage, nunca no localStorage', () => {
    setToken('a.b.c');
    expect(getToken()).toBe('a.b.c');
    expect(window.sessionStorage.getItem('fiapx.access_token')).toBe('a.b.c');
    expect(window.localStorage.length).toBe(0);
    clearToken();
    expect(getToken()).toBeNull();
    expect(window.sessionStorage.getItem('fiapx.access_token')).toBeNull();
  });

  it('decodifica as claims do JWT (com acentos) sem validar a assinatura', () => {
    const { access_token } = issueToken(DEMO_USER, 1_000_000);
    expect(decodeToken(access_token)).toEqual({
      id: DEMO_USER.id,
      name: 'Demo Usuário',
      email: 'demo@fiapx.com',
      expiresAt: (1000 + 3600) * 1000,
    });
  });

  it('recusa tokens malformados', () => {
    expect(decodeToken('sem-pontos')).toBeNull();
    expect(decodeToken('a.%%%.c')).toBeNull();
    expect(decodeToken(`a.${btoa(JSON.stringify({ name: 'x' }))}.c`)).toBeNull();
  });

  it('currentUser descarta token expirado', () => {
    const { access_token } = issueToken(DEMO_USER, Date.now() - 2 * 3600_000);
    setToken(access_token);
    expect(currentUser()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('currentUser devolve o usuário do token válido e o recupera do sessionStorage', () => {
    window.sessionStorage.setItem('fiapx.access_token', issueToken(DEMO_USER).access_token);
    expect(currentUser()?.email).toBe('demo@fiapx.com');
  });

  it('currentUser sem token devolve null', () => {
    expect(currentUser()).toBeNull();
  });
});
