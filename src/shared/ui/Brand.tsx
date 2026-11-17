import type { ReactNode } from 'react';

/** Logo em texto: "FIAP X" + subtítulo. */
export function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  if (size === 'sm') {
    return (
      <span className="flex items-baseline gap-2">
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          FIAP <span className="text-primary">X</span>
        </span>
        <span className="hidden border-l border-line pl-2 text-sm text-muted sm:inline">Processador de Vídeos</span>
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-4xl font-bold tracking-tight text-ink">
        FIAP <span className="text-primary">X</span>
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Processador de vídeos</span>
    </div>
  );
}

/** Card central das telas públicas (login, cadastro, senha), com a faixa em gradiente do layout. */
export function AuthCard({ title, subtitle, badge, children }: { title: string; subtitle?: ReactNode; badge?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:items-center">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-line bg-surface shadow-modal">
        <div className="h-1.5 bg-gradient-to-r from-primary-active via-primary to-blue-600" aria-hidden />
        <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center gap-3 text-center">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-tint px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                {badge}
              </span>
            )}
            <Logo />
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
