import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tc-ink': 'var(--tc-ink)',
        'tc-primary': 'var(--tc-primary)',
        'tc-primary-hover': 'var(--tc-primary-hover)',
        'tc-action-lime': 'var(--tc-action-lime)',
        'tc-lime-hover': 'var(--tc-lime-hover)',
        'tc-canvas': 'var(--tc-canvas)',
        'tc-chalk': 'var(--tc-chalk)',
        'tc-surface': 'var(--tc-surface)',
        'tc-surface-soft': 'var(--tc-surface-soft)',
        'tc-blue-light': 'var(--tc-blue-light)',
        'tc-graphite': 'var(--tc-graphite)',
        'tc-text-secondary': 'var(--tc-text-secondary)',
        'tc-steel-grey': 'var(--tc-steel-grey-on-white-only)',
        'tc-border': 'var(--tc-border)',
        'tc-border-strong': 'var(--tc-border-strong)',
        'tc-warning': 'var(--tc-warning)',
        'tc-success': 'var(--tc-success)',
        'tc-error': 'var(--tc-error)',
        'tc-focus': 'var(--tc-focus)',

        // Semantic Brand V3 Aliases
        brand: {
          DEFAULT: 'var(--tc-primary)',
          hover: 'var(--tc-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--tc-action-lime)',
          hover: 'var(--tc-lime-hover)',
        },
        ink: 'var(--tc-ink)',
        canvas: 'var(--tc-canvas)',
        'ai-surface': 'var(--tc-surface-soft)',
        'body-muted': 'var(--tc-text-secondary)',
        'functional-outline': 'var(--tc-border-strong)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card, 14px)',
        button: 'var(--radius-button, 10px)',
      },
      boxShadow: {
        'lime-outline': '0 0 0 2px var(--tc-ink)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
