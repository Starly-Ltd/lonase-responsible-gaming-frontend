/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                success: "#10b981",
                warning: "#f59e0b",
                danger: "#ef4444",
                "blue-primary": "#172B74",
                "blue-darker": "#0F1F4D",
                "blue-secondary": "#1E3A8A",
                "orange-primary": "#FF7F1E",
                "orange-secondary": "#FFF4EB",
                "orange-links": "#FF7F1E",
                "grey-bg": "#F5F5F5",
                "grey-border": "#E5E5E5",
            },
            spacing: {
                18: "4.5rem",
                88: "22rem",
                128: "32rem",
            },
            minHeight: {
                "screen-safe": "calc(100vh - 4rem)",
            },
        },
        screens: {
            xs: "475px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
    },
    plugins: [],
};
