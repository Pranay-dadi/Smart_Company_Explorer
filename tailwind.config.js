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
          light: '#1E88E5', // Blue for light mode
          dark: '#1565C0', // Darker blue for dark mode
        },
        secondary: {
          light: '#4CAF50', // Green for light mode
          dark: '#388E3C', // Darker green for dark mode
        },
        accent: {
          light: '#F57C00', // Orange for light mode
          dark: '#EF6C00', // Slightly darker orange for dark mode
        },
        background: {
          light: '#F5F5F5', // Light gray for light mode
          secondary_light: '#FFFFFF', // White for cards, headers in light mode
          dark: '#212121', // Dark background for dark mode
          secondary_dark: '#2D2D2D', // Lighter gray for cards in dark mode
        },
        text: {
          light: '#424242', // Dark gray for light mode
          dark: '#E0E0E0', // Light gray for dark mode
        },
        error: {
          light: '#D32F2F', // Red for light mode
          dark: '#E57373', // Lighter red for dark mode
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}