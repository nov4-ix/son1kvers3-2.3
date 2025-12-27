#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset}${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
};

// Verificar variables de entorno
function checkEnvVars() {
  log.info('Verificando variables de entorno...');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_THE_GENERATOR_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log.error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  log.success('Variables de entorno verificadas correctamente');
}

// Ejecutar pruebas
function runTests() {
  log.info('Ejecutando pruebas...');
  try {
    execSync('pnpm test:ci', { stdio: 'inherit' });
    log.success('Todas las pruebas pasaron correctamente');
  } catch (error) {
    log.error('Error al ejecutar las pruebas');
    process.exit(1);
  }
}

// Verificar que no haya cambios sin confirmar
function checkGitStatus() {
  log.info('Verificando estado de Git...');
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      log.warning('Hay cambios sin confirmar en el repositorio:');
      console.log(status);
      log.warning('Por favor, confirma tus cambios antes de desplegar');
      process.exit(1);
    }
    log.success('El repositorio está limpio');
  } catch (error) {
    log.error('Error al verificar el estado de Git');
    process.exit(1);
  }
}

// Verificar que estemos en la rama correcta
function checkBranch() {
  const allowedBranches = ['main', 'master'];
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  
  if (!allowedBranches.includes(currentBranch)) {
    log.warning(`Estás en la rama '${currentBranch}'. Deberías estar en 'main' o 'master' para desplegar`);
    process.exit(1);
  }
  
  log.success(`Estás en la rama '${currentBranch}'`);
}

// Función principal
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}=== Verificación previa al despliegue ===${colors.reset}\n`);
  
  try {
    // Verificar rama
    checkBranch();
    
    // Verificar estado de Git
    checkGitStatus();
    
    // Verificar variables de entorno
    checkEnvVars();
    
    // Ejecutar pruebas
    runTests();
    
    console.log(`\n${colors.bright}${colors.green}✓✓✓ ¡Todo listo para el despliegue! ✓✓✓${colors.reset}\n`);
  } catch (error) {
    log.error('Error durante la verificación previa al despliegue:');
    console.error(error);
    process.exit(1);
  }
}

main();
