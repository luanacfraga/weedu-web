import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#504371',
          base: '#504371',
          dark: '#40355a',
          light: '#5f5087',
          lighter: '#7968a5',
          lightest: '#978ab9',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#0D9488',
          base: '#0D9488',
          dark: '#0F766E',
          light: '#14B8A6',
          lighter: '#2DD4BF',
          lightest: '#99F6E4',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        black: {
          DEFAULT: '#1A1A1A',
          base: '#1A1A1A',
          dark: '#000000',
          light: '#333333',
          lighter: '#4D4D4D',
          lightest: '#666666',
        },
        danger: {
          DEFAULT: '#EF4444',
          base: '#EF4444',
          dark: '#F87171',
          light: '#FCA5A5',
          lighter: '#FECACA',
          lightest: '#FEE2E2',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: '#10B981',
          base: '#10B981',
          dark: '#34D399',
          light: '#6EE7B7',
          lighter: '#A7F3D0',
          lightest: '#D1FAE5',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: '#F59E0B',
          base: '#F59E0B',
          dark: '#FBBF24',
          light: '#FCD34D',
          lighter: '#FDE68A',
          lightest: '#FEF3C7',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-in': 'fade-in 0.6s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
