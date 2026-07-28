terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default     = "us-east-1"
  description = "The AWS region to provision resources in"
}

variable "environment" {
  default     = "production"
  description = "Deployment environment name"
}

# Random ID for unique S3 bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket for medical record storage
resource "aws_s3_bucket" "medicore_storage" {
  bucket        = "medicore-records-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name        = "medicore-records-storage"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Enable versioning for security audits
resource "aws_s3_bucket_versioning" "storage_versioning" {
  bucket = aws_s3_bucket.medicore_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enforce secure transport block public access
resource "aws_s3_bucket_public_access_block" "storage_public_block" {
  bucket = aws_s3_bucket.medicore_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Terraform Outputs for S3 Storage
output "s3_bucket_name" {
  value       = aws_s3_bucket.medicore_storage.id
  description = "The name of the S3 medical records bucket"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.medicore_storage.arn
  description = "The ARN of the S3 medical records bucket"
}
