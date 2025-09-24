module.exports = {
  content: ["./pages/*.{html,js}", "./index.html", "./js/*.js"],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Bright Lime Green and Dark Green
        primary: {
          50: "#f0fff0", // Very light lime green
          100: "#dcfce7", // Light lime green
          200: "#bbf7d0", // Medium light lime green
          300: "#86efac", // Medium lime green
          400: "#4ade80", // Medium bright lime green
          500: "#32cd32", // Base bright lime green
          600: "#16a34a", // Dark green
          700: "#15803d", // Darker green
          800: "#166534", // Very dark green
          900: "#14532d", // Darkest green
          DEFAULT: "#32cd32", // Bright lime green as primary
        },
        // Secondary Colors - Dark Green Variations
        secondary: {
          50: "#f0f9f4", // Very light dark green tint
          100: "#d4e7dd", // Light dark green
          200: "#a9cfbb", // Medium light dark green
          300: "#7eb799", // Medium dark green
          400: "#539f77", // Medium darker green
          500: "#1a3d2e", // Base dark green
          600: "#143126", // Darker green
          700: "#0e251e", // Very dark green
          800: "#081916", // Darkest green
          900: "#041109", // Ultra dark green
          DEFAULT: "#1a3d2e", // Dark green for details
        },
        // Accent Colors - Lime Green Variations
        accent: {
          50: "#f0fff0", // Very light lime
          100: "#dcfce7", // Light lime
          200: "#bbf7d0", // Medium light lime
          300: "#86efac", // Medium lime
          400: "#4ade80", // Medium bright lime
          500: "#32cd32", // Base bright lime
          600: "#16a34a", // Darker lime
          700: "#15803d", // Dark lime
          800: "#166534", // Very dark lime
          900: "#14532d", // Darkest lime
          DEFAULT: "#32cd32", // Bright lime green accent
        },
        // Background and Surface - Lime Green Based
        background: "#32cd32", // Bright lime green background
        surface: "#dcfce7", // Light lime green for surfaces
        // Text Colors
        text: {
          primary: "#ffffff", // White text on bright green
          secondary: "#1a3d2e", // Dark green text
          muted: "#539f77", // Muted green text
        },
        // Status Colors
        success: "#4ade80", // Success feedback
        warning: "#fbbf24", // Warning
        error: "#ef4444", // Error
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        accent: ['Crimson Text', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        crimson: ['Crimson Text', 'serif'],
        mono: ['Courier New', 'monospace'], // Added for terminal effect
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      boxShadow: {
        'primary': '0 4px 20px rgba(26, 61, 46, 0.1)',
        'card': '0 2px 10px rgba(26, 61, 46, 0.08)',
        'focus': '0 0 0 3px rgba(50, 205, 50, 0.2)',
        'soft': '0 2px 15px rgba(26, 61, 46, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 600ms ease-out',
        'slide-up': 'slideUp 600ms ease-out',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
        'typewriter': 'typewriter 4s steps(40) 1s infinite', // Added for terminal effect
        'cursor': 'cursor 1s step-end infinite', // Added for cursor blinking
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        // Added for terminal typewriter effect
        typewriter: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '100%' },
        },
        cursor: {
          '0%, 50%': { borderColor: 'transparent' },
          '51%, 100%': { borderColor: 'white' },
        },
      },
      transitionDuration: {
        '300': '300ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}