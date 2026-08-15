/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fbf5",
          100: "#dcf6e6",
          200: "#bcecd1",
          300: "#8eddb4",
          400: "#57c98f",
          500: "#2ec866",
          600: "#1ea94f",
          700: "#1b8743",
          800: "#1a6a38",
          900: "#175830",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        elevated:
          "0 2px 4px 0 rgb(15 23 42 / 0.05), 0 8px 24px -6px rgb(15 23 42 / 0.12)",
      },
    },
  },
  plugins: [],
};
