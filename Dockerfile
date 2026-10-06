# ===================================================================
# Multi-stage Dockerfile for Spring Boot Backend
# Stage 1: Build JAR using Maven and JDK 17
# Stage 2: Run application using lightweight JRE 17 Alpine runtime
# ===================================================================

# --- Stage 1: Build ---
FROM maven:3.9.8-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Runtime ---
FROM eclipse-temurin:17-jre-alpine AS runtime

# Security: Create non-root system user and group
RUN addgroup -S workpulse && adduser -S workpulse -G workpulse
WORKDIR /app

# Copy executable JAR from build stage
COPY --from=build /app/target/*.jar /app/app.jar
RUN chown -R workpulse:workpulse /app

# Switch to unprivileged user
USER workpulse

# Expose backend API port
EXPOSE 8080

# Environment-driven execution
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
