# Imagen sce-api (Fig. 9; Tabla 53, etapa 6; Trivy la escanea en CI). Solo dependencias de produccion.
# No ejecuta el seed: es la misma imagen que ira a staging y piloto. El ambiente de pruebas lo pide en docker-compose.yml.
FROM node:25-slim AS construccion
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:25-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=construccion /app/package.json ./
COPY --from=construccion /app/node_modules ./node_modules
COPY --from=construccion /app/prisma ./prisma
COPY --from=construccion /app/dist ./dist
# npm y npx no se usan en ejecucion: se retiran para reducir la superficie (Trivy, AU-20).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
