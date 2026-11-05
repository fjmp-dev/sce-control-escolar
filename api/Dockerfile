# Imagen de la API (manual sec. 31; Trivy la escanea en CI). Ambiente de pruebas con datos sinteticos.
FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
USER node
EXPOSE 3000
# Migra y carga el seed sintetico en cada arranque (ambos son idempotentes).
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && node dist/main.js"]
