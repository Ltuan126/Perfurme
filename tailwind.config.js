/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F2EB',
        surface: '#EFECE3',
        charcoal: '#191A16',
        charcoal2: '#1A1A17',
        ink: '#1A1A17',
        muted: '#55534C',
        label: '#8A8779',
        label2: '#9A9789',
        oncream: '#ECE9E0',
        oncream2: '#F2EFE9',
        mutedDark: '#B9B7AC',
        hairline: '#DFDBD0',
        hairlineDark: '#2C2D26',
        underline: '#CBC7BB',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}
