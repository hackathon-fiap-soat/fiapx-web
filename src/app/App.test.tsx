import { render, screen } from '@testing-library/react';
import { ApiError } from '../shared/httpClient';
import { App } from './App';
import { createQueryClient } from './queryClient';

describe('App', () => {
  it('sem sessão, a raiz leva ao login', async () => {
    window.history.replaceState(null, '', '/');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Acessar plataforma' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('não repete erros 4xx; repete até 2 vezes falhas de rede e 5xx', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (count: number, error: unknown) => boolean;
    expect(retry(0, new ApiError(403, 'x'))).toBe(false);
    expect(retry(0, new ApiError(503, 'x'))).toBe(true);
    expect(retry(2, new ApiError(0, 'x'))).toBe(false);
  });
});
