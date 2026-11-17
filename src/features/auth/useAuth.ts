import { createContext, useContext } from 'react';
import type { SessionUser } from '../../shared/tokenStore';

export interface AuthContextValue {
  user: SessionUser | null;
  /** A última sessão terminou por expiração (401/403 ou fim da validade do token). */
  sessionExpired: boolean;
  /** Guarda o token recebido do login ou da redefinição de senha. */
  signIn: (accessToken: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
