# ==============================================================================
# Etapa 1: Compilación (Build Stage) con Maven y Java 17
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copiar el descriptor del proyecto para aprovechar el caché de capas de Docker
COPY pom.xml .

# Descargar dependencias para acelerar reconstrucciones futuras
RUN mvn dependency:go-offline -B || true

# Copiar el código fuente y empaquetar el JAR omitiendo tests
COPY src ./src
RUN mvn clean package -DskipTests

# ==============================================================================
# Etapa 2: Imagen de Ejecución Ligera (Runtime Stage)
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Crear usuario y grupo de sistema sin privilegios por seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar el archivo JAR generado desde la etapa de compilación
COPY --from=builder /build/target/*.jar app.jar

# Exponer el puerto de la aplicación
EXPOSE 8080

# Comando de inicio del servicio Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
