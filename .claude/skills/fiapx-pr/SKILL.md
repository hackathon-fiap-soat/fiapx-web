---
name: fiapx-pr
description: Fluxo para levar uma mudança deste repositório fiapx-* até a main — branch, Conventional Commits, push com o gh, PR, CI verde, squash merge e README atualizado. Use sempre que for commitar ou abrir PR.
---

# Abrir, validar e mergear um PR

A `main` é protegida: toda mudança entra por PR. A aprovação é opcional (qualquer integrante, inclusive o
autor, pode mergear), mas o merge só acontece com o CI verde: os checks (testes, lint e o Quality Gate do
SonarCloud) são obrigatórios na proteção da `main`. **Todo merge na `main` faz deploy** do serviço.

## Passos

1. Partir da `main` atualizada e criar a branch: `git checkout main && git pull && git checkout -b <tipo>/<assunto>`
   (`feat/`, `fix/`, `docs/`, `chore/`, `ci/`).
2. Antes de commitar:
   - rodar lint e testes do repositório (veja o README);
   - conferir se o `README.md` precisa mudar (propósito, stack, como rodar/testar, variáveis, links) e
     atualizar no mesmo PR;
   - se mudou contrato, rota, fila ou decisão, a mudança no `fiapx-docs` vem antes ou junto;
   - nenhum segredo no diff (`git diff --cached`).
3. Commit em Conventional Commits, mensagem em português: `feat(escopo): descrição curta`, corpo com o que
   e por quê.
4. Push. Se o `git push` travar pedindo credencial (Keychain do macOS), use o helper do `gh`:

   ```bash
   GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -u origin <branch>
   ```

5. `gh pr create` com título no padrão do commit e corpo com **Resumo**, **Como testar** e validações feitas.
6. Esperar o CI. A execução pode levar alguns segundos para aparecer; não siga com id vazio:

   ```bash
   r=""; for i in $(seq 1 20); do r=$(gh run list -b <branch> -L 1 --json databaseId -q '.[0].databaseId'); [ -n "$r" ] && break; sleep 3; done
   gh run watch "$r" --exit-status
   ```

   Se o repositório ainda não tem workflow para os arquivos alterados, diga isso no PR.
7. Com tudo verde: `gh pr merge <n> --squash --delete-branch`, depois `git checkout main && git pull`.
8. Atualizar o painel de progresso (tarefa da etapa) e relatar ao time o link do PR.
9. **Ao fim de uma implementação (etapa ou mudança relevante), teste o deploy na AWS** com a skill
   `deploy-aws`: o merge de um serviço já dispara o `deploy.yml`; confira o smoke do `deploy-all`, verifique o
   que a etapa entregou e rode o `destroy-all` no fim. Mudou Terraform, Dockerfile ou manifests? Confira
   antes as restrições do lab (`fiapx-docs/06-deploy/ambientes.md#restrições-conhecidas-do-lab`).

## Não fazer

- Push direto na `main`, `--force` na `main`, ou merge com CI vermelho ou pendente.
- Merge de PR do `fiapx-infra` que muda a infraestrutura (gera custo): esse quem faz é o time, depois de
  revisar o `plan`.
- Commitar `.env`, chaves `.pem`/`.key` ou state do Terraform.
