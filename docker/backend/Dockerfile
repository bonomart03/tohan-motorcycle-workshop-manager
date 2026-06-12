# ─── Etapa 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# ✅ ci en lugar de install: reproducible, falla si hay diferencias en lockfile
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Etapa 2: Producción (imagen mínima) ─────────────────────────────────────
FROM node:20-alpine AS production

# ✅ No ejecutar como root dentro del contenedor
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER appuser

EXPOSE 3001
CMD ["node", "dist/server.js"]
