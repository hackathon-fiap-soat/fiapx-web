import { useState, type FormEvent } from 'react';
import { KeyRound, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { authApi } from '../features/auth/api';
import { isPasswordValid } from '../features/auth/passwordPolicy';
import { PasswordRequirements } from '../features/auth/PasswordRequirements';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { Button } from '../shared/ui/Button';
import { PasswordField } from '../shared/ui/TextField';

/** /conta/senha: seção "Segurança & Troca de Senha" do layout de editar perfil (o resto está fora do escopo). */
export function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    current: current ? undefined : 'Informe a senha atual.',
    password: !isPasswordValid(password)
      ? 'A senha não atende aos requisitos.'
      : password === current
        ? 'A nova senha deve ser diferente da atual.'
        : undefined,
    confirmation: confirmation && confirmation === password ? undefined : 'As senhas não conferem.',
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    setSuccess(false);
    if (errors.current || errors.password || errors.confirmation) return;
    setLoading(true);
    try {
      await authApi.changePassword({ current_password: current, new_password: password });
      setSuccess(true);
      setSubmitted(false);
      setCurrent('');
      setPassword('');
      setConfirmation('');
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'Não foi possível alterar a senha.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <header className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-surface-tint text-primary-ink" aria-hidden>
          <ShieldCheck size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Segurança e troca de senha</h1>
          <p className="text-sm text-muted">Confirme a senha atual e escolha uma nova. Você receberá um e-mail de confirmação.</p>
        </div>
      </header>
      {success && <Alert tone="success">Senha alterada com sucesso.</Alert>}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && !error.field('current_password') && !error.field('new_password') && <Alert tone="error">{error.message}</Alert>}
        <PasswordField
          label="Senha atual"
          name="current_password"
          autoComplete="current-password"
          icon={<KeyRound size={18} />}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={(submitted ? errors.current : undefined) ?? error?.field('current_password')}
        />
        <PasswordField
          label="Nova senha"
          name="new_password"
          autoComplete="new-password"
          maxLength={72}
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={(submitted ? errors.password : undefined) ?? error?.field('new_password')}
        />
        <PasswordRequirements password={password} />
        <PasswordField
          label="Confirmar nova senha"
          name="new_password_confirmation"
          autoComplete="new-password"
          maxLength={72}
          icon={<RotateCcw size={18} />}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={submitted ? errors.confirmation : undefined}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Atualizar senha
          </Button>
        </div>
      </form>
    </section>
  );
}
