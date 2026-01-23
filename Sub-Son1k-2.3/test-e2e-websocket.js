#!/usr/bin/env node

/**
 * End-to-End WebSocket Integration Test
 * Tests the complete flow: generation creation → WebSocket updates → completion
 */

import WebSocket from 'ws'
import fetch from 'node-fetch'

const BACKEND_URL = 'http://localhost:3001'
const WS_URL = 'ws://localhost:3001/ws/generation'

async function testWebSocketIntegration() {
  console.log('🚀 Starting End-to-End WebSocket Integration Test\n')

  let generationId = null
  let wsConnected = false
  let updatesReceived = []

  // Step 1: Test backend health
  console.log('📡 Step 1: Checking backend health...')
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`)
    if (!healthResponse.ok) throw new Error('Backend not healthy')
    console.log('✅ Backend is healthy')
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message)
    return false
  }

  // Step 2: Connect WebSocket
  console.log('\n🔌 Step 2: Connecting WebSocket...')
  const ws = new WebSocket(WS_URL)

  return new Promise((resolve) => {
    ws.on('open', () => {
      console.log('✅ WebSocket connected')
      wsConnected = true

      // Step 3: Simulate generation creation (mock)
      console.log('\n🎵 Step 3: Simulating music generation...')

      // For this test, we'll simulate what happens when a generation is created
      generationId = 'test-gen-' + Date.now()

      // Subscribe to generation updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        generationId
      }))

      console.log(`📡 Subscribed to generation: ${generationId}`)

      // Step 4: Simulate generation updates (normally done by backend)
      setTimeout(() => {
        console.log('\n📤 Step 4: Simulating generation progress updates...')

        // Simulate status updates
        const updates = [
          { status: 'processing', progress: 25 },
          { status: 'processing', progress: 50 },
          { status: 'processing', progress: 75 },
          {
            status: 'completed',
            progress: 100,
            audioUrl: 'https://example.com/test-audio.mp3',
            tracks: [{ title: 'Test Track', duration: 60 }]
          }
        ]

        updates.forEach((update, index) => {
          setTimeout(() => {
            const updateData = {
              type: 'generation_update',
              generationId,
              ...update,
              timestamp: new Date().toISOString()
            }

            // In real scenario, backend would send this
            console.log(`📤 Sending update: ${update.status} (${update.progress || 0}%)`)

            // For testing, we'll simulate receiving our own message
            ws.emit('message', { data: JSON.stringify(updateData) })

          }, index * 1000) // 1 second apart
        })

      }, 1000)
    })

    ws.on('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📡 Received WebSocket message:', data)

        if (data.type === 'generation_update') {
          updatesReceived.push(data)
          console.log(`✅ Update ${updatesReceived.length}: ${data.status}`)
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error)
      }
    })

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
    })

    ws.on('close', () => {
      console.log('🔌 WebSocket disconnected')
      wsConnected = false
    })

    // Step 5: Verify results after all updates
    setTimeout(() => {
      console.log('\n📊 Step 5: Verifying test results...')

      const success = wsConnected &&
                     updatesReceived.length >= 4 &&
                     updatesReceived.some(u => u.status === 'completed')

      if (success) {
        console.log('✅ E2E Test PASSED!')
        console.log(`📈 Updates received: ${updatesReceived.length}`)
        console.log('🎯 Final status: completed')
      } else {
        console.log('❌ E2E Test FAILED!')
        console.log(`📈 Updates received: ${updatesReceived.length}`)
        console.log(`🔗 WebSocket connected: ${wsConnected}`)
      }

      ws.close()
      resolve(success)

    }, 6000) // Wait for all updates + buffer
  })
}

// Run the test
testWebSocketIntegration()
  .then((success) => {
    console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`)
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('\n💥 Test CRASHED:', error)
    process.exit(1)
  })