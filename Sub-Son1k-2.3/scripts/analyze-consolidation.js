#!/usr/bin/env node

/**
 * Script de Análisis de Consolidación
 * 
 * Compara Sub-Son1k-2.3 con ALFASSV y genera reporte de diferencias
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../..');
const SON1K_DIR = path.join(BASE_DIR, 'Sub-Son1k-2.3');
const ALFASSV_DIR = path.join(BASE_DIR, 'ALFASSV-base');

async function analyzeApps() {
  console.log('📱 Analyzing apps...\n');
  
  const son1kApps = await fs.readdir(path.join(SON1K_DIR, 'apps'));
  const alfassvApps = await fs.readdir(path.join(ALFASSV_DIR, 'apps'));
  
  console.log('📦 Apps in Sub-Son1k-2.3:');
  son1kApps.forEach(app => console.log(`  - ${app}`));
  
  console.log('\n📦 Apps in ALFASSV:');
  alfassvApps.forEach(app => console.log(`  - ${app}`));
  
  // Apps únicas en cada proyecto
  const onlyInSon1k = son1kApps.filter(app => !alfassvApps.includes(app));
  const onlyInAlfassv = alfassvApps.filter(app => !son1kApps.includes(app));
  const common = son1kApps.filter(app => alfassvApps.includes(app));
  
  console.log('\n✨ Apps SOLO en Sub-Son1k-2.3:');
  onlyInSon1k.forEach(app => console.log(`  🆕 ${app}`));
  
  console.log('\n✨ Apps SOLO en ALFASSV:');
  onlyInAlfassv.forEach(app => console.log(`  🆕 ${app}`));
  
  console.log('\n🔄 Apps COMUNES (requieren merge):');
  common.forEach(app => console.log(`  🔀 ${app}`));
  
  return { onlyInSon1k, onlyInAlfassv, common };
}

async function analyzePackages() {
  console.log('\n\n📦 Analyzing packages...\n');
  
  const son1kPkgs = await fs.readdir(path.join(SON1K_DIR, 'packages'));
  const alfassvPkgs = await fs.readdir(path.join(ALFASSV_DIR, 'packages'));
  
  console.log('📚 Packages in Sub-Son1k-2.3:');
  son1kPkgs.forEach(pkg => console.log(`  - ${pkg}`));
  
  console.log('\n📚 Packages in ALFASSV:');
  alfassvPkgs.forEach(pkg => console.log(`  - ${pkg}`));
  
  return { son1kPkgs, alfassvPkgs };
}

async function analyzeDependencies() {
  console.log('\n\n🔍 Analyzing dependencies...\n');
  
  const son1kPkg = JSON.parse(
    await fs.readFile(path.join(SON1K_DIR, 'package.json'), 'utf-8')
  );
  const alfassvPkg = JSON.parse(
    await fs.readFile(path.join(ALFASSV_DIR, 'package.json'), 'utf-8')
  );
  
  const son1kDeps = { ...son1kPkg.dependencies, ...son1kPkg.devDependencies };
  const alfassvDeps = { ...alfassvPkg.dependencies, ...alfassvPkg.devDependencies };
  
  console.log('📌 Dependencies comparison:');
  
  // Nuevas en Son1k
  const newInSon1k = Object.keys(son1kDeps).filter(dep => !alfassvDeps[dep]);
  if (newInSon1k.length > 0) {
    console.log('\n✨ New dependencies in Sub-Son1k-2.3:');
    newInSon1k.forEach(dep => {
      console.log(`  + ${dep}@${son1kDeps[dep]}`);
    });
  }
  
  // Diferentes versiones
  const differentVersions = Object.keys(son1kDeps).filter(dep => {
    return alfassvDeps[dep] && son1kDeps[dep] !== alfassvDeps[dep];
  });
  
  if (differentVersions.length > 0) {
    console.log('\n⚠️  Different versions:');
    differentVersions.forEach(dep => {
      console.log(`  ${dep}:`);
      console.log(`    Sub-Son1k-2.3: ${son1kDeps[dep]}`);
      console.log(`    ALFASSV:       ${alfassvDeps[dep]}`);
    });
  }
  
  return { newInSon1k, differentVersions };
}

async function analyzeExtension() {
  console.log('\n\n🧩 Analyzing Chrome Extension...\n');
  
  try {
    const son1kExt = await fs.readdir(path.join(SON1K_DIR, 'extensions'));
    const alfassvExt = await fs.readdir(path.join(ALFASSV_DIR, 'suno-extension'));
    
    console.log('🔌 Extensions in Sub-Son1k-2.3:', son1kExt.length, 'items');
    console.log('🔌 Extensions in ALFASSV:', alfassvExt.length, 'items');
    
    // Compare manifest
    const son1kManifest = JSON.parse(
      await fs.readFile(
        path.join(SON1K_DIR, 'extensions/suno-sonos-extension/manifest.json'),
        'utf-8'
      )
    );
    const alfassvManifest = JSON.parse(
      await fs.readFile(
        path.join(ALFASSV_DIR, 'suno-extension/manifest.json'),
        'utf-8'
      )
    );
    
    console.log('\n📋 Manifest versions:');
    console.log(`  Sub-Son1k-2.3: v${son1kManifest.version}`);
    console.log(`  ALFASSV:       v${alfassvManifest.version}`);
    
  } catch (error) {
    console.log('⚠️  Could not analyze extension:', error.message);
  }
}

async function generateMigrationPlan() {
  console.log('\n\n📝 Generating migration recommendations...\n');
  
  const recommendations = [
    '1️⃣  Migrate robust polling system from the-generator-nextjs',
    '2️⃣  Copy live-collaboration app (unique to Sub-Son1k-2.3)',
    '3️⃣  Merge web-classic improvements (Generator Express)',
    '4️⃣  Update dependencies to latest versions',
    '5️⃣  Consolidate scripts from both projects',
    '6️⃣  Merge documentation files',
    '7️⃣  Compare and merge extension features',
    '8️⃣  Update turbo.json with new apps',
    '9️⃣  Sync environment variables',
    '🔟 Test all migrations before deploy',
  ];
  
  console.log('🎯 PRIORITY ACTIONS:\n');
  recommendations.forEach(rec => console.log(`  ${rec}`));
  
  console.log('\n📊 Summary:');
  console.log('  Total apps in ecosystem: ~14-16');
  console.log('  Shared packages: ~4-6');
  console.log('  Migration complexity: MEDIUM');
  console.log('  Estimated time: 10 days');
  console.log('  Risk level: LOW (incremental migration)');
}

async function main() {
  console.log('🚀 CONSOLIDATION ANALYSIS: Sub-Son1k-2.3 → ALFASSV\n');
  console.log('=' .repeat(70));
  
  try {
    await analyzeApps();
    await analyzePackages();
    await analyzeDependencies();
    await analyzeExtension();
    await generateMigrationPlan();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Analysis complete!\n');
    console.log('📄 Next step: Review PLAN_CONSOLIDACION_DEFINITIVO.md');
    console.log('🚀 Ready to start migration!\n');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

main();
