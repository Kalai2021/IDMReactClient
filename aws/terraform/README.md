# Terraform Deployment for IDM React Client

This directory contains Terraform configurations to deploy the IDM React Client on AWS using ECS Fargate.

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate permissions
- Docker image pushed to ECR

## Quick Start

### 1. Configure Variables

Copy the example variables file and update it with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

```hcl
# Required variables
ecr_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/idm-react-client"
backend_api_url = "https://your-backend-api.com"

# Optional variables
domain_name = "your-domain.com"
route53_zone_id = "Z1234567890ABC"
certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Plan the Deployment

```bash
terraform plan
```

### 4. Apply the Configuration

```bash
terraform apply
```

### 5. Access Your Application

After successful deployment, you can access your application at:

- **ALB DNS Name**: Check the output `alb_dns_name`
- **Custom Domain**: If configured, your domain name

## Infrastructure Components

This Terraform configuration creates:

### Networking
- VPC with public and private subnets
- NAT Gateway for private subnet internet access
- Security groups for ALB and ECS

### Compute
- ECS Fargate cluster
- ECS service with auto-scaling
- Application Load Balancer

### Security
- IAM roles for ECS tasks
- Security groups with minimal required access
- HTTPS redirect (if certificate provided)

### Monitoring
- CloudWatch log group
- Auto-scaling based on CPU utilization

## Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ecr_repository_url` | ECR repository URL | `123456789012.dkr.ecr.us-east-1.amazonaws.com/idm-react-client` |
| `backend_api_url` | Backend API URL | `https://your-backend-api.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region | `us-east-1` |
| `project_name` | Project name | `idm-react-client` |
| `task_cpu` | ECS task CPU units | `512` |
| `task_memory` | ECS task memory | `1024` |
| `service_desired_count` | Desired service instances | `2` |
| `domain_name` | Custom domain name | `""` |
| `certificate_arn` | SSL certificate ARN | `""` |

## SSL/TLS Configuration

To enable HTTPS:

1. Request an SSL certificate in AWS Certificate Manager
2. Add the certificate ARN to `terraform.tfvars`
3. Add your domain name and Route 53 zone ID
4. Apply the configuration

## Auto Scaling

The configuration includes auto-scaling based on CPU utilization:

- **Target**: 70% CPU utilization
- **Min instances**: 1
- **Max instances**: 5 (configurable)

## Monitoring and Logging

### CloudWatch Logs
- Log group: `/ecs/idm-react-client`
- Retention: 30 days
- Log stream prefix: `ecs`

### Accessing Logs
```bash
# List log streams
aws logs describe-log-streams --log-group-name /ecs/idm-react-client

# Get log events
aws logs get-log-events --log-group-name /ecs/idm-react-client --log-stream-name <stream-name>
```

## Cost Optimization

### Recommendations
1. **Use Spot instances** for non-critical workloads
2. **Right-size resources** based on actual usage
3. **Enable CloudWatch Insights** for better monitoring
4. **Set up billing alerts** to monitor costs

### Estimated Costs (us-east-1)
- **ECS Fargate**: ~$15-30/month for 2 tasks
- **ALB**: ~$20/month
- **NAT Gateway**: ~$45/month
- **Data transfer**: Varies based on usage

## Troubleshooting

### Common Issues

1. **Task fails to start**
   ```bash
   # Check ECS service events
   aws ecs describe-services --cluster idm-react-client-cluster --services idm-react-client-service
   ```

2. **Health check failures**
   ```bash
   # Check target group health
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

3. **Container logs**
   ```bash
   # Get container logs
   aws logs get-log-events --log-group-name /ecs/idm-react-client --log-stream-name <stream-name>
   ```

### Debugging Commands

```bash
# Check ECS cluster status
aws ecs describe-clusters --clusters idm-react-client-cluster

# Check service status
aws ecs describe-services --cluster idm-react-client-cluster --services idm-react-client-service

# Check task status
aws ecs list-tasks --cluster idm-react-client-cluster --service-name idm-react-client-service
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources created by Terraform, including data.

## Security Considerations

1. **Network Security**
   - ECS tasks run in private subnets
   - ALB in public subnets with minimal access
   - Security groups restrict traffic

2. **IAM Security**
   - Principle of least privilege
   - ECS tasks have minimal required permissions
   - No long-term credentials in containers

3. **Data Security**
   - Environment variables for configuration
   - Secrets stored in AWS Systems Manager Parameter Store (recommended)

## Next Steps

1. **Set up CI/CD pipeline** for automated deployments
2. **Configure monitoring alerts** for production
3. **Set up backup and disaster recovery**
4. **Implement blue-green deployments**
5. **Add custom domain and SSL certificate**

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review AWS ECS documentation
3. Check Terraform logs and AWS CloudTrail
4. Create an issue in the repository 