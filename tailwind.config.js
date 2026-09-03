/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vku: {
          red: '#dc2626',      // Màu đỏ VKU
          'red-dark': '#b91c1c',
          'red-light': '#fef2f2',
          gold: '#f59e0b',     // Màu vàng VKU
          'gold-dark': '#d97706',
          'gold-light': '#fffbeb',
          blue: '#1d4ed8',     // Màu xanh dương VKU
          'blue-dark': '#1e40af',
          'blue-light': '#eff6ff',
          navy: '#0f172a',
          white: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
