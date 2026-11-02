# AWS EC2 Cloud Deployment Guide

**Application:** TaskHub (Full-Stack Spring Boot 3 + PostgreSQL 16)  
**Target Environment:** Amazon Web Services (AWS) EC2 — Ubuntu Server 24.04 LTS  
**Orchestration:** Docker Engine & Docker Compose  
**Security Standard:** Zero-Exposure Internal Database & Enforced Environment Secrets  

---

## 1. Architecture Overview

The application is deployed on a single AWS EC2 virtual machine running Ubuntu Server 24.04 LTS. Services are containerized and orchestrated via Docker Compose:

* **Application Container (`app`):** Spring Boot 3.3.4 running on Eclipse Temurin Java 17 JRE Alpine. Accessible externally via host port `8080`.
* **Database Container (`db`):** PostgreSQL 16 Alpine. Isolated inside the internal Docker network (`crud-network`). **Host port `5432` is unmapped** for zero exposure to the public internet.
* **Storage Persistence:** Named Docker volume `postgres_crud_data` ensures database persistence across container updates and host reboots.

```
 Internet (Browser / HTTP)
            │
            ▼ Port 8080 (AWS Security Group Inbound)
┌────────────────────────────────────────────────────────┐
│ AWS EC2 (Ubuntu 24.04 LTS)                             │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Docker Bridge Network: crud-network              │  │
│  │                                                  │  │
│  │   ┌────────────────────┐   Internal connection    │  │
│  │   │ springboot-crud-app│ ─────────────────────┐  │  │
│  │   │ (Spring Boot :8080)│                      │  │  │
│  │   └─────────┬──────────┘                      ▼  │  │
│  │             │ (Exposed: 8080)        ┌──────────┴───┐│
│  │             │                        │postgres-crud-db│
│  │             │                        │(Postgres:5432)││
│  │             │                        └───────┬──────┘│
│  └─────────────┼────────────────────────────────┼───┘  │
│                │                                │      │
│                ▼                                ▼      │
│         Host Port 8080              postgres_crud_data │
│                                      (Persistent Volume)
└────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

1. **AWS EC2 Instance:**
   * **AMI:** Ubuntu Server 24.04 LTS (64-bit x86).
   * **Instance Type:** `t2.micro` or `t3.micro` (1 vCPU, 1 GiB RAM).
   * **Storage:** 15–20 GiB gp3 root volume.
2. **Security Group Inbound Rules:**
   * **SSH:** TCP Port `22` (Source: My IP recommended).
   * **Application HTTP:** TCP Port `8080` (Source: `0.0.0.0/0` for public review).
3. **SSH Key Pair:**
   * A private key file (`.pem`) created during instance launch.

---

## 3. Host Server Configuration (Ubuntu 24.04)

### Step 3.1: Connect to the EC2 Instance via SSH

Open your local terminal and connect using the key pair:

```bash
chmod 400 <your-key-pair>.pem
ssh -i "<your-key-pair>.pem" ubuntu@<EC2_PUBLIC_IPv4_OR_DNS>
```

### Step 3.2: Configure Swap Memory (Critical for 1 GiB RAM Instances)

Spring Boot and Maven compilation require memory headroom. On `t2.micro` or `t3.micro` (1 GiB RAM), configuring a 2 GiB swap file prevents Out-Of-Memory (OOM) process termination:

```bash
# Allocate 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap persistent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify memory status
free -h
```

### Step 3.3: Install Docker Engine & Docker Compose Plugin

Install the official Docker packages on Ubuntu 24.04:

```bash
# Update repository indexes
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## 4. Application Deployment

### Step 4.1: Clone the Repository

```bash
git clone https://github.com/Jahxs/Tarea1.git
cd Tarea1
```

### Step 4.2: Configure Environment Secrets

Copy the environment template and provide secure credentials:

```bash
cp .env.example .env
nano .env
```

Ensure `.env` contains:

```env
POSTGRES_DB=crud_tareas_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=generate_a_strong_password_here
APP_PORT=8080
```

> [!IMPORTANT]
> The `.env` file is excluded from version control via `.gitignore`. Never commit or publish `.env`.

### Step 4.3: Validate Configuration and Build Containers

```bash
# Verify Compose configuration syntax and variable interpolation
docker compose config --quiet

# Build and start services in detached mode
docker compose up --build -d
```

### Step 4.4: Verify Container Execution & Logs

```bash
# Check service status and health checks
docker compose ps

# Inspect real-time application startup logs
docker compose logs -f app
```

Verify that the Spring Boot logs display:
```text
Tomcat started on port 8080 (http) with context path '/'
Started CrudTareasApplication in X.XXX seconds
```

---

## 5. Verification & Testing

### 5.1: Web Interface Verification

Open any modern web browser and navigate to:

```text
http://<EC2_PUBLIC_IP>:8080/
```

Verify the following:
1. **Initial Page Load:** TaskHub dashboard renders with CSS grid, cards, and navigation controls.
2. **Task Creation:** Create a new task (e.g., Title: `"Verify Cloud Deployment"`, Status: `"EN_PROCESO"`).
3. **Data Persistence Across Refresh:** Hard-refresh the browser (`Ctrl + F5`); the task remains displayed.
4. **Interactive Controls:** Toggle status, view details modal, switch to Kanban view, and test real-time search.

### 5.2: RESTful API Automated Verification via cURL

Run these commands either from the EC2 instance or locally against the public IP:

```bash
# 1. Health / Welcome page test (HTTP 200)
curl -I http://<EC2_PUBLIC_IP>:8080/

# 2. Retrieve all tasks (GET)
curl -X GET http://<EC2_PUBLIC_IP>:8080/api/tareas

# 3. Create a task via REST API (POST)
curl -X POST http://<EC2_PUBLIC_IP>:8080/api/tareas \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Verify Cloud API",
    "descripcion": "Verifying Spring Boot REST endpoint on AWS EC2",
    "estado": "COMPLETADA"
  }'

# 4. Confirm task persistence after container restart
docker compose restart app
curl -X GET http://<EC2_PUBLIC_IP>:8080/api/tareas
```

---

## 6. Security Hardening Recommendations

### 6.1: SSH Access Security
* **Restrict Inbound IP:** In the AWS Security Group, restrict port `22` to your own IP address (`<YOUR_IP>/32`) rather than `0.0.0.0/0`.
* **Private Key Protection:** Always store `.pem` files with restrictive permissions (`chmod 400`). Never share or upload private keys to GitHub.
* **Authentication:** Password authentication is disabled by default on Ubuntu AMIs; keep key-based authentication enforced.

### 6.2: PostgreSQL Database Hardening
* **Zero Host Port Exposure:** As configured in [docker-compose.yml](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/docker-compose.yml), the PostgreSQL port `5432` is **not published** to the host. It communicates exclusively within the isolated Docker network `crud-network`.
* **Mandatory Password Enforcement:** `POSTGRES_PASSWORD` is strictly required via `${POSTGRES_PASSWORD:?}` syntax, preventing accidental execution with default credentials.
* **Persistent Volume Backups:** Back up the `postgres_crud_data` volume regularly using `docker run --rm -v postgres_crud_data:/data -v $(pwd):/backup alpine tar czvf /backup/db_backup.tar.gz /data`.

### 6.3: HTTP / HTTPS Production Recommendations
* **Reverse Proxy:** For production deployments, place an Nginx reverse proxy in front of Spring Boot to handle SSL/TLS termination on port `443`.
* **SSL/TLS Certificates:** Obtain a free automated certificate using Let's Encrypt (`certbot --nginx`) tied to a custom domain.
* **Security Group Tightening:** Close port `8080` to the public and allow traffic only through ports `80` (HTTP redirect) and `443` (HTTPS).
