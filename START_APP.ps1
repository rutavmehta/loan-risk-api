# Loan Risk Platform - Startup Script
# Run this in PowerShell to start both backend and frontend

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Loan Risk Platform Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any existing processes on ports 3001 and 8000
Write-Host "[1] Cleaning up old processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Step 2: Start Backend
Write-Host "[2] Starting Backend on port 8000..." -ForegroundColor Green
cd e:\loan-risk-platform\backend
.\..\..\venv\Scripts\Activate.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\loan-risk-platform\backend; ..\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 3

# Step 3: Start Frontend
Write-Host "[3] Starting Frontend on port 3001..." -ForegroundColor Green
cd e:\loan-risk-platform\frontend
npm run dev

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Application Started Successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
