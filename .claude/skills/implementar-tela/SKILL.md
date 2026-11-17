---
name: implementar-tela
description: Passo a passo para implementar uma tela do fiapx-web em React a partir do layout do Google Stitch, integrada aos contratos reais da API. Use ao criar ou ajustar qualquer tela ou componente visual.
---

# Implementar uma tela

1. **Escopo:** confira a tabela "Layout de referência" do `README.md`. Telas e seções fora do escopo não são
   implementadas, e os elementos do painel sem suporte na API seguem o "Tratamento previsto".
2. **Referência visual:** abra `stitch_fiap_x_video_processor_front_end/<tela>/code.html` e o `screen.png`.
   Siga o `fiap_x_video_engine/DESIGN.md` (cores, tipografia Hanken Grotesk + Inter + JetBrains Mono,
   badges de status, componentes). O HTML do Stitch é referência, não código de produção: reescreva em
   componentes React + Tailwind, sem copiar o CDN.
3. **Contrato:** endpoints, payloads e erros em `fiapx-docs/api/openapi.yaml`. Regras de UX em
   `fiapx-docs/00-especificacao/Prompt-layout-web.md`.
4. **Comportamentos obrigatórios:**
   - 401 ou 403 da API → limpa a sessão e volta ao login ("sessão expirada");
   - erros 422 mostram a mensagem genérica da API, sem revelar se o e-mail existe;
   - política de senha (8 a 72, maiúscula, número e símbolo) validada também no front;
   - upload: `POST /api/videos` → `POST` multipart no S3 com os `fields` na ordem e o arquivo por último,
     progresso por `XMLHttpRequest`, limite de 500 MB;
   - polling de 5 s enquanto houver vídeo em estado não final; motivo de falha legível a partir do
     `failure_code`.
5. **Onde fica:** página em `src/pages/`, lógica e componentes da funcionalidade em `src/features/<auth|videos>/`,
   chamadas HTTP só pelo `request()` de `src/shared/httpClient.ts` (`auth: true` nas rotas protegidas) e
   componentes visuais reutilizáveis em `src/shared/ui/`. Rota nova em `src/app/AppRoutes.tsx` (dentro do
   `ProtectedRoute` se exigir login).
6. **Mock:** atualize `src/mocks/handlers.ts` (e o estado em `src/mocks/db.ts`) para a tela funcionar sem
   back-end, com as mesmas respostas e erros do OpenAPI. Confira em `npm run dev:mock`.
7. **Testes:** Vitest + Testing Library com `renderApp(path, { loggedIn })` de `src/test/render.tsx` (app inteiro
   + MSW), cobrindo carregamento, sucesso e erro; `server.use(...)` para forçar um erro. Cobertura ≥ 80%
   (`npm run test:coverage`), `npm run lint` e `npm run typecheck` limpos. Fluxo novo de ponta a ponta entra em
   `e2e/` (mock, roda no CI) e, se depender do back-end real, em `e2e-local/`.
8. **Back-end real:** `npm run dev` com o stack local de pé (README, "Fluxo ponta a ponta local"); o Vite tem de
   estar em `http://localhost:5173` por causa do CORS do bucket do LocalStack.
9. Atualize o README (rotas, variáveis, escopo) e abra o PR com a skill `fiapx-pr`.
