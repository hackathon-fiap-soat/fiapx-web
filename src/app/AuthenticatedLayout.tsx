import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { Logo } from '../shared/ui/Brand';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-surface-tint text-primary-ink' : 'text-muted hover:text-ink'}`;

/** Cabeçalho com navegação, usuário e "Sair" das telas autenticadas. */
export function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <nav aria-label="Principal" className="flex items-center gap-1">
              <NavLink to="/videos" className={navClass}>
                Meus vídeos
              </NavLink>
              <NavLink to="/conta/senha" className={navClass}>
                Trocar senha
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-white" aria-hidden>
              {initial}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
            >
              <LogOut size={18} aria-hidden /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted sm:px-8">
        © {new Date().getFullYear()} FIAP X — Hackathon PÓS TECH SOAT
      </footer>
    </div>
  );
}
