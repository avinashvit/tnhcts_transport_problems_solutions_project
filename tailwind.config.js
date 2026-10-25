/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          dark: '#0a0a0c',
          card: '#ffffff',
          accent: '#64748b',
          blue: '#68759e',
          lime: '#86efac',
          pink: '#f472b6',
          purple: '#c084fc',
          surface: '#fbf9f7',
        },
        tn: {
          dark: '#0f172a',
          primary: '#18181b',
          light: '#f1f5f9',
          muted: '#fafafa',
          accent: '#2563eb',
        }
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        code: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '3px 3px 0px #0a0a0c',
        'neo-sm': '2px 2px 0px #0a0a0c',
        'neo-lg': '5px 5px 0px #0a0a0c',
        'neo-xl': '8px 8px 0px #0a0a0c',
        'soft-glow': '0 20px 50px rgba(200, 150, 180, 0.25)',
      }
    },
  },
  plugins: [],
}
