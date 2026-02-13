import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Coca-Cola Andina (KOA)
        koa: {
          red: '#F40009',        // Rojo Coca-Cola (logo)
          mint: '#7DD3C0',       // Verde menta (principal)
          green: '#059669',      // Verde oscuro (íconos)
          'green-light': '#e8f8f5',  // Verde claro (backgrounds)
          'gray-dark': '#333333',    // Gris oscuro (textos)
          'gray-medium': '#999999',  // Gris medio (subtítulos)
        },
      },
    },
  },
  plugins: [],
};
export default config;
