/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "Strategy" Brand Palette
        brand: {
          400: '#A78BFA', // Hover states / Accents
          500: '#8B5CF6', // Primary "GENERATE" Button
          600: '#7C3AED', // Active states
          glow: '#8B5CF680', // For box-shadow glows
        },
        // Deep Dark Mode Palette (Rich Black vs Flat Black)
        dark: {
          bg: '#050505',      // Main background (near black)
          surface: '#121212', // Card background
          border: '#2A2A2A',  // Subtle borders
          text: {
            main: '#EDEDED',  // High readability
            muted: '#A3A3A3', // Secondary labels
          }
        }
      },
      backgroundImage: {
        // The "World Class" Depth Effect: faint purple light from top
        'strategy-gradient': 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, rgba(5, 5, 5, 1) 70%)',
        // Glassmorphism panel texture
        'glass-panel': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px -5px var(--tw-shadow-color)',
        'input-focus': '0 0 0 2px rgba(139, 92, 246, 0.3)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Courier Prime', 'serif'],
      },
    },
  },
  plugins: [],
}