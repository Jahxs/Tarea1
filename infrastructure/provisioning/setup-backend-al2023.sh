#!/usr/bin/env bash
# ==============================================================================
# TaskHub - EC2 Provisioning Script for Amazon Linux 2023 (AL2023)
# ==============================================================================
# Target: Distributed Spring Boot 3 Backend Node for AWS Application Load Balancer (ALB)
# Roles: Installs Docker, Docker Compose, tunes OS/Swap, and deploys TaskHub backend.
# Security Standards:
#   - Zero database colocation (centralized PostgreSQL instance / RDS).
#   - Zero hardcoded credentials (supports SSM, secure .env, and hidden interactive prompts).
#   - Passwords never logged, echoed, or committed.
#   - Non-root container execution.
#
# Usage:
#   1. Recommended (Pre-staged secure .env or SSM):
#      sudo bash setup-backend-al2023.sh --db-host 10.0.1.50
#
#   2. Interactive prompt (password entry is hidden):
#      sudo bash setup-backend-al2023.sh --db-host 10.0.1.50 --interactive
# ==============================================================================

set -euo pipefail

# --- Color formatting for CLI logging ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- Check Superuser Privileges ---
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be executed with root/sudo privileges."
    exit 1
fi

# --- Default Configurable Parameters ---
REPO_URL="${REPO_URL:-https://github.com/Jahxs/Tarea1.git}"
REPO_BRANCH="${REPO_BRANCH:-feature/SCRUM-9-load-balancing}"
INSTALL_DIR="/opt/taskhub"
APP_PORT="${APP_PORT:-8080}"
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-crud_tareas_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
INTERACTIVE=false

# --- Parse Command-Line Arguments ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --db-host) DB_HOST="$2"; shift 2 ;;
        --db-port) DB_PORT="$2"; shift 2 ;;
        --db-name) DB_NAME="$2"; shift 2 ;;
        --db-user) DB_USER="$2"; shift 2 ;;
        --db-password)
            log_warn "Passing passwords via CLI flags is visible in 'ps aux'. Prefer secure .env or hidden prompt."
            DB_PASSWORD="$2"; shift 2 ;;
        --interactive) INTERACTIVE=true; shift ;;
        --repo-branch) REPO_BRANCH="$2"; shift 2 ;;
        --app-port) APP_PORT="$2"; shift 2 ;;
        *) log_warn "Unknown parameter passed: $1"; shift ;;
    esac
done

log_info "=========================================================="
log_info " TaskHub - Backend Node Provisioning (Amazon Linux 2023)  "
log_info " Target: AWS Application Load Balancer (ALB) Target Node  "
log_info "=========================================================="

# ==============================================================================
# Step 1: Operating System Optimization & Swap Memory (t3.micro 1GiB RAM Guard)
# ==============================================================================
# Spring Boot compilation (Maven) and JVM execution require headroom.
# On AL2023 with XFS filesystems, dd must be used instead of fallocate.
log_info "Step 1: Checking and configuring Swap memory (${SWAP_SIZE_GB}GB)..."

if [ ! -f /swapfile ]; then
    log_info "Allocating /swapfile using block copy (XFS safe)..."
    dd if=/dev/zero of=/swapfile bs=128M count=$((SWAP_SIZE_GB * 8)) status=none
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
    log_success "Swapfile created and activated successfully."
else
    log_info "Swapfile already exists. Skipping allocation."
fi

# Swappiness optimization (lower value favors RAM, uses swap only when necessary)
sysctl -w vm.swappiness=10 >/dev/null
if ! grep -q "vm.swappiness=10" /etc/sysctl.conf 2>/dev/null; then
    echo "vm.swappiness=10" >> /etc/sysctl.conf
fi

# ==============================================================================
# Step 2: System Packages & Dependencies Installation (AL2023 dnf)
# ==============================================================================
log_info "Step 2: Updating packages and installing Git, Docker, and utilities..."
dnf update -y --releasever=latest
dnf install -y git curl wget jq docker

# Enable and start Docker service
systemctl enable --now docker
usermod -aG docker ec2-user || true
log_success "Docker Engine installed and running: $(docker --version)"

# ==============================================================================
# Step 3: Install Docker Compose Plugin v2
# ==============================================================================
log_info "Step 3: Installing Docker Compose v2 standalone and plugin..."
DOCKER_CLI_PLUGINS="/usr/local/lib/docker/cli-plugins"
mkdir -p "$DOCKER_CLI_PLUGINS"

ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  COMPOSE_ARCH="x86_64" ;;
    aarch64) COMPOSE_ARCH="aarch64" ;;
    *) log_error "Unsupported CPU architecture: $ARCH"; exit 1 ;;
esac

COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${COMPOSE_ARCH}"
curl -sSL "$COMPOSE_URL" -o "$DOCKER_CLI_PLUGINS/docker-compose"
chmod +x "$DOCKER_CLI_PLUGINS/docker-compose"

# Link for backward compatibility with 'docker compose' and 'docker-compose'
ln -sf "$DOCKER_CLI_PLUGINS/docker-compose" /usr/local/bin/docker-compose
ln -sf "$DOCKER_CLI_PLUGINS/docker-compose" /usr/bin/docker-compose

log_success "Docker Compose installed: $(docker compose version)"

# ==============================================================================
# Step 4: Clone or Update TaskHub Codebase
# ==============================================================================
log_info "Step 4: Setting up application directory at $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
    log_info "Repository already exists. Pulling latest changes from branch: $REPO_BRANCH..."
    git -C "$INSTALL_DIR" fetch origin "$REPO_BRANCH"
    git -C "$INSTALL_DIR" checkout "$REPO_BRANCH"
    git -C "$INSTALL_DIR" pull origin "$REPO_BRANCH"
else
    log_info "Cloning repository $REPO_URL (branch: $REPO_BRANCH)..."
    git clone -b "$REPO_BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# ==============================================================================
# Step 5: Secure Environment Configuration (Zero Hardcoded Credentials)
# ==============================================================================
log_info "Step 5: Verifying environment configuration (.env)..."
ENV_FILE="$INSTALL_DIR/.env"

# Prompt interactively if requested and DB_PASSWORD is unset
if [ "$INTERACTIVE" = true ] && [ -z "$DB_PASSWORD" ] && [ ! -f "$ENV_FILE" ]; then
    read -r -p "Enter PostgreSQL Host: " DB_HOST
    read -r -p "Enter PostgreSQL User [postgres]: " input_user
    DB_USER="${input_user:-postgres}"
    read -r -s -p "Enter PostgreSQL Password (hidden): " DB_PASSWORD
    echo ""
fi

# Case A: Credentials provided via environment/arguments - generate secure .env
if [ -n "$DB_HOST" ] && [ -n "$DB_PASSWORD" ]; then
    log_info "Generating production .env with restricted file permissions (600)..."
    cat <<EOF > "$ENV_FILE"
# Generated securely by TaskHub Provisioning Script on $(date -u)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
APP_PORT=${APP_PORT}
HIKARI_MAX_POOL=5
EOF
    chmod 600 "$ENV_FILE"
    chown ec2-user:ec2-user "$ENV_FILE"
    log_success "Secure .env configuration active (credentials masked)."
# Case B: Pre-staged .env file already exists
elif [ -f "$ENV_FILE" ]; then
    log_info "Pre-existing .env file detected at $ENV_FILE. Verifying permissions..."
    chmod 600 "$ENV_FILE"
    chown ec2-user:ec2-user "$ENV_FILE"
# Case C: No credentials available
else
    log_warn "No .env found and no database credentials provided."
    log_warn "Copying template from .env.backend.example..."
    cp "$INSTALL_DIR/.env.backend.example" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    chown ec2-user:ec2-user "$ENV_FILE"
    log_error "Please configure real database credentials in $ENV_FILE before launching container!"
    exit 2
fi

# ==============================================================================
# Step 6: Build & Deploy Spring Boot Backend (No PostgreSQL Container)
# ==============================================================================
log_info "Step 6: Orchestrating TaskHub Backend container via docker-compose.backend.yml..."

# Ensure non-root ownership of project directory
chown -R ec2-user:ec2-user "$INSTALL_DIR"

# Build and start container in detached mode
docker compose -f docker-compose.backend.yml up --build -d

# ==============================================================================
# Step 7: Post-Deployment Health Check & Metadata Retrieval (IMDSv2 Compliant)
# ==============================================================================
log_info "Step 7: Awaiting Spring Boot container initialization..."
MAX_ATTEMPTS=15
ATTEMPT=1
IS_HEALTHY=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s -f "http://localhost:${APP_PORT}/api/tareas" > /dev/null 2>&1; then
        IS_HEALTHY=true
        break
    fi
    log_info "Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for Spring Boot on port ${APP_PORT} (5s sleep)..."
    sleep 5
    ATTEMPT=$((ATTEMPT + 1))
done

# --- IMDSv2-Compliant AWS Metadata Retrieval ---
# Amazon Linux 2023 enforces IMDSv2 (requires session token via PUT)
IMDS_TOKEN=$(curl -s -S -f -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60" \
    --connect-timeout 2 --max-time 3 2>/dev/null || true)

PUBLIC_IP=""
INSTANCE_ID=""

if [ -n "$IMDS_TOKEN" ]; then
    PUBLIC_IP=$(curl -s -f -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
        --connect-timeout 2 --max-time 3 \
        "http://169.254.169.254/latest/meta-data/public-ipv4" 2>/dev/null || true)
    INSTANCE_ID=$(curl -s -f -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
        --connect-timeout 2 --max-time 3 \
        "http://169.254.169.254/latest/meta-data/instance-id" 2>/dev/null || true)
fi

# Fallback to local network interfaces
PRIVATE_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

if [ "$IS_HEALTHY" = true ]; then
    log_success "=========================================================="
    log_success " TaskHub Backend Node Successfully Deployed & Healthy!    "
    log_success " Ready for AWS ALB Target Group Registration (Port ${APP_PORT}) "
    log_success "----------------------------------------------------------"
    [ -n "$INSTANCE_ID" ] && log_info " EC2 Instance ID : $INSTANCE_ID"
    log_info " Private IPv4    : $PRIVATE_IP (Use for ALB Target Group)"
    if [ -n "$PUBLIC_IP" ]; then
        log_info " Public IPv4     : $PUBLIC_IP"
    else
        log_info " Public IPv4     : None (Secure private subnet deployment)"
    fi
    log_info " Health Endpoint : http://localhost:${APP_PORT}/api/tareas"
    log_success "=========================================================="
else
    log_warn "Application container is running but health check endpoint did not respond yet."
    log_warn "Check container logs using: docker logs -f taskhub-backend-app"
fi
