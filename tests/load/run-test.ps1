<#
.SYNOPSIS
    Executes Grafana k6 performance tests using Docker on Windows PowerShell.

.DESCRIPTION
    Runs load testing scripts against TaskHub API without requiring local k6 installation.
    Mounts the current test directory into the official grafana/k6 Docker container.

.PARAMETER ScriptName
    The name of the k6 test script located in tests/load/. Default: 'baseline-test.js'.

.PARAMETER BaseUrl
    The target base URL for TaskHub API. Default: 'http://54.91.56.83'.

.PARAMETER VUs
    Optional override for virtual users count. If omitted, uses stages defined in the script.

.PARAMETER Duration
    Optional override for test duration (e.g., '30s', '1m').

.EXAMPLE
    .\tests\load\run-test.ps1
    Runs baseline test with default stages against AWS EC2 deployment.

.EXAMPLE
    .\tests\load\run-test.ps1 -BaseUrl "http://localhost"
    Runs baseline test against local Docker environment.

.EXAMPLE
    .\tests\load\run-test.ps1 -VUs 5 -Duration "20s"
    Runs with 5 virtual users for 20 seconds.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$ScriptName = "baseline-test.js",

    [Parameter(Position = 1)]
    [string]$BaseUrl = "http://54.91.56.83",

    [Parameter(Position = 2)]
    [int]$VUs,

    [Parameter(Position = 3)]
    [string]$Duration
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " TaskHub - Grafana k6 Performance Test Runner (Docker)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Resolve script directory path
$TestDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptPath = Join-Path $TestDir $ScriptName

if (-not (Test-Path $ScriptPath)) {
    Write-Error "Test script not found: $ScriptPath"
    exit 1
}

# Verify Docker daemon is accessible
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker detected: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Error "Docker is not running or not in PATH. Please start Docker Desktop."
    exit 1
}

# Build arguments array
$dockerArgs = @(
    "run", "--rm",
    "-v", "${TestDir}:/tests",
    "-e", "BASE_URL=$BaseUrl",
    "grafana/k6:latest", "run"
)

if ($VUs -gt 0) {
    $dockerArgs += @("--vus", "$VUs")
}

if (-not [string]::IsNullOrWhiteSpace($Duration)) {
    $dockerArgs += @("--duration", "$Duration")
}

$dockerArgs += "/tests/$ScriptName"

Write-Host "Target API Base URL : $BaseUrl" -ForegroundColor Yellow
Write-Host "Executing Script    : $ScriptName" -ForegroundColor Yellow
if ($VUs -gt 0) { Write-Host "Override VUs        : $VUs" -ForegroundColor Yellow }
if ($Duration)  { Write-Host "Override Duration   : $Duration" -ForegroundColor Yellow }
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Running command: docker $($dockerArgs -join ' ')" -ForegroundColor DarkGray
Write-Host "----------------------------------------------------------`n" -ForegroundColor DarkGray

& docker $dockerArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Test completed successfully and all thresholds passed!" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Test completed with threshold violations or errors (Exit code: $LASTEXITCODE)." -ForegroundColor Red
}

exit $LASTEXITCODE
