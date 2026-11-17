import { screen } from '@testing-library/react';
import { renderApp } from '../test/render';

async function submit(user: ReturnType<typeof renderApp>['user'], current: string, next: string, confirmation = next) {
  if (current) await user.type(screen.getByLabelText('Senha atual'), current);
  if (next) await user.type(screen.getByLabelText('Nova senha'), next);
  if (confirmation) await user.type(screen.getByLabelText('Confirmar nova senha'), confirmation);
  await user.click(screen.getByRole('button', { name: 'Atualizar senha' }));
}

describe('ChangePasswordPage', () => {
  it('valida no front antes de chamar a API', async () => {
    const { user } = renderApp('/conta/senha', { loggedIn: true });
    await submit(user, '', 'fraca', 'outra');
    expect(screen.getByText('Informe a senha atual.')).toBeInTheDocument();
    expect(screen.getByText('A senha não atende aos requisitos.')).toBeInTheDocument();
    expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
  });

  it('nova senha igual à atual é recusada', async () => {
    const { user } = renderApp('/conta/senha', { loggedIn: true });
    await submit(user, 'Senha-forte-123!', 'Senha-forte-123!');
    expect(screen.getByText('A nova senha deve ser diferente da atual.')).toBeInTheDocument();
  });

  it('senha atual errada mostra o erro do campo vindo da API', async () => {
    const { user } = renderApp('/conta/senha', { loggedIn: true });
    await submit(user, 'errada', 'Nova-senha-456!');
    expect(await screen.findByText('A senha atual está incorreta.')).toBeInTheDocument();
  });

  it('troca a senha e limpa o formulário', async () => {
    const { user } = renderApp('/conta/senha', { loggedIn: true });
    await submit(user, 'senha12345', 'Nova-senha-456!');
    expect(await screen.findByText('Senha alterada com sucesso.')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
  });
});
