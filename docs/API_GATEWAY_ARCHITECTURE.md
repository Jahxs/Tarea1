# API Gateway Architecture & Integration Design

**Project:** TaskHub
**Jira Issue:** SCRUM-7 (API Gateway)
**Standard:** Git Flow & Cloud-Native Reverse Proxy Architecture

---

## 1. Current Architecture Overview

TaskHub currently runs as a containerized full-stack application deployed on an AWS EC2 instance:
* **Backend (`springboot-crud-app`):** Spring Boot 3.3.4 running Java 17 on internal host port `8080`.
* **Database (`postgres-crud-db`):** PostgreSQL 16 Alpine running on isolated Docker network (`crud-network`), unexposed to the public internet.
* **Clients:** Web browsers and external consumers make direct HTTP requests to the EC2 host on port `8080`.

---

## 2. Proposed API Gateway Integration

The API Gateway layer will be introduced as the single, centralized reverse proxy and entry point:
* **Decoupled Client Access:** Clients communicate exclusively with the API Gateway endpoint (`/api/*`).
* **Reverse Proxy Routing:** Inbound requests are forwarded internally to `springboot-crud-app:8080`.
* **Extensibility:** Prepares the platform for future microservices and serverless functions (e.g., AWS Lambda).
* **Cross-Origin & SSL Management:** Centralizes CORS preflight handling and SSL/TLS termination at the boundary.

---

## 3. Existing REST Endpoints (Target Routing)

All CRUD operations exposed by `com.proyecto.crudtareas.controller.TareaController` map to `/api/tareas`:

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tareas` | Retrieve list of all tasks | `200 OK` |
| `GET` | `/api/tareas/{id}` | Retrieve specific task by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/tareas` | Create and persist a new task | `201 Created` |
| `PUT` | `/api/tareas/{id}` | Update existing task by ID | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/tareas/{id}` | Delete task by ID | `204 No Content` / `404 Not Found` |

---

## 4. Security & Traffic Considerations

* **Port Isolation:** Host port `8080` and database port `5432` will remain unexposed to the public internet once the gateway is operational.
* **Rate Limiting & Throttling:** Protects backend services against DoS attacks and excessive client requests.
* **Centralized CORS Policies:** Replaces open `@CrossOrigin(origins = "*")` with granular whitelist origins managed by the gateway.
* **Environment Integrity:** Production credentials and AWS environment variables remain isolated and secured.

---

## 5. Implementation Plan

1. **Phase 1 (Documentation & Design):** Complete architectural baseline and endpoint mapping (SCRUM-7 Task 1).
2. **Phase 2 (Gateway Configuration):** Define the reverse proxy service, upstream configurations, and routing rules without altering existing EC2 baseline (SCRUM-7 Task 2).
3. **Phase 3 (Proxy Routing & Parameterization):** Correct HTTP_PROXY routing for `/api/tareas` and `/api/tareas/{proxy+}`, enforce explicit backend base URL at deployment time, and validate CloudFormation template (SCRUM-7 Task 3).
4. **Phase 4 (Testing & Verification):** Validate CRUD roundtrips through the gateway, enforce port isolation, and verify automated health checks.

---

## 6. CloudFormation HTTP Proxy Routing Implementation (SCRUM-7 Task 3)

The AWS CloudFormation template (`infrastructure/api-gateway.yaml`) defines the Amazon API Gateway HTTP API (API Gateway v2) configured for transparent reverse proxying to the Spring Boot backend service.

### 6.1 Route & Integration Mapping

To ensure seamless routing to Spring Boot while avoiding routing ambiguity or missing path parameters, two dedicated HTTP_PROXY integrations and routes are configured:

| Route Key | Target Integration | Upstream Integration URI | Matched Operations |
| :--- | :--- | :--- | :--- |
| `ANY /api/tareas` | `TareasBaseIntegration` | `${BackendBaseUrl}/api/tareas` | `GET /api/tareas` (list all)<br>`POST /api/tareas` (create task) |
| `ANY /api/tareas/{proxy+}` | `TareasProxyIntegration` | `${BackendBaseUrl}/api/tareas/{proxy}` | `GET /api/tareas/{id}` (fetch by ID)<br>`PUT /api/tareas/{id}` (update task)<br>`DELETE /api/tareas/{id}` (delete task) |

### 6.2 Request Preservation Guarantees

* **HTTP Methods (`ANY`):** Both routes and integrations utilize the `ANY` method. API Gateway dynamically preserves and forwards the incoming client HTTP method (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) to the Spring Boot controller.
* **Path Parameters (`{proxy+}` -> `{proxy}`):** Greedy route syntax `{proxy+}` captures single or nested path segments (such as entity IDs) and dynamically injects them into the upstream `${BackendBaseUrl}/api/tareas/{proxy}` URI, preserving Spring Boot's `@PathVariable Long id` mapping.
* **Query String Forwarding:** API Gateway HTTP API natively forwards all incoming query parameters (e.g., `?sort=fechaCreacion,desc` or `?status=pending`) to the upstream service without requiring explicit mapping templates.
* **Connection Type:** Both integrations explicitly specify `ConnectionType: INTERNET`, establishing standard public/routable network connectivity to the target backend instance.

### 6.3 Deployment Parameterization & Security Safeguards

* **Explicit Backend URL Required:** The `BackendBaseUrl` parameter requires an explicit URL at deployment time (e.g., `http://<ec2-public-ip-or-dns>:8080`). The unsafe `http://localhost:8080` default was removed to prevent loopback routing failures inside the AWS managed environment.
* **Format Enforcement:** `AllowedPattern: ^https?://[^/]+$` ensures the URL includes `http://` or `https://` while strictly forbidding a trailing slash, preventing double-slash malformed URLs downstream.
* **CORS Management:** Preflight requests are handled directly by the API Gateway HTTP API (`CorsConfiguration`), supporting `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS` with standard headers (`Content-Type`, `Authorization`, `X-Requested-With`).
* **Backend Isolation:** The Spring Boot backend container continues listening on port `8080` internally on the EC2 host. Port mapping modifications and security group tightening will follow in subsequent deployment phases.

### 6.4 Template Validation

The CloudFormation template (`infrastructure/api-gateway.yaml`) is verified locally using `cfn-lint` against AWS CloudFormation resource schemas, confirming zero structural errors, invalid property keys, or syntax warnings.

---

## 7. Postman Verification Test Suite (SCRUM-7 Task 4)

A Postman Collection v2.1 is provided under `postman/taskhub-api-gateway.postman_collection.json` covering the full CRUD lifecycle against the API Gateway endpoints:

* **Dynamic Base URL (`apiBaseUrl`):** Targets the deployed API Gateway endpoint (`https://<api-id>.execute-api.<region>.amazonaws.com`) or local backend without hardcoding host IP addresses or cloud resource identifiers.
* **Chained Resource ID (`taskId`):** Captures `taskId` dynamically from `POST /api/tareas` response to drive subsequent `PUT` and `DELETE` requests sequentially.
* **Automated Status Assertions:** Validates expected status codes (`200 OK` for GET/PUT, `201 Created` for POST, and `204 No Content` for DELETE).
* **Usage Documentation:** See [`postman/README.md`](../postman/README.md) for import and execution instructions.

