# FoodX Microservices Local Dev Starter
param (
    [string]$Service = "all"
)

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  FoodX Microservices Development Starter        " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$services = @(
    @{ Name = "api-gateway"; Path = "api-gateway/pom.xml"; Port = "8080" },
    @{ Name = "user-service"; Path = "services/user-service/pom.xml"; Port = "8081" },
    @{ Name = "inventory-service"; Path = "services/inventory-service/pom.xml"; Port = "8082" },
    @{ Name = "recipe-service"; Path = "services/recipe-service/pom.xml"; Port = "8083" },
    @{ Name = "plan-shopping-service"; Path = "services/plan-shopping-service/pom.xml"; Port = "8084" },
    @{ Name = "ai-service"; Path = "services/ai-service/pom.xml"; Port = "8085" },
    @{ Name = "social-stats-service"; Path = "services/social-stats-service/pom.xml"; Port = "8086" }
)

if ($Service -eq "build") {
    Write-Host "[BUILD] Dang bien dich toan bo Reactor Multi-Module..." -ForegroundColor Yellow
    & "$rootDir\mvnw.cmd" clean compile -DskipTests
    exit 0
}

if ($Service -eq "gateway") {
    Write-Host "[GATEWAY] Dang khoi chay API Gateway tren cong 8080..." -ForegroundColor Green
    & "$rootDir\mvnw.cmd" spring-boot:run -f "$rootDir\api-gateway\pom.xml"
    exit 0
}

# Chạy dịch vụ đơn lẻ chỉ định
$matched = $services | Where-Object { $_.Name -eq $Service }
if ($matched) {
    Write-Host "[$($matched.Name)] Dang khoi chay tren cong $($matched.Port)..." -ForegroundColor Green
    & "$rootDir\mvnw.cmd" spring-boot:run -f "$rootDir\$($matched.Path)"
    exit 0
}

# Chạy bộ lõi chính: Gateway (8080), User (8081), Inventory (8082)
if ($Service -eq "core") {
    $coreServices = $services | Where-Object { $_.Name -in @("user-service", "inventory-service", "api-gateway") }
    foreach ($s in $coreServices) {
        Write-Host "[START] Mo cua so moi cho $($s.Name) (Cong $($s.Port))..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host '--- Khoi chay $($s.Name) ---' -ForegroundColor Yellow; .\mvnw.cmd spring-boot:run -f $($s.Path)"
    }
    Write-Host "Da mo 3 service core. Truy cap web tai: http://localhost:8080" -ForegroundColor Green
    exit 0
}

# Mặc định: Chạy tất cả microservices trong các cửa sổ riêng biệt
if ($Service -eq "all") {
    Write-Host "[ALL] Dang khoi chay tat ca 7 microservices..." -ForegroundColor Yellow
    foreach ($s in $services) {
        Write-Host "  -> Khoi chay $($s.Name) tren cong $($s.Port)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host '=== Dang chay $($s.Name) (Cong $($s.Port)) ===' -ForegroundColor Yellow; .\mvnw.cmd spring-boot:run -f $($s.Path)"
        Start-Sleep -Milliseconds 500
    }
    Write-Host "Tat ca cac service da duoc khoi dong!" -ForegroundColor Green
    Write-Host "Web Frontend & Gateway: http://localhost:8080" -ForegroundColor White
    exit 0
}
