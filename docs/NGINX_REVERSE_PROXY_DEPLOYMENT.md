# AWS EC2 Nginx Reverse Proxy Deployment & Security Hardening Guide

**Project:** TaskHub  
**Jira Issue:** SCRUM-8 (Nginx Reverse Proxy on Port 80)  
**Security Standard:** Port 80 Ingress, Internal Port 8080 Isolation, Zero Database Exposure  

---

## 1. Architecture & Security Model

The deployment introduces an Nginx reverse proxy running inside a container on the AWS EC2 instance to serve as the unified entry point on standard HTTP port `80`.

```
 Internet / Clients / AWS API Gateway
                  │
                  ▼ Port 80 (HTTP)
 ┌──────────────────────────────────────────────────────────────┐
 │ AWS EC2 Instance (Ubuntu 24.04 LTS)                          │
 │                                                              │
 │   ┌────────────────────────────────────────────────────────┐ │
 │   │ Docker Bridge Network: crud-network                    │ │
 │   │                                                        │ │
 │   │  ┌───────────────────────┐                             │ │
 │   │  │ nginx-reverse-proxy   │ (Published: 80:80)          │ │
 │   │  │ (Nginx 1.27 Alpine)   │                             │ │
 │   │  └───────────┬───────────┘                             │ │
 │   │              │ proxy_pass http://app:8080              │ │
 │   │              ▼                                         │ │
 │   │  ┌───────────────────────┐    Internal Connection      │ │
 │   │  │ springboot-crud-app   │ ────────────────────────┐   │ │
 │   │  │ (Spring Boot :8080)   │ (Internal Expose only)  │   │ │
 │   │  └───────────────────────┘                         ▼   │ │
 │   │                                         ┌──────────────┴┐│
 │   │                                         │postgres-crud-db││
 │   │                                         │(Postgres :5432)││
 │   │                                         └───────┬───────┘│
 │   └─────────────────────────────────────────────────┼────────┘│
 │                                                     │        │
 │                                                     ▼        │
 │                                            postgres_crud_data │
 │                                            (Persistent Volume)│
 └──────────────────────────────────────────────────────────────┘
```

* **Public Port 80:** Nginx listens on host port 80 and terminates public HTTP traffic.
* **Spring Boot (Port 8080):** Bound exclusively to `crud-network`; no host port is published.
* **PostgreSQL (Port 5432):** Fully isolated within `crud-network` with persistent named volume `postgres_crud_data`.
* **Zero Exposure:** Direct public requests to port 8080 and port 5432 are rejected by both Docker and AWS Security Groups.

---

## 2. Step-by-Step EC2 Deployment Procedure

> [!IMPORTANT]
> Do not execute deployment commands on AWS EC2 without explicit administrative approval.

### Step 2.1: Connect to EC2 Host via SSH

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 2.2: Update the Repository on EC2

Navigate to the application root directory and fetch the latest branch:

```bash
cd /home/ubuntu/Tarea1
git fetch origin
git checkout feature/nginx-reverse-proxy
git pull origin feature/nginx-reverse-proxy
```

Verify that the working tree is clean and points to the target commit:

```bash
git status
```

### Step 2.3: Validate Docker Compose Configuration

Before restarting containers, validate that Docker Compose correctly resolves all service definitions, networks, and port bindings:

```bash
docker compose config
```

Verify the output:
* `nginx`: has `published: "80"` on `crud-network`.
* `app`: has `expose: ["8080"]` without any `published` ports.
* `db`: has zero published ports and preserves `postgres_crud_data`.

### Step 2.4: Safely Deploy Updated Containers

Rebuild and start the containers in detached mode:

```bash
docker compose up -d --build
```

> [!NOTE]
> Named Docker volume `postgres_crud_data` persists PostgreSQL data across restarts. No database records will be lost during this update.

Verify container status:

```bash
docker compose ps
```

All three containers (`nginx-reverse-proxy`, `springboot-crud-app`, `postgres-crud-db`) must be in the `Up` state.

Check Nginx and Spring Boot logs for startup errors:

```bash
docker compose logs --tail 50 nginx
docker compose logs --tail 50 app
```

---

## 3. AWS EC2 Security Group Configuration

Update the EC2 Security Group to allow standard HTTP port 80 and block deprecated port 8080.

### Required Inbound Rules Table

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `<Your-IP>/32` | Administrative access (PRESERVED) |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Public Nginx reverse proxy access (ADD) |
| **Custom TCP** | TCP | `8080` | — | Direct Spring Boot port (REVOKE / REMOVE) |
| **PostgreSQL** | TCP | `5432` | — | Database port (MUST NOT EXIST) |

### Updating via AWS Management Console

1. Navigate to **EC2 Console** > **Instances** > Select your TaskHub EC2 instance.
2. Under the **Security** tab, click the associated **Security Group ID**.
3. Select **Edit inbound rules**:
   * Click **Add rule**: Type = `HTTP`, Port = `80`, Source = `0.0.0.0/0`.
   * Locate the rule for port `8080` and click **Delete**.
   * Confirm the SSH rule (port `22`) remains untouched.
4. Click **Save rules**.

---

## 4. AWS API Gateway Configuration Update

Because Spring Boot is now routed through Nginx on port 80, the AWS API Gateway HTTP API upstream integration must point to port 80 (standard HTTP) instead of port 8080.

### CloudFormation Parameter Update

Update the `BackendBaseUrl` parameter in your CloudFormation stack from `http://<EC2_PUBLIC_IP>:8080` to `http://<EC2_PUBLIC_IP>`:

```bash
aws cloudformation update-stack \
  --stack-name taskhub-api-gateway \
  --use-previous-template \
  --parameters \
      ParameterKey=BackendBaseUrl,ParameterValue=http://<EC2_PUBLIC_IP> \
      ParameterKey=Environment,UsePreviousValue=true
```

### Verification in AWS API Gateway Console

1. Navigate to **API Gateway** > Select `taskhub-api-gateway-dev`.
2. Inspect **Integrations**:
   * `TareasBaseIntegration`: Target URI is `http://<EC2_PUBLIC_IP>/api/tareas`.
   * `TareasProxyIntegration`: Target URI is `http://<EC2_PUBLIC_IP>/api/tareas/{proxy}`.
3. Confirm both integrations route cleanly through port 80.

---

## 5. Post-Deployment Verification & Testing

Execute the following verification steps on your local workstation:

### 1. Test Port 80 Access (Expected: Success 200 OK)

```bash
# Frontend UI
curl -i http://<EC2_PUBLIC_IP>/index.html

# REST API Endpoint
curl -i http://<EC2_PUBLIC_IP>/api/tareas
```

### 2. Test Port 8080 Isolation (Expected: Connection Refused / Timeout)

```bash
curl -i --connect-timeout 5 http://<EC2_PUBLIC_IP>:8080/api/tareas
```

The request must hang and time out, confirming direct access is successfully blocked.

### 3. Test AWS API Gateway Roundtrip

```bash
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/api/tareas
```

### 4. Execute Postman CRUD Integration Suite

```bash
npx newman run postman/taskhub-api-gateway.postman_collection.json \
  --env-var "apiBaseUrl=http://<EC2_PUBLIC_IP>"
```

All tests for `GET`, `POST`, `PUT`, and `DELETE` must pass with status codes `200`, `201`, `200`, and `204`.

---

## 6. Rollback Plan

If unexpected routing failures occur:
1. Re-add port `8080` to the EC2 Security Group inbound rules.
2. In `docker-compose.yml`, restore `ports: - "8080:8080"` under the `app` service.
3. Run `docker compose up -d` to restore direct backend accessibility.
