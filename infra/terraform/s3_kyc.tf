# Terraform Infrastructure Configuration for MediCore 360 AWS S3 KYC Document Vault

terraform {
  required_version = ">= 1.5.0"
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

variable "aws_region" {
  description = "AWS Cloud Region for MediCore 360 Deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment Environment (production / staging)"
  type        = string
  default     = "production"
}

# 1. Private S3 Bucket for HIPAA-Compliant Encrypted KYC Identity Documents
resource "aws_s3_bucket" "kyc_vault" {
  bucket        = "medflow-kyc-documents-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "MediCore360 KYC Document Vault"
    Environment = var.environment
    Compliance  = "HIPAA"
    ManagedBy   = "Terraform"
  }
}

# 2. Enable Bucket Versioning for Audit Trails
resource "aws_s3_bucket_versioning" "kyc_vault_versioning" {
  bucket = aws_s3_bucket.kyc_vault.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Server-Side KMS Encryption Configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "kyc_vault_encryption" {
  bucket = aws_s3_bucket.kyc_vault.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

# 4. Strict Public Access Block (Prevent Internet Exposure)
resource "aws_s3_bucket_public_access_block" "kyc_vault_private" {
  bucket = aws_s3_bucket.kyc_vault.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 5. IAM Policy for MediCore API Service S3 Upload & Presigned URL Access
resource "aws_iam_policy" "kyc_s3_policy" {
  name        = "medflow-kyc-s3-policy-${var.environment}"
  description = "IAM Policy allowing MediCore 360 API to upload and generate presigned URLs for KYC docs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.kyc_vault.arn,
          "${aws_s3_bucket.kyc_vault.arn}/*"
        ]
      }
    ]
  })
}

# Output S3 Bucket Name and ARN
output "kyc_s3_bucket_name" {
  value       = aws_s3_bucket.kyc_vault.id
  description = "AWS S3 KYC Bucket Name"
}

output "kyc_s3_bucket_arn" {
  value       = aws_s3_bucket.kyc_vault.arn
  description = "AWS S3 KYC Bucket ARN"
}
