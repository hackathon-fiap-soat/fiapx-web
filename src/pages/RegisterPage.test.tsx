import { screen } from '@testing-library/react';
import { renderApp } from '../test/render';

interface FormValues {
  name?: string;
  email?: string;
  password?: string;
  confirmation?: string;
}

async function fill(user: ReturnType<typeof renderApp>['user'], values: FormValues = {}) {
  const { name = 'Maria Silva', email = 'maria@example.com', password = 'Senha-forte-123!' } = values;
  const confirmation = values.confirmation ?? password;
  if (name) await user.type(screen.getByLabelText('Nome completo'), name);
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (password) await user.type(screen.getByLabelText('Senha'), password);
  if (confirmation) await user.type(screen.getByLabelText('Confirmação de senha'), confirmation);
  await user.click(screen.getByRole('button', { name: /Criar conta/ }));
}

describe('RegisterPage', () => {
  it('valida no front: campos vazios, política de senha e confirmação', async () => {
    const { user } = renderApp('/cadastro');
    await fill(user, { name: '', email: 'invalido', password: 'fraca', confirmation: 'outra' });
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('A senha não atende aos requisitos.')).toBeInTheDocument();
    expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/cadastro');
  });

  it('checklist da política acompanha a digitação', async () => {
    const { user } = renderApp('/cadastro');
    await user.type(screen.getByLabelText('Senha'), 'Abc');
    expect(screen.getByText(/Pelo menos uma letra maiúscula/)).toHaveTextContent('(atendido)');
    expect(screen.getByText(/Pelo menos um número/)).toHaveTextContent('(pendente)');
    expect(screen.getByText(/Força da senha/)).toHaveTextContent('Fraca');
  });

  it('cadastra e vai para o login com aviso de sucesso e o e-mail preenchido', async () => {
    const { user } = renderApp('/cadastro');
    await fill(user);
    expect(await screen.findByText(/Conta criada com sucesso/)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(screen.getByLabelText('E-mail')).toHaveValue('maria@example.com');
  });

  it('e-mail repetido mostra o 422 genérico da API', async () => {
    const { user } = renderApp('/cadastro');
    await fill(user, { email: 'demo@fiapx.com' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível concluir o cadastro.');
  });
});
