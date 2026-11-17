# Tudo o que vem de outros repositórios é lido do SSM (ADR-001, fiapx-docs/06-deploy/parametros-ssm.md).
locals {
  ssm = "/fiapx/${var.env}"
}

data "aws_ssm_parameter" "this" {
  for_each = toset([
    "apigw/api_id",
    "apigw/vpc_link_id",
    "alb/listener_arn",
  ])
  name = "${local.ssm}/${each.value}"
}

locals {
  p = { for k, v in data.aws_ssm_parameter.this : k => nonsensitive(v.value) }
}
