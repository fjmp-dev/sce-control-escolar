# Imagen de la API (manual sec. 31; Trivy la escanea en CI). Ambiente de pruebas con datos sinteticos.
FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# npm y npx no se usan en ejecucion: se retiran para reducir la superficie (Trivy, AU-20).
RUN npx prisma generate && npm run build \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER node
EXPOSE 3000
# Migra y carga el seed sintetico en cada arranque (ambos son idempotentes).
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node prisma/seed.mts && node dist/main.js"]
