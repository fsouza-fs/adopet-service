resource "aws_db_subnet_group" "default" {
  name       = "main1"
  subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
}

resource "aws_docdb_subnet_group" "default" {
  name       = "main2"
  subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
}

resource "aws_db_instance" "postgres" {
  db_subnet_group_name = aws_db_subnet_group.default.name
  allocated_storage    = 5  # Minimum storage
  max_allocated_storage = 20
  engine               = "postgres"
  engine_version       = "12.19"
  instance_class       = "db.t4g.micro"  # Free Tier eligible
  db_name                 = "mydatabase"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres12"
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible = true

  tags = {
    Name = "my-postgres-database"
  }
}

resource "aws_docdb_cluster" "mongo" {
  cluster_identifier = "my-mongo-cluster"
  db_subnet_group_name = aws_docdb_subnet_group.default.name
  master_username    = var.db_username
  master_password    = var.db_password
  backup_retention_period = 1
  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot = true
  apply_immediately = true


  tags = {
    Name = "my-mongo-cluster"
  }
}

resource "aws_docdb_cluster_instance" "mongo_instance" {
  count                = 1
  identifier           = "my-mongo-instance"
  cluster_identifier   = aws_docdb_cluster.mongo.id
  instance_class       = "db.t3.medium"

  tags = {
    Name = "my-mongo-instance"
  }
}

resource "aws_security_group" "db" {
  vpc_id = aws_vpc.main.id

  name_prefix = "db-"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "docdb_endpoint" {
  value = aws_docdb_cluster.mongo.endpoint
}