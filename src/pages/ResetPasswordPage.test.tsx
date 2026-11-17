import { screen } from '@testing-library/react';
import { MOCK_RESET_TOKEN } from '../mocks/db';
import { renderApp } from '../test/render';

describe('ResetPasswordPage', () => {
  it('confere o link, mostra e-mail mascarado e expiração, salva e já entra', async () => {
    const { user } = renderApp(`/redefinir-senha?token=${MOCK_RESET_TOKEN}`);
    expect(screen.getByText(/Verificando o link/)).toBeInTheDocument();
    expect(await screen.findByText('d***o@fiapx.com')).toBeInTheDocument();
    expect(screen.getByText(/Expira em (29|30) min/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nova senha'), 'curta');
    await user.click(screen.getByRole('button', { name: /Salvar nova senha e entrar/ }));
    expect(screen.getByText('A senha não atende aos requisitos.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Nova senha'));
    await user.type(screen.getByLabelText('Nova senha'), 'Nova-senha-456!');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'Nova-senha-456!');
    await user.click(screen.getByRole('button', { name: /Salvar nova senha e entrar/ }));
    expect(await screen.findByRole('heading', { name: 'Meus vídeos' })).toBeInTheDocument();
  });

  it('link inválido mostra a mensagem e o caminho para pedir outro', async () => {
    renderApp(`/redefinir-senha?token=${'x'.repeat(43)}`);
    expect(await screen.findByRole('alert')).toHaveTextContent('O link de redefinição é inválido ou expirou. Peça um novo.');
    expect(screen.getByRole('link', { name: 'Pedir um novo link' })).toHaveAttribute('href', '/recuperar-senha');
  });

  it('sem token nem chama a API', () => {
    renderApp('/redefinir-senha');
    expect(screen.getByRole('alert')).toHaveTextContent(/inválido ou expirou/);
  });
});
