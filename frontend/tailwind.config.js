/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 🌞 Light mode colors
        backgroundColor: "#FFFFFF",
        textColor: "#1A1E18",
        accentColor: "#F4F4F4",
        secondaryTextColor: "#6B7280",
        borderColor: "#D1D5DB",
        hoverColor: "#306366",
        title: "#0B0B0B",
        body: "#555555",
        section: "#F5F5F5",

        // 🌙 Dark mode colors
        "backgroundColor-dark": "#0F0F0F",
        "textColor-dark": "#E5E7EB",
        "accentColor-dark": "#1F2937",
        "secondaryTextColor-dark": "#9CA3AF",
        "borderColor-dark": "#374151",
        "hoverColor-dark": "#4FD1C5",
        "title-dark": "#FFFFFF",
        "body-dark": "#CCCCCC",
        "section-dark": "#1A1A1A",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          lg: "1024px",
          xl: "1208px",
          "2xl": "1536px",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeUp: "fadeUp 0.6s ease-in-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
