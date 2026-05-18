/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Figma 準拠のトークン
        brand: {
          DEFAULT: "#05B45B",
          hover: "#04A052",
          light: "rgba(5,180,91,0.1)",
          dark: "#037F40",
        },
        warning: {
          DEFAULT: "#F2B705",
          light: "#FFF9E6",
        },
        danger: {
          DEFAULT: "#F15025",
          light: "#FFF5F0",
        },
        muted: {
          DEFAULT: "#AEADA9",
          light: "rgba(174,173,169,0.1)",
        },
        ink: {
          DEFAULT: "#363635",
          sub: "#727270",
          disabled: "#A3A3A3",
        },
        surface: {
          DEFAULT: "#FDFDFA",
          second: "#F5F4ED",
        },
        line: "#DCDCD9",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Yu Gothic",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        "dot-blink": {
          "0%, 80%, 100%": { opacity: "0.2" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "fade-out": "fade-out 300ms ease-in forwards",
        "dot-blink": "dot-blink 1s infinite",
      },
    },
  },
  plugins: [],
};
