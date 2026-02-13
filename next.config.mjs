/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para Docker/Cloud Run
  output: 'standalone',
  
  // Si usas imágenes, configurar dominio
  images: {
    domains: ['localhost'],
    unoptimized: true, // Para Cloud Run
  },
};

export default nextConfig;
