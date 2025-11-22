# NeonDB Setup Script for TrustMint (PowerShell)
# This script helps you configure NeonDB backup

Write-Host "🔧 Setting up NeonDB backup for TrustMint..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the functions directory
if (-not (Test-Path "package.json") -or -not (Test-Path "src")) {
    Write-Host "❌ Error: Please run this script from the functions directory" -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is installed
try {
    $null = Get-Command firebase -ErrorAction Stop
} catch {
    Write-Host "❌ Error: Firebase CLI not found. Install it with: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing PostgreSQL client..." -ForegroundColor Yellow
npm install pg

Write-Host ""
Write-Host "🔐 Step 2: Setting NeonDB connection string as Firebase Secret..." -ForegroundColor Yellow
Write-Host "Paste your connection string when prompted:" -ForegroundColor Gray
Write-Host "postgresql://neondb_owner:npg_WE2GXadx4Ujo@ep-rapid-cloud-a407c4um-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -ForegroundColor Gray
Write-Host ""

firebase functions:secrets:set NEON_DB_URL

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ NeonDB connection string set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Step 3: Building functions..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build successful!" -ForegroundColor Green
        Write-Host ""
        $deploy = Read-Host "📤 Step 4: Deploy functions? (y/n)"
        if ($deploy -eq "y" -or $deploy -eq "Y") {
            firebase deploy --only functions
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "🎉 NeonDB backup is now active!" -ForegroundColor Green
                Write-Host ""
                Write-Host "✅ Auto-sync is enabled - every Firestore change will backup to NeonDB" -ForegroundColor Green
                Write-Host "📊 Check backup_logs collection in Firestore to monitor syncs" -ForegroundColor Cyan
            }
        } else {
            Write-Host ""
            Write-Host "⚠️  Functions built but not deployed. Run 'firebase deploy --only functions' when ready." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to set secret. Check Firebase CLI setup." -ForegroundColor Red
    exit 1
}

