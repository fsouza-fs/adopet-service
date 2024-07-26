terraform {
  cloud {
    organization = "fsouza"

    workspaces {
      name = "aws-fsouza-demo"
    }
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
  profile = "fsouza-demo"
}