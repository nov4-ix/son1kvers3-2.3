/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#171922',
          secondary: '#1C232F',
          card: '#122024',
        },
        teal: {
          dark: '#15333B',
          mid: '#15A4A2',
        },
        mint: '#40FDAE',
        purple: '#B858FF',
        blue: '#047AF6',
        lavender: '#BCAACD',
        // Mantener colores legacy para compatibilidad
        carbon: '#0A0C10',
        cyan: '#00FFE7',
        magenta: '#B84DFF',
        accent: '#9AF7EE',
        ghost: '#1A1D26',
        phantom: '#2A2D36',
      },
      boxShadow: {
        neon: '0 0 20px rgba(64, 253, 174, 0.4)',
        'neon-purple': '0 0 20px rgba(184, 88, 255, 0.4)',
        'neon-blue': '0 0 20px rgba(4, 122, 246, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-mint': 'glow-mint 2s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(0, 255, 231, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(0, 255, 231, 0.6)' },
        },
        'glow-mint': {
          'from': { boxShadow: '0 0 20px rgba(64, 253, 174, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(64, 253, 174, 0.6)' },
        },
        'glow-purple': {
          'from': { boxShadow: '0 0 20px rgba(184, 88, 255, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(184, 88, 255, 0.6)' },
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
