import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎵 API generate-music LLAMADA')

  try {
    const body = await req.json()
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2))

    const { lyrics, prompt, voice, instrumental } = body

    if (!prompt?.trim()) {
      console.log('❌ Prompt vacío')
      return NextResponse.json({ error: 'Prompt musical requerido' }, { status: 400 })
    }

    if (!instrumental && !lyrics?.trim()) {
      console.log('❌ Letra vacía (modo NO instrumental)')
      return NextResponse.json({ error: 'Letra requerida o activa modo instrumental' }, { status: 400 })
    }

    const SUNO_API_KEY = process.env.VITE_SUNO_API_KEY || process.env.SUNO_API_KEY
    console.log('🔑 SUNO_API_KEY:', SUNO_API_KEY ? '✅ Configurada' : '❌ NO ENCONTRADA')

    if (!SUNO_API_KEY) {
      return NextResponse.json({ 
        error: 'SUNO_API_KEY no configurada en variables de entorno' 
      }, { status: 500 })
    }

    const sunoPayload = {
      prompt: prompt.trim(),
      lyrics: instrumental ? '' : lyrics.trim(),
      voice: voice || 'male',
      instrumental: instrumental || false,
      make_instrumental: instrumental || false
    }

    console.log('📤 Enviando a Suno API:', JSON.stringify(sunoPayload, null, 2))

    const SUNO_API_URL = process.env.VITE_MUSIC_API_BASE_URL || 'https://api.sunoapi.com/v1'
    const sunoResponse = await fetch(`${SUNO_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`
      },
      body: JSON.stringify(sunoPayload)
    })

    console.log('📊 Suno Response Status:', sunoResponse.status)

    if (!sunoResponse.ok) {
      const errorData = await sunoResponse.json().catch(() => ({}))
      console.log('❌ Suno API Error:', errorData)
      throw new Error(errorData.error || 'Error al generar música')
    }

    const sunoData = await sunoResponse.json()
    console.log('✅ Suno Response:', JSON.stringify(sunoData, null, 2))

    return NextResponse.json({
      success: true,
      trackId: sunoData.trackId || sunoData.id,
      audioUrls: sunoData.audioUrls || [],
      audioUrl: sunoData.audioUrl || null,
      message: 'Música en generación'
    })

  } catch (error: any) {
    console.error('❌ ERROR en generate-music:', error)
    return NextResponse.json({ 
      error: error.message || 'Error desconocido al generar música' 
    }, { status: 500 })
  } finally {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}
