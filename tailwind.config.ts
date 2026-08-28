import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'vg-bg':      '#0e1117',
        'vg-surface': '#161b22',
        'vg-raised':  '#1c2431',
        'vg-border':  '#30363d',
        'vg-cyan':    '#00d4ff',
        'vg-amber':   '#f5a623',
        'vg-red':     '#ff4444',
        'vg-green':   '#39d353',
        'vg-purple':  '#a855f7',
        'vg-text':    '#e6edf3',
        'vg-muted':   '#8b949e',
        'vg-subtle':  '#4d5566',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'scale-in':   'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up':   'slideUp 0.35s ease-out forwards',
        'pulse-red':  'pulseRed 1.8s ease-in-out infinite',
        'pulse-cyan': 'pulseCyan 2.5s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'slot-scroll':'slotScroll 0.1s linear infinite',
        'shimmer':    'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 16px 2px rgba(255,68,68,0.25)' },
          '50%':      { boxShadow: '0 0 40px 8px rgba(255,68,68,0.6)' },
        },
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 16px 2px rgba(0,212,255,0.2)' },
          '50%':      { boxShadow: '0 0 36px 6px rgba(0,212,255,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        slotScroll: {
          '0%':   { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'cyan-glow':  '0 0 20px rgba(0,212,255,0.35)',
        'amber-glow': '0 0 20px rgba(245,166,35,0.35)',
        'red-glow':   '0 0 20px rgba(255,68,68,0.4)',
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
