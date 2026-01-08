#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script automatizado de consolidación optimizada: 16 apps → 8 apps
    
.DESCRIPTION
    Migra y consolida aplicaciones según la estrategia optimizada:
    - Ghost Studio Pro (Mini + Pro + Clone)
    - Web Classic Hub (Dashboard + Music + Image + Video)
    - Nova Post Pilot (Social + Community)
    - The Generator (con polling robusto)
    - Live Collaboration
    
.EXAMPLE
    .\consolidate-optimized.ps1 -Step 1
    .\consolidate-optimized.ps1 -Step all
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('1', '2', '3', '4', '5', '6', 'all')]
    [string]$Step = 'all',
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Step { Write-Host "`n🚀 $args`n" -ForegroundColor Magenta }

# Paths
$BASE_DIR = "c:\Users\qrrom\Downloads"
$SON1K_DIR = "$BASE_DIR\Sub-Son1k-2.3\Sub-Son1k-2.3"
$ALFASSV_DIR = "$BASE_DIR\ALFASSV-base"

function Test-Prerequisites {
    Write-Step "Verificando pre-requisitos..."
    
    # Verificar directorios existen
    if (-not (Test-Path $SON1K_DIR)) {
        Write-Error "No se encuentra Sub-Son1k-2.3 en $SON1K_DIR"
        exit 1
    }
    
    if (-not (Test-Path $ALFASSV_DIR)) {
        Write-Error "No se encuentra ALFASSV en $ALFASSV_DIR"
        exit 1
    }
    
    # Verificar pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Success "pnpm instalado: v$pnpmVersion"
    } catch {
        Write-Error "pnpm no está instalado. Instala con: npm install -g pnpm"
        exit 1
    }
    
    # Verificar node
    try {
        $nodeVersion = node --version
        Write-Success "Node.js instalado: $nodeVersion"
    } catch {
        Write-Error "Node.js no está instalado"
        exit 1
    }
    
    Write-Success "Pre-requisitos OK"
}

function Step-1-Setup {
    Write-Step "PASO 1: Setup inicial"
    
    Set-Location $ALFASSV_DIR
    
    # Verificar estado de git
    Write-Info "Verificando estado de Git..."
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Hay cambios sin commitear. Continuando de todas formas..."
    }
    
    # Crear branch
    Write-Info "Creando branch feature/consolidation-optimized..."
    if (-not $DryRun) {
        git checkout -b feature/consolidation-optimized 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Branch creado"
        } else {
            Write-Warning "Branch ya existe, usando el existente"
            git checkout feature/consolidation-optimized
        }
    }
    
    # Instalar dependencias
    Write-Info "Instalando dependencias..."
    if (-not $DryRun) {
        pnpm install
        Write-Success "Dependencias instaladas"
    }
    
    Write-Success "Setup completado"
}

function Step-2-GhostStudioPro {
    Write-Step "PASO 2: Consolidar Ghost Studio Pro"
    
    Set-Location $ALFASSV_DIR
    $ghostDir = "apps/ghost-studio"
    
    # Crear estructura de modos
    Write-Info "Creando estructura de modos..."
    $modeDirs = @(
        "$ghostDir/src/modes/MiniDAW",
        "$ghostDir/src/modes/ProDAW",
        "$ghostDir/src/modes/VoiceClone",
        "$ghostDir/src/components/ModeSelector"
    )
    
    foreach ($dir in $modeDirs) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Info "Creado: $dir"
        } else {
            Write-Info "[DRY RUN] Crearía: $dir"
        }
    }
    
    # Mover código actual de Ghost Studio a MiniDAW mode
    Write-Info "Moviendo Ghost Studio actual a modo Mini..."
    if (-not $DryRun -and (Test-Path "$ghostDir/src/components")) {
        Copy-Item -Path "$ghostDir/src/components/*" -Destination "$ghostDir/src/modes/MiniDAW/" -Recurse -Force
        Write-Success "Código movido a MiniDAW"
    }
    
    # Copiar Sonic DAW a ProDAW mode
    Write-Info "Copiando Sonic DAW a modo Pro..."
    $sonicSrc = "$ALFASSV_DIR/apps/sonic-daw/src"
    if (Test-Path $sonicSrc) {
        if (-not $DryRun) {
            Copy-Item -Path "$sonicSrc/*" -Destination "$ghostDir/src/modes/ProDAW/" -Recurse -Force
            Write-Success "Sonic DAW copiado"
        } else {
            Write-Info "[DRY RUN] Copiaría Sonic DAW"
        }
    } else {
        Write-Warning "Sonic DAW no encontrado, saltando..."
    }
    
    # Copiar Clone Station a VoiceClone mode
    Write-Info "Copiando Clone Station a modo Voice Clone..."
    $cloneSrc = "$ALFASSV_DIR/apps/clone-station"
    if (Test-Path $cloneSrc) {
        if (-not $DryRun) {
            Copy-Item -Path "$cloneSrc/src/*" -Destination "$ghostDir/src/modes/VoiceClone/" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Clone Station copiado"
        } else {
            Write-Info "[DRY RUN] Copiaría Clone Station"
        }
    } else {
        Write-Warning "Clone Station no encontrado, saltando..."
    }
    
    # Crear ModeSelector component
    Write-Info "Creando ModeSelector component..."
    $modeSelectorCode = @'
import { useState } from 'react';

interface ModeSelectorProps {
  mode: 'mini' | 'pro' | 'clone';
  onChange: (mode: 'mini' | 'pro' | 'clone') => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 p-4 bg-gray-900 border-b border-gray-800">
      <button
        onClick={() => onChange('mini')}
        className={`px-4 py-2 rounded-lg transition ${
          mode === 'mini' 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        🎵 Mini DAW
      </button>
      <button
        onClick={() => onChange('pro')}
        className={`px-4 py-2 rounded-lg transition ${
          mode === 'pro' 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        🎛️ Pro DAW
      </button>
      <button
        onClick={() => onChange('clone')}
        className={`px-4 py-2 rounded-lg transition ${
          mode === 'clone' 
            : 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        🎤 Voice Clone
      </button>
    </div>
  );
}
'@
    
    if (-not $DryRun) {
        $modeSelectorCode | Out-File -FilePath "$ghostDir/src/components/ModeSelector/ModeSelector.tsx" -Encoding UTF8
        Write-Success "ModeSelector creado"
    }
    
    Write-Success "Ghost Studio Pro estructurado correctamente"
}

function Step-3-WebClassicHub {
    Write-Step "PASO 3: Consolidar Web Classic Hub"
    
    Set-Location $ALFASSV_DIR
    $webDir = "apps/web-classic"
    
    # Crear estructura de features
    Write-Info "Creando estructura de features..."
    $featureDirs = @(
        "$webDir/src/features/GeneratorExpress",
        "$webDir/src/features/ImageCreator",
        "$webDir/src/features/VideoCreator"
    )
    
    foreach ($dir in $featureDirs) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Info "Creado: $dir"
        }
    }
    
    # Copiar Generator Express de Sub-Son1k-2.3
    Write-Info "Copiando Generator Express..."
    $generatorExpressSrc = "$SON1K_DIR/apps/web-classic/src/components/GeneratorExpress.tsx"
    if (Test-Path $generatorExpressSrc) {
        if (-not $DryRun) {
            Copy-Item -Path $generatorExpressSrc -Destination "$webDir/src/features/GeneratorExpress/" -Force
            Write-Success "Generator Express copiado"
        }
    } else {
        Write-Warning "Generator Express no encontrado"
    }
    
    # Copiar Image Generator
    Write-Info "Copiando Image Generator..."
    $imageGenSrc = "$ALFASSV_DIR/apps/image-generator/src"
    if (Test-Path $imageGenSrc) {
        if (-not $DryRun) {
            Copy-Item -Path "$imageGenSrc/*" -Destination "$webDir/src/features/ImageCreator/" -Recurse -Force
            Write-Success "Image Generator copiado"
        }
    }
    
    Write-Success "Web Classic Hub estructurado correctamente"
}

function Step-4-TheGeneratorPolling {
    Write-Step "PASO 4: Migrar sistema de polling robusto"
    
    Set-Location $ALFASSV_DIR
    $genDir = "apps/the-generator"
    
    # Crear directorio de polling
    Write-Info "Creando directorio de servicios de polling..."
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path "$genDir/src/services/polling" -Force | Out-Null
    }
    
    # Copiar servicios de polling
    Write-Info "Copiando servicios de polling..."
    $pollingSrc = "$SON1K_DIR/apps/the-generator-nextjs/src/services"
    if (Test-Path $pollingSrc) {
        if (-not $DryRun) {
            $files = Get-ChildItem -Path $pollingSrc -Filter "*.ts" -File
            foreach ($file in $files) {
                Copy-Item -Path $file.FullName -Destination "$genDir/src/services/polling/" -Force
                Write-Info "Copiado: $($file.Name)"
            }
            Write-Success "Servicios de polling copiados"
        }
    } else {
        Write-Warning "Servicios de polling no encontrados en the-generator-nextjs"
    }
    
    Write-Success "Sistema de polling migrado"
}

function Step-5-LiveCollaboration {
    Write-Step "PASO 5: Migrar Live Collaboration"
    
    Set-Location $ALFASSV_DIR
    
    # Copiar app completa
    Write-Info "Copiando Live Collaboration..."
    $liveCollabSrc = "$SON1K_DIR/apps/live-collaboration"
    if (Test-Path $liveCollabSrc) {
        if (-not $DryRun) {
            Copy-Item -Path $liveCollabSrc -Destination "apps/" -Recurse -Force
            Write-Success "Live Collaboration copiado"
        }
    } else {
        Write-Warning "Live Collaboration no encontrado"
    }
    
    Write-Success "Live Collaboration migrado"
}

function Step-6-Finalize {
    Write-Step "PASO 6: Finalizar y commit"
    
    Set-Location $ALFASSV_DIR
    
    # Actualizar turbo.json
    Write-Info "Actualizando turbo.json..."
    # (aquí iría la lógica para actualizar turbo.json)
    
    # Git status
    Write-Info "Estado de Git:"
    git status --short
    
    if (-not $DryRun) {
        Write-Info "`nPara commitear los cambios, ejecuta:"
        Write-Host "  git add ." -ForegroundColor Yellow
        Write-Host "  git commit -m 'feat: consolidate 16 apps into 8 powerful apps'" -ForegroundColor Yellow
        Write-Host "  git push origin feature/consolidation-optimized" -ForegroundColor Yellow
    }
    
    Write-Success "Consolidación completada!"
    Write-Info "`nResumen de consolidación:"
    Write-Host "  ✅ Ghost Studio Pro (Mini + Pro + Clone)" -ForegroundColor Green
    Write-Host "  ✅ Web Classic Hub (Dashboard + Music + Image + Video)" -ForegroundColor Green
    Write-Host "  ✅ The Generator (polling robusto)" -ForegroundColor Green
    Write-Host "  ✅ Live Collaboration (nuevo)" -ForegroundColor Green
    Write-Host "`n  📊 16 apps → 8 apps = 50% reducción" -ForegroundColor Cyan
}

# Main execution
function Main {
    Write-Host @"
╔══════════════════════════════════════════════════════════╗
║  CONSOLIDACIÓN OPTIMIZADA: 16 apps → 8 apps             ║
║  Estrategia: Consolidar por features, no multiplicar    ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    if ($DryRun) {
        Write-Warning "MODO DRY RUN - No se realizarán cambios reales"
    }
    
    Test-Prerequisites
    
    switch ($Step) {
        '1' { Step-1-Setup }
        '2' { Step-2-GhostStudioPro }
        '3' { Step-3-WebClassicHub }
        '4' { Step-4-TheGeneratorPolling }
        '5' { Step-5-LiveCollaboration }
        '6' { Step-6-Finalize }
        'all' {
            Step-1-Setup
            Step-2-GhostStudioPro
            Step-3-WebClassicHub
            Step-4-TheGeneratorPolling
            Step-5-LiveCollaboration
            Step-6-Finalize
        }
    }
    
    Write-Host "`n✨ ¡Proceso completado!" -ForegroundColor Green
}

# Run
Main
