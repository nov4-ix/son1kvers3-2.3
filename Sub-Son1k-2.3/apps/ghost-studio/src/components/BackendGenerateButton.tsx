import { useState } from 'react';

export function BackendGenerateButton() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ✅ VALIDAR BACKEND_URL de manera segura
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const BACKEND_SECRET = import.meta.env.VITE_BACKEND_SECRET || 'dev-token';

  // ✅ Si no hay BACKEND_URL, mostrar mensaje de error en UI
  if (!BACKEND_URL) {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px solid #ff6b6b',
        borderRadius: 8,
        color: '#ff6b6b'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>⚠️ Configuración requerida</h3>
        <p style={{ margin: 0 }}>
          <strong>VITE_BACKEND_URL</strong> no está configurada.
          <br />
          Define esta variable en tu archivo <code>.env</code>
        </p>
      </div>
    );
  }

  /**
   * Sleep utility for retry delays
   */
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Fetch with retry logic
   */
  async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Si es error de servidor (5xx), reintentar
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response;
      } catch (err) {
        lastError = err as Error;

        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError.message}`);
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        setRetryCount(attempt + 1);

        await sleep(delay);
      }
    }

    throw lastError!;
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setRetryCount(0);

    try {
      // ✅ Paso 1: Crear generación con retry
      console.log('📡 Creando generación...');
      const createRes = await fetchWithRetry(
        `${BACKEND_URL}/api/generation/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BACKEND_SECRET}`
          },
          body: JSON.stringify({
            prompt,
            style: 'pop',
            duration: 120,
            quality: 'standard'
          })
        },
        3 // 3 reintentos
      );

      if (!createRes.ok) {
        const errorText = await createRes.text().catch(() => 'Unknown error');
        throw new Error(`Create failed: ${createRes.status} - ${errorText}`);
      }

      const createData = await createRes.json();

      if (!createData.success || !createData.data?.generationId) {
        throw new Error(createData.error?.message || 'Failed to create generation');
      }

      const { generationId } = createData.data;
      console.log('✅ Generación creada:', generationId);

      // ✅ Paso 2: Polling con retry y timeout
      const startTime = Date.now();
      const timeout = 300000; // 5 minutos
      const pollInterval = 3000; // 3 segundos
      let pollAttempt = 0;

      while (Date.now() - startTime < timeout) {
        pollAttempt++;
        console.log(`🔄 Polling attempt ${pollAttempt}...`);

        try {
          const statusRes = await fetchWithRetry(
            `${BACKEND_URL}/api/generation/${generationId}/status`,
            {
              headers: {
                'Authorization': `Bearer ${BACKEND_SECRET}`
              }
            },
            2 // 2 reintentos por polling
          );

          if (!statusRes.ok) {
            console.warn(`⚠️ Status check returned ${statusRes.status}, continuing...`);
            await sleep(pollInterval);
            continue;
          }

          const statusData = await statusRes.json();

          if (statusData.success && statusData.data) {
            const status = statusData.data.status;

            console.log(`📊 Status: ${status}`);

            if (status === 'COMPLETED' && statusData.data.audioUrl) {
              console.log('✅ Generación completada!');
              setAudioUrl(statusData.data.audioUrl);
              return;
            }

            if (status === 'FAILED') {
              throw new Error(statusData.data.error || 'Generation failed');
            }

            // Status es PENDING o PROCESSING, continuar polling
          }
        } catch (pollError) {
          console.warn('⚠️ Polling error:', pollError);
          // Continuar polling en caso de error no crítico
        }

        await sleep(pollInterval);
      }

      throw new Error('Timeout - Generation took too long (5 minutes)');

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err?.message || 'Error generating music');
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <textarea
        placeholder="Escribe un prompt para generar música..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        style={{
          width: '100%',
          height: 80,
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 12,
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        style={{
          marginTop: 12,
          backgroundColor: loading ? '#888' : '#00FFE7',
          color: '#0A0C10',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 6,
          cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 14,
          transition: 'all 0.2s'
        }}
      >
        {loading ? (
          retryCount > 0
            ? `Reintentando (${retryCount})...`
            : 'Generando...'
        ) : 'Generar con Backend'}
      </button>

      {error && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid #ff6b6b',
          borderRadius: 6,
          color: '#ff6b6b'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            padding: 12,
            background: 'rgba(0, 255, 231, 0.1)',
            border: '1px solid #00FFE7',
            borderRadius: 6,
            marginBottom: 8
          }}>
            <strong style={{ color: '#00FFE7' }}>✅ Generación completada!</strong>
          </div>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
