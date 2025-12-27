import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Tokens válidos proporcionados por el usuario
const TOKENS = [
  'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjE2OTU0OTMsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8ycXBaSFh1U05Ta0t2ZUFoa2Z6RVMxNGRnVEgiLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoic295cGVwZWphaW1lc0BnbWFpbC5jb20iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL3Bob25lIjpudWxsLCJpYXQiOjE3NjE2OTU0MzMsImlzcyI6Imh0dHBzOi8vY2xlcmsuc3Vuby5jb20iLCJqdGkiOiI3MmI1MzIyNDEzNjk2MWNkMmMxOSIsIm5iZiI6MTc2MTY5NTQyMywic2lkIjoic2Vzc18zNGhGMWNKTlF2enkzN2V4dFNiTzNaZEFIR1YiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzJxcFpIWHVTTlNrS3ZlQWhrZnpFUzE0ZGdUSCJ9.H5wdTL3MaHD44eq1Nr8Bj_LFWTUaQLd0hw6Win92jwJ9jorj1ZD8DQQiQS4E0UnMPHQsbG8IET93fSUJM-64GGWDYm__DA-LdNQIYKRdlXiZjMKfzmwsl8lSK7iag8Gzp7Db0kkHoTIdkKsnt6YRIKKzbWJ2kxBV3fjlEnRp549epZ1zM1VDoQmhe9WWgAAaQ3mLxrKoOMuw9tmMJUCUeRjaEIHN8shg1-iAv1Ug0wyidl03AyKvhYxR1Cq7n7rLKZctNr5ubpxMkfyGo6LPXdz1WTSwV2w65TvG_FEpeazFQkiI7ErjF4mWr-B28ITMuMgJjHkpWQPEdZjN6eTi_Q',
  'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjE2OTU1NDUsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8ycXBaSFh1U05Ta0t2ZUFoa2Z6RVMxNGRnVEgiLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoic295cGVwZWphaW1lc0BnbWFpbC5jb20iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL3Bob25lIjpudWxsLCJpYXQiOjE3NjE2OTU0ODUsImlzcyI6Imh0dHBzOi8vY2xlcmsuc3Vuby5jb20iLCJqdGkiOiJjNWVkM2MxYzgyMGYxZThjMGRiNiIsIm5iZiI6MTc2MTY5NTQ3NSwic2lkIjoic2Vzc18zNGhGMWNKTlF2enkzN2V4dFNiTzNaZEFIR1YiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzJxcFpIWHVTTlNrS3ZmQWhrZnpFUzE0ZGdUSCJ9.DJT0ZYh3qdriyF19NvV6wvaHncSW02Y4mLSw0Ix6uGHEquwLEslCMfLS31TH9VfPGGU0qpgoR9nZMt0xgxdK1U7uwrkiGGTCMHsiwiNCQ0ZUxkv-xJofYPdGGyyzyy1gRYpAAHksWNn_UTHToX6Kimk0vEVdUUVbAxeysOnWnffQPRp70KED9G1C-qW2_Oc0u4CI2zGoUQO8ZX_1t2QEhgKsKvjgDBSS5jlM-7qriVHq9JTIGdIlrJYRjJGrxntJW9eIBSUYFvFY8A6vRukZ6p469TtmvIkoZqoGWdUPOewMN0QGM_SUHzYjAbQqGmiC1uOYx7vFv_edaKPbwwTM0A',
  'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjE2OTU1OTAsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8ycXBaSFh1U05Ta0t2ZUFoa2Z6RVMxNGRnVEgiLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoic295cGVwZWphaW1lc0BnbWFpbC5jb20iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL3Bob25lIjpudWxsLCJpYXQiOjE3NjE2OTU1MzAsImlzcyI6Imh0dHBzOi8vY2xlcmsuc3Vuby5jb20iLCJqdGkiOiIwOGZhMDhlYTZkOTA2MjhiZWY1ZCIsIm5iZiI6MTc2MTY5NTUyMCwic2lkIjoic2Vzc18zNGhGMWNKTlF2enkzN2V4dFNiTzNaZEFIR1YiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzJxcFpIWHVTTlNrS3ZmQWhrZnpFUzE0ZGdUSCJ9.mmWzepBlLZBEP25V4_dtGs_hItVX9oyE6ka0X93ay2NygCxHhT9yO0kGtWSfUQoyP8BuoLoLn1MCAB8N9Hhh5HAH4dULjiEV6HRDwX5JBWiV2XaCUe7QJH31vxMbNUlD42OoR3RZfcowss2Gzcq9ral6bEYByXxU8qPu-5MByc3xJ5sJ-UE7rsfMa_X95wSNqxA2JRHftF0adkMT6ZuYpJgFs6GO5UoOzIFpIriRKfTsiT40_8h4rezPQ5TEHxdrHwOL89HW6AyF4StsQbiz0TvV7MV2K6TsSWgtP4YpKjKstevujbFa_DSbCJAOJtLnyV_Obaj0uhPpFr-Iweq10Q',
  'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjE2OTkxODIsImZ2YSI6WzYzMSwtMV0sImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJxcFpIWHVTTlNrS3ZmQWhrZnpFUzE0ZGdUSCIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJzb3lwZXBlamFpbWVzQGdtYWlsLmNvbSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvcGhvbmUiOm51bGwsImlhdCI6MTc2MTY5NTU4MiwiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjJkZTllM2I0Zjg0NDc2OTkyODdiIiwibmJmIjoxNzYxNjk1NTcyLCJzaWQiOiJzZXNzXzM0aEYxY0pOUXZ6eTM3ZXh0U2JPM1pkQUhHViIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMnFwWkhYdVNOU2tLdmZBaGtmekVTMTRkZ1RIIn0.B-qPOvNnIInOHnTwin8njRRWT5r103Y3_GuGi6WFJnnEOODj_Nb-YpKbfSo39fDwcjo2k0t7rTCxOjWGlp_3wSN_OcLyfSYLbX5nnn_5KdwWx6328YknCne8y4P32P3pkcoS2F2tYFXq1xCu6-Izpt3SbtP5mL4_SJ99rYZiIiw8V2ho9pzKRtMvOmsuH8ni70t6VgGxJ8ZrVBQqbINC47drPRYd2U1GW4gNvHLUT36vKiCuOdaeUF9rL0Injs6ieHPplJHJ5CQbVxkipB3QZWo9NaweZWl_CZjviJhEpYSUNzTRPaGZfWg9gua5gG8ojk9iaTABdGTr-1cKnFKnWQ'
];

async function main() {
  try {
    console.log('Iniciando proceso de carga de tokens...');

    // Limpiar tokens existentes
    console.log('Limpiando tokens existentes...');
    await prisma.token.deleteMany({});
    console.log('Tokens existentes eliminados.');

    console.log(`\nAgregando ${TOKENS.length} tokens a la base de datos...`);
    
    for (let i = 0; i < TOKENS.length; i++) {
      const token = TOKENS[i];
      const tokenId = `sunov2-token-${i + 1}`;
      
      try {
        const tokenRecord = await prisma.token.create({
          data: {
            hash: tokenId,
            email: 'soypepejaim.es@gmail.com',
            isActive: true,
            isValid: true,
            usageCount: 0,
            rateLimit: 10,
            tier: 'FREE',
            encryptedToken: Buffer.from(token).toString('base64'),
            metadata: JSON.stringify({
              source: 'manual',
              validated: true,
              addedAt: new Date().toISOString(),
              notes: 'Token agregado durante la configuración inicial'
            })
          }
        });

        console.log(`✅ Token ${i + 1} agregado exitosamente (ID: ${tokenRecord.id})`);
      } catch (error) {
        console.error(`❌ Error al agregar el token ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n✅ Proceso completado. Los tokens han sido agregados a la base de datos.');
    console.log('🚀 El sistema está listo para usar con múltiples tokens!');

  } catch (error) {
    console.error('❌ Error crítico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
