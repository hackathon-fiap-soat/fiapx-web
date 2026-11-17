# Rota $default do HTTP API do fiapx-infra (ADR-019 §6): tudo o que não casa com uma rota específica
# (/api/auth/* nas Lambdas, /api/videos* e /api/health/* no video-api) vai para o ALB interno pelo VPC Link.
# O listener do ALB manda /api/* para o video-api e o padrão para o target group do site (pods nginx).
# Sem authorizer: o site é público; a API continua protegida nas rotas dela.
resource "aws_apigatewayv2_integration" "site" {
  api_id                 = local.p["apigw/api_id"]
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  integration_uri        = local.p["alb/listener_arn"]
  connection_type        = "VPC_LINK"
  connection_id          = local.p["apigw/vpc_link_id"]
  payload_format_version = "1.0"
  timeout_milliseconds   = 10000
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = local.p["apigw/api_id"]
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.site.id}"
}
