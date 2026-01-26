<# Run-All-WSL: Orquesta setup y ejecución completa en WSL (Ubuntu) #>
param(
  [string]$Distro = "Ubuntu"
)

Write-Host "Running full WSL flow: $Distro" -ForegroundColor Green

# 1) Setup WSL (habilitar y preparar la distro)
Write-Host "Step 1/5: Setup WSL (Ubuntu)" -ForegroundColor Cyan
& "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3\scripts\linux\setup-wsl.ps1" -Distro $Distro

# 2) Bootstrap dev dentro de WSL (herramientas de desarrollo y Node)
Write-Host "Step 2/5: Bootstrap Linux dev tools" -ForegroundColor Cyan
& "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3\scripts/linux/bootstrap-dev.ps1" -Distro $Distro

# 3) Bootstrap repos dentro de WSL (pnpm y dependencias)
Write-Host "Step 3/5: Bootstrap repo deps" -ForegroundColor Cyan
& "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3\scripts/linux/bootstrap-repo.ps1" -Distro $Distro

# 4) Ejecutar backend dentro de WSL
Write-Host "Step 4/5: Run backend in WSL" -ForegroundColor Cyan
& "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3\scripts/linux/run-backend-wsl.ps1" -Distro $Distro

# 5) Ejecutar frontend dentro de WSL
Write-Host "Step 5/5: Run frontend in WSL" -ForegroundColor Cyan
& "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3\scripts/linux/run-frontend-wsl.ps1" -Distro $Distro

Write-Host "✅ Frontend y Backend deberían estar arrancando dentro de $Distro." -ForegroundColor Green
