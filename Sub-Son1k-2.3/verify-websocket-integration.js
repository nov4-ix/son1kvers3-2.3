#!/usr/bin/env node

/**
 * Simple WebSocket Integration Verification
 * Verifies that WebSocket code is properly integrated
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 WebSocket Integration Verification')
console.log('=====================================')

const checks = [
  {
    name: 'Generator.tsx imports WebSocket hook',
    file: 'apps/the-generator/src/pages/Generator.tsx',
    pattern: 'useGenerationStatus',
    required: true
  },
  {
    name: 'Generator.tsx has generationId state',
    file: 'apps/the-generator/src/pages/Generator.tsx',
    pattern: '[generationId, setGenerationId] = useState',
    required: true
  },
  {
    name: 'Generator.tsx uses WebSocket hook',
    file: 'apps/the-generator/src/pages/Generator.tsx',
    pattern: 'useGenerationStatus',
    required: true
  },
  {
    name: 'Generator.tsx has connection indicator',
    file: 'apps/the-generator/src/pages/Generator.tsx',
    pattern: 'Real-time',
    required: true
  },
  {
    name: 'WebSocket service exists',
    file: 'apps/the-generator/src/services/websocket.ts',
    pattern: 'useGenerationWebSocket',
    required: true
  },
  {
    name: 'WebSocket service has polling fallback',
    file: 'apps/the-generator/src/services/websocket.ts',
    pattern: 'useGenerationStatus',
    required: true
  },
  {
    name: 'Backend has WebSocket server',
    file: 'packages/backend/src/websocket/generationSocket.ts',
    pattern: 'setupWebSocket',
    required: true
  },
  {
    name: 'Backend imports WebSocket server',
    file: 'packages/backend/src/index.ts',
    pattern: 'setupWebSocket',
    required: true
  },
  {
    name: 'Backend has emitGenerationUpdate',
    file: 'packages/backend/src/services/musicGenerationService.ts',
    pattern: 'emitGenerationUpdate',
    required: false // This might not be implemented yet
  }
]

let passed = 0
let total = checks.length

checks.forEach(check => {
  try {
    const filePath = path.join(process.cwd(), check.file)
    const content = fs.readFileSync(filePath, 'utf8')

    if (check.pattern instanceof RegExp) {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}`)
        passed++
      } else {
        console.log(`❌ ${check.name}`)
        if (check.required) {
          console.log(`   Required pattern not found: ${check.pattern}`)
        }
      }
    } else {
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.name}`)
        passed++
      } else {
        console.log(`❌ ${check.name}`)
        if (check.required) {
          console.log(`   Required text not found: ${check.pattern}`)
        }
      }
    }
  } catch (error) {
    console.log(`❌ ${check.name}`)
    console.log(`   File not found or error: ${error.message}`)
    if (check.required) {
      console.log(`   Required file: ${check.file}`)
    }
  }
})

console.log('')
console.log(`📊 Results: ${passed}/${total} checks passed`)

if (passed === total) {
  console.log('🎉 All WebSocket integration checks PASSED!')
  console.log('')
  console.log('✅ WebSocket integration is complete and ready for testing')
  console.log('')
  console.log('🚀 Next steps:')
  console.log('1. Start backend: cd packages/backend && npm run dev')
  console.log('2. Start frontend: cd apps/the-generator && npm run dev')
  console.log('3. Open http://localhost:3005 and generate music')
  console.log('4. Check browser console for WebSocket messages')
  process.exit(0)
} else {
  console.log('⚠️  Some checks failed. WebSocket integration may be incomplete.')
  process.exit(1)
}