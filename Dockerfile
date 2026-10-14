# ============================================================================
# FoodX — image chạy service (JRE). Biên dịch Maven làm trên máy host.
# ============================================================================
# Maven bên trong Docker Desktop bị rớt kết nối khi tải file lớn từ Maven Central
# (treo hàng chục phút rồi "Premature end of Content-Length"). Vì vậy jar được
# build bằng `mvnw` trên máy host, image chỉ đóng gói jar đó:
#
#   .\mvnw.cmd -B -DskipTests package
#   New-Item -ItemType Directory -Force docker\jars | Out-Null
#   Copy-Item api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar docker\jars\api-gateway.jar
#   # (lặp lại cho từng service)
#   docker compose build
# ============================================================================

FROM eclipse-temurin:17-jre-alpine

ARG MODULE
ARG PORT
ARG JAR_FILE

RUN addgroup -S foodx && adduser -S -G foodx foodx

WORKDIR /app

# Jar được copy sẵn vào docker/jars/ (ngoài target/). Docker không re-include
# đáng tin file nằm trong thư mục đã bị .dockerignore loại trừ.
COPY docker/jars/${JAR_FILE} /app/app.jar

RUN mkdir -p /app/uploads && chown -R foodx:foodx /app
VOLUME ["/app/uploads"]

USER foodx

ENV SERVER_PORT=${PORT} \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -Dfile.encoding=UTF-8"

EXPOSE ${PORT}

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- "http://127.0.0.1:${SERVER_PORT}/actuator/health" | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_TOOL_OPTIONS -jar /app/app.jar"]
