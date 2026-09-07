/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      colors: {
        lp: {
          bg: "#070B14",
          surface: "#0D1320",
          "surface-2": "#111A2B",
          border: "rgba(255,255,255,0.07)",
          text: "#E6EDF6",
          muted: "#8B98AB",
          sky: "#38BDF8",
          indigo: "#6366F1",
          violet: "#A78BFA"
        }
      },
      boxShadow: {
        glow: "0 4px 20px rgba(99,102,241,0.4)",
        "glow-lg": "0 8px 32px rgba(99,102,241,0.55)"
      }
    }
  },
  plugins: []
};
