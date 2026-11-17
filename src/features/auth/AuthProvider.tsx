import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setUnauthorizedHandler } from '../../shared/httpClient';
import { clearToken, currentUser, decodeToken, setToken, type SessionUser } from '../../shared/tokenStore';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => currentUser());
  const [sessionExpired, setSessionExpired] = useState(false);
  const queryClient = useQueryClient();

  const endSession = useCallback(
    (expired: boolean) => {
      clearToken();
      queryClient.clear();
      setSessionExpired(expired);
      // Sem navigate aqui: o ProtectedRoute leva ao login (com o aviso de sessão expirada).
      setUser(null);
    },
    [queryClient],
  );

  // 401 ou 403 em qualquer chamada autenticada: sessão expirada → login.
  useEffect(() => {
    setUnauthorizedHandler(() => endSession(true));
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  // O token vale 1 h: ao vencer, volta ao login mesmo sem nenhuma chamada à API.
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => endSession(true), Math.max(0, user.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [user, endSession]);

  const signIn = useCallback((accessToken: string) => {
    const decoded = decodeToken(accessToken);
    if (!decoded) throw new Error('Token inválido recebido da API.');
    setToken(accessToken);
    setSessionExpired(false);
    setUser(decoded);
  }, []);

  const signOut = useCallback(() => endSession(false), [endSession]);

  const value = useMemo(() => ({ user, sessionExpired, signIn, signOut }), [user, sessionExpired, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
