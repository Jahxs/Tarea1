# ==============================================================================
# Stage 1: Build stage with Maven and Java 17
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy project descriptor to leverage Docker layer caching
COPY pom.xml .

# Download dependencies offline to speed up future builds
RUN mvn dependency:go-offline -B || true

# Copy source code and package application JAR skipping unit tests
COPY src ./src
RUN mvn clean package -DskipTests

# ==============================================================================
# Stage 2: Lightweight runtime stage
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create unprivileged system user and group for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy generated JAR artifact from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose application HTTP port
EXPOSE 8080

# Launch Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
