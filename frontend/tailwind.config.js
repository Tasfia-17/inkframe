/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vellum:   '#f7f4ed',
        parchment:'#ffffff',
        charcoal: '#191919',
        inkwell:  '#242424',
        bookgray: '#333333',
        mutedgray:'#6b6b6b',
        storygreen:'#50B33A',
        border:   '#e8e4da',
        borderdark:'#d4cfc4',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '1386px',
      },
    },
  },
  plugins: [],
}
