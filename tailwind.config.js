/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04101a',
          900: '#06121d',
          850: '#081a28',
          800: '#0b2030',
          700: '#102c42',
          600: '#173a55',
          500: '#1f4d6e',
          400: '#2a6488',
          300: '#3d86ad',
        },
        brand: {
          50: '#ecfdff',
          100: '#cff7fe',
          200: '#a4eefc',
          300: '#6ce1f9',
          400: '#22ccee',
          500: '#06b6d4',
          600: '#0892b3',
          700: '#0e748a',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34, 204, 238, 0.15), 0 18px 40px -20px rgba(34, 204, 238, 0.45)',
        card: '0 24px 60px -28px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
