'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Music, Sparkles, Upload, Play, Download, Wand2, Users, User, Shuffle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-secondary-dark to-primary-dark relative overflow-hidden pb-32">

      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-son1k-purple rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-son1k-cyan rounded-full blur-3xl" style={{animationDelay:'1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-son1k-cyan/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-son1k-cyan font-[family-name:var(--font-orbitron)]">SON1KVERS3</h1>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#create" className="text-white/70 hover:text-son1k-cyan transition-colors">Crear</a>
              <a href="#explore" className="text-white/70 hover:text-son1k-cyan transition-colors">Explorar</a>
              <a href="#pricing" className="text-white/70 hover:text-son1k-cyan transition-colors">Precios</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-[#40FDAE] hover:bg-[#40FDAE]/90 text-white shadow-lg shadow-[#40FDAE]/60 border border-[#40FDAE]/50" size="sm">Iniciar Sesión</Button>
            <Button className="bg-[#40FDAE] hover:bg-[#40FDAE]/90 text-white shadow-lg shadow-[#40FDAE]/60 border border-[#40FDAE]/50" size="sm">Registro</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - SON1KVERS3 Main Title */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Music className="w-8 h-8 md:w-12 md:h-12 text-[#00FFE7] animate-pulse"/>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-orbitron)] gradient-text mb-4">SON1KVERS3</h2>
              <p className="text-2xl md:text-3xl text-[#9AF7EE] mb-2 font-[family-name:var(--font-space-mono)]">Ctrl + Alt = Humanity</p>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Genera letras profesionales con parámetros literarios avanzados. Música creada exclusivamente para ti.
              </p>
            </div>
          </div>
          <div className="flex gap-4 justify-center mt-8 pt-8 border-t border-son1k-cyan/20">
            <Button className="bg-[#40FDAE] hover:bg-[#40FDAE]/90 text-white shadow-lg shadow-[#40FDAE]/60" size="lg" onClick={() => window.location.href = 'http://localhost:3002'}>
              <Play className="w-6 h-6 mr-2" />
              The Generator
            </Button>
            <Button variant="outline" className="border-[#40FDAE] text-[#40FDAE] hover:bg-[#40FDAE]/20 shadow-lg shadow-[#40FDAE]/30" size="lg" onClick={() => window.location.href = '/CODEX_MAESTRO.html'}>
              <Download className="w-6 h-6 mr-2" />
              Códex Maestro
            </Button>
          </div>
        </div>
      </section>

      {/* Herramientas Express - Generador Integrado en Landing Page */}
      <section id="create" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">

          {/* Generador Express - Formulario Integrado en Landing Page */}
          <Card className="bg-[#1a1d29]/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#00FFE7]/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00FFE7] to-[#B84DFF] rounded-xl">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] gradient-text animate-pulse">THE GENERATOR EXPRESS</h3>
                <p className="text-sm text-[#9AF7EE]">Generación rápida de música con IA avanzada</p>
              </div>
            </div>

            {/* Formulario Único del Generador */}
            <div className="space-y-6">
              {/* Single Text Area for Prompt and Lyrics */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80">Prompt + Letra</label>
                <textarea
                  placeholder="Describe el estilo musical, BPM, atmósfera, género... y escribe tu letra aquí. La IA generará música basada en tu descripción completa."
                  className="w-full h-48 px-4 py-3 bg-black/30 border-2 border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#00FFE7] resize-none text-sm leading-relaxed font-mono"
                  maxLength={1000}
                />
                <div className="text-right text-sm text-[#9AF7EE] font-mono">0/1000 caracteres</div>
              </div>

              {/* Voice Selection Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#00FFE7]" />
                  <span className="text-white font-medium">Voz:</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:border-[#00FFE7] hover:text-[#00FFE7] transition-all">Hombre</button>
                  <button className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:border-[#B84DFF] hover:text-[#B84DFF] transition-all">Mujer</button>
                  <button className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:border-[#FFD700] hover:text-[#FFD700] transition-all">Random</button>
                  <button className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:border-[#00FFE7] hover:text-[#00FFE7] transition-all">Dual</button>
                </div>
              </div>

              {/* Generate Button */}
              <Button className="w-full bg-[#40FDAE] hover:bg-[#40FDAE]/90 text-white text-xl font-black py-6 rounded-3xl transition-all transform hover:scale-105 shadow-2xl shadow-[#40FDAE]/60" size="lg">
                <Play className="w-6 h-6 mr-3" />
                Generar con IA
              </Button>

              {/* Info */}
              <div className="text-center text-sm text-white/50 flex items-center justify-center gap-4 flex-wrap">
                <span>🎵 2 pistas • ⚡ Sin límites • 🔊 Audio HD</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Creations */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 font-[family-name:var(--font-orbitron)]">Tus Creaciones Recientes</h3>
          <div className="grid grid-cols-1 gap-4">
            <Card className="glass-effect border-white/10 p-6 hover:border-[#B858FE]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#B858FE]/20 to-[#40FDAE]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">Cyber Dreams</h4>
                  <p className="text-sm text-white/50">Cyberpunk • 120s</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Upload className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="glass-effect border-white/10 p-6 hover:border-[#B858FE]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#B858FE]/20 to-[#40FDAE]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">Glitch Salvation</h4>
                  <p className="text-sm text-white/50">Cyberpunk • 120s</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Upload className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="glass-effect border-white/10 p-6 hover:border-[#B858FE]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#B858FE]/20 to-[#40FDAE]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">Digital Rain</h4>
                  <p className="text-sm text-white/50">Cyberpunk • 120s</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Upload className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Línea divisoria verde con luz */}
        <div className="mt-16 mb-8 relative">
          <hr className="h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent opacity-50" />
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent animate-pulse shadow-sm shadow-son1k-cyan/50"></div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="px-6 py-20 bg-gradient-to-b from-transparent to-[#122024]/30">
        <div className="max-w-7xl mx-auto">
          {/* Banner de Estreno THE GENERATOR */}
          <div className="mb-12 text-center">
            <div className="bg-gradient-to-r from-[#40FDAE]/80 via-son1k-cyan/60 to-son1k-purple/40 text-white rounded-2xl p-6 shadow-xl shadow-[#40FDAE]/60 border border-son1k-cyan/20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-orbitron)]">THE GENERATOR</h2>
              <p className="text-xl text-white/80 animate-pulse">🚀 ¡HOY LANZAMOS LA BETA PÚBLICA!</p>
              <p className="text-lg text-son1k-cyan font-semibold animate-pulse">SON1KVERS3 2.0 disponible para todos 🎵</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)]">Top 10 de la Semana</h3>
            <span className="text-sm text-white/50">Semana del 20-26 Ene 2025</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-effect border-white/10 p-5 hover:border-[#40FDAE]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br from-[#B858FE] to-[#40FDAE] text-white">#1</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate group-hover:text-[#40FDAE] transition-colors">Cyber Dreams</h4>
                  <p className="text-sm text-white/50">@neural_frequency</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">125K</span>
                  <Play className="w-5 h-5 text-white/70 group-hover:text-[#40FDAE] transition-colors" />
                </div>
              </div>
            </Card>
            <Card className="glass-effect border-white/10 p-5 hover:border-[#40FDAE]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br from-[#B858FE] to-[#40FDAE] text-white">#2</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate group-hover:text-[#40FDAE] transition-colors">Glitch Salvation</h4>
                  <p className="text-sm text-white/50">@quantum_beats</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">98K</span>
                  <Play className="w-5 h-5 text-white/70 group-hover:text-[#40FDAE] transition-colors" />
                </div>
              </div>
            </Card>
          </div>

          {/* Línea divisoria verde con luz */}
          <div className="mt-16 mb-8 relative">
            <hr className="h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent opacity-50" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent animate-pulse shadow-sm shadow-son1k-cyan/50"></div>
          </div>
        </div>
      </section>

      {/* El Santuario Próximamente */}
      <section className="px-6 py-20 bg-gradient-to-br from-secondary-dark to-primary-dark relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h3 className="text-4xl md:text-6xl font-bold text-son1k-cyan mb-4 font-[family-name:var(--font-orbitron)]">EL SANTUARIO</h3>
            <p className="text-2xl text-son1k-purple font-bold font-[family-name:var(--font-space-mono)] animate-pulse">PRÓXIMAMENTE...</p>
          </div>
          <div className="bg-[#1a1d29]/70 backdrop-blur-xl rounded-2xl p-8 border border-son1k-purple/30 relative mx-auto max-w-2xl">
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              Red social exclusiva para artistas de música IA. Conecta con creadores globales, colabora en proyectos, comparte técnicas, aprende de maestros y construye una comunidad donde tu creatividad no tiene límites.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-son1k-purple grid grid-cols-2 gap-2">
              <span className="flex items-center gap-2">🤝 Red de artistas IA</span>
              <span className="flex items-center gap-2">🎵 Colaboraciones globales</span>
              <span className="flex items-center gap-2">🎨 Aprendizaje colectivo</span>
              <span className="flex items-center gap-2">⚡ Comunidad HTTP404</span>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-son1k-blue">
              <span>🔒 Acceso exclusivo para PRO+</span>
              <span>🌐 Conexiones internacionales</span>
              <span>🎯 Mentores y discípulos</span>
            </div>
          </div>

          {/* Línea divisoria verde con luz final */}
          <div className="mt-16 mb-8 relative">
            <hr className="h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent opacity-50" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-son1k-cyan to-transparent animate-pulse shadow-sm shadow-son1k-cyan/50"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">Elige tu Tier</h3>
            <p className="text-white/60">Desbloquea todo el potencial de SON1KVERS3</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-effect border-white/10 p-6 hover:border-white/20 transition-all">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white/80 mb-2">FREE</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-white/50">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>5 generaciones/mes</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Hasta 60s</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Calidad estándar</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Comenzar</Button>
            </Card>

            <Card className="glass-effect border-[#B858FE]/50 p-6 relative overflow-hidden glow-purple">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#B858FE] to-[#40FDAE] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <div className="mb-6 mt-4">
                <h4 className="text-lg font-bold text-white mb-2">PRO</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold gradient-text">$29</span>
                  <span className="text-white/50">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>50 generaciones/mes</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Hasta 120s</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Calidad premium</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Button className="w-full glow-purple">Actualizar a PRO</Button>
            </Card>

            <Card className="glass-effect border-white/10 p-6 hover:border-white/20 transition-all">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white/80 mb-2">PREMIUM</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-white/50">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>200 generaciones/mes</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Hasta 300s</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Calidad ultra</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>API access</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Actualizar</Button>
            </Card>

            <Card className="glass-effect border-white/10 p-6 hover:border-white/20 transition-all">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white/80 mb-2">ENTERPRISE</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">Custom</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Generaciones ilimitadas</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>Sin límite de duración</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>White-label</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <div className="w-5 h-5 text-[#40FDAE] flex-shrink-0 mt-0.5">✓</div>
                  <span>SLA garantizado</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Contactar Ventas</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-white/50">© SON1KVERS3 2025 · Archivo Central · PX-COM // PROTOCOL-ALPHA.01</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
