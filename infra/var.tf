variable "vpc_cidr" {
  type = string
  default = "10.0.0.0/16"
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "pub_key" {
  type = string
}

variable "domain_name" {
  type = string
  default = "test.net"
}

variable "backend-service" {
  type = string
  default = "adopet-service"
}

variable "frontend_service" {
  type = string
  default = "adopet-web"
}

variable "cluster_name" {
  type = string
  default = "adopet"
}

variable "backend_container_name" {
  type = string
  default = "dockergs"
}

variable "frontend_container_name" {
  type = string
  default = "dockergsweb"
}
