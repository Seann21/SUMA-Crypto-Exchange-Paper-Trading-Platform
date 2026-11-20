import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: {
          DEFAULT: "#0f1523",
          hover: "#151e32",
          border: "#1c263c",
          subtle: "#121929",
        },
        suma: {
          gold: "#f59e0b",
          orange: "#ea580c",
          red: "#ef4444",
          green: "#10b981",
          dark: "#080b11",
          card: "#0d1320",
          cardHover: "#131b2d",
          border: "#1c263d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-gold": "0 0 25px -5px rgba(245, 158, 11, 0.35)",
        "glow-orange": "0 0 30px -5px rgba(234, 88, 12, 0.4)",
        "glow-green": "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "glow-red": "0 0 20px -5px rgba(239, 68, 68, 0.3)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

