# PowerShell script to verify complete affiliate setup
Write-Host "🔍 TravelAI Pro - Setup Verification" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "🔧 Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    $allGood = $false
}

# Check npm dependencies
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host "  ✅ package.json exists" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "  ✅ node_modules directory exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  node_modules missing. Run 'npm install'" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ package.json not found" -ForegroundColor Red
    $allGood = $false
}

# Check affiliate configuration
Write-Host "💰 Checking affiliate configuration..." -ForegroundColor Cyan
if (Test-Path "config/affiliates.js") {
    Write-Host "  ✅ Affiliate configuration exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ config/affiliates.js missing" -ForegroundColor Red
    $allGood = $false
}

# Check environment file
Write-Host "⚙️  Checking environment..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
} else {
    if (Test-Path ".env.example") {
        Write-Host "  ⚠️  .env missing but .env.example found. Copy and configure it." -ForegroundColor Yellow
        Write-Host "     Command: Copy-Item .env.example .env" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ No environment configuration found" -ForegroundColor Red
    }
}

# Check critical files
Write-Host "📁 Checking project structure..." -ForegroundColor Cyan
$criticalFiles = @(
    "index.js",
    "locationService.js", 
    "test-affiliates.js",
    "AFFILIATE_CHECKLIST.md"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "🎉 Setup Verification Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Your affiliate system is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\run.ps1 test" -ForegroundColor White
    Write-Host "  2. Apply to affiliate programs" -ForegroundColor White
    Write-Host "  3. Update .env with real affiliate IDs" -ForegroundColor White
    Write-Host "  4. Start earning commissions!" -ForegroundColor White
} else {
    Write-Host "⚠️  Setup Issues Detected" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Please fix the issues above before proceeding." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Common Solutions:" -ForegroundColor Yellow
    Write-Host "  - Install Node.js from nodejs.org" -ForegroundColor White
    Write-Host "  - Run 'npm install' to install dependencies" -ForegroundColor White
    Write-Host "  - Copy .env.example to .env" -ForegroundColor White
}

Write-Host ""