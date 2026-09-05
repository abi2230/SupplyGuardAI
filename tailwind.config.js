/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070b14',
          900: '#0b1120',
          800: '#111a2e',
          700: '#1b2742',
          600: '#2a3a5e',
          500: '#3d4f76',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b6d8ff',
          300: '#84bcff',
          400: '#4d97ff',
          500: '#1f7bff',
          600: '#0a5ef0',
          700: '#0a48c4',
          800: '#0e3d9e',
          900: '#12367d',
        },
        mint: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warn: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(7,11,20,.5), 0 4px 16px rgba(7,11,20,.25)',
        glow: '0 0 0 1px rgba(31,123,255,.25), 0 8px 32px rgba(31,123,255,.18)',
      },
      animation: {
        'fade-in': 'fadeIn .4s ease-out both',
        'slide-up': 'slideUp .45s cubic-bezier(.16,1,.3,1) both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'dash': 'dash 1.2s linear infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: .55 } },
        dash: { to: { 'stroke-dashoffset': '-20' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
