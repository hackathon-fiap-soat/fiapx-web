import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { authApi } from '../features/auth/api';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { AuthCard } from '../shared/ui/Brand';
import { Button } from '../shared/ui/Button';
import { TextField } from '../shared/ui/TextField';

/** Intervalo para pedir outro link (Prompt-layout-web: "permite pedir de novo após 2 minutos"). */
export const RESEND_AFTER_SECONDS = 120;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
      setCooldown(RESEND_AFTER_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'Não foi possível enviar o pedido.'));
    } finally {
      setLoading(false);
    }
  }

  const minutes = Math.floor(cooldown / 60);
  const seconds = String(cooldown % 60).padStart(2, '0');

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha."
      badge="Recuperação de acesso"
    >
      {sent && (
        <Alert tone="success">
          Se o e-mail estiver cadastrado, você receberá as instruções em instantes. O link vale 30 minutos e só pode ser usado uma vez.
        </Alert>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && !error.field('email') && <Alert tone="error">{error.message}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          icon={<Mail size={18} />}
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error?.field('email')}
        />
        <Button type="submit" size="lg" fullWidth loading={loading} disabled={!email || cooldown > 0} icon={<Send size={18} aria-hidden />}>
          {cooldown > 0 ? `Pedir outro link em ${minutes}:${seconds}` : sent ? 'Enviar de novo' : 'Enviar link de redefinição'}
        </Button>
      </form>
      <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Voltar ao login
      </Link>
    </AuthCard>
  );
}
