module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // or 'media'
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F4F7FB",
          100: "#E2E8F6",
          200: "#C4D1EC",
          300: "#9BAFDA",
          400: "#6E87C6",
          500: "#3B5BAF", // brand accent
          600: "#2C4588",
          700: "#1E3163", // secondary main
          800: "#141E3F",
          900: "#0A1124", // darkest
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
