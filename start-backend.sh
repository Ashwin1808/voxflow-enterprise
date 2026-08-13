#!/bin/bash
set -e

# Prepend Homebrew OpenJDK 21 to PATH and pin JAVA_HOME (JDK 24+ breaks Mockito and Keycloak JWT auth)
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "=================================================="
echo " Starting VoxFlow Backend Infrastructure..."
echo "=================================================="

# Ensure databases exist
createdb voxflow_fraud 2>/dev/null || true
createdb voxflow_insurance 2>/dev/null || true
createdb voxflow_inbound 2>/dev/null || true
createdb voxflow_provider 2>/dev/null || true
createdb voxflow_analytics 2>/dev/null || true

# Start Keycloak container if not already active
if [ ! "$(docker ps -q -f name=voxflow-keycloak-new)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=voxflow-keycloak-new)" ]; then
        docker start voxflow-keycloak-new
    else
        docker run -d --name voxflow-keycloak-new -p 8089:8080 \
          -e KEYCLOAK_ADMIN=admin \
          -e KEYCLOAK_ADMIN_PASSWORD=admin \
          -v "$(pwd)/infra/keycloak/voxflow-realm.json:/opt/keycloak/data/import/realm.json" \
          quay.io/keycloak/keycloak:24.0.0 start-dev --import-realm
    fi
fi

# Set environment variables for RabbitMQ authentication
export SPRING_RABBITMQ_USERNAME=voxflow
export SPRING_RABBITMQ_PASSWORD=voxflow

# Load runtime configuration (.env is gitignored)
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

echo "=================================================="
echo " Stopping any existing service instances..."
echo "=================================================="
kill -9 $(lsof -t -i :8081) 2>/dev/null || true
kill -9 $(lsof -t -i :8082) 2>/dev/null || true
kill -9 $(lsof -t -i :8083) 2>/dev/null || true
kill -9 $(lsof -t -i :8084) 2>/dev/null || true
kill -9 $(lsof -t -i :8085) 2>/dev/null || true
kill -9 $(lsof -t -i :8086) 2>/dev/null || true

echo "=================================================="
echo " Starting Spring Boot services in background..."
echo "=================================================="

mvn -pl services/auth-service spring-boot:run > auth.log 2>&1 &
echo "✓ auth-service booted on port 8081 (logging to auth.log)"

mvn -pl services/fraud-service spring-boot:run > fraud.log 2>&1 &
echo "✓ fraud-service booted on port 8082 (logging to fraud.log)"

mvn -pl services/insurance-service spring-boot:run > insurance.log 2>&1 &
echo "✓ insurance-service booted on port 8083 (logging to insurance.log)"

mvn -pl services/inbound-service spring-boot:run > inbound.log 2>&1 &
echo "✓ inbound-service booted on port 8084 (logging to inbound.log)"

mvn -pl services/provider-service spring-boot:run > provider.log 2>&1 &
echo "✓ provider-service booted on port 8085 (logging to provider.log)"

mvn -pl services/analytics-service spring-boot:run > analytics.log 2>&1 &
echo "✓ analytics-service booted on port 8086 (logging to analytics.log)"

mvn -pl services/outbound-service spring-boot:run > outbound.log 2>&1 &
echo "✓ outbound-service booted on port 8087 (logging to outbound.log, CALL_PROVIDER=${CALL_PROVIDER:-emulator})"

echo "=================================================="
echo " Backend startup initiated successfully."
echo " Use 'tail -f *.log' to view logs."
echo "=================================================="
