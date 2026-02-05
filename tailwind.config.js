/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Slate/zinc palette for dark theme
        background: '#09090b', // zinc-950
        surface: '#18181b',    // zinc-900
        surfaceHover: '#27272a', // zinc-800
        border: '#27272a',     // zinc-800
        text: '#fafafa',       // zinc-50
        textMuted: '#a1a1aa',  // zinc-400
        primary: '#fafafa',    // zinc-50
        primaryHover: '#e4e4e7', // zinc-200
      },
    },
  },
  plugins: [],
}
