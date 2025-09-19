import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans]
      },
      colors: {
        brand: {
          50: "#ecf7ff",
          100: "#d0ecff",
          200: "#a1d8ff",
          300: "#73c3ff",
          400: "#44afff",
          500: "#159bff",
          600: "#0d7bd6",
          700: "#085baa",
          800: "#043b80",
          900: "#001c55"
        }
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(21, 155, 255, 0.45)" },
          "50%": { boxShadow: "0 0 0 0.5rem rgba(21, 155, 255, 0)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
}

export default config
