output "route_id" {
  description = "Id da rota $default criada no API Gateway."
  value       = aws_apigatewayv2_route.default.id
}
