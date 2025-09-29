# PowerShell script to manage the Travel Planner affiliate system
# Run this from the server directory

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "test", "dev", "help")]
    [string]$Action = "help"
)

Write-Host "🚀 TravelAI Pro - Affiliate Management Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

switch ($Action) {
    "start" {
        Write-Host "🌐 Starting production server..." -ForegroundColor Cyan
        node index.js
    }
    
    "test" {
        Write-Host "🧪 Testing affiliate system..." -ForegroundColor Cyan
        node test-affiliates.js
    }
    
    "dev" {
        Write-Host "🔧 Starting development server..." -ForegroundColor Cyan
        if (Get-Command nodemon -ErrorAction SilentlyContinue) {
            nodemon index.js
        } else {
            Write-Host "⚠️  nodemon not found. Installing..." -ForegroundColor Yellow
            npm install -g nodemon
            nodemon index.js
        }
    }
    
    "help" {
        Write-Host "📖 Available Commands:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  .\run.ps1 start    - Start production server" -ForegroundColor White
        Write-Host "  .\run.ps1 test     - Test affiliate configuration" -ForegroundColor White  
        Write-Host "  .\run.ps1 dev      - Start development server with auto-reload" -ForegroundColor White
        Write-Host "  .\run.ps1 help     - Show this help message" -ForegroundColor White
        Write-Host ""
        Write-Host "💰 Affiliate Setup Status:" -ForegroundColor Yellow
        Write-Host ""
        
        # Check if .env exists
        if (Test-Path ".env") {
            Write-Host "  ✅ .env file exists" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  .env file missing (copy from .env.example)" -ForegroundColor Red
        }
        
        # Check if affiliate config exists
        if (Test-Path "config/affiliates.js") {
            Write-Host "  ✅ Affiliate configuration ready" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Affiliate configuration missing" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "🎯 Quick Start:" -ForegroundColor Yellow
        Write-Host "  1. Run '.\run.ps1 test' to verify affiliate setup" -ForegroundColor White
        Write-Host "  2. Apply to affiliate programs (see AFFILIATE_CHECKLIST.md)" -ForegroundColor White
        Write-Host "  3. Update .env with real affiliate IDs" -ForegroundColor White
        Write-Host "  4. Run '.\run.ps1 start' to launch the server" -ForegroundColor White
    }
}

Write-Host ""