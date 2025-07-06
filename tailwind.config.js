/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        success: '#10B981',
        error: '#EF4444',
        gray: {
          100: '#F3F4F6',
          400: '#9CA3AF',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2A44',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}