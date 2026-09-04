# FoodX Microservices Local Dev Starter
param (
    [string]$Service = "all"
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  FoodX Microservices Development Starter        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$services = @(
    @{ Name = "foodx-common"; Path = "foodx-common/pom.xml"; Port = "" },
    @{ Name = "user-service"; Path = "services/user-service/pom.xml"; Port = "8081" },
    @{ Name = "inventory-service"; Path = "services/inventory-service/pom.xml"; Port = "8082" },
    @{ Name = "recipe-service"; Path = "services/recipe-service/pom.xml"; Port = "8083" },
    @{ Name = "plan-shopping-service"; Path = "services/plan-shopping-service/pom.xml"; Port = "8084" },
    @{ Name = "ai-service"; Path = "services/ai-service/pom.xml"; Port = "8085" },
    @{ Name = "social-stats-service"; Path = "services/social-stats-service/pom.xml"; Port = "8086" },
    @{ Name = "api-gateway"; Path = "api-gateway/pom.xml"; Port = "8080" }
)

if ($Service -eq "build") {
    Write-Host "[BUILD] Đang biên dịch toàn bộ Reactor Multi-Module..." -ForegroundColor Yellow
    .\mvnw.cmd clean compile -DskipTests
    exit 0
}

if ($Service -eq "gateway") {
    Write-Host "[GATEWAY] Đang khởi chạy API Gateway trên cổng 8080..." -ForegroundColor Green
    .\mvnw.cmd spring-boot:run -f api-gateway/pom.xml
    exit 0
}

Write-Host "Để chạy từng service riêng biệt:" -ForegroundColor White
Write-Host "  .\mvnw.cmd spring-boot:run -f api-gateway/pom.xml                (Cổng 8080 - Web + Gateway)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/user-service/pom.xml     (Cổng 8081 - Auth/Profile)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/inventory-service/pom.xml(Cổng 8082 - Fridge/Food)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/recipe-service/pom.xml   (Cổng 8083 - Recipes/Home)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/plan-shopping-service/pom.xml (Cổng 8084 - Plan/Shopping)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/ai-service/pom.xml       (Cổng 8085 - AI/Chat)" -ForegroundColor Green
Write-Host "  .\mvnw.cmd spring-boot:run -f services/social-stats-service/pom.xml (Cổng 8086 - Social/Stats)" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
