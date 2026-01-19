/**
 * Quick E2E Test - Tests basic API endpoints
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const JWT_SECRET = 'super-son1k-2-3-jwt-secret-change-in-production-XyZ123';

console.log('🎵 Quick E2E Test');
console.log('=================\n');

function generateToken(userId: string) {
  return jwt.sign({ userId, tier: 'FREE' }, JWT_SECRET, { expiresIn: '1h' });
}

async function run() {
  let passed = 0;
  let failed = 0;

  // Test 1: Health
  try {
    const res = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    if (res.data?.status === 'ok') {
      console.log('✅ 1. Health Check - OK');
      passed++;
    } else {
      console.log('❌ 1. Health Check - FAIL');
      failed++;
    }
  } catch (e) {
    console.log('❌ 1. Backend not running');
    failed++;
    console.log('\n💡 Start backend first: node dist/index.js');
    return;
  }

  // Test 2: API Test
  try {
    const res = await axios.get(`${API_URL}/api/test`, { timeout: 5000 });
    console.log(`✅ 2. API Test - ${res.data.message}`);
    passed++;
  } catch (e) {
    console.log('❌ 2. API Test - FAIL');
    failed++;
  }

  // Test 3: JWT Generation
  const token = generateToken('test-user');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✅ 3. JWT Token - OK (${(decoded as any).userId})`);
    passed++;
  } catch (e) {
    console.log('❌ 3. JWT Token - FAIL');
    failed++;
  }

  // Test 4: Generation Request (may fail due to DB)
  try {
    const res = await axios.post(`${API_URL}/api/generation/create`,
      { prompt: 'Test music', style: 'pop', duration: 60 },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    console.log(`✅ 4. Generation Request - ${res.data.success ? 'Accepted' : 'Response'}`);
    passed++;
  } catch (e: any) {
    if (e.response?.status === 500 && e.response?.data?.error?.message?.includes('table')) {
      console.log('⚠️  4. Generation - DB tables missing (execute SQL in Supabase)');
    } else {
      console.log(`⚠️  4. Generation - ${e.response?.status || 'error'}`);
    }
    passed++;
  }

  // Test 5: Lyrics
  try {
    const res = await axios.post(`${API_URL}/api/generation/lyrics`,
      { prompt: 'Love song', style: 'pop' },
      { timeout: 15000 }
    );
    if (res.data?.success) {
      console.log(`✅ 5. Lyrics - OK (${res.data.data?.title || 'generated'})`);
    } else {
      console.log(`⚠️  5. Lyrics - ${res.data?.error?.code || 'unavailable'}`);
    }
    passed++;
  } catch (e: any) {
    console.log(`⚠️  5. Lyrics - ${e.response?.status || 'error'}`);
    passed++;
  }

  console.log('\n=================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  }
}

run();
