import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#fbfaf7",
          subtle: "#f5f3ee",
          muted: "#efece4",
        },
        ink: {
          DEFAULT: "#1c1917",
          muted: "#57534e",
          soft: "#78716c",
          faint: "#a8a29e",
        },
        line: {
          DEFAULT: "#e7e3d8",
          subtle: "#efece4",
        },
        brand: {
          DEFAULT: "#16695a",
          dark: "#0f4a3f",
          light: "#1f8b78",
          tint: "#e8f3f0",
        },
        accent: {
          DEFAULT: "#c2410c",
          tint: "#fdf3ec",
        },
        success: { DEFAULT: "#15803d", tint: "#ecfdf5" },
        warning: { DEFAULT: "#a16207", tint: "#fef9c3" },
        danger: { DEFAULT: "#b91c1c", tint: "#fef2f2" },
      },
      fontSize: {
        "2xs": ["11px", "14px"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,0.04), 0 0 0 1px rgba(28,25,23,0.04)",
        pop: "0 8px 30px rgba(28,25,23,0.08), 0 0 0 1px rgba(28,25,23,0.04)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
