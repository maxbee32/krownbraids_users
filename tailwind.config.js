
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f5e0cc',
          300: '#ecc9a8',
          400: '#e0ad7a',
          500: '#d4914c',
          600: '#c47a38',
          700: '#a4642e',
          800: '#85512a',
          900: '#6d4326',
          950: '#3a2110',
        },
        secondary: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#2e2e2e',
          950: '#1a1a1a',
        },
        accent: {
          50: '#fef7ee',
          100: '#fdead9',
          200: '#fcd4b8',
          300: '#fab88c',
          400: '#f79156',
          500: '#f57232',
          600: '#e65622',
          700: '#bf421a',
          800: '#983619',
          900: '#7a2e19',
          950: '#42140b',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #d4914c 0%, #c47a38 50%, #a4642e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)',
        'gradient-braids': 'linear-gradient(135deg, #fdf8f3 0%, #f5e0cc 50%, #ecc9a8 100%)',
      },
      boxShadow: {
        'premium': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
        'premium-hover': '0 30px 80px -20px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 30px rgba(212, 145, 76, 0.3)',
        'inner-glow': 'inset 0 0 30px rgba(212, 145, 76, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};