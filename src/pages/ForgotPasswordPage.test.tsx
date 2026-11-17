import { act, screen } from '@testing-library/react';
import { renderApp } from '../test/render';

describe('ForgotPasswordPage', () => {
  it('sempre confirma o pedido e só libera outro depois de 2 minutos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { user } = renderApp('/recuperar-senha');
    await user.type(screen.getByLabelText('E-mail'), 'demo@fiapx.com');
    await user.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));
    expect(await screen.findByText(/Se o e-mail estiver cadastrado/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pedir outro link em 2:00/ })).toBeDisabled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('/redefinir-senha?token='));

    for (let second = 0; second < 121; second += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }
    expect(screen.getByRole('button', { name: 'Enviar de novo' })).toBeEnabled();
    vi.useRealTimers();
  });

  it('e-mail inválido mostra o erro do campo', async () => {
    const { user } = renderApp('/recuperar-senha');
    await user.type(screen.getByLabelText('E-mail'), 'x');
    await user.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));
    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
  });
});
