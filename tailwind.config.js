/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        fondo: "#0a0a0a",
        surface: "#141414",
        elevada: "#1e1e1e",
        burdeos: {
          DEFAULT: "#7A2E3F",
          hover: "#9a3a4f",
        },
        champan: "#D8B47E",
        texto: {
          DEFAULT: "#f0f0f0",
          secundario: "#888888",
        },
        borde: "#2a2a2a",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
