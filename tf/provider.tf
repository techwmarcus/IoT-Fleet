terraform {
  required_version = ">= 0.12"
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 6.45.0"
        }
    }
    backend "s3" {
      region = "us-west-1"
      key = "iot.tfstate"
      bucket = "amarric-tf-state-test"
    }
}

provider "aws" {
  region = "us-west-1"
}