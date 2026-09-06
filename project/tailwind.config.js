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
        finops: {
          dark: '#0B0F19',
          card: '#111827',
          cardBorder: '#1F2937',
          accent: '#3B82F6',
          aws: '#FF9900',
          azure: '#0089D6',
          gcp: '#4285F4',
          k8s: '#326CE5',
          savings: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
