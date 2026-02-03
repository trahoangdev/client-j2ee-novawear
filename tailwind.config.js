/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1.5rem',
  		screens: {
  			'sm': '640px',
  			'md': '768px',
  			'lg': '1024px',
  			'xl': '1280px',
  			'2xl': '1440px'
  		}
  	},
  	extend: {
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
  			// NOVAWEAR Custom Colors
  			terracotta: {
  				DEFAULT: '#C85A54',
  				50: '#F7E8E7',
  				100: '#F0D4D2',
  				200: '#E3ABA7',
  				300: '#D6827C',
  				400: '#C85A54',
  				500: '#B14840',
  				600: '#8C3932',
  				700: '#672A25',
  				800: '#421B18',
  				900: '#1D0C0B'
  			},
  			sage: {
  				DEFAULT: '#A8B5A0',
  				50: '#F5F7F4',
  				100: '#E9EDE7',
  				200: '#D3DBCF',
  				300: '#BCC9B7',
  				400: '#A8B5A0',
  				500: '#8FA085',
  				600: '#728568',
  				700: '#566450',
  				800: '#3A4336',
  				900: '#1E221C'
  			},
  			cream: {
  				DEFAULT: '#FAF8F5',
  				dark: '#F5F2ED'
  			},
  			charcoal: '#2D2D2D',
  			gold: '#D4AF37',
  			coral: '#FF6B6B',
  			success: '#4ECDC4',
  			navy: {
  				DEFAULT: '#1A1F36',
  				light: '#252B45'
  			},
  			cyan: '#00D9FF',
  			magenta: '#FF006E'
  		},
  		fontFamily: {
  			display: ['Fraunces', 'serif'],
  			body: ['Plus Jakarta Sans', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		fontSize: {
  			'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  			'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  			'h2': ['2.25rem', { lineHeight: '1.25' }],
  			'h3': ['1.5rem', { lineHeight: '1.3' }],
  			'body': ['1rem', { lineHeight: '1.6' }],
  			'small': ['0.875rem', { lineHeight: '1.5' }],
  			'caption': ['0.75rem', { lineHeight: '1.4' }]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem',
  			'30': '7.5rem'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'soft': '0 4px 24px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
  			'soft-lg': '0 8px 32px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.04)',
  			'elevated': '0 12px 40px rgba(0,0,0,0.12), 0 0 2px rgba(0,0,0,0.04)'
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
  			'fade-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-up': 'fade-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  			'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  			'shimmer': 'shimmer 2s infinite linear'
  		},
  		transitionTimingFunction: {
  			'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}