variable "env" {
  description = "Ambiente (prefixo dos parâmetros /fiapx/<env>/...)."
  type        = string
  default     = "prod"
}

variable "region" {
  description = "Região da AWS."
  type        = string
  default     = "us-east-1"
}
