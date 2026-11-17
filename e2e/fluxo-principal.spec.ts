import { expect, test } from '@playwright/test';

// Fluxo principal da spec (§8.7): login → upload de 3 vídeos ao mesmo tempo → status atualizando sozinho.
test('login, upload de 3 vídeos e status até Concluído', async ({ page }) => {
  await page.goto('/videos');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('E-mail').fill('demo@fiapx.com');
  await page.getByLabel('Senha', { exact: true }).fill('senha12345');
  await page.getByRole('button', { name: /Entrar na plataforma/ }).click();

  await expect(page).toHaveURL(/\/videos$/);
  await expect(page.getByRole('heading', { name: 'Meus vídeos' })).toBeVisible();
  await expect(page.getByText('aula-01-introducao.mp4')).toBeVisible();

  const video = (name: string) => ({ name, mimeType: 'video/mp4', buffer: Buffer.alloc(800_000, 1) });
  await page.getByTestId('file-input').setInputFiles([video('e2e-aula-1.mp4'), video('e2e-aula-2.mp4'), video('e2e-com-erro.mp4')]);

  await expect(page.getByRole('heading', { name: 'Uploads em andamento' })).toBeVisible();
  await expect(page.getByText('Enviado')).toHaveCount(3);

  const row = (name: string) => page.getByTestId('video-row').filter({ hasText: name });
  for (const name of ['e2e-aula-1.mp4', 'e2e-aula-2.mp4', 'e2e-com-erro.mp4']) {
    await expect(row(name)).toBeVisible();
  }
  await expect(page.getByText(/Atualização automática/)).toBeVisible();

  // Sem recarregar: o polling de 5 s leva os vídeos até o estado final (~15 s no mock).
  await expect(row('e2e-aula-1.mp4').getByText('Concluído')).toBeVisible({ timeout: 40_000 });
  await expect(row('e2e-aula-2.mp4').getByText('Concluído')).toBeVisible({ timeout: 40_000 });
  await expect(row('e2e-com-erro.mp4').getByText('Falhou')).toBeVisible({ timeout: 40_000 });
  await expect(row('e2e-com-erro.mp4').getByText(/corrompido/)).toBeVisible();
  await expect(row('e2e-aula-1.mp4').getByRole('button', { name: /Baixar ZIP/ })).toBeVisible();
  await expect(page.getByText('Todos os vídeos finalizados')).toBeVisible();

  const download = page.waitForEvent('download');
  await row('e2e-aula-1.mp4').getByRole('button', { name: /Baixar ZIP/ }).click();
  expect((await download).suggestedFilename()).toBe('e2e-aula-1-frames.zip');
});
