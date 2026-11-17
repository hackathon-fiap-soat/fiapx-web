import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: ReactNode;
  /** Conteúdo à direita do rótulo (ex.: link "Esqueceu a senha?"). */
  labelAside?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, error, hint, labelAside, id, className = '', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-erro`;
  const hintId = `${inputId}-dica`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {labelAside}
      </div>
      <div
        className={`flex h-11 items-center gap-2 rounded-lg border bg-surface px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 ${
          error ? 'border-rose-400' : 'border-line'
        }`}
      >
        {icon && <span className="text-muted" aria-hidden>{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-full w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-placeholder focus:outline-none ${className}`}
          {...rest}
        />
      </div>
      {hint && (
        <div id={hintId} className="text-xs text-muted">
          {hint}
        </div>
      )}
      {error && (
        <p id={errorId} className="text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
});

type PasswordFieldProps = Omit<TextFieldProps, 'type'>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <TextField ref={ref} type={visible ? 'text' : 'password'} className="pr-8" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? `Ocultar ${props.label.toLowerCase()}` : `Mostrar ${props.label.toLowerCase()}`}
        className="absolute right-2 top-[34px] rounded p-1.5 text-muted hover:text-ink"
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
});
