# ============================================================================
# FoodX — Dockerfile dùng chung cho cả 7 module chạy được
# ============================================================================
# Trước đây mỗi service có một Dockerfile riêng chỉ `COPY target/*.jar`, tức là
# vẫn phải build Maven trên máy trước rồi mới build image (và build context là
# thư mục service nên không thể build được `foodx-common`).
#
# Nay chỉ còn MỘT Dockerfile multi-stage ở gốc repo; chọn module qua build arg:
#
#   docker build --build-arg MODULE=services/user-service --build-arg PORT=8081 -t foodx/user-service .
#
# docker-compose.yml truyền các arg này (xem `build.args`).
#
# Build context PHẢI là gốc repo (chứa pom.xml tổng và mọi module).
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1 — build: có JDK + Maven, build đúng module được yêu cầu
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build

ARG MODULE

WORKDIR /workspace

# Copy pom của TẤT CẢ module trước: Maven cần đọc đủ reactor mới parse được `-pl`.
# Bước này chỉ phụ thuộc pom nên được cache lại, không phải tải lại dependency mỗi lần sửa code.
COPY pom.xml ./
COPY foodx-common/pom.xml foodx-common/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY services/user-service/pom.xml services/user-service/pom.xml
COPY services/inventory-service/pom.xml services/inventory-service/pom.xml
COPY services/recipe-service/pom.xml services/recipe-service/pom.xml
COPY services/plan-shopping-service/pom.xml services/plan-shopping-service/pom.xml
COPY services/ai-service/pom.xml services/ai-service/pom.xml
COPY services/social-stats-service/pom.xml services/social-stats-service/pom.xml

# Làm nóng cache dependency (chỉ phụ thuộc pom nên layer này được tái sử dụng khi sửa code).
# `|| true` là cố ý: `dependency:go-offline` không build được module nội bộ `foodx-common`
# trong reactor, nên bước này chỉ mang tính tối ưu. Lỗi thật sẽ lộ ra ở bước `package` bên dưới.
RUN mvn -B -q -pl "${MODULE}" -am dependency:go-offline -DskipTests || true

# Copy mã nguồn cần thiết rồi build
COPY foodx-common/src foodx-common/src
COPY ${MODULE}/src ${MODULE}/src

RUN mvn -B -pl "${MODULE}" -am -DskipTests package

# ---------------------------------------------------------------------------
# Stage 2 — runtime: chỉ JRE, chạy bằng user thường, có healthcheck
# ---------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runtime

ARG MODULE
ARG PORT

# Chạy bằng user không phải root (chuẩn bảo mật container)
RUN addgroup -S foodx && adduser -S -G foodx foodx

WORKDIR /app

COPY --from=build /workspace/${MODULE}/target/*.jar /app/app.jar

# Thư mục uploads dùng chung volume; phải thuộc user chạy app mới ghi được
RUN mkdir -p /app/uploads && chown -R foodx:foodx /app
VOLUME ["/app/uploads"]

USER foodx

ENV SERVER_PORT=${PORT} \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -Dfile.encoding=UTF-8"

EXPOSE ${PORT}

# Healthcheck đọc /actuator/health — endpoint này được foodx-common mở công khai cho mọi service.
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- "http://127.0.0.1:${SERVER_PORT}/actuator/health" | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_TOOL_OPTIONS -jar /app/app.jar"]
