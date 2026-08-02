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
        noche: "#0B0E1A",
        burdeos: {
          DEFAULT: "#7A2E3F",
          light: "#9A4457",
          dark: "#5C2230",
        },
        champan: {
          DEFAULT: "#D8B47E",
          light: "#E6CBA0",
          dark: "#B8935E",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
