import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          navy: '#0a1628',
          blue: '#1e3a5f',
          accent: '#3b82f6',
          light: '#e8f4fc',
          white: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
}
export default config
