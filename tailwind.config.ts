import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./1778957059565444171.html"
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				gothic: ['UnifrakturMaguntia', 'cursive'],
				cinzel: ['Cinzel', 'serif'],
				fell: ['IM Fell English', 'serif'],
				crimson: ['Crimson Text', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'flicker': {
					'0%, 100%': { opacity: '1' },
					'92%': { opacity: '1' },
					'93%': { opacity: '0.4' },
					'94%': { opacity: '1' },
					'96%': { opacity: '0.6' },
					'97%': { opacity: '1' },
				},
				'fog-drift': {
					'0%': { transform: 'translateX(-5%) translateY(0)', opacity: '0.4' },
					'50%': { opacity: '0.6' },
					'100%': { transform: 'translateX(5%) translateY(-3%)', opacity: '0.4' },
				},
				'pulse-red': {
					'0%, 100%': { boxShadow: '0 0 8px rgba(139,0,0,0.4)' },
					'50%': { boxShadow: '0 0 20px rgba(220,20,60,0.8), 0 0 40px rgba(139,0,0,0.4)' },
				},
				'drip': {
					'0%': { transform: 'scaleY(0)', transformOrigin: 'top', opacity: '0' },
					'30%': { opacity: '1' },
					'100%': { transform: 'scaleY(1)', transformOrigin: 'top', opacity: '1' },
				},
				'float-particle': {
					'0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '0.5' },
					'100%': { transform: 'translateY(-120vh) translateX(var(--drift, 20px))', opacity: '0' },
				},
				'screen-shake': {
					'0%, 100%': { transform: 'translate(0, 0)' },
					'20%': { transform: 'translate(-3px, 2px)' },
					'40%': { transform: 'translate(3px, -2px)' },
					'60%': { transform: 'translate(-2px, -3px)' },
					'80%': { transform: 'translate(2px, 3px)' },
				},
				'fade-in-slow': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'flicker': 'flicker 4s infinite',
				'fog': 'fog-drift 12s ease-in-out infinite alternate',
				'pulse-red': 'pulse-red 2s ease-in-out infinite',
				'drip': 'drip 1.5s ease-out both',
				'shake': 'screen-shake 0.5s ease-in-out',
				'fade-slow': 'fade-in-slow 1.5s ease forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
