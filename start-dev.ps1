# Purelane Theme - Quick Start (PowerShell)
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Purelane Theme - Quick Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if shopify CLI is installed
$shopify = Get-Command shopify -ErrorAction SilentlyContinue
if (-not $shopify) {
    Write-Host "[1/3] Installing Shopify CLI globally..." -ForegroundColor Yellow
    npm install -g @shopify/cli
} else {
    Write-Host "[1/3] Shopify CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Authenticating with Shopify..." -ForegroundColor Yellow
shopify auth login

Write-Host ""
$store = Read-Host "Enter your store URL (e.g., your-store.myshopify.com)"

Write-Host ""
Write-Host "[3/3] Starting dev server for $store..." -ForegroundColor Yellow
shopify theme dev --store=$store
