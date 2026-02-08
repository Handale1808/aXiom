import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateX(-50%) translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' }
        },
        loadingScale: {
          '0%, 100%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.2)' },
        },
        loadingGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(48, 214, 214, 0.8)' },
          '50%': { boxShadow: '0 0 20px rgba(48, 214, 214, 1)' },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms ease-out',
        loadingScale: 'loadingScale 1.5s ease-in-out infinite',
        loadingGlow: 'loadingGlow 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;