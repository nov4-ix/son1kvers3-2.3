/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",
        primary: {
          DEFAULT: "#B84DFF",
          foreground: "#ffffff",
          dark: "#0A0C10",
        },
        secondary: {
          DEFAULT: "#00FFE7",
          foreground: "#ffffff",
          dark: "#1a1d29",
        },
        accent: {
          DEFAULT: "#9AF7EE",
          foreground: "#0A0C10",
        },
        muted: {
          DEFAULT: "#1a1d29",
          foreground: "#9AF7EE",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        border: "#00FFE7",
        input: "#1a1d29",
        ring: "#B84DFF",
        // Additional SON1K colors
        son1k: {
          cyan: "#00FFE7",
          purple: "#B84DFF",
          blue: "#9AF7EE",
          gold: "#FFD700",
          red: "#FF1744",
        },
        'primary-dark': "#0A0C10",
        'secondary-dark': "#1a1d29",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Inter_E5387405-module__6kjfMG__variable",
          "Poppins",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "Space Mono",
          "Space_Mono_6ea683de-module__e0u9Iq__variable",
          "JetBrains Mono",
          "monospace",
        ],
        orbitron: [
          "Orbitron",
          "Orbitron_5d61b861-module__tzdIhq__variable",
          "Biometric W95",
          "Impact",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(184, 88, 254, 0.3), 0 0 40px rgba(64, 253, 174, 0.2)",
      },
    },
  },
  plugins: [],
}
