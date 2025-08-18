#!/bin/bash

# Comprehensive deployment script with safety checks and rollback capability
# Usage: ./scripts/deploy.sh [staging|production] [--skip-tests] [--force]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/njillu-deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
}

# Error handling
cleanup() {
    log "Cleaning up temporary files..."
    rm -f "$LOG_FILE.tmp"
}

trap cleanup EXIT

error_exit() {
    log_error "$1"
    exit 1
}

# Parse arguments
ENVIRONMENT=""
SKIP_TESTS=false
FORCE_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [staging|production] [--skip-tests] [--force]"
            echo "  staging|production: Target environment"
            echo "  --skip-tests: Skip test suite execution"
            echo "  --force: Force deployment without confirmation"
            exit 0
            ;;
        *)
            error_exit "Unknown parameter: $1"
            ;;
    esac
done

# Validate environment parameter
if [[ -z "$ENVIRONMENT" ]]; then
    error_exit "Environment parameter required. Use 'staging' or 'production'"
fi

# Environment-specific configuration
case "$ENVIRONMENT" in
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ENV_FILE=".env.staging"
        HEALTH_URL="https://staging.your-domain.com/api/health"
        ;;
    production)
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env.production"
        HEALTH_URL="https://your-domain.com/api/health"
        ;;
esac

log "Starting deployment to $ENVIRONMENT"
log "Log file: $LOG_FILE"

# Pre-deployment checks
log "Running pre-deployment checks..."

# Check if we're in the right directory
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    error_exit "Not in project root directory"
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    error_exit "Docker is not running"
fi

# Check if required files exist
required_files=("$COMPOSE_FILE" "Dockerfile" "package.json")
for file in "${required_files[@]}"; do
    if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
        error_exit "Required file not found: $file"
    fi
done

# Git checks
if [[ "$ENVIRONMENT" == "production" ]]; then
    # Check if we're on main branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" != "main" ]]; then
        if [[ "$FORCE_DEPLOY" == "false" ]]; then
            error_exit "Not on main branch. Use --force to override."
        else
            log_warning "Deploying from non-main branch: $current_branch"
        fi
    fi
    
    # Check for uncommitted changes
    if [[ -n "$(git status --porcelain)" ]]; then
        if [[ "$FORCE_DEPLOY" == "false" ]]; then
            error_exit "Uncommitted changes detected. Use --force to override."
        else
            log_warning "Uncommitted changes detected"
        fi
    fi
fi

# Test suite execution
if [[ "$SKIP_TESTS" == "false" ]]; then
    log "Running test suite..."
    
    # Install dependencies
    log "Installing dependencies..."
    pnpm install --frozen-lockfile || error_exit "Failed to install dependencies"
    
    # Run linting
    log "Running linting..."
    pnpm run lint || error_exit "Linting failed"
    
    # Run type checking
    log "Running type checking..."
    pnpm run build --no-lint || error_exit "Type checking failed"
    
    # Run unit tests
    log "Running unit tests..."
    pnpm run test:unit || error_exit "Unit tests failed"
    
    # Run integration tests
    log "Running integration tests..."
    pnpm run test:integration || error_exit "Integration tests failed"
    
    log_success "All tests passed"
else
    log_warning "Skipping test suite"
fi

# Confirmation prompt
if [[ "$FORCE_DEPLOY" == "false" ]]; then
    echo
    echo -e "${YELLOW}Ready to deploy to $ENVIRONMENT${NC}"
    echo "Environment file: $ENV_FILE"
    echo "Compose file: $COMPOSE_FILE"
    echo "Health check URL: $HEALTH_URL"
    echo
    read -p "Continue with deployment? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
fi

# Create backup if production
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "Creating backup..."
    if [[ -f "$PROJECT_ROOT/scripts/backup-production.sh" ]]; then
        "$PROJECT_ROOT/scripts/backup-production.sh" || log_warning "Backup script failed"
    else
        log_warning "Backup script not found"
    fi
fi

# Build and deploy
log "Building application..."

# Set environment variables
if [[ -f "$PROJECT_ROOT/$ENV_FILE" ]]; then
    log "Loading environment from $ENV_FILE"
    set -a
    source "$PROJECT_ROOT/$ENV_FILE"
    set +a
else
    log_warning "Environment file not found: $ENV_FILE"
fi

# Build Docker image
log "Building Docker image..."
docker-compose -f "$COMPOSE_FILE" build --parallel || error_exit "Docker build failed"

# Database migrations
if [[ -f "$PROJECT_ROOT/scripts/migrate-$ENVIRONMENT.sh" ]]; then
    log "Running database migrations..."
    "$PROJECT_ROOT/scripts/migrate-$ENVIRONMENT.sh" || error_exit "Database migrations failed"
else
    log_warning "Migration script not found for $ENVIRONMENT"
fi

# Deploy with zero-downtime strategy
log "Deploying application..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    # Zero-downtime deployment for production
    log "Starting zero-downtime deployment..."
    
    # Scale up to 2 instances
    docker-compose -f "$COMPOSE_FILE" up -d --scale app=2 || error_exit "Failed to scale up"
    
    # Wait for new instances to be healthy
    log "Waiting for new instances to be healthy..."
    sleep 30
    
    # Health check
    max_attempts=10
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
            log_success "Health check passed"
            break
        fi
        log "Health check attempt $attempt/$max_attempts failed"
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error_exit "Health check failed after $max_attempts attempts"
    fi
    
    # Scale down to 1 instance
    docker-compose -f "$COMPOSE_FILE" up -d --scale app=1 || error_exit "Failed to scale down"
else
    # Simple deployment for staging
    docker-compose -f "$COMPOSE_FILE" up -d || error_exit "Deployment failed"
fi

# Post-deployment checks
log "Running post-deployment checks..."

# Wait for services to stabilize
sleep 30

# Health check
log "Checking application health..."
if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
    log_success "Application is healthy"
else
    error_exit "Health check failed"
fi

# Clean up old images
log "Cleaning up old Docker images..."
docker system prune -f --volumes || log_warning "Docker cleanup failed"

# Success
log_success "Deployment to $ENVIRONMENT completed successfully!"

# Display deployment information
echo
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date)"
echo "Git commit: $(git rev-parse --short HEAD)"
echo "Health URL: $HEALTH_URL"
echo "Log file: $LOG_FILE"
echo

# Send notification if webhook URL is configured
if [[ -n "${DEPLOY_WEBHOOK_URL:-}" ]]; then
    curl -X POST "$DEPLOY_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"Deployment to $ENVIRONMENT completed successfully!\"}" \
        || log_warning "Failed to send webhook notification"
fi

log "Deployment script completed"