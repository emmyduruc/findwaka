/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F14',
        surface: '#111827',
        textPrimary: '#F8FAFC',
        textMuted: '#94A3B8',
        accentPrimary: '#6EE7FF',
        accentSecondary: '#A78BFA',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#FB7185',
        border: 'rgba(148,163,184,0.18)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

