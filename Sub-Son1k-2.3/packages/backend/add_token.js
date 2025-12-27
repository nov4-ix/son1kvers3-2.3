const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addToken() {
  try {
    const token = await prisma.token.create({
      data: {
        hash: 'suno-token-1',
        email: 'soypepejaim.es@gmail.com',
        isActive: true,
        isValid: true,
        usageCount: 0,
        rateLimit: 10,
        tier: 'FREE',
        metadata: '{}',
        encryptedToken: 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjE1MzU1MjAsImZ2YSI6WzEyNDc0LC0xXSwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9jbGVya19pZCI6InVzZXJfMnFwWkhYdVNOU2tLdmVBaGtmekVTMTRkZ1RIIiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9lbWFpbCI6InNveXBlcGVqYWltZXNAZ21haWwuY29tIiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9waG9uZSI6bnVsbCwiaWF0IjoxNzYxNTMxOTIwLCJpc3MiOiJodHRwczovL2NsZXJrLnN1bm8uY29tIiwianRpIjoiZTFiOGNhNTlmM2VkZjYxNjIyYTEiLCJuYmYiOjE3NjE1MzE5MTAsInNpZCI6InNlc3NfMzRFZjNGMm5WbXlzeEI1b1M3aUlPeEh6eVRnIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8ycXBaSFh1U05Ta0t2ZUFoa2Z6RVMxNGRnVEgifQ.HPOmQvN2c4ZV87gYJlt2i_07ewDMYrZgwVfRztqsFO9E2jNBFy1Ybespv75FTu4gOLyBMdPuxqPl0R5rWGt-ZCYNj_aeMwuV4SWOpLPmImpBFaOGaeotuQzaRtcpCbmPkff8rh2dbARVPRuYYy_xcODeSxsTckRlrSdiPzeqTG8otAHxh35PG1bXVh6DXRnSViHedMezDgatx-fKHAxxGp6zM8yU4TVMSrxMoAETg5IF1JXSpQEiPgFe4PfkS2sHvpuO6lIgWiRT_R7EjeI-w8pqjTG54K6geN76trcnpAN7LEY5uEvfhDHsh0kQjbAur77VA27ao69T1pNLzBkABg'
      }
    });

    console.log('✅ Token agregado exitosamente!');
    console.log('ID:', token.id);
    console.log('Hash:', token.hash);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addToken();
