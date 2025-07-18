
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
				inter: ['Inter', 'system-ui', 'sans-serif'],
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
				},
				// Enhanced color palette for visual improvements
				emerald: {
					50: 'hsl(151, 81%, 96%)',
					100: 'hsl(149, 80%, 90%)',
					200: 'hsl(152, 76%, 80%)',
					300: 'hsl(156, 72%, 67%)',
					400: 'hsl(158, 64%, 52%)',
					500: 'hsl(160, 84%, 39%)',
					600: 'hsl(161, 94%, 30%)',
					700: 'hsl(163, 94%, 24%)',
					800: 'hsl(163, 88%, 20%)',
					900: 'hsl(164, 86%, 16%)'
				},
				violet: {
					50: 'hsl(250, 100%, 98%)',
					100: 'hsl(251, 91%, 95%)',
					200: 'hsl(251, 95%, 92%)',
					300: 'hsl(252, 95%, 85%)',
					400: 'hsl(255, 92%, 76%)',
					500: 'hsl(258, 90%, 66%)',
					600: 'hsl(262, 83%, 58%)',
					700: 'hsl(263, 70%, 50%)',
					800: 'hsl(263, 69%, 42%)',
					900: 'hsl(264, 67%, 35%)'
				},
				orange: {
					50: 'hsl(33, 100%, 96%)',
					100: 'hsl(34, 100%, 92%)',
					200: 'hsl(32, 98%, 83%)',
					300: 'hsl(31, 97%, 72%)',
					400: 'hsl(27, 96%, 61%)',
					500: 'hsl(25, 95%, 53%)',
					600: 'hsl(21, 90%, 48%)',
					700: 'hsl(17, 88%, 40%)',
					800: 'hsl(15, 79%, 34%)',
					900: 'hsl(15, 75%, 28%)'
				},
				cyan: {
					50: 'hsl(183, 100%, 96%)',
					100: 'hsl(185, 96%, 90%)',
					200: 'hsl(186, 94%, 82%)',
					300: 'hsl(187, 92%, 69%)',
					400: 'hsl(188, 86%, 53%)',
					500: 'hsl(189, 94%, 43%)',
					600: 'hsl(192, 91%, 36%)',
					700: 'hsl(193, 82%, 31%)',
					800: 'hsl(194, 70%, 27%)',
					900: 'hsl(196, 64%, 24%)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
