import type { Metadata } from 'next'
import './globals.css'
import ClientBody from './ClientBody'

export const metadata: Metadata = {
  title: 'SON1KVERS3 · Ctrl + Alt = Humanity',
  description: 'Son1kVers3 - Ecosistema artístico-tecnológico que une música, inteligencia artificial y narrativa cyberpunk lírica.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <ClientBody>
        {children}
      </ClientBody>
    </html>
  )
}
