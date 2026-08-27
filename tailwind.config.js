/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          primary: 'var(--accent-primary)',
          positive: 'var(--accent-positive)',
          negative: 'var(--accent-negative)',
          trend: 'var(--accent-trend)',
          neutral: 'var(--accent-neutral)',
        },
        surface: {
          bg: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--card-bg)',
          border: 'var(--card-border)',
          header: 'var(--header-bg)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'status-pulse': 'pulse 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
