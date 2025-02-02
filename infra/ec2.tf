data "aws_iam_policy" "ecsInstanceRolePolicy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

data "aws_iam_policy_document" "ecsInstanceAssumeRole" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_ssm_parameter" "ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_iam_role" "ecsInstanceRole" {
  name               = "ecsInstanceRole"
  assume_role_policy = data.aws_iam_policy_document.ecsInstanceAssumeRole.json
}

resource "aws_iam_role_policy_attachment" "ecsInstancePolicy" {
  role       = aws_iam_role.ecsInstanceRole.name
  policy_arn = data.aws_iam_policy.ecsInstanceRolePolicy.arn
}

resource "aws_iam_instance_profile" "test_profile" {
  name = "test_profile"
  role = aws_iam_role.ecsInstanceRole.name
}

resource "aws_key_pair" "my-ssh-key" {
  key_name   = "my-ssh-key"
  public_key = var.pub_key
}

resource "aws_launch_template" "ecs_lt" {
 name_prefix   = "ecs-template"
 image_id      = data.aws_ssm_parameter.ami.value
 instance_type = "t2.small"

 key_name               = aws_key_pair.my-ssh-key.key_name
 vpc_security_group_ids = [aws_security_group.security_group.id]
 iam_instance_profile {
   name = aws_iam_instance_profile.test_profile.name
 }

 block_device_mappings {
   device_name = "/dev/xvda"
   ebs {
     volume_size = 30
     volume_type = "gp2"
   }
 }

 tag_specifications {
   resource_type = "instance"
   tags = {
     Name = "ecs-instance"
   }
 }

 user_data = base64encode(<<-EOF
#!/bin/bash
echo ECS_CLUSTER=${var.cluster_name} >> /etc/ecs/ecs.config;
EOF
  )
}

resource "aws_autoscaling_group" "ecs_asg" {
 vpc_zone_identifier = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
 desired_capacity    = 2
 max_size            = 4
 min_size            = 1

 launch_template {
   id      = aws_launch_template.ecs_lt.id
   version = "$Latest"
 }

 tag {
   key                 = "AmazonECSManaged"
   value               = true
   propagate_at_launch = true
 }

 depends_on = [ aws_internet_gateway.internet_gateway ]
}

resource "aws_lb" "ecs_alb" {
 name               = "ecs-alb"
 internal           = false
 load_balancer_type = "application"
 security_groups    = [aws_security_group.security_group.id]
 subnets            = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]

 tags = {
   Name = "ecs-alb"
 }
}

resource "aws_lb_listener" "ecs_alb_listener" {
 load_balancer_arn = aws_lb.ecs_alb.arn
 port              = 3001
 protocol          = "HTTP"

 default_action {
   type             = "forward"
   target_group_arn = aws_lb_target_group.ecs_tg.arn
 }

 lifecycle {
   replace_triggered_by = [aws_lb_target_group.ecs_tg]
 }
}

resource "aws_lb_target_group" "ecs_tg" {
 name        = "backend-target-group"
 port        = 3001
 protocol    = "HTTP"
 target_type = "ip"
 vpc_id      = aws_vpc.main.id

 health_check {
   path = "/health"
 }
}

resource "aws_lb_listener" "ecs_alb_frontend_listener" {
 load_balancer_arn = aws_lb.ecs_alb.arn
 port              = 80
 protocol          = "HTTP"

 default_action {
   type             = "forward"
   target_group_arn = aws_lb_target_group.ecs_frontend_tg.arn
 }

 lifecycle {
   replace_triggered_by = [aws_lb_target_group.ecs_frontend_tg]
 }
}

resource "aws_lb_target_group" "ecs_frontend_tg" {
 name        = "frontend-target-group"
 port        = 80
 protocol    = "HTTP"
 target_type = "ip"
 vpc_id      = aws_vpc.main.id

 health_check {
   path = "/"
 }
}