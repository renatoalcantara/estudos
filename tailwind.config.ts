import type { Config } from 'tailwindcss'

/**
 * Tokens derivados do DESIGN.md (template "sanity").
 * Cores semânticas (bg/surface/text/border) são dirigidas por CSS variables
 * em src/index.css para suportar tema claro/escuro. Acentos (brand/success/
 * error) são fixos pois independem do tema.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        'surface-2': 'var(--c-surface-2)',
        text: 'var(--c-text)',
        'text-soft': 'var(--c-text-soft)',
        'text-faint': 'var(--c-text-faint)',
        border: 'var(--c-border)',
        brand: { DEFAULT: '#6366f1', deep: '#dd0000' },
        success: '#37cd84',
        error: '#dd0000',
        link: '#0052ef',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'app-xs': '3px',
        'app-sm': '4px',
        'app-md': '5px',
        'app-lg': '6px',
        marketing: '12px',
      },
      spacing: {
        section: '64px',
        'section-lg': '96px',
      },
      letterSpacing: {
        display: '-0.04em',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.08)',
        'glow-success': '0 0 28px rgba(55,205,132,0.45)',
      },
      keyframes: {
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'note-pop': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.96)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'in-tune-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.06)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'sheet-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'page-enter': 'page-enter 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'note-pop': 'note-pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 300ms ease-out both',
        'fade-in-up': 'fade-in-up 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'in-tune-pulse': 'in-tune-pulse 1.3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.2s ease-in-out infinite',
        'pop-in': 'pop-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'sheet-up': 'sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'sheet-down': 'sheet-down 260ms cubic-bezier(0.4, 0, 1, 1) both',
        'fade-out': 'fade-out 260ms ease-in both',
      },
    },
  },
  plugins: [],
} satisfies Config
