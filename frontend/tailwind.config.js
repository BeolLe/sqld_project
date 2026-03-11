/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        sqld: {
          blue: '#1e40af',
          navy: '#0f172a',
          accent: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // A4 비율 레이아웃 (210mm × 297mm → 약 794px × 1123px)
      width: {
        a4: '794px',
      },
      minHeight: {
        a4: '1123px',
      },
    },
  },
  plugins: [],
};
