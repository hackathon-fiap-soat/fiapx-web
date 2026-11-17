import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// DoD: cadastro → login → upload de 3 vídeos ao mesmo tempo → status atualizando sozinho → download dos zips.
// E2E_VIDEOS_DIR: pasta com vídeos reais (ex.: gerados com o ffmpeg da imagem do fiapx-video-processor).
const videosDir = process.env.E2E_VIDEOS_DIR ?? '';
const videos = (process.env.E2E_VIDEOS ?? 'aula-3.mp4,aula-4.mp4,aula-5.mp4').split(',');

test('DoD local: cadastro, login, 3 uploads, status sozinho e download dos zips', async ({ page }, testInfo) => {
  test.skip(!videosDir, 'Defina E2E_VIDEOS_DIR com 3 vídeos reais.');
  const email = `dod+${Date.now()}@example.com`;
  const password = 'Senha-forte-123!';

  await page.goto('/cadastro');
  await page.getByLabel('Nome completo').fill('Teste DoD');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByLabel('Confirmação de senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: /Criar conta/ }).click();
  await expect(page.getByText(/Conta criada com sucesso/)).toBeVisible();

  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: /Entrar na plataforma/ }).click();
  await expect(page).toHaveURL(/\/videos$/);
  await expect(page.getByText('Você ainda não enviou nenhum vídeo.')).toBeVisible();

  await page.getByTestId('file-input').setInputFiles(videos.map((name) => join(videosDir, name)));
  await expect(page.getByText('Enviado')).toHaveCount(videos.length, { timeout: 60_000 });

  const row = (name: string) => page.getByTestId('video-row').filter({ hasText: name });
  // Sem recarregar a página: o polling de 5 s leva cada vídeo até Concluído.
  for (const name of videos) {
    await expect(row(name).getByText('Concluído')).toBeVisible({ timeout: 180_000 });
  }
  await expect(page.getByText('Todos os vídeos finalizados')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('painel-concluido.png'), fullPage: true });

  for (const name of videos) {
    const download = page.waitForEvent('download');
    await row(name).getByRole('button', { name: /Baixar ZIP/ }).click();
    const file = testInfo.outputPath(`${name}.zip`);
    await (await download).saveAs(file);
    const listing = execFileSync('unzip', ['-l', file]).toString();
    const frames = (listing.match(/frame_\d+\.png/g) ?? []).length;
    console.log(`${name}: zip de ${statSync(file).size} bytes com ${frames} frames`);
    expect(frames).toBeGreaterThan(0);
    await expect(row(name).getByText(`${frames} frames`)).toBeVisible();
  }
});
