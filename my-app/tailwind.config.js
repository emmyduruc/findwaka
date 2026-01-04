/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./ui/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
    },
  },
  plugins: [],
}