terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.73"
    }
  }

  # Configuração parcial: o bucket (fiapx-tfstate-<account_id>) chega no `terraform init -backend-config`
  # do workflow, que também o cria se faltar (ADR-019). Lock nativo do S3 (ADR-002).
  backend "s3" {
    key          = "fiapx-web/prod.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "fiapx"
      Environment = var.env
      Repository  = "fiapx-web"
      ManagedBy   = "terraform"
    }
  }
}
