/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    dark: "#0f172a",
                    light: "#1e293b",
                    accent: "#38bdf8",
                    danger: "#ef4444",
                    success: "#22c55e",
                    warning: "#eab308"
                }
            }
        },
    },
    plugins: [],
}
