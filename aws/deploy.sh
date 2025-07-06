#!/bin/bash

# AWS Deployment Script for IDM React Client
# This script automates the deployment process to AWS

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="idm-react-client"
ECS_CLUSTER="idm-cluster"
ECS_SERVICE="idm-react-service"
TASK_DEFINITION_FAMILY="idm-react-client"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    if ! command_exists jq; then
        print_warning "jq is not installed. Installing..."
        if command_exists brew; then
            brew install jq
        elif command_exists apt-get; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command_exists yum; then
            sudo yum install -y jq
        else
            print_error "Cannot install jq automatically. Please install it manually."
            exit 1
        fi
    fi
    
    print_status "Prerequisites check passed"
}

# Get AWS account ID
get_account_id() {
    print_status "Getting AWS account ID..."
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_status "AWS Account ID: $ACCOUNT_ID"
}

# Create ECR repository if it doesn't exist
create_ecr_repository() {
    print_status "Checking ECR repository..."
    
    if ! aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" >/dev/null 2>&1; then
        print_status "Creating ECR repository: $ECR_REPOSITORY"
        aws ecr create-repository --repository-name "$ECR_REPOSITORY" --region "$AWS_REGION"
    else
        print_status "ECR repository already exists"
    fi
}

# Login to ECR
login_to_ecr() {
    print_status "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building Docker image..."
    docker build -t "$ECR_REPOSITORY" .
    
    print_status "Tagging image for ECR..."
    docker tag "$ECR_REPOSITORY:latest" "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest"
    
    print_status "Pushing image to ECR..."
    docker push "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest"
}

# Create ECS cluster if it doesn't exist
create_ecs_cluster() {
    print_status "Checking ECS cluster..."
    
    if ! aws ecs describe-clusters --clusters "$ECS_CLUSTER" --region "$AWS_REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
        print_status "Creating ECS cluster: $ECS_CLUSTER"
        aws ecs create-cluster --cluster-name "$ECS_CLUSTER" --region "$AWS_REGION"
    else
        print_status "ECS cluster already exists"
    fi
}

# Update task definition
update_task_definition() {
    print_status "Updating task definition..."
    
    # Update the task definition file with actual values
    sed -i.bak "s/ACCOUNT_ID/$ACCOUNT_ID/g" aws/task-definition.json
    sed -i.bak "s/REGION/$AWS_REGION/g" aws/task-definition.json
    
    # Register new task definition
    TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
        --cli-input-json file://aws/task-definition.json \
        --region "$AWS_REGION" \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text)
    
    print_status "Task definition registered: $TASK_DEFINITION_ARN"
    echo "$TASK_DEFINITION_ARN"
}

# Create or update ECS service
deploy_service() {
    print_status "Deploying ECS service..."
    
    TASK_DEFINITION_ARN=$1
    
    # Check if service exists
    if aws ecs describe-services --cluster "$ECS_CLUSTER" --services "$ECS_SERVICE" --region "$AWS_REGION" --query 'services[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
        print_status "Updating existing service..."
        aws ecs update-service \
            --cluster "$ECS_CLUSTER" \
            --service "$ECS_SERVICE" \
            --task-definition "$TASK_DEFINITION_ARN" \
            --region "$AWS_REGION"
    else
        print_status "Creating new service..."
        # Note: This requires additional setup (VPC, subnets, security groups, load balancer)
        print_warning "Service creation requires additional AWS infrastructure setup."
        print_warning "Please run the manual setup steps in aws/README.md first."
        return 1
    fi
}

# Wait for service to be stable
wait_for_service_stability() {
    print_status "Waiting for service to be stable..."
    aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION"
    print_status "Service is now stable"
}

# Create CloudWatch log group
create_log_group() {
    print_status "Creating CloudWatch log group..."
    
    if ! aws logs describe-log-groups --log-group-name-prefix "/ecs/$ECR_REPOSITORY" --region "$AWS_REGION" --query 'logGroups[0].logGroupName' --output text 2>/dev/null | grep -q "/ecs/$ECR_REPOSITORY"; then
        aws logs create-log-group --log-group-name "/ecs/$ECR_REPOSITORY" --region "$AWS_REGION"
        aws logs put-retention-policy --log-group-name "/ecs/$ECR_REPOSITORY" --retention-in-days 30 --region "$AWS_REGION"
        print_status "CloudWatch log group created"
    else
        print_status "CloudWatch log group already exists"
    fi
}

# Main deployment function
main() {
    print_status "Starting AWS deployment..."
    
    check_prerequisites
    get_account_id
    create_ecr_repository
    login_to_ecr
    build_and_push_image
    create_ecs_cluster
    create_log_group
    
    TASK_DEFINITION_ARN=$(update_task_definition)
    
    if deploy_service "$TASK_DEFINITION_ARN"; then
        wait_for_service_stability
        print_status "Deployment completed successfully!"
        print_status "Your application should be available at the ALB endpoint."
    else
        print_error "Deployment failed. Please check the error messages above."
        exit 1
    fi
}

# Run main function
main "$@" 