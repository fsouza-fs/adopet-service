resource "aws_ecs_cluster" "ecs_cluster" {
 name = var.cluster_name
}

resource "aws_ecs_capacity_provider" "ecs_capacity_provider" {
 name = "test1"

 auto_scaling_group_provider {
   auto_scaling_group_arn = aws_autoscaling_group.ecs_asg.arn

   managed_scaling {
     maximum_scaling_step_size = 1000
     minimum_scaling_step_size = 1
     status                    = "ENABLED"
     target_capacity           = 3
   }
 }
}

resource "aws_ecs_cluster_capacity_providers" "example" {
 cluster_name = aws_ecs_cluster.ecs_cluster.name

 capacity_providers = [aws_ecs_capacity_provider.ecs_capacity_provider.name]

 default_capacity_provider_strategy {
   base              = 1
   weight            = 100
   capacity_provider = aws_ecs_capacity_provider.ecs_capacity_provider.name
 }
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy" "ecsExecutionRolePolicy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecsExecutionRolePolicy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecsExecutionRole" {
  name               = "ecsExecutionRole"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.ecsExecutionRolePolicy.json
}

resource "aws_iam_role_policy_attachment" "ecsExecutionPolicy" {
  role       = aws_iam_role.ecsExecutionRole.name
  policy_arn = data.aws_iam_policy.ecsExecutionRolePolicy.arn
}

resource "aws_ecs_task_definition" "backend" {
 family             = "backend-task"
 network_mode       = "awsvpc"
 execution_role_arn = aws_iam_role.ecsExecutionRole.arn
 cpu                = 256
 runtime_platform {
   operating_system_family = "LINUX"
   cpu_architecture        = "X86_64"
 }
 container_definitions = jsonencode([
   {
     name      = var.backend_container_name
     image     = "fsouzafs/adopet-service:1.0.0"
     cpu       = 256
     memory    = 512
     essential = true
     portMappings = [
       {
         containerPort = 3001
         hostPort      = 3001
         protocol      = "tcp"
       }
     ]
     "environment": [
       {
         "name": "PG_ENDPOINT",
         "value": "${aws_db_instance.postgres.endpoint}"
       },
       {
         "name": "MG_ENDPOINT",
         "value": "${aws_docdb_cluster.mongo.endpoint}"
       },
       {
         "name": "DB_USERNAME",
         "value": "${var.db_username}"
       },
       {
         "name": "DB_PASSWORD",
         "value": "${var.db_password}"
       }
     ],
   }
 ])
}

resource "aws_ecs_task_definition" "frontend" {
 family             = "frontend-task"
 network_mode       = "awsvpc"
 execution_role_arn = aws_iam_role.ecsExecutionRole.arn
 cpu                = 256
 runtime_platform {
   operating_system_family = "LINUX"
   cpu_architecture        = "X86_64"
 }
 container_definitions = jsonencode([
   {
     name      = var.frontend_container_name
     image     = "fsouzafs/adopet-web:1.0.0"
     cpu       = 256
     memory    = 512
     essential = true
     portMappings = [
       {
         containerPort = 80
         hostPort      = 80
         protocol      = "tcp"
       }
     ]
   }
 ])
}

resource "aws_ecs_service" "adopet_web" {
 name            = var.frontend_service
 cluster         = aws_ecs_cluster.ecs_cluster.id
 task_definition = aws_ecs_task_definition.frontend.arn
 desired_count   = 1

 network_configuration {
   subnets         = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
   security_groups = [aws_security_group.security_group.id]
 }

 force_new_deployment = true
 placement_constraints {
   type = "distinctInstance"
 }

 triggers = {
   redeployment = true
 }

 capacity_provider_strategy {
   capacity_provider = aws_ecs_capacity_provider.ecs_capacity_provider.name
   weight            = 100
 }

 load_balancer {
   target_group_arn = aws_lb_target_group.ecs_frontend_tg.arn
   container_name   = var.frontend_container_name
   container_port   = 80
 }

 lifecycle {
  ignore_changes = [task_definition]
 }

 depends_on = [aws_autoscaling_group.ecs_asg, aws_ecs_service.adopet_service]
}

resource "aws_ecs_service" "adopet_service" {
 name            = var.backend-service
 cluster         = aws_ecs_cluster.ecs_cluster.id
 task_definition = aws_ecs_task_definition.backend.arn
 desired_count   = 2

 network_configuration {
   subnets         = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
   security_groups = [aws_security_group.security_group.id]
 }

 force_new_deployment = true
 placement_constraints {
   type = "distinctInstance"
 }

 triggers = {
   redeployment = true
 }

 capacity_provider_strategy {
   capacity_provider = aws_ecs_capacity_provider.ecs_capacity_provider.name
   weight            = 100
 }

 load_balancer {
   target_group_arn = aws_lb_target_group.ecs_tg.arn
   container_name   = var.backend_container_name
   container_port   = 3001
 }

 service_registries {
    registry_arn   = aws_service_discovery_service.this.arn
 }

 lifecycle {
  ignore_changes = [task_definition]
 }

 depends_on = [aws_autoscaling_group.ecs_asg]
}

resource "aws_service_discovery_private_dns_namespace" "private" {
  name        = var.domain_name
  description = "Private dns namespace for service discovery"
  vpc         = aws_vpc.main.id
}

resource "aws_service_discovery_service" "this" {
  name = var.backend-service
  force_destroy = true

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.private.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.ecs_cluster.name
}

output "ecs_backend_service" {
  value = aws_ecs_service.adopet_service.name
}

output "ecs_backend_td" {
  value = aws_ecs_task_definition.backend.family
}

output "ecs_backend_container" {
  value = "${var.backend_container_name}"
}

output "ecs_frontend_service" {
  value = aws_ecs_service.adopet_web.name
}

output "ecs_frontend_td" {
  value = aws_ecs_task_definition.frontend.family
}

output "ecs_frontend_container" {
  value = "${var.frontend_container_name}"
}
