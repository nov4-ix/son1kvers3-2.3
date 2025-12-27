import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const trackId = searchParams.get('trackId')
  
  console.log('🔍 Consultando status para trackId:', trackId)
  
  if (!trackId) {
    return NextResponse.json({ error: 'trackId requerido' }, { status: 400 })
  }
  
  try {
    const BACKEND_URL = process.env.VITE_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    const AUTH_TOKEN = process.env.VITE_AUTH_TOKEN
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${AUTH_TOKEN}`
    }
    
    const response = await fetch(`${BACKEND_URL}/api/track-status?trackId=${trackId}`, {
      headers
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error al consultar status:', errorText)
      throw new Error(`Error del backend: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📊 Status data:', data)
    
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('❌ Error en track-status:', error)
    return NextResponse.json({ 
      error: error.message,
      status: 'error'
    }, { status: 500 })
  }
}
