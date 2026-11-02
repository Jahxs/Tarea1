# TaskHub - Grafana k6 Performance Testing (Phase 1)

Este directorio contiene la suite de pruebas de rendimiento y carga para **TaskHub**, desarrollada con [Grafana k6](https://k6.io/).

---

## 1. ¿Qué es Grafana k6 y por qué lo usamos?

**Grafana k6** es una herramienta de ingeniería de rendimiento moderna, de código abierto y basada en JavaScript (motor Go) diseñada para evaluar la estabilidad, latencia y escalabilidad de APIs y microservicios.

### ¿Por qué k6 para TaskHub?
- **Rendimiento nativo:** A diferencia de herramientas basadas en hilos pesados como JMeter, k6 utiliza *Virtual Users (VUs)* ligeros basados en goroutines, consumiendo un mínimo de memoria en la máquina cliente.
- **Pruebas como Código (Test-as-Code):** Los escenarios se escriben en JavaScript declarativo, permitiendo versionar las pruebas en Git junto al código fuente de Spring Boot.
- **Thresholds automatizados:** Permite definir criterios de aceptación estrictos (SLAs/SLOs). Si la latencia p95 o la tasa de error superan el límite, la prueba falla de inmediato (ideal para pipelines CI/CD).
- **Ejecución contenerizada:** Se ejecuta directamente mediante Docker oficial (`grafana/k6:latest`), sin requerir instalación local de dependencias en Windows o Linux.

---

## 2. Arquitectura de la Prueba Inicial (Línea Base - Fase 1)

En esta primera fase evaluamos el comportamiento de **TaskHub antes de implementar balanceo de carga** (arquitectura de réplica única):

```
+------------------+       HTTP (Puerto 80)       +---------------------+
|   Grafana k6     | ---------------------------> | Nginx Reverse Proxy |
| (Virtual Users)  |                              |    (nginx:1.27)     |
+------------------+                              +----------+----------+
                                                             |
                                         crud-network (Docker)
                                         proxy_pass :8080    |
                                                             v
                                                  +---------------------+
                                                  | Spring Boot 3 App   |
                                                  | (1 sola instancia)  |
                                                  +----------+----------+
                                                             |
                                         JDBC :5432          |
                                                             v
                                                  +---------------------+
                                                  | PostgreSQL 16 DB    |
                                                  | (postgres-crud-db)  |
                                                  +---------------------+
```

### Objetivo de la Fase 1:
Establecer una **línea base (baseline)** del endpoint `GET /api/tareas` bajo condiciones controladas para responder:
1. ¿Cuál es la latencia normal en percentil 95 (p95)?
2. ¿Cuántas solicitudes por segundo (RPS) procesa una sola réplica?
3. ¿Cuál es el comportamiento sin saturar la CPU ni la memoria de la instancia AWS EC2 `t3.micro`?

---

## 3. Estructura de Archivos

```
tests/load/
├── baseline-test.js   # Script principal de prueba k6 en JavaScript
├── run-test.ps1       # Script automatizado de ejecución en PowerShell
└── README.md          # Esta guía técnica y de interpretación
```

---

## 4. Cómo Ejecutar las Pruebas desde Windows PowerShell

No es necesario instalar k6 en Windows. Únicamente requieres tener **Docker Desktop** en ejecución.

### Opción A: Mediante el script automatizado (Recomendada)

Ejecuta el script incluido desde la raíz del proyecto o desde la carpeta `tests/load`:

```powershell
# 1. Ejecución con valores por defecto (contra la IP pública de AWS EC2: http://54.91.56.83)
.\tests\load\run-test.ps1

# 2. Ejecución contra el entorno Docker local (localhost)
.\tests\load\run-test.ps1 -BaseUrl "http://localhost"

# 3. Sobrescribir usuarios virtuales y duración para un chequeo rápido (smoke test)
.\tests\load\run-test.ps1 -BaseUrl "http://54.91.56.83" -VUs 2 -Duration "10s"
```

### Opción B: Mediante comando Docker directo

Si prefieres invocar directamente el contenedor de Docker desde PowerShell:

```powershell
# Ejecución estándar montando la carpeta actual en el contenedor
docker run --rm -v "${PWD}/tests/load:/tests" -e BASE_URL="http://54.91.56.83" grafana/k6:latest run /tests/baseline-test.js
```

**Explicación de los parámetros de Docker:**
- `--rm`: Elimina automáticamente el contenedor al finalizar la prueba para no dejar residuos.
- `-v "${PWD}/tests/load:/tests"`: Monta la carpeta local `tests/load` dentro del directorio `/tests` del contenedor Linux.
- `-e BASE_URL="http://54.91.56.83"`: Inyecta la variable de entorno con la dirección del servidor a probar.
- `grafana/k6:latest`: Imagen oficial de k6 mantenida por Grafana Labs.
- `run /tests/baseline-test.js`: Ejecuta el script dentro del contenedor.

---

## 5. Parámetros del Perfil de Carga y Thresholds

El script `baseline-test.js` está diseñado con una carga controlada y segura para la instancia `t3.micro`:

### Etapas de Carga (Stages):
- **0 a 10s (Ramp-up):** Incremento suave de 0 a 5 VUs. Permite el calentamiento del hilo Tomcat y el pool HikariCP.
- **10s a 30s (Steady-state):** Mantiene 5 VUs concurrentes con pausas de 1 segundo (pacing).
- **30s a 40s (Ramp-down):** Reduce de 5 a 0 VUs para un cierre limpio de conexiones HTTP Keep-Alive.

### Criterios de Aceptación (Thresholds):
```javascript
thresholds: {
    'http_req_failed': ['rate<0.01'],    // Menos del 1% de fallos permitidos
    'http_req_duration': ['p(95)<500'], // 95% de peticiones deben responder en < 500ms
    'http_req_duration': ['p(99)<1000'] // 99% de peticiones deben responder en < 1000ms
}
```

---

## 6. Interpretación de Métricas Clave

Al finalizar la prueba, k6 genera un reporte en consola. A continuación se detalla cómo interpretar cada métrica:

| Métrica k6 | Nombre Técnico | ¿Qué significa en TaskHub? | Valor Saludable Esperado (Fase 1) |
| :--- | :--- | :--- | :--- |
| **`http_reqs`** | Total Requests & Throughput | Número total de peticiones HTTP emitidas y tasa de peticiones por segundo (RPS). | ~4 a 6 req/s con 5 VUs y pacing de 1s. |
| **`http_req_duration`** | Latencia Total | Tiempo transcurrido desde el envío del primer byte hasta la recepción total de la respuesta JSON. Incluye red, Nginx, Spring Boot y consulta SQL. | Promedio entre 80ms y 180ms. |
| **`p(95)`** | Percentil 95 | El 95% de las peticiones fueron más rápidas que este valor. Es más representativo que el promedio porque no se distorsiona con valores atípicos. | `< 300ms` en condiciones normales. |
| **`http_req_failed`** | Tasa de Error HTTP | Porcentaje de solicitudes que devolvieron códigos de error (4xx o 5xx) o fallos de conexión. | `0.00%` (debe ser estrictamente 0). |
| **`iteration_duration`**| Duración de Iteración | Tiempo que tarda un usuario virtual en hacer la petición + validar JSON + el `sleep(1)`. | ~1.1s a 1.2s. |

### Validaciones Funcionales (Checks):
- `✓ status is 200 (OK)`: El backend y la base de datos están operativos.
- `✓ content-type is JSON`: La cabecera HTTP devuelta es `application/json`.
- `✓ response body is non-empty`: La respuesta contiene datos.
- `✓ response is valid array`: El cuerpo se deserializa correctamente como un arreglo JSON de tareas.
