import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],

	theme: {
		extend: {
			fontFamily: {
				sans: [
					'var(--font-geist-sans)',
					'system-ui',
					'sans-serif'
				],
				mono: [
					'var(--font-geist-mono)',
					'monospace'
				]
			},
			colors: {
				background: '#ffffff',
				foreground: '#0f172a',
				card: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a'
				},
				primary: {
					DEFAULT: '#1e293b',
					foreground: '#f8fafc'
				},
				secondary: {
					DEFAULT: '#f1f5f9',
					foreground: '#0f172a'
				},
				muted: {
					DEFAULT: '#f1f5f9',
					foreground: '#64748b'
				},
				accent: {
					DEFAULT: '#f1f5f9',
					foreground: '#0f172a'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				border: '#e2e8f0',
				input: '#e2e8f0',
				ring: '#1e293b'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [tailwindcssAnimate],
}

export default config