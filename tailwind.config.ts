import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F7F5",
        ink: {
          DEFAULT: "#171717",
          primary: "#171717",
          secondary: "#777777",
          muted: "#999999",
          faint: "#BCBCB8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#FBFBFA",
          subtle: "#F2F2EE",
          dark: "#141413",
        },
        border: {
          DEFAULT: "#DADAD6",
          subtle: "#EAEAE6",
          dark: "#2A2A28",
        },
        signal: {
          blue: "#3867E8",
          "blue-subtle": "#EDF2FD",
          "blue-border": "#C2D4FA",
          green: "#25845A",
          "green-subtle": "#EBF6F0",
          "green-border": "#BCE3CE",
          amber: "#C27803",
          "amber-subtle": "#FDF6EA",
          "amber-border": "#F3DCB1",
          red: "#DC2626",
          "red-subtle": "#FDF2F2",
          "red-border": "#F8CACA",
        },
        brand: {
          50: "#EDF2FD",
          100: "#DDE8FB",
          200: "#C2D4FA",
          500: "#3867E8",
          600: "#2B55CF",
          700: "#2042AA",
          800: "#183285",
          900: "#102360",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        serif: [
          '"Newsreader"',
          '"Playfair Display"',
          '"Instrument Serif"',
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          '"Roboto Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "12px",
        "3xl": "12px",
        full: "9999px",
      },
      boxShadow: {
        fine: "0 1px 2px 0 rgba(23, 23, 23, 0.04)",
        card: "0 1px 3px 0 rgba(23, 23, 23, 0.05), 0 1px 2px -1px rgba(23, 23, 23, 0.03)",
        popover: "0 4px 12px 0 rgba(23, 23, 23, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
