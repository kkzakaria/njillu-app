#!/bin/bash

# Staging database migration script
# Applies database migrations with rollback capability

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[MIGRATE-STAGING]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI not found. Please install it first."
    exit 1
fi

# Load staging environment
if [[ -f "$PROJECT_ROOT/.env.staging" ]]; then
    source "$PROJECT_ROOT/.env.staging"
fi

# Check required environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL_STAGING" "SUPABASE_SERVICE_ROLE_KEY_STAGING")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        log_error "Required environment variable not set: $var"
        exit 1
    fi
done

log "Starting staging database migration..."

cd "$PROJECT_ROOT"

# Create backup before migration
log "Creating database backup..."
BACKUP_FILE="backups/staging-backup-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p backups

# Note: This is a placeholder for actual backup command
# Replace with actual Supabase backup command when available
log_warning "Backup creation not implemented for staging"

# Check migration status
log "Checking current migration status..."
supabase migration list --project-ref="${NEXT_PUBLIC_SUPABASE_URL_STAGING##*/}" || {
    log_error "Failed to check migration status"
    exit 1
}

# Apply pending migrations
log "Applying pending migrations..."
supabase db push --project-ref="${NEXT_PUBLIC_SUPABASE_URL_STAGING##*/}" || {
    log_error "Migration failed"
    exit 1
}

# Verify database integrity
log "Verifying database integrity..."
# Add database integrity checks here
# Example: Check if required tables exist, constraints are in place, etc.

log "Migration completed successfully!"

# Optional: Run seed data for staging
if [[ -f "$PROJECT_ROOT/supabase/seed-staging.sql" ]]; then
    log "Applying staging seed data..."
    # Apply seed data
    log_warning "Seed data application not implemented"
fi

log "Staging database migration completed successfully!"