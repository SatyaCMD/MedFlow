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

# Provision core Virtual Private Cloud (VPC)
resource "aws_vpc" "medicore_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name        = "medicore-vpc"
    Environment = var.environment
  }
}

# Internet Gateway for public routing
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.medicore_vpc.id
  tags = {
    Name = "medicore-igw"
  }
}

# Provision Subnets (EKS requires at least two subnets in different AZs)
resource "aws_subnet" "public_subnet_a" {
  vpc_id            = aws_vpc.medicore_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name                                = "medicore-pub-a"
    "kubernetes.io/cluster/medicore-production-cluster" = "shared"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id            = aws_vpc.medicore_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = {
    Name                                = "medicore-pub-b"
    "kubernetes.io/cluster/medicore-production-cluster" = "shared"
  }
}

# Route Table & Associations
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.medicore_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "medicore-public-rt"
  }
}

resource "aws_route_table_association" "pub_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "pub_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

# IAM Role for EKS Control Plane
resource "aws_iam_role" "eks_cluster_role" {
  name = "medicore-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# EKS Cluster Setup
resource "aws_eks_cluster" "medicore_eks" {
  name     = "medicore-production-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = [
      aws_subnet.public_subnet_a.id,
      aws_subnet.public_subnet_b.id
    ]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# IAM Role for EKS Node Group
resource "aws_iam_role" "eks_nodes" {
  name = "medicore-eks-node-group-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "amazon_eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "amazon_eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "amazon_ec2_container_registry_read_only" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_nodes.name
}

# EKS Node Group Config
resource "aws_eks_node_group" "node_group" {
  cluster_name    = aws_eks_cluster.medicore_eks.name
  node_group_name = "medicore-node-group"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.amazon_eks_worker_node_policy,
    aws_iam_role_policy_attachment.amazon_eks_cni_policy,
    aws_iam_role_policy_attachment.amazon_ec2_container_registry_read_only,
  ]
}

# DocumentDB (MongoDB alternative) Cluster Setup
resource "aws_docdb_cluster" "medicore_docdb" {
  cluster_identifier      = "medicore-docdb-cluster"
  engine                  = "docdb"
  master_username         = "medicore_admin"
  master_password         = "SecureProdDBPassword123!"
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
}

# AWS ElastiCache Subnet Group (Redis Stack)
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "medicore-redis-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
}

# AWS ElastiCache Redis Replication Group
resource "aws_elasticache_replication_group" "medicore_redis" {
  replication_group_id          = "medicore-redis-cluster"
  replication_group_description = "Redis session store and job queue broker"
  node_type                     = "cache.t3.micro"
  port                          = 6379
  parameter_group_name          = "default.redis7"
  subnet_group_name             = aws_elasticache_subnet_group.redis_subnet_group.name
  automatic_failover_enabled    = true
  num_cache_clusters            = 2
  security_group_ids            = [aws_security_group.db_sg.id]
}

# Database Security Group
resource "aws_security_group" "db_sg" {
  name        = "medicore-db-sg"
  description = "Allows access to DocumentDB and Redis instances"
  vpc_id      = aws_vpc.medicore_vpc.id

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.medicore_vpc.cidr_block]
  }

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.medicore_vpc.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Terraform Outputs
output "eks_cluster_endpoint" {
  value = aws_eks_cluster.medicore_eks.endpoint
}

output "eks_cluster_certificate_authority" {
  value = aws_eks_cluster.medicore_eks.certificate_authority[0].data
}

output "docdb_endpoint" {
  value = aws_docdb_cluster.medicore_docdb.endpoint
}

output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.medicore_redis.primary_endpoint_address
}
