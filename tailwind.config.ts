import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#F3E8FF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F8F7FC",
        },
        text: {
          DEFAULT: "#1A1A2E",
          muted: "#6B6B80",
        },
        border: "#E5E5EF",
        success: "#10B981",
        warning: "#F59E0B",
      },
      fontFamily: {
        heading: ["Young Serif", "Georgia", "serif"],
        body: ["Open Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-slide-in": "fadeSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-subtle": "bounceSubtle 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSubtle: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
