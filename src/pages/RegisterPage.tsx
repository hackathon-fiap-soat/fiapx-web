import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, Lock, RotateCcw, UserRound } from 'lucide-react';
import { authApi } from '../features/auth/api';
import { isPasswordValid } from '../features/auth/passwordPolicy';
import { PasswordRequirements } from '../features/auth/PasswordRequirements';
import { ApiError } from '../shared/httpClient';
import { Alert } from '../shared/ui/Alert';
import { AuthCard } from '../shared/ui/Brand';
import { Button } from '../shared/ui/Button';
import { PasswordField, TextField } from '../shared/ui/TextField';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const localErrors = {
    name: name.trim() ? undefined : 'Informe seu nome.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : 'Informe um e-mail válido.',
    password: isPasswordValid(password) ? undefined : 'A senha não atende aos requisitos.',
    confirmation: confirmation === password && confirmation ? undefined : 'As senhas não conferem.',
  };
  const hasLocalErrors = Object.values(localErrors).some(Boolean);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    if (hasLocalErrors) return;
    setLoading(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password });
      navigate('/login', { state: { registered: true, email: email.trim() } });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'Não foi possível concluir o cadastro.'));
      setLoading(false);
    }
  }

  const show = (field: keyof typeof localErrors) => (submitted ? localErrors[field] : undefined) ?? error?.field(field);

  return (
    <AuthCard title="Criar sua conta" subtitle="Cadastre-se para enviar vídeos e extrair frames automaticamente." badge="Novo acesso">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <Alert tone="error">{error.message}</Alert>}
        <TextField
          label="Nome completo"
          name="name"
          autoComplete="name"
          maxLength={120}
          icon={<UserRound size={18} />}
          placeholder="Ex.: Maria Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={show('name')}
        />
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          maxLength={180}
          icon={<AtSign size={18} />}
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={show('email')}
        />
        <PasswordField
          label="Senha"
          name="password"
          autoComplete="new-password"
          maxLength={72}
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={show('password')}
        />
        <PasswordRequirements password={password} />
        <PasswordField
          label="Confirmação de senha"
          name="password_confirmation"
          autoComplete="new-password"
          maxLength={72}
          icon={<RotateCcw size={18} />}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={submitted ? localErrors.confirmation : undefined}
        />
        <p className="text-xs text-muted">Ao concluir, você vai para o login com um aviso de confirmação.</p>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Criar conta <ArrowRight size={18} aria-hidden />
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        Já possui cadastro?{' '}
        <Link to="/login" className="font-medium text-primary-ink hover:underline">
          Fazer login
        </Link>
      </p>
    </AuthCard>
  );
}
