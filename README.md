# fiapx-web

Front-end do FIAP X: cadastro, login, upload de vários vídeos, lista de status e download do zip. Servido por um pod nginx no EKS, na mesma origem da API (rota `$default` do API Gateway, ADR-019).

> Parte do **Hackathon FIAP X — Processador de Vídeos** (PÓS TECH SOAT, Fase 5).
> A documentação vem antes do código: a arquitetura, as decisões (ADRs/RFCs) e os contratos ficam em
> [`fiapx-docs`](https://github.com/hackathon-fiap-soat/fiapx-docs) (spec §8.7, [OpenAPI](https://github.com/hackathon-fiap-soat/fiapx-docs/blob/main/api/openapi.yaml)).

## Stack

React 18 + Vite 7 + TypeScript (strict) + Tailwind 4, React Router, TanStack Query, lucide-react. Modo mock com
MSW 2. Testes com Vitest + Testing Library e Playwright. Em produção, nginx (`nginxinc/nginx-unprivileged`)
num pod do EKS, atrás da rota `$default` do API Gateway (ADR-019).

## Telas e rotas

| Rota | Tela | API |
|---|---|---|
| `/login` | Login | `POST /api/auth/login` |
| `/cadastro` | Cadastro (política de senha com checklist e medidor de força) | `POST /api/auth/register` |
| `/recuperar-senha` | Pedir link de redefinição (novo pedido só depois de 2 min) | `POST /api/auth/password/forgot` |
| `/redefinir-senha?token=` | Criar nova senha pelo link e já entrar | `POST /api/auth/password/reset/verify` e `/reset` |
| `/videos` (protegida) | Painel: upload múltiplo, uploads em andamento, "Meus vídeos" com filtro, paginação e download | `/api/videos*` + POST no S3 |
| `/conta/senha` (protegida) | Trocar senha logado | `PUT /api/auth/password` |

Comportamentos:

- **Sessão:** o `access_token` fica em memória + `sessionStorage` (nunca `localStorage`); nome e e-mail vêm das
  claims do JWT. Qualquer 401 ou 403 numa chamada autenticada (ou o fim da validade do token) limpa a sessão e
  volta ao login com "Sua sessão expirou".
- **Upload:** valida extensão e tamanho (500 MB) no cliente, faz `POST /api/videos` e envia o arquivo direto ao
  S3 por `XMLHttpRequest` (progresso por arquivo), com todos os `upload.fields` e o `file` por último, sem
  `Authorization`. No máximo 3 envios simultâneos; os demais esperam na fila.
- **Status:** a lista é recarregada a cada 5 s enquanto houver vídeo em estado não final (`PENDING_UPLOAD`,
  `UPLOADED`, `QUEUED`, `PROCESSING`). Falhas mostram o `failure_reason` (ou um texto pelo `failure_code`).
- **Download:** `GET /api/videos/{id}/download` e abre a URL pré-assinada do zip.

## Como rodar

Pré-requisito: Node.js 22 ou 24 (o CI e a imagem usam o 24).

```bash
npm ci
npm run dev:mock      # modo mock (MSW): sem back-end, em http://localhost:5173
npm run dev           # contra o back-end local (veja abaixo)
npm run build         # build de produção em dist/
```

**Modo mock** (`npm run dev:mock`, ou `VITE_USE_MOCKS=true`): o MSW responde a `/api/*` e ao "S3" no navegador.
Usuário de demonstração `demo@fiapx.com` / `senha12345` (já com dois vídeos de exemplo). Vídeos enviados passam
por `UPLOADED → QUEUED → PROCESSING → COMPLETED` em ~15 s; um nome com "erro" termina em `FAILED`. O link de
redefinição de senha do mock é `/redefinir-senha?token=demo-reset-token-0000000000000000000000000000` (também
aparece no console ao pedir a recuperação de `demo@fiapx.com`). O estado do mock é em memória e volta ao
inicial ao recarregar a página.

**Contra o back-end local** (`npm run dev`): o proxy do Vite faz o papel do API Gateway e mantém a mesma origem:
`/api/auth/*` vai para o `fiapx-auth` (`npm run dev`, porta 3001) e o resto de `/api` para o `fiapx-video-api`
(porta 8080). O upload vai direto ao S3 do LocalStack, cujo CORS só libera a origem `http://localhost:5173`
(`FIAPX_WEB_URL` do `fiapx-infra/local`): rode o Vite nessa porta.

### Fluxo ponta a ponta local (DoD da Etapa 6.5)

```bash
(cd ../fiapx-infra/local && docker compose up -d --wait)
(cd ../fiapx-auth && npm run dev)                    # porta 3001 (veja o README do fiapx-auth)
(cd ../fiapx-video-api && docker compose up -d)      # porta 8080, sem o profile simulador
(cd ../fiapx-video-processor && docker compose up -d)
(cd ../fiapx-notification && npm run dev)            # e-mails no Mailpit (http://localhost:8025)
npm run dev                                          # http://localhost:5173

# 3 vídeos reais (3, 4 e 5 s) e o teste: cadastro → login → 3 uploads → status sozinho → download dos zips
mkdir -p /tmp/videos && for d in 3 4 5; do docker run --rm -v /tmp/videos:/s fiapx-video-processor:dev \
  ffmpeg -loglevel error -f lavfi -i "testsrc=duration=${d}:size=320x240:rate=10" -pix_fmt yuv420p -y "/s/aula-${d}.mp4"; done
E2E_VIDEOS_DIR=/tmp/videos npm run test:e2e:local
```

## Como testar

```bash
npm run lint            # ESLint (zero avisos)
npm run typecheck       # tsc
npm test                # Vitest + Testing Library (MSW no Node)
npm run test:coverage   # com cobertura mínima de 80% (é o que o CI roda)
npm run test:e2e        # Playwright: login → upload de 3 vídeos → status até Concluído, contra o modo mock
npm run test:e2e:local  # o mesmo fluxo (com cadastro e download) contra o stack real local
```

Na primeira vez, instale o navegador do Playwright: `npx playwright install chromium`.

## Variáveis de ambiente

| Variável | Onde | Padrão | Uso |
|---|---|---|---|
| `VITE_API_BASE_URL` | build | `/api` | base das chamadas; site e API ficam na mesma origem (ADR-019) |
| `VITE_USE_MOCKS` | build | `false` (`true` no modo `mock`) | liga o MSW no navegador |
| `FIAPX_AUTH_URL` | `npm run dev` | `http://localhost:3001` | destino do proxy de `/api/auth` |
| `FIAPX_VIDEO_API_URL` | `npm run dev` | `http://localhost:8080` | destino do proxy do resto de `/api` |
| `E2E_BASE_URL`, `E2E_VIDEOS_DIR` | `test:e2e:local` | `http://localhost:5173`, — | URL do Vite e pasta com os vídeos |

Veja `.env.example` e `.env.mock`. Não há segredo no front-end.

## Imagem e deploy

- **Imagem** (`Dockerfile`): build do Vite com `VITE_API_BASE_URL=/api` → `nginxinc/nginx-unprivileged:1.29.8-alpine`,
  porta 8080, `USER 101:101` (o EKS exige `runAsNonRoot` com UID numérico). A imagem aplica `apk upgrade` (correções do Alpine posteriores à base). O nginx (`nginx/default.conf`) faz
  o fallback do SPA (`try_files ... /index.html`), cache longo em `/assets/`, `no-cache` no `index.html` e 404
  em JSON para `/api/*` (em produção o ALB manda `/api/*` ao video-api; o nginx não faz proxy).

  ```bash
  docker build -t fiapx-web .
  docker run --rm -p 8088:8080 fiapx-web   # http://localhost:8088/ e qualquer rota do SPA (ex.: /login)
  ```

- **Kubernetes** (`k8s/`, kustomize, namespace `fiapx`): Deployment `web` (2 réplicas, não root, raiz só
  leitura, probes em `GET /`), Service `web` (porta 80 → 8080) e TargetGroupBinding `web` (target type `ip`) no
  target group `fiapx-prod-web` (`/fiapx/prod/alb/web_target_group_arn`), o padrão do listener do ALB interno.
- **Terraform** (`infra/`, state `fiapx-web/prod.tfstate` no bucket `fiapx-tfstate-<conta>`): rota `$default`
  no HTTP API (`/fiapx/prod/apigw/api_id`), sem authorizer, integração `HTTP_PROXY` pelo VPC Link ao listener
  do ALB. As rotas específicas da API têm prioridade sobre ela.
- **Workflows** (nomes no padrão "<Tipo> · <o que faz>", com jobs e steps descritivos): `ci.yml`
  ("CI · lint, testes, build e imagem do site"; PR: lint, typecheck, testes com cobertura e SonarCloud (Quality Gate), build, E2E com mock, imagem + smoke +
  Trivy, kustomize + kubeconform, terraform fmt/validate e actionlint); `deploy.yml` ("Deploy · site (nginx no EKS) e rota $default"; merge na `main`,
  `workflow_dispatch` e `workflow_call` do `deploy-all`): credenciais do lab → SSM → imagem `linux/amd64` no ECR
  (`/fiapx/prod/ecr/fiapx-web/url`) → `terraform apply` da rota → `kubectl apply -k` → `rollout status` →
  smoke em `/` e `/login` na URL do site (`/fiapx/prod/web/url`); `destroy.yml` ("Destroy · site e rota $default";
  `workflow_call` do `destroy-all`, ou manual com `confirm = destroy-web`): remove os recursos do site no EKS e a rota.
  Precisam dos Secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN` (ADR-019).

## Layout de referência

A pasta [`stitch_fiap_x_video_processor_front_end/`](stitch_fiap_x_video_processor_front_end/) traz o layout
gerado pelo time no Google Stitch: HTML estático (Tailwind via CDN) e um `screen.png` por tela, mais o design
system em [`fiap_x_video_engine/DESIGN.md`](stitch_fiap_x_video_processor_front_end/fiap_x_video_engine/DESIGN.md)
(cores, tipografia Hanken Grotesk + Inter + JetBrains Mono, badges de status, componentes). Ele é a
referência visual da implementação em React (Etapa 6.5); não é código de produção (não entra na imagem).

| Tela | Pasta | Escopo |
|---|---|---|
| Login | `login_fiap_x/` | Implementar |
| Cadastro | `cadastro_fiap_x/` | Implementar |
| Painel de vídeos (upload + lista) | `dashboard_de_v_deos_fiap_x/` | Implementar |
| Recuperar senha (`/recuperar-senha`) | `recuperar_senha_fiap_x/` | Implementar |
| Criar nova senha pelo link (`/redefinir-senha?token=`) | `alterar_senha_fiap_x/` | Implementar |
| Trocar senha logado (`/conta/senha`) | Seção "Segurança & Troca de Senha" de `editar_perfil_fiap_x/` | Implementado só essa seção |
| Editar perfil (demais seções) | `editar_perfil_fiap_x/` | Fora do escopo (sem endpoint no `fiapx-auth`) |

As telas de senha usam os endpoints de recuperação e troca de senha do `fiapx-auth`
([ADR-017](https://github.com/hackathon-fiap-soat/fiapx-docs/blob/main/04-adrs/ADR-017-recuperacao-e-troca-de-senha.md)).
A política de senha do layout (8 a 72 caracteres, com maiúscula, número e símbolo) vale também no cadastro.

Elementos do layout que a API não suporta e como ficaram na implementação:

| Elemento do layout | Situação na API (`fiapx-docs/api/openapi.yaml`) | Como ficou |
|---|---|---|
| Busca por nome do arquivo | `GET /api/videos` só filtra por `status` | Removida (fica o filtro por status) |
| Contadores (processados, em processamento, frames extraídos) | Não há endpoint de resumo; a lista é paginada | Removidos (fica o total de vídeos do filtro) |
| Polling de 1 s | A spec define 5 s enquanto houver vídeo não final | 5 s, com o indicador "Atualização automática" |
| "Iniciar Envio" em `PENDING_UPLOAD` | Não há endpoint para gerar um novo POST pré-assinado | Removido (o vídeo expira em 1 h) |
| Velocidade do envio (MB/s) | — | Removida (fica o percentual por arquivo) |
| Menus "Fila de Tarefas" e "Parâmetros de Extração", selo "Pipeline ativo", versão e SLA no rodapé | Sem funcionalidade correspondente | Removidos (o menu tem "Meus vídeos" e "Trocar senha") |
| "Lembrar sessão por 30 dias", "Auth v4", rodapés de TLS/cluster/Keycloak das telas de acesso | O token vale 1 h e fica no `sessionStorage` | Removidos |
| Caixa "Ambiente Sandbox / MOCK MSW" do login | — | Só aparece no modo mock |

## Links

- Documentação: [`fiapx-docs`](https://github.com/hackathon-fiap-soat/fiapx-docs)
- Todos os repositórios: [hackathon-fiap-soat](https://github.com/hackathon-fiap-soat)

## Contribuição

- A branch `main` é protegida: toda mudança entra por Pull Request (a aprovação é opcional; qualquer integrante, inclusive o autor, pode fazer o merge).
- O `README.md` deve estar sempre atualizado: toda mudança que afete propósito, stack, como rodar/testar,
  variáveis de ambiente ou links atualiza este arquivo no mesmo PR.
- Nunca commitar segredos (`.env`, chaves, tokens). Use `.env.example` com valores fictícios.
- Contexto para o Claude Code: [`CLAUDE.md`](CLAUDE.md) (projeto, regras e o papel deste repositório) e skills em
  [`.claude/skills/`](.claude/skills/) com os procedimentos deste repositório.

## Licença

[MIT](LICENSE)
