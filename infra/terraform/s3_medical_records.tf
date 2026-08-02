# Terraform Infrastructure Configuration for MediCore 360 AWS S3 Medical Records Vault
# Stores Prescriptions and Test Reports separate from identity KYC documents

# 1. Private S3 Bucket for HIPAA-Compliant Encrypted Medical Records (Prescriptions & Test Reports)
resource "aws_s3_bucket" "medical_records" {
  bucket        = "medflow-medical-records-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "MediCore360 Medical Records Vault"
    Environment = var.environment
    Compliance  = "HIPAA"
    ManagedBy   = "Terraform"
    DataType    = "Prescriptions-And-Lab-Reports"
  }
}

# 2. Enable Bucket Versioning for Audit Trails and Data Integrity
resource "aws_s3_bucket_versioning" "medical_records_versioning" {
  bucket = aws_s3_bucket.medical_records.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Server-Side KMS Encryption Configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "medical_records_encryption" {
  bucket = aws_s3_bucket.medical_records.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

# 4. Strict Public Access Block (Prevent Internet Exposure)
resource "aws_s3_bucket_public_access_block" "medical_records_private" {
  bucket = aws_s3_bucket.medical_records.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 5. Dedicated Folder Objects for Prescriptions and Test Reports Root Folders
resource "aws_s3_object" "prescriptions_folder" {
  bucket       = aws_s3_bucket.medical_records.id
  key          = "prescriptions/"
  content_type = "application/x-directory"
}

resource "aws_s3_object" "test_reports_folder" {
  bucket       = aws_s3_bucket.medical_records.id
  key          = "test-reports/"
  content_type = "application/x-directory"
}

# 6. IAM Policy for MediCore API Service S3 Upload & Presigned URL Access
resource "aws_iam_policy" "medical_records_s3_policy" {
  name        = "medflow-medical-records-s3-policy-${var.environment}"
  description = "IAM Policy allowing MediCore 360 API to upload and access prescriptions and test reports in S3"

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
          aws_s3_bucket.medical_records.arn,
          "${aws_s3_bucket.medical_records.arn}/*"
        ]
      }
    ]
  })
}

# Output S3 Bucket Name and ARN
output "medical_records_s3_bucket_name" {
  value       = aws_s3_bucket.medical_records.id
  description = "AWS S3 Medical Records Bucket Name"
}

output "medical_records_s3_bucket_arn" {
  value       = aws_s3_bucket.medical_records.arn
  description = "AWS S3 Medical Records Bucket ARN"
}
