import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Terminal } from 'lucide-react';
import { authApi } from '../features/auth/api';
import { useAuth } from '../features/auth/useAuth';
import { USE_MOCKS } from '../shared/config';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { AuthCard } from '../shared/ui/Brand';
import { Button } from '../shared/ui/Button';
import { PasswordField, TextField } from '../shared/ui/TextField';

interface LoginState {
  expired?: boolean;
  registered?: boolean;
  passwordChanged?: boolean;
  email?: string;
  from?: string;
}

export function LoginPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as LoginState;
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(state.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await authApi.login({ email: email.trim(), password });
      signIn(token.access_token);
      navigate(state.from && state.from !== '/login' ? state.from : '/videos', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'Não foi possível entrar.'));
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Acessar plataforma" subtitle="Entre com suas credenciais para gerenciar a extração de frames dos seus vídeos.">
      {state.expired && <Alert tone="info">Sua sessão expirou. Entre novamente.</Alert>}
      {state.registered && <Alert tone="success">Conta criada com sucesso. Entre com seu e-mail e senha.</Alert>}
      {state.passwordChanged && <Alert tone="success">Senha alterada. Entre com a nova senha.</Alert>}
      {USE_MOCKS && (
        <div className="flex items-start gap-3 rounded-lg bg-surface-tint px-3 py-3 text-sm">
          <Terminal size={18} className="mt-0.5 text-primary-ink" aria-hidden />
          <div>
            <p className="font-medium text-ink">
              Ambiente de demonstração <span className="ml-1 rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">MOCK MSW</span>
            </p>
            <p className="font-mono text-xs text-muted">demo@fiapx.com / senha12345</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && !error.field('email') && !error.field('password') && <Alert tone="error">{error.message}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          icon={<Mail size={18} />}
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error?.field('email')}
        />
        <PasswordField
          label="Senha"
          name="password"
          autoComplete="current-password"
          required
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error?.field('password')}
          labelAside={
            <Link to="/recuperar-senha" className="text-sm text-primary-ink hover:underline">
              Esqueceu a senha?
            </Link>
          }
        />
        <Button type="submit" size="lg" fullWidth loading={loading} disabled={!email || !password}>
          Entrar na plataforma <ArrowRight size={18} aria-hidden />
        </Button>
      </form>
      <div className="flex items-center gap-3 font-mono text-xs text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      <p className="text-center text-sm text-muted">
        Ainda não tem uma conta?{' '}
        <Link to="/cadastro" className="font-medium text-primary-ink hover:underline">
          Criar conta no FIAP X
        </Link>
      </p>
    </AuthCard>
  );
}
