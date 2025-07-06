# AWS Deployment Guide for IDM React Client

This guide provides step-by-step instructions to deploy the IDM React Client with Fluentd logging infrastructure on AWS.

## Architecture Overview

```
Internet → ALB → ECS Fargate → React App
                    ↓
                Fluentd → Elasticsearch → Kibana
                    ↓
                CloudWatch Logs
```

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed locally
- AWS ECR repository created
- Domain name (optional, for HTTPS)

## Deployment Options

### Option 1: ECS Fargate (Recommended)
- Serverless container deployment
- Auto-scaling capabilities
- Integrated with AWS services

### Option 2: EC2 with Docker Compose
- Traditional server deployment
- Full control over infrastructure
- Cost-effective for consistent workloads

## Option 1: ECS Fargate Deployment

### 1. Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository --repository-name idm-react-client

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### 2. Build and Push Docker Image

```bash
# Build the image
docker build -t idm-react-client .

# Tag for ECR
docker tag idm-react-client:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/idm-react-client:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/idm-react-client:latest
```

### 3. Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name idm-cluster
```

### 4. Create Task Definition

Create `aws/task-definition.json`:

```json
{
  "family": "idm-react-client",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "idm-react-client",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/idm-react-client:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "REACT_APP_API_URL",
          "value": "https://your-backend-api.com"
        },
        {
          "name": "REACT_APP_FLUENT_ENDPOINT",
          "value": "http://fluentd:24224"
        },
        {
          "name": "REACT_APP_LOGGING_ENABLED",
          "value": "true"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/idm-react-client",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 5. Create ECS Service

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Create service
aws ecs create-service \
  --cluster idm-cluster \
  --service-name idm-react-service \
  --task-definition idm-react-client:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/idm-tg,containerName=idm-react-client,containerPort=3000"
```

## Option 2: EC2 Deployment

### 1. Launch EC2 Instance

```bash
# Launch EC2 instance with Docker AMI
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-12345 \
  --subnet-id subnet-12345
```

### 2. Install Docker and Docker Compose

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd IDMReactClient

# Create production environment file
cat > .env << EOF
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_FLUENT_ENDPOINT=http://fluentd:24224
REACT_APP_LOGGING_ENABLED=true
NODE_ENV=production
EOF

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## Infrastructure as Code (Terraform)

### 1. Create Terraform Configuration

Create `aws/terraform/main.tf`:

```hcl
provider "aws" {
  region = "us-east-1"
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "idm-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "idm-cluster"
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "idm-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = "idm-react-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs.id]
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "idm-react-client"
    container_port   = 3000
  }
}
```

### 2. Deploy with Terraform

```bash
cd aws/terraform
terraform init
terraform plan
terraform apply
```

## Monitoring and Logging

### 1. CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/idm-react-client

# Set retention policy
aws logs put-retention-policy --log-group-name /ecs/idm-react-client --retention-in-days 30
```

### 2. CloudWatch Alarms

```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "idm-cpu-high" \
  --alarm-description "High CPU usage" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### 3. Elasticsearch Service (Optional)

For production logging, consider using AWS Elasticsearch Service:

```bash
# Create Elasticsearch domain
aws es create-elasticsearch-domain \
  --domain-name idm-logs \
  --elasticsearch-version 7.10 \
  --elasticsearch-cluster-config InstanceType=t3.small.elasticsearch,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp2,VolumeSize=10
```

## SSL/TLS Configuration

### 1. Request SSL Certificate

```bash
# Request certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --validation-method DNS
```

### 2. Configure ALB Listener

```bash
# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<certificate-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

## Environment Variables

### Production Environment

```bash
# Create Systems Manager Parameter Store entries
aws ssm put-parameter \
  --name "/idm/react/api-url" \
  --value "https://your-backend-api.com" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/idm/react/fluent-endpoint" \
  --value "http://fluentd:24224" \
  --type "SecureString"
```

## Security Considerations

### 1. Security Groups

```bash
# Create security group for ALB
aws ec2 create-security-group \
  --group-name idm-alb-sg \
  --description "Security group for ALB" \
  --vpc-id <vpc-id>

# Allow HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 2. IAM Roles

```bash
# Create ECS task execution role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://aws/ecs-task-execution-role-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

## Cost Optimization

### 1. Spot Instances (EC2)

```bash
# Use spot instances for cost savings
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --instance-market-options MarketType=spot,SpotOptions={MaxPrice=0.05}
```

### 2. Auto Scaling

```bash
# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name idm-asg \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-12345,subnet-67890"
```

## Troubleshooting

### Common Issues

1. **Container not starting**
   ```bash
   # Check ECS logs
   aws logs describe-log-streams --log-group-name /ecs/idm-react-client
   aws logs get-log-events --log-group-name /ecs/idm-react-client --log-stream-name <stream-name>
   ```

2. **Health check failures**
   ```bash
   # Check target group health
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

3. **Network connectivity**
   ```bash
   # Test connectivity from ECS task
   aws ecs run-task --cluster idm-cluster --task-definition idm-react-client --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345]}"
   ```

## Cleanup

```bash
# Delete ECS service
aws ecs update-service --cluster idm-cluster --service idm-react-service --desired-count 0
aws ecs delete-service --cluster idm-cluster --service idm-react-service

# Delete cluster
aws ecs delete-cluster --cluster idm-cluster

# Delete ALB
aws elbv2 delete-load-balancer --load-balancer-arn <alb-arn>

# Delete ECR repository
aws ecr delete-repository --repository-name idm-react-client --force
```

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions or AWS CodePipeline
2. Configure monitoring and alerting
3. Implement backup and disaster recovery
4. Set up staging environment
5. Configure domain and DNS 