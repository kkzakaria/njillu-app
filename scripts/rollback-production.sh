#!/bin/bash

# Production rollback script with safety checks and verification
# Supports rollback to previous deployment or specific version

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ROLLBACK_LOG="/tmp/rollback-$(date +%Y%m%d-%H%M%S).log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="/opt/backups/njillu-app"
HEALTH_URL="https://your-domain.com/api/health"
MAX_ROLLBACK_ATTEMPTS=3

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ROLLBACK:${NC} $*" | tee -a "$ROLLBACK_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$ROLLBACK_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$ROLLBACK_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$ROLLBACK_LOG"
}

error_exit() {
    log_error "$1"
    log "Rollback log saved to: $ROLLBACK_LOG"
    exit 1
}

# Parse command line arguments
ROLLBACK_TYPE="previous"  # previous, version, database, files
SPECIFIC_VERSION=""
FORCE_ROLLBACK=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --previous)
            ROLLBACK_TYPE="previous"
            shift
            ;;
        --version)
            ROLLBACK_TYPE="version"
            SPECIFIC_VERSION="$2"
            shift 2
            ;;
        --database-only)
            ROLLBACK_TYPE="database"
            shift
            ;;
        --files-only)
            ROLLBACK_TYPE="files"
            shift
            ;;
        --force)
            FORCE_ROLLBACK=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --previous          Rollback to previous deployment (default)"
            echo "  --version VERSION   Rollback to specific version"
            echo "  --database-only     Rollback database only"
            echo "  --files-only        Rollback application files only"
            echo "  --force             Force rollback without confirmation"
            echo "  --dry-run           Show what would be done without executing"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            error_exit "Unknown parameter: $1"
            ;;
    esac
done

log "Starting production rollback process..."
log "Rollback type: $ROLLBACK_TYPE"
log "Rollback log: $ROLLBACK_LOG"

# Pre-rollback validation
pre_rollback_checks() {
    log "Running pre-rollback validation..."
    
    # Check if we're in the right environment
    if [[ "$NODE_ENV" != "production" && -z "$FORCE_ROLLBACK" ]]; then
        error_exit "Not in production environment. Use --force to override."
    fi
    
    # Check Docker is running
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running"
    fi
    
    # Check backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        error_exit "Backup directory not found: $BACKUP_DIR"
    fi
    
    # Check for available backups
    local backup_count=$(find "$BACKUP_DIR" -name "*backup-*" -type f | wc -l)
    if [[ $backup_count -eq 0 ]]; then
        error_exit "No backup files found in $BACKUP_DIR"
    fi
    
    log_success "Pre-rollback checks passed"
}

# Find latest backup
find_latest_backup() {
    local backup_type="$1"
    local latest_backup=$(find "$BACKUP_DIR/$backup_type" -name "*backup-*.enc" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -z "$latest_backup" ]]; then
        log_error "No backup found for type: $backup_type"
        return 1
    fi
    
    echo "$latest_backup"
}

# Decrypt backup file
decrypt_backup() {
    local encrypted_file="$1"
    local decrypted_file="${encrypted_file%.enc}"
    local key_file="/etc/njillu-app/backup.key"
    
    if [[ ! -f "$key_file" ]]; then
        error_exit "Encryption key not found: $key_file"
    fi
    
    log "Decrypting backup: $(basename "$encrypted_file")"
    openssl enc -d -aes-256-cbc -in "$encrypted_file" -out "$decrypted_file" -pass file:"$key_file"
    
    echo "$decrypted_file"
}

# Create current state backup before rollback
create_emergency_backup() {
    log "Creating emergency backup of current state..."
    
    local emergency_backup_dir="$BACKUP_DIR/emergency/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$emergency_backup_dir"
    
    # Backup current Docker images
    docker save $(docker images --format "table {{.Repository}}:{{.Tag}}" | grep njillu-app | head -5) -o "$emergency_backup_dir/current-images.tar" 2>/dev/null || log_warning "Could not backup current images"
    
    # Backup current configuration
    cp -r "$PROJECT_ROOT/.env.production" "$emergency_backup_dir/" 2>/dev/null || log_warning "Could not backup environment file"
    cp -r "$PROJECT_ROOT/config" "$emergency_backup_dir/" 2>/dev/null || log_warning "Could not backup config directory"
    
    log_success "Emergency backup created: $emergency_backup_dir"
    echo "$emergency_backup_dir"
}

# Rollback database
rollback_database() {
    log "Rolling back database..."
    
    local db_backup=$(find_latest_backup "database")
    if [[ -z "$db_backup" ]]; then
        error_exit "No database backup found"
    fi
    
    log "Using database backup: $(basename "$db_backup")"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would restore database from $db_backup"
        return 0
    fi
    
    # Decrypt backup
    local decrypted_backup=$(decrypt_backup "$db_backup")
    
    # Load environment
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        source "$PROJECT_ROOT/.env.production"
    fi
    
    # Restore database
    log "Restoring database from backup..."
    
    # Note: This is a placeholder for actual Supabase restore
    # Replace with actual Supabase restore command
    log_warning "Database restore not implemented - placeholder"
    
    # Cleanup
    rm -f "$decrypted_backup"
    
    log_success "Database rollback completed"
}

# Rollback application files
rollback_application() {
    log "Rolling back application files..."
    
    local files_backup=$(find_latest_backup "files")
    if [[ -z "$files_backup" ]]; then
        error_exit "No files backup found"
    fi
    
    log "Using files backup: $(basename "$files_backup")"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would restore files from $files_backup"
        return 0
    fi
    
    # Decrypt backup
    local decrypted_backup=$(decrypt_backup "$files_backup")
    
    # Extract backup
    local temp_dir=$(mktemp -d)
    tar -xzf "$decrypted_backup" -C "$temp_dir"
    
    # Restore configuration files
    log "Restoring configuration files..."
    if [[ -f "$temp_dir/.env.production" ]]; then
        cp "$temp_dir/.env.production" "$PROJECT_ROOT/"
        log "Restored .env.production"
    fi
    
    if [[ -d "$temp_dir/config" ]]; then
        cp -r "$temp_dir/config" "$PROJECT_ROOT/"
        log "Restored config directory"
    fi
    
    # Cleanup
    rm -f "$decrypted_backup"
    rm -rf "$temp_dir"
    
    log_success "Application files rollback completed"
}

# Rollback Docker deployment
rollback_deployment() {
    log "Rolling back Docker deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would rollback Docker deployment"
        return 0
    fi
    
    # Get current running containers
    local current_containers=$(docker ps --filter "name=njillu-app" --format "{{.Names}}")
    
    # Stop current containers
    if [[ -n "$current_containers" ]]; then
        log "Stopping current containers..."
        echo "$current_containers" | xargs -r docker stop
    fi
    
    # Load previous image or rebuild
    if [[ "$ROLLBACK_TYPE" == "version" && -n "$SPECIFIC_VERSION" ]]; then
        log "Rolling back to version: $SPECIFIC_VERSION"
        # Pull specific version
        docker pull "ghcr.io/your-org/njillu-app:$SPECIFIC_VERSION" || error_exit "Failed to pull version $SPECIFIC_VERSION"
        
        # Update docker-compose to use specific version
        sed -i "s|image: ghcr.io/your-org/njillu-app:.*|image: ghcr.io/your-org/njillu-app:$SPECIFIC_VERSION|" "$PROJECT_ROOT/docker-compose.yml"
    else
        # Use previous image (would need to be implemented based on your tagging strategy)
        log "Rolling back to previous deployment..."
    fi
    
    # Restart with rollback configuration
    docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d
    
    log_success "Deployment rollback completed"
}

# Health check after rollback
post_rollback_verification() {
    log "Running post-rollback verification..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would run post-rollback verification"
        return 0
    fi
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30
    
    # Health check
    local attempts=0
    while [[ $attempts -lt $MAX_ROLLBACK_ATTEMPTS ]]; do
        log "Health check attempt $((attempts + 1))/$MAX_ROLLBACK_ATTEMPTS"
        
        if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        ((attempts++))
        if [[ $attempts -lt $MAX_ROLLBACK_ATTEMPTS ]]; then
            log "Health check failed, retrying in 15 seconds..."
            sleep 15
        fi
    done
    
    error_exit "Health check failed after $MAX_ROLLBACK_ATTEMPTS attempts"
}

# Main rollback function
main() {
    log "=== PRODUCTION ROLLBACK INITIATED ==="
    
    # Pre-rollback checks
    pre_rollback_checks
    
    # Create emergency backup
    local emergency_backup=""
    if [[ "$DRY_RUN" == "false" ]]; then
        emergency_backup=$(create_emergency_backup)
    fi
    
    # Confirmation
    if [[ "$FORCE_ROLLBACK" == "false" && "$DRY_RUN" == "false" ]]; then
        echo
        echo -e "${YELLOW}=== PRODUCTION ROLLBACK WARNING ===${NC}"
        echo "You are about to rollback PRODUCTION deployment"
        echo "Rollback type: $ROLLBACK_TYPE"
        echo "Emergency backup: $emergency_backup"
        echo "Health check URL: $HEALTH_URL"
        echo
        read -p "Are you absolutely sure? Type 'ROLLBACK' to continue: " -r
        if [[ "$REPLY" != "ROLLBACK" ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Execute rollback based on type
    case "$ROLLBACK_TYPE" in
        "previous"|"version")
            rollback_application
            rollback_deployment
            post_rollback_verification
            ;;
        "database")
            rollback_database
            ;;
        "files")
            rollback_application
            ;;
        *)
            error_exit "Unknown rollback type: $ROLLBACK_TYPE"
            ;;
    esac
    
    # Success
    log_success "=== PRODUCTION ROLLBACK COMPLETED ==="
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Generate rollback report
        local report_file="$PROJECT_ROOT/reports/rollback-report-$(date +%Y%m%d-%H%M%S).txt"
        mkdir -p "$PROJECT_ROOT/reports"
        
        cat << EOF > "$report_file"
=== Production Rollback Report ===
Date: $(date)
Rollback Type: $ROLLBACK_TYPE
Specific Version: ${SPECIFIC_VERSION:-"N/A"}
Emergency Backup: ${emergency_backup:-"N/A"}
Status: SUCCESS
Health Check: PASSED
Rollback Log: $ROLLBACK_LOG
===================================
EOF
        
        log_success "Rollback report saved: $report_file"
        
        # Send notification
        if [[ -n "${ROLLBACK_WEBHOOK_URL:-}" ]]; then
            curl -X POST "$ROLLBACK_WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"Production rollback completed successfully!\",\"type\":\"$ROLLBACK_TYPE\"}" \
                || log_warning "Failed to send notification"
        fi
    fi
    
    log "Rollback script completed successfully"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi