import { CheckCircle2, Circle } from 'lucide-react';
import { PASSWORD_RULES, passwordStrength, STRENGTH_LABELS } from './passwordPolicy';

const BAR_COLORS = ['bg-surface-muted', 'bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

/** Medidor de força + checklist da política de senha. */
export function PasswordRequirements({ password }: { password: string }) {
  const strength = passwordStrength(password);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={`h-1 flex-1 rounded-full ${strength >= step ? BAR_COLORS[strength] : 'bg-surface-muted'}`} />
        ))}
      </div>
      {password && (
        <p className="sr-only" aria-live="polite">
          Força da senha: {STRENGTH_LABELS[strength]}
        </p>
      )}
      <div className="rounded-lg bg-surface-tint px-3 py-3">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">Requisitos de segurança</p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password);
            return (
              <li key={rule.id} className={`flex items-center gap-2 ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted'}`}>
                {ok ? <CheckCircle2 size={16} aria-hidden /> : <Circle size={16} aria-hidden />}
                <span>
                  {rule.label}
                  <span className="sr-only">{ok ? ' (atendido)' : ' (pendente)'}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
