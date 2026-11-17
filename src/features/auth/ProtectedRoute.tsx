import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Rotas que exigem login: sem sessão, vai para /login (e volta para cá depois). */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, sessionExpired } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={sessionExpired ? { expired: true } : { from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Telas públicas de acesso (login, cadastro): quem já está logado vai direto ao painel. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/videos" replace />;
  return <>{children}</>;
}
