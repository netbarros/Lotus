#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# PostgreSQL Backup Script - MagicSaaS System-∞
# Automated backup with rotation and cloud upload
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="magicsaas_backup_${TIMESTAMP}.sql.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log "Starting PostgreSQL backup..."

# Perform backup
log "Creating backup: ${BACKUP_FILE}"
if pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    log "✅ Backup created successfully"

    # Get file size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log "Backup size: ${BACKUP_SIZE}"
else
    error "Failed to create backup"
fi

# Upload to S3 if configured
if [ -n "${S3_BUCKET}" ]; then
    log "Uploading to S3: s3://${S3_BUCKET}/backups/"
    if aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${S3_BUCKET}/backups/" --storage-class GLACIER_IR; then
        log "✅ Uploaded to S3 successfully"
    else
        warn "Failed to upload to S3"
    fi
fi

# Rotate old backups
log "Rotating old backups (keeping last ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "magicsaas_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
REMAINING_BACKUPS=$(find "${BACKUP_DIR}" -name "magicsaas_backup_*.sql.gz" -type f | wc -l)
log "Remaining backups: ${REMAINING_BACKUPS}"

# Create backup manifest
cat > "${BACKUP_DIR}/latest.txt" <<EOF
timestamp: ${TIMESTAMP}
file: ${BACKUP_FILE}
size: ${BACKUP_SIZE}
date: $(date -Iseconds)
database: magicsaas
EOF

log "✅ Backup completed successfully!"
log "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}"
