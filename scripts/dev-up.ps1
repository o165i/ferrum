# Полный локальный запуск в одну команду: .\scripts\dev-up.ps1
# Требует Docker Desktop. Запускать из PowerShell в корне проекта.

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
    Write-Host "[dev-up] .env не найден, копирую из .env.example"
    Copy-Item ".env.example" ".env"
    try {
        $bytes = New-Object byte[] 32
        [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        $secret = [Convert]::ToBase64String($bytes)
    } catch {
        $secret = "dev-only-secret-change-me"
    }
    (Get-Content ".env") -replace "replace-me-with-a-random-32-byte-secret", $secret | Set-Content ".env"
}

Write-Host "[dev-up] поднимаю Postgres и приложение..."
docker compose up -d --build

Write-Host "[dev-up] жду готовности приложения (миграции применяются автоматически при старте)..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2
        if ($resp.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 2
}

Write-Host "[dev-up] загружаю тестовые данные..."
docker compose --profile tools run --rm seed

Write-Host "[dev-up] готово. http://localhost:3000"
Write-Host "[dev-up] admin@ferrum.dev / Admin123!  |  user@ferrum.dev / User123!"
