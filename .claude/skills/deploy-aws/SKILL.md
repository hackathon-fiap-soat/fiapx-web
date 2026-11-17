---
name: deploy-aws
description: Testar uma implementação na AWS Academy Learner Lab (deploy, smoke, diagnóstico e destroy-all) e conferir infraestrutura nova contra as restrições do lab antes do PR. Use ao terminar qualquer etapa ou mudança relevante, ao mexer em Terraform, Dockerfile ou manifests, e quando um deploy falhar.
---

# Deploy e teste na AWS (AWS Academy)

Regra do time: **toda implementação termina com o deploy testado na AWS** e o ambiente derrubado depois
(`fiapx-docs/06-deploy/fluxo-de-deploy.md#teste-de-deploy-ao-fim-de-cada-implementação`, ADR-019).
`terraform apply`/`destroy` só pelo GitHub Actions; nunca rode `apply` local contra a AWS (`plan` local,
só leitura, pode).

## 1. Credenciais da sessão do lab

- Quem testa inicia o lab (*Start Lab*). A sessão dura ~4 h; ao terminar, as credenciais passam a ser negadas
  (`explicit deny ... voc-cancel-cred`).
- As três chaves vão como **Secrets** (nunca Variables: os repositórios são públicos) em `fiapx-infra`,
  `fiapx-notification`, `fiapx-auth` e `fiapx-video-api` (e nos repositórios novos que fizerem deploy):

  ```bash
  for r in fiapx-infra fiapx-notification fiapx-auth fiapx-video-api; do
    printf '%s' "$KEY"   | gh secret set AWS_ACCESS_KEY_ID     -R hackathon-fiap-soat/$r
    printf '%s' "$SECRET" | gh secret set AWS_SECRET_ACCESS_KEY -R hackathon-fiap-soat/$r
    printf '%s' "$TOKEN" | gh secret set AWS_SESSION_TOKEN     -R hackathon-fiap-soat/$r
  done
  ```

- Para inspecionar a conta daqui, guarde as chaves num arquivo `chmod 600` **fora dos repositórios**
  (diretório temporário da sessão), exporte e apague ao terminar. Nunca commite.

## 2. Antes do PR de infraestrutura nova

O `plan` só lê a conta; as restrições do lab aparecem no `apply`. Confira antes
(`fiapx-docs/06-deploy/ambientes.md#restrições-conhecidas-do-lab`):

```bash
# ações que o runner executa (role voclabs) e que pods/Lambdas executam (LabRole)
aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::<conta>:role/voclabs \
  --action-names <servico:Acao> ... \
  --query 'EvaluationResults[?EvalDecision!=`allowed`].[EvalActionName,EvalDecision]' --output text
```

- `explicitDeny` é real. `implicitDeny` pode ser falso negativo de regra com condição: confira com o recurso.
- Não peça chave KMS gerenciada (`aws/<serviço>`) sem ver outro recurso da conta usando-a (`aws/dynamodb` falha).
- Nada de bucket público, spot, instância acima de `large`, `db.serverless`, role nova, Pod Identity, SES,
  CloudFront ou Route 53 Domains. Descrição de security group só em ASCII. Bucket S3 novo: módulo
  `s3-bucket` do `fiapx-infra` (a SCP nega uma leitura do `aws_s3_bucket`).
- Imagem para o EKS: `USER` numérico (`runAsNonRoot`). HTTP API: permissão de authorizer com
  `source_arn = <execution_arn>/authorizers/<id>` (sem stage).
- Rode um `plan` local contra o state real para ver o que muda:
  `terraform init -backend-config=bucket=fiapx-tfstate-<conta>` e `terraform plan -lock=false`.

## 3. Subir e testar

| Situação | Como |
|---|---|
| Mudança num serviço | merge do PR: o `deploy.yml` do repositório roda sozinho |
| Mudança no `fiapx-infra` | merge (o time faz, gera custo): `apply` e depois `deploy-all` automático |
| Ambiente destruído / subir tudo | `gh workflow run deploy-all.yml -R hackathon-fiap-soat/fiapx-infra -f confirm=deploy-prod` |
| Retomar de uma etapa | o mesmo, com `-f a_partir_de=<notification\|auth\|video-api\|smoke>` |

Acompanhe com `gh run watch <id> --exit-status` e, em falha, `gh run view <id> --log-failed`.

**Smoke:** o job `smoke` do `deploy-all` precisa passar. Toda etapa que entrega algo novo acrescenta ao smoke
a verificação disso (ex.: upload até `COMPLETED`, item `SENT` no DynamoDB, tela de login).

## 4. Diagnóstico

| Onde | Comando |
|---|---|
| Rotas e authorizer | `aws logs tail /aws/apigateway/fiapx-prod --since 10m` (campos `status`, `authorizerError`, `integrationStatus`) |
| Lambdas | `aws logs tail /aws/lambda/fiapx-prod-auth-<nome> --since 10m` |
| EKS | `aws eks update-kubeconfig --name fiapx-prod` e `kubectl -n fiapx get pods,jobs`, `kubectl describe pod`, `kubectl logs` |
| Add-ons | `kubectl get pods -A`; releases do Helm: `kubectl get secrets -A -l owner=helm` |

Corrija pela causa e registre a restrição nova na tabela de `ambientes.md` no mesmo PR.

## 5. Derrubar

Ao terminar o teste: `gh workflow run destroy-all.yml -R hackathon-fiap-soat/fiapx-infra -f confirm=destroy-prod`
e confirme que terminou. Ligado, o ambiente custa ~US$ 10/dia do crédito do lab.
