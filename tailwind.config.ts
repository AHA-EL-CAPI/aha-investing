// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    // This is the most robust path for Next.js App Router projects
    './src/app/dashboard/BCOLOMBIA/page.tsx',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Catches files in the root 'app' directory
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Catches files in the 'src' directory (including 'src/app' if it's there)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // If you have a top-level 'components' folder
    // Add any other specific paths where your Tailwind classes might be used, e.g.:
    // './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        primary: '#1f77b4',
        grid: '#444444',
        axis: '#ffffff',
      },
    },
  },
  plugins: [],
};