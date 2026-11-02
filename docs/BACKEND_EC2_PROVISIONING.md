# TaskHub — Guía de Aprovisionamiento para Amazon Linux 2023 (AL2023)
## Arquitectura con AWS Application Load Balancer (ALB) y 3 Instancias EC2

Esta guía documenta la infraestructura en la nube y el aprovisionamiento automatizado e idempotente de **tres nodos backend independientes de Spring Boot 3** sobre instancias **Amazon Linux 2023 (EC2 t3.micro)**, balanceados mediante un **AWS Application Load Balancer (ALB)** de Capa 7.

---

## 1. Diagrama de Arquitectura en AWS

```
                              [ Clientes Web / k6 / Postman ]
                                             │
                                  HTTP: 80 / HTTPS: 443
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │   AWS Application Load Balancer (ALB)    │
                       │    (Internet-Facing, Multi-AZ)            │
                       └─────────────────────┬─────────────────────┘
                                             │
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │             ALB Target Group              │
                       │      Protocol: HTTP | Port: 8080          │
                       │      Health Check: GET /api/tareas        │
                       └─────────────────────┬─────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │ HTTP :8080                    │ HTTP :8080                    │ HTTP :8080
             ▼                               ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
    │ EC2 Backend 1    │            │ EC2 Backend 2    │            │ EC2 Backend 3    │
    │ (AL2023 t3.micro)│            │ (AL2023 t3.micro)│            │ (AL2023 t3.micro)│
    │ Spring Boot 3    │            │ Spring Boot 3    │            │ Spring Boot 3    │
    │ (Sin PostgreSQL) │            │ (Sin PostgreSQL) │            │ (Sin PostgreSQL) │
    └────────┬─────────┘            └────────┬─────────┘            └────────┬─────────┘
             │                               │                               │
             └───────────────────────────────┼───────────────────────────────┘
                                             │ JDBC :5432
                                             ▼
                                ┌──────────────────────────┐
                                │ PostgreSQL Centralizada  │
                                │ (RDS / Instancia Maestra)│
                                └──────────────────────────┘
```

---

## 2. Configuración del AWS Application Load Balancer (ALB) y Target Group

### 2.1 Especificaciones del Target Group
Para registrar los tres nodos EC2 en el balanceador:
- **Target Type:** `Instances` (o `IP addresses`).
- **Protocol:** `HTTP`.
- **Port:** `8080`.
- **VPC:** La misma VPC donde residen las instancias backend.
- **Protocol version:** `HTTP1` (por defecto).

### 2.2 Health Check del Target Group
El Application Load Balancer envía sondeos periódicos a cada instancia para determinar si debe enviarle tráfico:
- **Health check protocol:** `HTTP`.
- **Health check path:** `/api/tareas` (devuelve `HTTP 200 OK` cuando Spring Boot y la conexión a PostgreSQL están listos).
- **Healthy threshold:** `2` éxitos consecutivos para marcar la instancia como saludable.
- **Unhealthy threshold:** `2` fallos consecutivos para desviar el tráfico de una instancia caída.
- **Timeout:** `5` segundos.
- **Interval:** `15` a `30` segundos.
- **Success codes:** `200`.

---

## 3. Matriz de Grupos de Seguridad (Security Groups)

Para garantizar aislamiento estricto y cero exposición pública de las instancias de aplicación y de la base de datos:

| Security Group | Reglas de Entrada (Inbound) | Reglas de Salida (Outbound) | Propósito |
| :--- | :--- | :--- | :--- |
| **`alb-sg`** (Load Balancer) | • TCP 80 desde `0.0.0.0/0`<br>• TCP 443 desde `0.0.0.0/0` | • TCP 8080 hacia `backend-ec2-sg` | Ingress público para usuarios y herramientas de carga como Grafana k6. |
| **`backend-ec2-sg`** (3 Nodos EC2) | • TCP 8080 **restringido exclusivamente** a `alb-sg`<br>• TCP 22 restringido a la IP del administrador (`<MY_IP>/32`) | • TCP 5432 hacia `database-sg`<br>• TCP 80/443 a internet (vía NAT/IGW para `dnf` y Docker) | Las instancias backend **no tienen el puerto 8080 expuesto a internet**. Solo el ALB puede alcanzarlas. |
| **`database-sg`** (PostgreSQL) | • TCP 5432 **restringido exclusivamente** a `backend-ec2-sg` | • Todo denegado por defecto | Cero exposición pública de la base de datos. Solo los tres nodos Spring Boot pueden conectarse. |

---

## 4. Gestión Segura de Contraseñas y Secretos

> [!CAUTION]
> **Políticas de Seguridad para Credenciales:**
> 1. **Nunca pasar contraseñas en flags de línea de comandos** (`--db-password`), ya que quedan expuestas en el historial de bash (`.bash_history`) y en la tabla de procesos (`ps aux`).
> 2. **Nunca incluir contraseñas en texto plano en AWS User Data**, ya que User Data es legible para cualquier rol o usuario con permisos `ec2:DescribeInstanceAttribute`.
> 3. **Mecanismos Aprobados para Despliegue:**
>    - **Opción Recomendada (AWS SSM):** Almacenar la contraseña en AWS Systems Manager Parameter Store (`SecureString`) y leerla durante el aprovisionamiento.
>    - **Opción Pre-Staged:** Crear manualmente el archivo `/opt/taskhub/.env` con permisos restringidos `chmod 600` antes de ejecutar el script.
>    - **Opción Interactiva:** Ejecutar el script con `--interactive`; el script solicitará la contraseña ocultando los caracteres tecleados.

---

## 5. Dimensionamiento de Recursos para `t3.micro`

> [!NOTE]
> **Límites de Memoria como Hipótesis Inicial:**
> El límite de `280M` definido en [docker-compose.backend.yml](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/docker-compose.backend.yml) es una **configuración inicial de prueba**.
> - En Java 17, el consumo de memoria total es: $\text{Heap} + \text{Metaspace} + \text{Thread Stacks} + \text{Code Cache} + \text{GC Overheads}$.
> - Bajo carga concurrente (peticiones k6), la creación de hilos y el pool de conexiones pueden incrementar el uso de memoria fuera del Heap.
> - **Acción obligatoria:** Esta configuración se debe validar empíricamente con las pruebas de k6 de la Fase 3, ajustando los límites si se detecta cercanía al umbral de 280 MB.
> - **Memoria Swap (2 GiB):** El script crea automáticamente un swapfile de 2 GiB con `dd` (indispensable para la arquitectura de archivos XFS de AL2023) para absorber picos temporales sin invocar al OOM Killer de Linux.

---

## 6. Procedimiento de Aprovisionamiento en las 3 Instancias EC2

El script [setup-backend-al2023.sh](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/infrastructure/provisioning/setup-backend-al2023.sh) es idempotente y se ejecuta en cada una de las 3 instancias.

### Paso 6.1: Conectarse a cada instancia EC2
```bash
ssh -i "taskhub-key.pem" ec2-user@<IP_EC2_NODO>
```

### Paso 6.2: Descargar el script de aprovisionamiento
```bash
curl -fsSL https://raw.githubusercontent.com/Jahxs/Tarea1/feature/SCRUM-9-load-balancing/infrastructure/provisioning/setup-backend-al2023.sh -o setup-backend.sh
chmod +x setup-backend.sh
```

### Paso 6.3: Ejecutar el aprovisionamiento
```bash
# Ejecución interactiva (oculta la contraseña en terminal)
sudo bash setup-backend.sh \
  --db-host "10.0.1.50" \
  --db-name "crud_tareas_db" \
  --db-user "postgres" \
  --repo-branch "feature/SCRUM-9-load-balancing" \
  --interactive
```

---

## 7. Verificación Post-Despliegue y Registro en ALB

Una vez completado el aprovisionamiento en cada nodo:

```bash
# 1. Comprobar que el contenedor esté corriendo y saludable
docker compose -f /opt/taskhub/docker-compose.backend.yml ps

# 2. Verificar la respuesta local del endpoint de tareas
curl -i http://localhost:8080/api/tareas

# 3. Registrar la IP privada del nodo en el Target Group del ALB
# (En la consola de AWS: EC2 -> Target Groups -> Targets -> Register targets)
```

Cuando los tres nodos figuren en estado **`Healthy`** dentro del Target Group del ALB, el balanceador comenzará a distribuir las peticiones entre los tres nodos utilizando el algoritmo Round Robin ponderado por defecto.
