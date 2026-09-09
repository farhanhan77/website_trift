import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#fbf8f2",
          100: "#f5eee0",
          200: "#e9dac0",
          300: "#dcbe97",
          400: "#d0a171",
          500: "#c2824e",
          600: "#b06b40",
          700: "#925236",
          800: "#774230",
          900: "#63372a",
          950: "#381c15",
        },
        thrift: {
          dark: "#0F1115",
          card: "#161920",
          hover: "#1E222B",
          border: "#282E3D",
          accent: "#F59E0B", // Amber
          success: "#10B981", // Emerald
          danger: "#EF4444", // Red
          gradeA: "#10B981",
          gradeB: "#3B82F6",
          defect: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-in-out",
        "scale-up": "scaleUp 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
