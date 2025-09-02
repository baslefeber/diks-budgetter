import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // DIKS Brand Colors - matching the design reference
        brand: {
          navy: '#1a237e', // Deep navy blue (primary) - matches reference design
          'navy-light': '#3949ab', // Lighter navy for hover states
          'navy-dark': '#0d47a1', // Darker navy for active states
          yellow: '#ffc107', // Bright yellow (secondary) - matches DIKS logo
          'yellow-light': '#fff59d', // Lighter yellow for backgrounds
          'yellow-dark': '#ff8f00', // Darker yellow for hover states
        },
        // Custom semantic colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Budget status colors
        budget: {
          good: '#10b981', // Green
          warning: '#f59e0b', // Amber
          critical: '#ef4444', // Red
          inactive: '#6b7280', // Gray
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
