# Dockerfile para Next.js en Google Cloud Run
FROM node:18-alpine AS base

# 1. Instalar dependencias
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Build de la aplicación
FROM base AS builder
WORKDIR /app

# Recibir variables de entorno como argumentos de build
ARG OPENAI_API_KEY
ARG OPENAI_ASSISTANT_ID
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL

# Configurarlas como variables de entorno durante el build
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV OPENAI_ASSISTANT_ID=$OPENAI_ASSISTANT_ID
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Build optimizado para producción
RUN npm run build

# 3. Imagen de producción (solo lo necesario)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run usa variable PORT (por defecto 8080)
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar
CMD ["node", "server.js"]