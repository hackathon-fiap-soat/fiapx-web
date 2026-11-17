# fiapx-web

Front-end do FIAP X: cadastro, login, upload de vários vídeos, lista de status e download do zip. Servido por um pod nginx no EKS, na mesma origem da API (rota `$default` do API Gateway, ADR-019).

> Parte do **Hackathon FIAP X — Processador de Vídeos** (PÓS TECH SOAT, Fase 5).
> 🚧 Em construção. A documentação vem antes do código: a arquitetura, as decisões (ADRs/RFCs) e os
> contratos ficam em [`fiapx-docs`](https://github.com/hackathon-fiap-soat/fiapx-docs).

## Stack

React + Vite + TypeScript + Tailwind, servido por nginx (`nginxinc/nginx-unprivileged`) no EKS

## Como rodar

_A definir nas próximas etapas do plano._

## Layout de referência

A pasta [`stitch_fiap_x_video_processor_front_end/`](stitch_fiap_x_video_processor_front_end/) traz o layout
gerado pelo time no Google Stitch: HTML estático (Tailwind via CDN) e um `screen.png` por tela, mais o design
system em [`fiap_x_video_engine/DESIGN.md`](stitch_fiap_x_video_processor_front_end/fiap_x_video_engine/DESIGN.md)
(cores, tipografia Hanken Grotesk + Inter + JetBrains Mono, badges de status, componentes). Ele é a
referência visual da implementação em React (Etapa 6.5); não é código de produção.

| Tela | Pasta | Escopo |
|---|---|---|
| Login | `login_fiap_x/` | Implementar |
| Cadastro | `cadastro_fiap_x/` | Implementar |
| Painel de vídeos (upload + lista) | `dashboard_de_v_deos_fiap_x/` | Implementar |
| Recuperar senha (`/recuperar-senha`) | `recuperar_senha_fiap_x/` | Implementar |
| Criar nova senha pelo link (`/redefinir-senha?token=`) | `alterar_senha_fiap_x/` | Implementar |
| Trocar senha logado (`/conta/senha`) | Seção "Segurança & Troca de Senha" de `editar_perfil_fiap_x/` | Implementar só essa seção |
| Editar perfil (demais seções) | `editar_perfil_fiap_x/` | Fora do escopo (sem endpoint no `fiapx-auth`) |

As telas de senha usam os endpoints de recuperação e troca de senha do `fiapx-auth`
([ADR-017](https://github.com/hackathon-fiap-soat/fiapx-docs/blob/main/04-adrs/ADR-017-recuperacao-e-troca-de-senha.md)).
A política de senha do layout (8 a 72 caracteres, com maiúscula, número e símbolo) vale também no cadastro.

Elementos do painel que a API atual não suporta e que serão adaptados ou removidos na implementação:

| Elemento do layout | Situação na API (`fiapx-docs/api/openapi.yaml`) | Tratamento previsto |
|---|---|---|
| Busca por nome do arquivo | `GET /api/videos` só filtra por `status` | Remover, ou adicionar o parâmetro `q` na API |
| Contadores (processados, em processamento, frames extraídos) | Não há endpoint de resumo; a lista é paginada | Remover, ou adicionar `GET /api/videos/summary` |
| Polling de 1 s | A spec define 5 s enquanto houver vídeo não final | Usar 5 s |
| "Iniciar Envio" em `PENDING_UPLOAD` | Não há endpoint para gerar um novo POST pré-assinado | Remover (o vídeo expira em 1 h) |
| Menus "Fila de Tarefas" e "Parâmetros de Extração", selo "Pipeline ativo", versão e SLA no rodapé | Sem funcionalidade correspondente | Remover |

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
