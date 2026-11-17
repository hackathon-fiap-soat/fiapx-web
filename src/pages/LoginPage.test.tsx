import { screen } from '@testing-library/react';
import { renderApp } from '../test/render';
import { getToken } from '../shared/tokenStore';

describe('LoginPage', () => {
  it('entra com o usuário demo e vai para /videos', async () => {
    const { user } = renderApp('/login');
    await user.type(screen.getByLabelText('E-mail'), 'demo@fiapx.com');
    await user.type(screen.getByLabelText('Senha'), 'senha12345');
    await user.click(screen.getByRole('button', { name: /Entrar na plataforma/ }));
    expect(await screen.findByRole('heading', { name: 'Meus vídeos' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/videos');
    expect(getToken()).toMatch(/\.mock$/);
  });

  it('credenciais inválidas mostram a mensagem genérica da API', async () => {
    const { user } = renderApp('/login');
    await user.type(screen.getByLabelText('E-mail'), 'demo@fiapx.com');
    await user.type(screen.getByLabelText('Senha'), 'errada');
    await user.click(screen.getByRole('button', { name: /Entrar na plataforma/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('mostrar/ocultar senha', async () => {
    const { user } = renderApp('/login');
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('quem já está logado vai direto ao painel', async () => {
    renderApp('/login', { loggedIn: true });
    expect(await screen.findByRole('heading', { name: 'Meus vídeos' })).toBeInTheDocument();
  });

  it('rota protegida sem sessão volta ao login', () => {
    renderApp('/conta/senha');
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(screen.getByRole('heading', { name: 'Acessar plataforma' })).toBeInTheDocument();
  });
});
