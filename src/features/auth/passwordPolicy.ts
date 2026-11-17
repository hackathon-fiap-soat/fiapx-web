/** Política de senha do fiapx-auth (ADR-017, openapi): 8 a 72 caracteres, maiúscula, número e símbolo. */
export interface PasswordRule {
  id: 'length' | 'upper' | 'number' | 'symbol';
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'De 8 a 72 caracteres', test: (p) => p.length >= 8 && p.length <= 72 },
  { id: 'upper', label: 'Pelo menos uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'Pelo menos um número', test: (p) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'Pelo menos um símbolo (!@#$%^&*)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Força de 0 a 4: quantas regras a senha cumpre (o comprimento acima de 12 não muda a validade). */
export function passwordStrength(password: string): number {
  return password ? PASSWORD_RULES.filter((rule) => rule.test(password)).length : 0;
}

export const STRENGTH_LABELS = ['', 'Fraca', 'Fraca', 'Média', 'Forte'] as const;
