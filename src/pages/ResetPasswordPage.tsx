import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { authApi, type ResetTokenInfo } from '../features/auth/api';
import { isPasswordValid } from '../features/auth/passwordPolicy';
import { PasswordRequirements } from '../features/auth/PasswordRequirements';
import { useAuth } from '../features/auth/useAuth';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { AuthCard } from '../shared/ui/Brand';
import { Button } from '../shared/ui/Button';
import { Spinner } from '../shared/ui/Spinner';
import { PasswordField } from '../shared/ui/TextField';

type TokenState = { kind: 'checking' } | { kind: 'valid'; info: ResetTokenInfo } | { kind: 'invalid'; message: string };

const INVALID_LINK = 'O link de redefinição é inválido ou expirou. Peça um novo.';

function minutesLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000));
}

/** /redefinir-senha?token=...: confere o link, mostra o e-mail mascarado e cria a nova senha já entrando. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [tokenState, setTokenState] = useState<TokenState>({ kind: 'checking' });
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (token.length < 43) {
      setTokenState({ kind: 'invalid', message: INVALID_LINK });
      return;
    }
    authApi
      .verifyResetToken(token)
      .then((info) => !cancelled && setTokenState({ kind: 'valid', info }))
      .catch((err: unknown) => {
        if (!cancelled) setTokenState({ kind: 'invalid', message: err instanceof ApiError && err.status === 422 ? err.message : INVALID_LINK });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordError = isPasswordValid(password) ? undefined : 'A senha não atende aos requisitos.';
  const confirmationError = confirmation && confirmation === password ? undefined : 'As senhas não conferem.';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    if (passwordError || confirmationError) return;
    setLoading(true);
    try {
      const result = await authApi.resetPassword({ token, password });
      signIn(result.access_token);
      navigate('/videos', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'Não foi possível salvar a nova senha.'));
      setLoading(false);
    }
  }

  if (tokenState.kind === 'checking') {
    return (
      <AuthCard title="Criar nova senha" badge="Nova credencial">
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <Spinner size={18} label="" /> Verificando o link…
        </div>
      </AuthCard>
    );
  }

  if (tokenState.kind === 'invalid') {
    return (
      <AuthCard title="Link inválido" badge="Nova credencial">
        <Alert tone="error">{tokenState.message}</Alert>
        <Link to="/recuperar-senha" className="text-center text-sm font-medium text-primary-ink hover:underline">
          Pedir um novo link
        </Link>
      </AuthCard>
    );
  }

  const { info } = tokenState;
  return (
    <AuthCard
      title="Criar nova senha"
      badge="Nova credencial"
      subtitle={
        <>
          Defina uma nova senha para a conta <span className="font-medium text-ink">{info.email_masked}</span>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-surface-tint px-3 py-2 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-tertiary" aria-hidden /> Link válido
        </span>
        <span>• Expira em {minutesLeft(info.expires_at)} min</span>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <Alert tone="error">{error.field('password') ?? error.message}</Alert>}
        <PasswordField
          label="Nova senha"
          name="password"
          autoComplete="new-password"
          maxLength={72}
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted ? passwordError : undefined}
        />
        <PasswordRequirements password={password} />
        <PasswordField
          label="Confirmar nova senha"
          name="password_confirmation"
          autoComplete="new-password"
          maxLength={72}
          icon={<RotateCcw size={18} />}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={submitted ? confirmationError : undefined}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Salvar nova senha e entrar <ArrowRight size={18} aria-hidden />
        </Button>
      </form>
      <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Cancelar e voltar ao login
      </Link>
    </AuthCard>
  );
}
