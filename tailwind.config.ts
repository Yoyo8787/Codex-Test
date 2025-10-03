import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1220",
        surface: "#111b2f",
        accent: "#1f4cff",
        gain: "#29d38f",
        loss: "#ff5d73",
      },
      keyframes: {
        flashGain: {
          "0%": { backgroundColor: "rgba(41, 211, 143, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
        flashLoss: {
          "0%": { backgroundColor: "rgba(255, 93, 115, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        flashGain: "flashGain 0.8s ease-out",
        flashLoss: "flashLoss 0.8s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
