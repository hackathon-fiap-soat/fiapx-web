import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createVideo, DEMO_USER, markUploaded, setTiming } from '../mocks/db';
import { server } from '../mocks/server';
import { renderApp } from '../test/render';
import { getToken } from '../shared/tokenStore';

const rows = () => screen.getAllByTestId('video-row');
const rowOf = (name: string) => rows().find((row) => within(row).queryByText(name))!;

describe('VideosPage', () => {
  it('lista os vídeos com status, frames, motivo da falha e o total', async () => {
    renderApp('/videos', { loggedIn: true });
    expect(await screen.findByText('aula-01-introducao.mp4')).toBeInTheDocument();
    expect(screen.getByText('Olá,')).toBeInTheDocument();
    expect(screen.getAllByText('Demo Usuário').length).toBeGreaterThan(0);
    expect(within(rowOf('aula-01-introducao.mp4')).getByText('Concluído')).toBeInTheDocument();
    expect(within(rowOf('aula-01-introducao.mp4')).getByText('184 frames')).toBeInTheDocument();
    expect(within(rowOf('gravacao-com-erro.avi')).getByText('Falhou')).toBeInTheDocument();
    expect(screen.getByText(/O arquivo de vídeo está corrompido/)).toBeInTheDocument();
    expect(screen.getByLabelText('2 vídeos')).toBeInTheDocument();
    expect(screen.getByText('Todos os vídeos finalizados')).toBeInTheDocument();
    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 1 a 2 de 2 vídeos');
  });

  it('envia 3 vídeos ao mesmo tempo direto ao "S3" e eles entram na lista', async () => {
    const { user } = renderApp('/videos', { loggedIn: true });
    await screen.findByText('aula-01-introducao.mp4');
    const files = ['aula-a.mp4', 'aula-b.mov', 'aula-c.mkv'].map((name) => new File(['0123456789'], name, { type: '' }));
    await user.upload(screen.getByTestId('file-input'), files);

    expect(screen.getByRole('heading', { name: 'Uploads em andamento' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText('Enviado')).toHaveLength(3), { timeout: 4000 });
    await waitFor(() => expect(rows()).toHaveLength(5));
    for (const name of ['aula-a.mp4', 'aula-b.mov', 'aula-c.mkv']) {
      expect(within(rowOf(name)).getByText(/Recebido|Na fila/)).toBeInTheDocument();
    }
    expect(screen.getByText(/Atualização automática/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar concluídos' }));
    expect(screen.queryByRole('heading', { name: 'Uploads em andamento' })).not.toBeInTheDocument();
  });

  it('arquivo de formato inválido é recusado no cliente', async () => {
    renderApp('/videos', { loggedIn: true });
    await screen.findByText('aula-01-introducao.mp4');
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [new File(['x'], 'foto.png', { type: 'image/png' })] } });
    expect(await screen.findByText(/Formato não aceito/)).toBeInTheDocument();
    expect(rows()).toHaveLength(2);
  });

  it('aceita arquivos arrastados para a área de upload', async () => {
    renderApp('/videos', { loggedIn: true });
    await screen.findByText('aula-01-introducao.mp4');
    const dropzone = screen.getByTestId('dropzone');
    const file = new File(['x'], 'arrastado.txt');
    await act(async () => {
      dropzone.dispatchEvent(Object.assign(new Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: { files: [] } }));
      dropzone.dispatchEvent(Object.assign(new Event('dragleave', { bubbles: true }), { dataTransfer: { files: [] } }));
      dropzone.dispatchEvent(Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: { files: [file] } }));
    });
    expect(await screen.findByText('arrastado.txt')).toBeInTheDocument();
  });

  it('atualiza o status sozinho (polling de 5 s) enquanto há vídeo não final', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      setTiming({ uploadedMs: 0, queuedMs: 1000, processingMs: 3000 });
      const video = createVideo(DEMO_USER.id, 'em-andamento.mp4', 4_000_000);
      markUploaded(video.key);
      renderApp('/videos', { loggedIn: true });
      expect(await within(await screen.findByText('em-andamento.mp4').then(() => rowOf('em-andamento.mp4'))).findByText('Na fila')).toBeInTheDocument();
      expect(screen.getByText(/Atualização automática \(a cada 5 s\)/)).toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5100);
      });
      await waitFor(() => expect(within(rowOf('em-andamento.mp4')).getByText('Concluído')).toBeInTheDocument());
      expect(screen.getByText('Todos os vídeos finalizados')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('baixa o zip pelo link pré-assinado', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { user } = renderApp('/videos', { loggedIn: true });
    await user.click(await screen.findByRole('button', { name: 'Baixar ZIP de aula-01-introducao.mp4' }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.href).toMatch(/^data:application\/zip/);
    expect(anchor.download).toBe('aula-01-introducao-frames.zip');
  });

  it('erro ao gerar o link de download aparece na tela', async () => {
    server.use(http.get('/api/videos/:id/download', () => HttpResponse.json({ message: 'O vídeo ainda não está pronto para download.' }, { status: 409 })));
    const { user } = renderApp('/videos', { loggedIn: true });
    await user.click(await screen.findByRole('button', { name: 'Baixar ZIP de aula-01-introducao.mp4' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('O vídeo ainda não está pronto para download.');
  });

  it('filtra por status e mostra o estado vazio', async () => {
    const { user } = renderApp('/videos', { loggedIn: true });
    await screen.findByText('aula-01-introducao.mp4');
    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'EXPIRED');
    expect(await screen.findByText('Nenhum vídeo com esse status.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'FAILED');
    expect(await screen.findByText('gravacao-com-erro.avi')).toBeInTheDocument();
    expect(screen.queryByText('aula-01-introducao.mp4')).not.toBeInTheDocument();
  });

  it('usuário sem vídeos vê o estado vazio amigável', async () => {
    server.use(http.get('/api/videos', () => HttpResponse.json({ data: [], meta: { page: 1, per_page: 10, total: 0 } })));
    renderApp('/videos', { loggedIn: true });
    expect(await screen.findByText('Você ainda não enviou nenhum vídeo.')).toBeInTheDocument();
  });

  it('pagina a lista', async () => {
    for (let i = 0; i < 11; i += 1) createVideo(DEMO_USER.id, `extra-${i}.mp4`, 10, Date.now() - i);
    const { user } = renderApp('/videos', { loggedIn: true });
    await screen.findByText('extra-0.mp4');
    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 1 a 10 de 13 vídeos');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(await screen.findByText('gravacao-com-erro.avi')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(await screen.findByText('extra-0.mp4')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: /Itens por página/ }), '25');
    await waitFor(() => expect(rows()).toHaveLength(13));
    await user.click(screen.getByRole('button', { name: 'Atualizar lista' }));
  });

  it('erro ao carregar a lista mostra a mensagem', async () => {
    server.use(http.get('/api/videos', () => HttpResponse.json({ message: 'Os dados informados são inválidos.' }, { status: 422 })));
    renderApp('/videos', { loggedIn: true });
    expect(await screen.findByRole('alert')).toHaveTextContent('Os dados informados são inválidos.');
  });

  it('403 da API (token recusado) limpa a sessão e volta ao login', async () => {
    server.use(http.get('/api/videos', () => HttpResponse.json({ message: 'Forbidden' }, { status: 403 })));
    renderApp('/videos', { loggedIn: true });
    expect(await screen.findByText('Sua sessão expirou. Entre novamente.')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(getToken()).toBeNull();
  });

  it('Sair encerra a sessão', async () => {
    const { user } = renderApp('/videos', { loggedIn: true });
    await screen.findByText('aula-01-introducao.mp4');
    await user.click(screen.getByRole('button', { name: /Sair/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(screen.queryByText('Sua sessão expirou. Entre novamente.')).not.toBeInTheDocument();
    expect(getToken()).toBeNull();
  });
});
