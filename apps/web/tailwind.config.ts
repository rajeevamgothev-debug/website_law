import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      colors: {
        ink: "#09111f",
        sand: "#f3ebdc",
        bronze: "#c89a4b",
        brass: "#8c6a31",
        mist: "#bfd0ea"
      },
      boxShadow: {
        halo: "0 20px 80px rgba(200, 154, 75, 0.2)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(191, 208, 234, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(191, 208, 234, 0.07) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
