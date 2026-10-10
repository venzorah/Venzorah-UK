export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#06245F",
          900: "#041A45",
          700: "#0B3480",
          100: "#DCE4F3",
          50: "#EEF2FA",
        },
        gold: {
          DEFAULT: "#FFB900",
          600: "#E5A600",
          100: "#FFEDB8",
          50: "#FFF7DE",
        },
        surface: "#F5F7FB",
        ink: "#18243A",
        muted: "#64748B",
        line: "#E2E8F0",
        success: "#15803D",
        danger: "#B91C1C",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(6,36,95,0.04), 0 4px 16px rgba(6,36,95,0.06)",
        pop: "0 12px 40px rgba(6,36,95,0.16)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
};
