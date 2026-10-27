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
2. **Phase 2 (Gateway Configuration):** Define the reverse proxy service, upstream configurations, and routing rules without altering existing EC2 baseline.
3. **Phase 3 (Testing & Validation):** Validate CRUD roundtrips through the gateway and confirm port isolation.
4. **Phase 4 (Review & Verification):** Verify automated health checks, rate limiting, and zero regressions.
