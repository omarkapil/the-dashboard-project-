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
                    dark: "#020617",
                    deep: "#0f172a",
                    light: "#1e293b",
                    accent: "#38bdf8", // Sky Blue
                    vibrant: "#8b5cf6", // Purple
                    neon: "#22d3ee", // Cyan
                    danger: "#ef4444",
                    success: "#10b981",
                    warning: "#f59e0b"
                }
            },
            backgroundImage: {
                'cyber-gradient': 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent), radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.15), transparent)',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(56, 189, 248, 0.3)',
                'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
