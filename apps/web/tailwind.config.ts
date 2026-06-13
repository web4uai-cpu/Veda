import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        veda: {
          saffron: {
            50: '#FFF8F0',
            100: '#FFECD4',
            200: '#FFD6A5',
            300: '#FFBC6B',
            400: '#E8A23C',
            500: '#C97A24',
            600: '#A8621A',
            700: '#874D14',
            800: '#6B3D10',
            900: '#4A2A0C',
          },
          indigo: {
            50: '#EEF2F7',
            100: '#D4DEEB',
            200: '#A9BDDB',
            300: '#7E9CCB',
            400: '#5478AE',
            500: '#3A5E94',
            600: '#243B63',
            700: '#1C2F50',
            800: '#14233D',
            900: '#0C1729',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Mukta', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      maxWidth: {
        content: '1400px',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
