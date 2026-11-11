# Imagen sce-portal (Fig. 9; Tabla 53, etapa 6; Trivy la escanea en CI). Solo lleva la salida standalone de Next.js.
FROM node:24-slim AS construccion
WORKDIR /app
COPY package.json package-lock.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci
COPY . .
RUN npm run build

FROM node:24-slim
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=construccion /app/.next/standalone ./
COPY --from=construccion /app/.next/static ./.next/static
# npm y npx no se usan en ejecucion: se retiran para reducir la superficie (Trivy, AU-20).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER node
EXPOSE 3000
CMD ["node", "server.js"]
