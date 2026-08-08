@echo off
echo ==========================================
echo   Purelane Theme - Quick Start (Windows)
echo ==========================================
echo.

REM Check if shopify CLI is installed
where shopify >nul 2>nul
if %errorlevel% neq 0 (
    echo [1/3] Installing Shopify CLI globally...
    npm install -g @shopify/cli
) else (
    echo [1/3] Shopify CLI already installed
)

echo.
echo [2/3] Authenticating with Shopify...
shopify auth login

echo.
set /p STORE="Enter your store URL (e.g., your-store.myshopify.com): "

echo.
echo [3/3] Starting dev server for %STORE%...
shopify theme dev --store=%STORE%

pause
