# TaskHub API Gateway Postman Collection

This directory contains the automated Postman test collection for validating TaskHub CRUD endpoints through the Amazon API Gateway reverse proxy or against the local Spring Boot backend.

## Collection Overview

* **File:** `taskhub-api-gateway.postman_collection.json`
* **Schema:** Postman Collection v2.1.0 (`https://schema.getpostman.com/json/collection/v2.1.0/collection.json`)
* **Target Service:** TaskHub Spring Boot 3 REST API (`com.proyecto.crudtareas.controller.TareaController`)

## Collection Variables

The collection relies on parameterized variables so that no EC2 IP addresses, AWS Gateway IDs, or environment credentials are hardcoded:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `apiBaseUrl` | `https://<api-id>.execute-api.<region>.amazonaws.com` | Base URL of the deployed API Gateway HTTP API (or `http://localhost:8080`) |
| `taskId` | `1` | Entity ID used for single-resource operations; automatically updated by the `POST` test script |

## Endpoints & Test Validations

| Request | HTTP Method | Endpoint | Expected Status | Test Script Validations |
| :--- | :--- | :--- | :--- | :--- |
| **List All Tasks** | `GET` | `{{apiBaseUrl}}/api/tareas` | `200 OK` | Verifies HTTP 200 and JSON array structure |
| **Create Task** | `POST` | `{{apiBaseUrl}}/api/tareas` | `201 Created` | Verifies HTTP 201, payload properties, and captures `taskId` |
| **Update Task by ID** | `PUT` | `{{apiBaseUrl}}/api/tareas/{{taskId}}` | `200 OK` | Verifies HTTP 200 and updated fields |
| **Delete Task by ID** | `DELETE` | `{{apiBaseUrl}}/api/tareas/{{taskId}}` | `204 No Content` | Verifies HTTP 204 response |

## How to Import and Execute

### In Postman (Desktop or Web)

1. **Import Collection:**
   * Open the Postman application.
   * Click **Import** in the top navigation bar.
   * Drag and drop `postman/taskhub-api-gateway.postman_collection.json` (or select via file browser).
2. **Configure Variables:**
   * Select the imported collection **TaskHub API Gateway**.
   * Navigate to the **Variables** tab.
   * Update the `apiBaseUrl` **Current Value** with your deployed API Gateway invoke URL (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com`) or local host (`http://localhost:8080`).
3. **Execute Collection:**
   * Click **Run collection** to open the Collection Runner.
   * Keep the execution order (`GET` -> `POST` -> `PUT` -> `DELETE`) to ensure `taskId` chained tests execute sequentially.
   * Click **Run TaskHub API Gateway** and review the test execution report.

### In CLI (Newman)

To execute headlessly in CI/CD pipelines or local command line:

```bash
npx newman run postman/taskhub-api-gateway.postman_collection.json \
  --env-var "apiBaseUrl=http://localhost:8080"
```
