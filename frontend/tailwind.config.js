/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1B2A',
        paper: '#F3F5F7',
        card: '#FFFFFF',
        line: '#E3E8ED',
        body: '#17222E',
        muted: '#67788A',
        brand: '#126E6A',
        brandsoft: '#E2F1F0',
        good: '#16794A',
        goodsoft: '#E3F3EA',
        warn: '#A9650B',
        warnsoft: '#FBEEDA',
        pending: '#8A5B00',
        pendingsoft: '#FFF4CC',
        bad: '#B32318',
        badsoft: '#FBE7E5',
        calm: '#2E5AA8',
        calmsoft: '#E6EDF9'
      },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)',
        lift: '0 2px 6px rgba(16,24,40,.06), 0 24px 48px -20px rgba(16,24,40,.28)'
      }
    }
  },
  plugins: []
};
