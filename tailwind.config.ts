import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "accent-warm": {
          DEFAULT: "hsl(var(--accent-warm))",
          foreground: "hsl(var(--accent-warm-foreground))",
        },
        "accent-cool": {
          DEFAULT: "hsl(var(--accent-cool))",
          foreground: "hsl(var(--accent-cool-foreground))",
        },
        "accent-info": {
          DEFAULT: "hsl(var(--accent-info))",
          foreground: "hsl(var(--accent-info-foreground))",
        },
        "neon-green": "hsl(var(--neon-green))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-warm': 'var(--shadow-glow-warm)',
        'glow-cool': 'var(--shadow-glow-cool)',
        'lift': 'var(--shadow-lift)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blob": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-25px, 20px) scale(0.95)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(-3deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "aurora-drift": {
          "0%": { transform: "scale(1.3) translateX(0%) translateY(0%)" },
          "25%": { transform: "scale(1.4) translateX(-5%) translateY(3%)" },
          "50%": { transform: "scale(1.35) translateX(-3%) translateY(6%)" },
          "75%": { transform: "scale(1.4) translateX(4%) translateY(3%)" },
          "100%": { transform: "scale(1.3) translateX(0%) translateY(0%)" },
        },
        "aurora-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "grid-pulse": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.08" },
        },
        "line-flow": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "dot-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.5)", opacity: "1" },
        },
        "wave": {
          "0%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(5px) translateY(-5px)" },
          "50%": { transform: "translateX(10px) translateY(0)" },
          "75%": { transform: "translateX(5px) translateY(5px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        // New professional animations
        "gradient-shift": {
          "0%, 100%": { 
            backgroundPosition: "0% 50%",
            transform: "scale(1) rotate(0deg)"
          },
          "25%": { 
            backgroundPosition: "100% 50%",
            transform: "scale(1.02) rotate(1deg)"
          },
          "50%": { 
            backgroundPosition: "100% 100%",
            transform: "scale(1.05) rotate(0deg)"
          },
          "75%": { 
            backgroundPosition: "0% 100%",
            transform: "scale(1.02) rotate(-1deg)"
          }
        },
        "morph-blob": {
          "0%, 100%": {
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            transform: "translate(0, 0) rotate(0deg)"
          },
          "25%": {
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
            transform: "translate(5px, -5px) rotate(90deg)"
          },
          "50%": {
            borderRadius: "50% 60% 30% 60% / 30% 40% 70% 60%",
            transform: "translate(0, 5px) rotate(180deg)"
          },
          "75%": {
            borderRadius: "60% 40% 60% 30% / 60% 50% 40% 50%",
            transform: "translate(-5px, 0) rotate(270deg)"
          }
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px 0 hsl(var(--primary) / 0.2)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 40px 10px hsl(var(--primary) / 0.3)",
            transform: "scale(1.02)"
          }
        },
        "reveal-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(40px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "tilt-card": {
          "0%, 100%": { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" },
          "25%": { transform: "perspective(1000px) rotateX(2deg) rotateY(2deg)" },
          "75%": { transform: "perspective(1000px) rotateX(-2deg) rotateY(-2deg)" }
        },
        "border-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 5px hsl(var(--primary) / 0.3), inset 0 0 5px hsl(var(--primary) / 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.4), inset 0 0 10px hsl(var(--primary) / 0.15)" 
          }
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" }
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "glow-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 2px hsl(var(--primary) / 0.3))" },
          "50%": { filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" }
        },
        // Consensus/Majority/Dissent section animations
        "consensus-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 hsl(142 76% 36% / 0.2)",
            borderColor: "hsl(142 76% 36% / 0.3)"
          },
          "50%": { 
            boxShadow: "0 0 12px 4px hsl(142 76% 36% / 0.15)",
            borderColor: "hsl(142 76% 36% / 0.5)"
          }
        },
        "majority-wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" }
        },
        "dissent-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-1px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(1px)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "blob": "blob 18s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "aurora-drift": "aurora-drift 12s ease-in-out infinite",
        "aurora-glow": "aurora-glow 5s ease-in-out infinite",
        "gradient": "gradient 4s ease infinite",
        "grid-pulse": "grid-pulse 4s ease-in-out infinite",
        "line-flow": "line-flow 3s ease-in-out infinite",
        "dot-pulse": "dot-pulse 2s ease-in-out infinite",
        "wave": "wave 4s ease-in-out infinite",
        "morph": "morph 8s ease-in-out infinite",
        // New professional animations
        "gradient-shift": "gradient-shift 15s ease-in-out infinite",
        "morph-blob": "morph-blob 20s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "reveal-up": "reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "tilt-card": "tilt-card 10s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "text-shimmer": "text-shimmer 4s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.5s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        // Consensus/Majority/Dissent animations
        "consensus-pulse": "consensus-pulse 3s ease-in-out infinite",
        "majority-wiggle": "majority-wiggle 4s ease-in-out infinite",
        "dissent-shake": "dissent-shake 0.5s ease-in-out"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), transparent 50%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
