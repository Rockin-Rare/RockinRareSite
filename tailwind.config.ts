import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#0F1115",
          secondary: "#14171D",
          card: "#181B22",
          elevated: "#1D212A",
          border: "#2A2F3A",
          text: "#F4F1EA",
          muted: "#7D8594",
          secondaryText: "#A9AFBC",
          gold: "#D6A84F",
          highlight: "#F2C76E",
          success: "#4ADE80",
          sold: "#6B7280",
          error: "#F87171"
        }
      },
      boxShadow: {
        vault: "0 18px 60px rgba(0, 0, 0, 0.28)",
        gold: "0 18px 60px rgba(214, 168, 79, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
