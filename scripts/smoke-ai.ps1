# Smoke test AI + gateway sau khi start services.
# Chạy: .\scripts\smoke-ai.ps1
param(
    [string]$Base = "http://localhost:8080",
    [string]$Username = "minhanh",
    [string]$Password = "123456",
    [int]$Concurrent = 8
)

$ErrorActionPreference = "Stop"
Write-Host "=== FoodX AI smoke test ===" -ForegroundColor Cyan

function Invoke-Json($method, $url, $body, $token) {
    $headers = @{ "Accept" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $args = @{ Method = $method; Uri = $url; Headers = $headers; ContentType = "application/json" }
    if ($body) { $args.Body = $body }
    return Invoke-RestMethod @args
}

# 1) AI status
try {
    $status = Invoke-RestMethod "$Base/api/ai/status" -TimeoutSec 10
    Write-Host ("[AI status] provider={0} mock={1} bulkhead={2}" -f `
        $status.data.provider, $status.data.mock, ($status.data.bulkhead | ConvertTo-Json -Compress)) -ForegroundColor Green
} catch {
    Write-Host "[AI status] FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 2) Gateway metrics
try {
    $m = Invoke-RestMethod "$Base/api/gateway/metrics" -TimeoutSec 10
    Write-Host ("[Gateway] backend={0} rateReject={1} bulkheadReject={2} aiPermits={3}" -f `
        $m.backend, $m.rejectedByRateLimit, $m.rejectedByBulkhead, $m.aiAvailablePermits) -ForegroundColor Green
} catch {
    Write-Host "[Gateway metrics] FAIL: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3) Login
try {
    $login = Invoke-RestMethod -Method Post -Uri "$Base/api/auth/login" `
        -ContentType "application/json" `
        -Body (@{ username = $Username; password = $Password } | ConvertTo-Json) `
        -TimeoutSec 10
    $token = $login.data.accessToken
    if (-not $token) { throw "No accessToken in login response" }
    Write-Host "[Login] OK as $Username" -ForegroundColor Green
} catch {
    Write-Host "[Login] FAIL: $($_.Exception.Message) — bỏ qua chat test" -ForegroundColor Yellow
    exit 0
}

# 4) Tạo session + gửi 1 tin
try {
    $session = Invoke-Json Post "$Base/api/chat/sessions" (@{ title = "Smoke test"; mode = "chat" } | ConvertTo-Json) $token
    $sid = $session.data.id
    $t0 = Get-Date
    $chat = Invoke-Json Post "$Base/api/chat/sessions/$sid/messages" (@{ message = "Gợi ý món từ trứng và cà chua" } | ConvertTo-Json) $token
    $ms = [int]((Get-Date) - $t0).TotalMilliseconds
    $reply = if ($chat.data.reply) { $chat.data.reply.Substring(0, [Math]::Min(80, $chat.data.reply.Length)) } else { "(empty)" }
    Write-Host "[Chat] ${ms}ms → $reply…" -ForegroundColor Green
} catch {
    $code = $null
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    Write-Host "[Chat] FAIL status=$code $($_.Exception.Message)" -ForegroundColor Red
}

# 5) Concurrent burst (nhỏ) — mong 200/429/503, không crash
Write-Host "[Burst] $Concurrent requests song song..." -ForegroundColor Cyan
$jobs = 1..$Concurrent | ForEach-Object {
    Start-ThreadJob -ScriptBlock {
        param($Base, $token, $i)
        try {
            $s = Invoke-RestMethod -Method Post -Uri "$Base/api/chat/sessions" `
                -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
                -Body (@{ title = "burst-$i" } | ConvertTo-Json)
            $r = Invoke-RestMethod -Method Post -Uri "$Base/api/chat/sessions/$($s.data.id)/messages" `
                -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
                -Body (@{ message = "Món nhanh từ rau" } | ConvertTo-Json)
            return "OK"
        } catch {
            $c = 0
            if ($_.Exception.Response) { $c = [int]$_.Exception.Response.StatusCode }
            if ($c -in 429, 503) { return "HTTP$c" }
            return "ERR:$c"
        }
    } -ArgumentList $Base, $token, $_
}
$results = $jobs | ForEach-Object { Receive-Job -Job $_ -Wait; Remove-Job $_ }
$results | Group-Object | ForEach-Object { Write-Host ("  {0} × {1}" -f $_.Name, $_.Count) -ForegroundColor Yellow }
Write-Host "=== Done. Server vẫn sống = PASS ===" -ForegroundColor Cyan
