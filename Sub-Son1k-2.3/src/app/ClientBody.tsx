'use client'

export default function ClientBody({ children }: { children: React.ReactNode }) {
  return (
    <body className="font-inter font-orbitron font-space-mono">
      {children}
    </body>
  )
}
