#!/usr/bin/env pwsh
# Deploy script for Railway via GitHub
# Usage: .\deploy.ps1

Write-Host "🚀 Iniciando proceso de deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Repositorio Git ya inicializado" -ForegroundColor Green
}

# Check if remote exists
$remoteUrl = "https://github.com/cabrongerson0-rgb/sucursalpymes-holld.git"
$remoteExists = git remote get-url origin 2>$null

if (-not $remoteExists) {
    Write-Host "🔗 Agregando repositorio remoto..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
} else {
    Write-Host "✅ Repositorio remoto ya configurado" -ForegroundColor Green
    Write-Host "   URL: $remoteExists" -ForegroundColor Gray
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  ADVERTENCIA: No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "   Recuerda configurar las variables de entorno en Railway" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env encontrado (no será subido por .gitignore)" -ForegroundColor Green
}

# Show status
Write-Host ""
Write-Host "📋 Estado actual del repositorio:" -ForegroundColor Cyan
git status --short

# Ask for confirmation
Write-Host ""
$confirm = Read-Host "¿Deseas continuar con el commit y push? (s/n)"

if ($confirm -ne "s") {
    Write-Host "❌ Deployment cancelado" -ForegroundColor Red
    exit 1
}

# Add all files
Write-Host ""
Write-Host "📝 Agregando archivos..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Creando commit..." -ForegroundColor Yellow
$commitMessage = Read-Host "Mensaje del commit (presiona Enter para mensaje por defecto)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy optimizado para Railway - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git commit -m $commitMessage

# Push to GitHub
Write-Host ""
Write-Host "⬆️  Subiendo a GitHub..." -ForegroundColor Yellow

try {
    # Try to push to main
    git push -u origin main 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        # If main doesn't work, try master
        Write-Host "   Intentando con rama master..." -ForegroundColor Gray
        git branch -M main
        git push -u origin main --force
    }
    
    Write-Host ""
    Write-Host "✅ ¡Código subido exitosamente a GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📌 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Ve a https://railway.app" -ForegroundColor White
    Write-Host "   2. Crea un nuevo proyecto desde GitHub" -ForegroundColor White
    Write-Host "   3. Selecciona el repositorio: cabrongerson0-rgb/sucursalpymes-holld" -ForegroundColor White
    Write-Host "   4. Configura las variables de entorno:" -ForegroundColor White
    Write-Host "      - SESSION_SECRET" -ForegroundColor Gray
    Write-Host "      - TELEGRAM_BOT_TOKEN" -ForegroundColor Gray
    Write-Host "      - TELEGRAM_CHAT_ID" -ForegroundColor Gray
    Write-Host "      - NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   5. Railway desplegará automáticamente" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Repositorio: $remoteUrl" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Error al subir a GitHub:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que tengas acceso al repositorio" -ForegroundColor White
    Write-Host "   2. Verifica tus credenciales de Git" -ForegroundColor White
    Write-Host "   3. Intenta: git push -u origin main --force" -ForegroundColor White
    exit 1
}
