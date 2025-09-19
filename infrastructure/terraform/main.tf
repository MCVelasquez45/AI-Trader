terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "ai-trader"
  cidr   = var.vpc_cidr
  azs    = var.availability_zones
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
}

resource "aws_eks_cluster" "primary" {
  name     = "ai-trader"
  role_arn = var.eks_role_arn
  version  = "1.30"

  vpc_config {
    subnet_ids = module.vpc.private_subnets
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.10.1.0/24", "10.10.2.0/24"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.10.11.0/24", "10.10.12.0/24"]
}

variable "eks_role_arn" {
  type = string
}
