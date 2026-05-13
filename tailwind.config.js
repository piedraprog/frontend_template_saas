/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  corePlugins: {
    // Preflight desactivado para no pisar resets de PrimeNG / tokens Aura
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'admin-card':
          '0 1px 2px rgb(15 23 42 / 0.06), 0 4px 16px rgb(15 23 42 / 0.06)',
        'admin-float':
          '0 18px 50px rgb(15 23 42 / 0.12)',
      },
    },
  },
  plugins: [],
};
