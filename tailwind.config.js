/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb',
          dark: '#1e40af',
        },
        accent: {
          light: '#f59e42',
          dark: '#ea580c',
        },
        background: {
          light: '#ffffff',
          dark: '#000000', // Black for dark mode background
        },
        card: {
          light: '#FFD580', // Sunrise color for light mode cards
          dark: '#374151',  // Gray-700 for dark mode cards
        },
        text: {
          light: '#374151', // Gray text for cards in light mode
          dark: '#ffffff',  // White text for cards in dark mode
        },
        error: {
          light: '#ef4444',
          dark: '#f87171',
        },
        info: '#2563eb',
        success: '#22c55e',
        warning: '#f59e42',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}